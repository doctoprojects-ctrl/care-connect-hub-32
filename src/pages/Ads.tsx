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

export default function QueueDisplay() {
  const { ads } = useAds();
  const activeAds = useMemo(() => ads.filter((ad) => ad.active), [ads]);

  const [index, setIndex] = useState(0);
  const [justChanged, setJustChanged] = useState(true);
  const timerRef = useRef<number | null>(null);
  const highlightRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (highlightRef.current) window.clearTimeout(highlightRef.current);
    if (!current) return;

    setJustChanged(true);
    highlightRef.current = window.setTimeout(() => setJustChanged(false), TITLE_HIGHLIGHT_MS);

    if (current.type === 'image') {
      timerRef.current = window.setTimeout(advance, IMAGE_READ_TIME_MS);
    } else {
      // Videos advance on `onEnded`; this is just a fallback ceiling.
      timerRef.current = window.setTimeout(advance, VIDEO_MAX_TIME_MS);
    }

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (highlightRef.current) window.clearTimeout(highlightRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, count]);

  // Make sure a freshly-scrolled-to video always starts playing from 0.
  useEffect(() => {
    const v = videoRef.current;
    if (v && current?.type === 'video') {
      v.currentTime = 0;
      v.play().catch(() => {
        /* autoplay can be blocked until the user interacts with the page */
      });
    }
  }, [current?.id, current?.type]);

  if (count === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-950 text-white">
        <p className="text-2xl text-white/60">No active ads to display right now.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white overflow-hidden flex flex-col">
      {/* Sliding track: one full-screen slide per ad, scrolled horizontally */}
      <div
        className="flex h-screen w-full transition-transform duration-700 ease-in-out"
        style={{
          width: `${count * 100}%`,
          transform: `translateX(-${index * (100 / count)}%)`,
        }}
      >
        {activeAds.map((ad) => (
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
                ad.id === current?.id && justChanged
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-90',
              ].join(' ')}
            >
              {ad.title}
            </h1>

            {/* Media */}
            <div className="flex-1 w-full flex items-center justify-center min-h-0">
              {ad.type === 'image' ? (
                <img
                  src={ad.dataUrl}
                  alt={ad.title}
                  className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl"
                />
              ) : (
                <video
                  ref={ad.id === current?.id ? videoRef : undefined}
                  src={ad.dataUrl}
                  autoPlay
                  muted
                  playsInline
                  onEnded={ad.id === current?.id ? advance : undefined}
                  className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl"
                />
              )}
            </div>
          </div>
        ))}
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
    </div>
  );
}
