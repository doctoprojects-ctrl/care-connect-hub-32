// components/QueueDisplay.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAds } from '@/lib/adsStore';

/**
 * How long an IMAGE ad stays on screen before the display scrolls
 * to the next one. Gives people time to actually read the title.
 */
const IMAGE_READ_TIME_MS = 9000;

/**
 * Safety cap for VIDEO ads in case the video's `onEnded` event never
 * fires (corrupt file, browser quirk, etc). Videos normally advance
 * on their own once playback finishes.
 */
const VIDEO_MAX_TIME_MS = 90000;

/** How long the title banner keeps its "just changed" highlight. */
const TITLE_HIGHLIGHT_MS = 1200;

/** Number of retry attempts for video playback */
const MAX_VIDEO_RETRIES = 3;

export default function QueueDisplay() {
  const { ads, isLoading, error, lastFetched, refreshAds, clearCache } = useAds();
  const [index, setIndex] = useState(0);
  const [justChanged, setJustChanged] = useState(true);
  const [videoError, setVideoError] = useState<Record<string, boolean>>({});
  const timerRef = useRef<number | null>(null);
  const highlightRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoRetryCount = useRef<Record<string, number>>({});

  const activeAds = useMemo(() => ads.filter((ad) => ad.active), [ads]);
  const count = activeAds.length;
  const current = count > 0 ? activeAds[index % count] : null;

  // If ads are added/removed and the current index no longer exists,
  // snap back to a valid slide instead of showing a blank screen.
  useEffect(() => {
    if (count === 0) {
      setIndex(0);
      return;
    }
    if (index >= count) {
      setIndex(0);
    }
  }, [count, index]);

  const advance = () => {
    setIndex((prev) => (count === 0 ? 0 : (prev + 1) % count));
  };

  // Timer that decides WHEN to scroll to the next ad.
  useEffect(() => {
    // Clear any existing timers first
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (highlightRef.current) {
      window.clearTimeout(highlightRef.current);
      highlightRef.current = null;
    }

    if (!current) return;

    // Set highlight
    setJustChanged(true);
    highlightRef.current = window.setTimeout(() => setJustChanged(false), TITLE_HIGHLIGHT_MS);

    // Set the main timer based on ad type
    if (current.type === 'image') {
      timerRef.current = window.setTimeout(() => {
        advance();
      }, IMAGE_READ_TIME_MS);
    } else {
      // Videos advance on `onEnded`; this is just a fallback ceiling.
      timerRef.current = window.setTimeout(() => {
        // If video hasn't ended by now, force advance
        const video = videoRef.current;
        if (video && !video.ended) {
          console.warn('Video timed out, forcing advance');
        }
        advance();
      }, VIDEO_MAX_TIME_MS);
    }

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (highlightRef.current) {
        window.clearTimeout(highlightRef.current);
        highlightRef.current = null;
      }
    };
  }, [current?.id, count]);

  // Make sure a freshly-scrolled-to video always starts playing from 0.
  useEffect(() => {
    const v = videoRef.current;
    if (v && current?.type === 'video') {
      // Reset retry count for this video
      if (!videoRetryCount.current[current.id]) {
        videoRetryCount.current[current.id] = 0;
      }
      
      v.currentTime = 0;
      const playPromise = v.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Video started successfully
            setVideoError(prev => ({ ...prev, [current.id]: false }));
          })
          .catch((error) => {
            // Autoplay was blocked or other error
            console.warn('Video play failed:', error);
            
            // Retry if we haven't exceeded max attempts
            const retries = videoRetryCount.current[current.id] || 0;
            if (retries < MAX_VIDEO_RETRIES) {
              videoRetryCount.current[current.id] = retries + 1;
              setTimeout(() => {
                if (videoRef.current) {
                  videoRef.current.play().catch(() => {});
                }
              }, 1000);
            } else {
              // If all retries fail, treat as image and advance after read time
              setVideoError(prev => ({ ...prev, [current.id]: true }));
              // Advance after image read time if video fails completely
              timerRef.current = window.setTimeout(() => {
                advance();
              }, IMAGE_READ_TIME_MS);
            }
          });
      }
    }
  }, [current?.id, current?.type]);

  // Handle video errors
  const handleVideoError = (adId: string) => {
    setVideoError(prev => ({ ...prev, [adId]: true }));
    // If video errors, advance after image read time
    timerRef.current = window.setTimeout(() => {
      advance();
    }, IMAGE_READ_TIME_MS);
  };

  // Show loading state
  if (isLoading && count === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-950 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/60">Loading ads...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && count === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-950 text-white">
        <div className="text-center max-w-md">
          <p className="text-red-500 text-xl mb-2">Failed to load ads</p>
          <p className="text-white/60 mb-4">{error}</p>
          <button
            onClick={() => refreshAds()}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors mr-2"
          >
            Retry
          </button>
          <button
            onClick={() => clearCache()}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
          >
            Clear Cache
          </button>
        </div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-950 text-white">
        <div className="text-center">
          <p className="text-2xl text-white/60">No active ads to display right now.</p>
          <p className="text-sm text-white/30 mt-4">Check back later for new content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white overflow-hidden flex flex-col">
      {/* Cache info bar - shows when ads were last fetched */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm text-white/40 text-xs px-4 py-1 text-center flex items-center justify-between">
        <span>
          {lastFetched 
            ? `📦 Ads loaded: ${lastFetched.toLocaleString()}` 
            : '📦 Loading...'}
        </span>
        <span>
          {ads.length > 0 && `Total: ${ads.length} ads`}
        </span>
      </div>

      {/* Sliding track: one full-screen slide per ad, scrolled horizontally */}
      <div
        className="flex h-screen w-full transition-transform duration-700 ease-in-out"
        style={{
          width: `${count * 100}%`,
          transform: `translateX(-${index * (100 / count)}%)`,
        }}
      >
        {activeAds.map((ad) => {
          const isCurrent = ad.id === current?.id;
          const hasError = videoError[ad.id] || false;
          
          return (
            <div
              key={ad.id}
              className="h-screen flex flex-col items-center justify-center px-10 py-8 shrink-0"
              style={{ width: `${100 / count}%` }}
            >
              {/* Title */}
              <h1
                className={[
                  'text-center font-bold leading-tight mb-8 max-w-5xl transition-all duration-500',
                  'text-4xl md:text-6xl',
                  isCurrent && justChanged
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-90',
                ].join(' ')}
              >
                {ad.title}
              </h1>

              {/* Media */}
              <div className="flex-1 w-full flex items-center justify-center min-h-0 relative">
                {ad.type === 'image' ? (
                  <img
                    src={ad.dataUrl}
                    alt={ad.title}
                    className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl"
                    loading="lazy"
                    onError={(e) => {
                      console.warn('Image failed to load:', ad.id);
                    }}
                  />
                ) : (
                  <>
                    {hasError ? (
                      // Fallback for video errors - show a placeholder
                      <div className="max-h-[70vh] max-w-full rounded-lg shadow-2xl bg-neutral-800 flex items-center justify-center">
                        <div className="text-center p-8">
                          <svg className="w-16 h-16 mx-auto mb-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <p className="text-white/60">Video unavailable</p>
                          <p className="text-white/30 text-sm mt-2">Will advance shortly</p>
                        </div>
                      </div>
                    ) : (
                      <video
                        ref={isCurrent ? videoRef : undefined}
                        src={ad.dataUrl}
                        autoPlay
                        muted
                        playsInline
                        onEnded={() => {
                          if (isCurrent) {
                            advance();
                          }
                        }}
                        onError={() => {
                          if (isCurrent) {
                            handleVideoError(ad.id);
                          }
                        }}
                        className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl"
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress dots so people can see how many ads are queued */}
      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2">
        {activeAds.map((ad, i) => (
          <span
            key={ad.id}
            className={[
              'h-2 rounded-full transition-all duration-300',
              i === index ? 'w-8 bg-white' : 'w-2 bg-white/30',
            ].join(' ')}
          />
        ))}
      </div>

      {/* Display counter showing current position */}
      <div className="absolute bottom-16 left-0 right-0 flex items-center justify-center">
        <span className="text-xs text-white/30">
          {index + 1} / {count}
        </span>
      </div>
    </div>
  );
}
