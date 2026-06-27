import { useEffect, useMemo, useState, useRef } from 'react';
import { useAds } from '@/lib/adsStore';
import { QueueDept, useQueueTickets } from '@/lib/queueStore';
import { clinicConfig } from '@/lib/clinicConfig';

const DEPT_LABELS: Record<QueueDept, string> = {
  doctor: 'Doctor',
  pharmacy: 'Pharmacy',
  triage: 'Triage',
};

const DEPT_COLORS: Record<QueueDept, string> = {
  doctor: 'from-blue-500 to-blue-700',
  pharmacy: 'from-emerald-500 to-emerald-700',
  triage: 'from-amber-500 to-amber-700',
};

// Scroll speed in pixels per second
const SCROLL_SPEED = 50;

export default function QueueDisplay() {
  const tickets = useQueueTickets();
  const ads = useAds().filter(a => a.active);
  const [adIdx, setAdIdx] = useState(0);
  const [now, setNow] = useState(new Date());
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastTimestampRef = useRef<number>(0);

  // Define currentAd BEFORE using it in effects
  const currentAd = ads[adIdx];

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Scroll animation loop
  useEffect(() => {
    if (!currentAd || currentAd.type !== 'image' || !textRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const textWidth = textRef.current.scrollWidth;
    
    // Reset scroll position if text is not wide enough to scroll
    if (textWidth <= containerWidth) {
      setScrollPosition(0);
      return;
    }

    let startTime = performance.now();
    
    const animate = (timestamp: number) => {
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp;
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = (timestamp - lastTimestampRef.current) / 1000; // in seconds
      lastTimestampRef.current = timestamp;

      if (!isPaused) {
        setScrollPosition(prev => {
          const newPos = prev + (SCROLL_SPEED * deltaTime);
          // Reset when the entire text has scrolled through
          if (newPos >= textWidth) {
            // Pause at the end for 3 seconds before restarting
            setIsPaused(true);
            setTimeout(() => {
              setIsPaused(false);
              setScrollPosition(0);
            }, 3000);
            return textWidth - containerWidth;
          }
          return newPos;
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastTimestampRef.current = 0;
    };
  }, [currentAd, isPaused]);

  // Rotate ads (images every 10s with pause for scrolling, videos handled by onEnded)
  useEffect(() => {
    if (ads.length <= 1) return;
    if (!currentAd || currentAd.type === 'video') return;
    
    // Reset scroll position when ad changes
    setScrollPosition(0);
    setIsPaused(false);
    
    // Allow 10 seconds for reading before changing to next ad
    const t = setTimeout(() => {
      setAdIdx(i => (i + 1) % ads.length);
    }, 10000);
    
    return () => clearTimeout(t);
  }, [adIdx, ads, currentAd]);

  useEffect(() => {
    if (adIdx >= ads.length) setAdIdx(0);
  }, [ads.length, adIdx]);

  const nowServing = useMemo(() => {
    const out: Record<QueueDept, ReturnType<typeof useQueueTickets>[number] | null> = {
      doctor: null, pharmacy: null, triage: null,
    };
    (['doctor', 'pharmacy', 'triage'] as QueueDept[]).forEach(d => {
      const list = tickets.filter(t => t.dept === d && (t.status === 'called' || t.status === 'serving'));
      out[d] = list[list.length - 1] ?? null;
    });
    return out;
  }, [tickets]);

  const waitingCount = (d: QueueDept) => tickets.filter(t => t.dept === d && t.status === 'waiting').length;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{clinicConfig.name}</h1>
          <p className="text-slate-400">Queue Display</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono">{now.toLocaleTimeString()}</div>
          <div className="text-slate-400">{now.toLocaleDateString()}</div>
        </div>
      </header>

      <div className="grid lg:grid-cols-5 gap-4 flex-1">
        <div className="lg:col-span-2 grid grid-rows-3 gap-4">
          {(['doctor', 'triage', 'pharmacy'] as QueueDept[]).map(d => {
            const cur = nowServing[d];
            return (
              <div key={d} className={`rounded-2xl p-6 bg-gradient-to-br ${DEPT_COLORS[d]} shadow-2xl flex flex-col justify-between`}>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-semibold uppercase tracking-wide">{DEPT_LABELS[d]}</span>
                  <span className="text-sm bg-black/30 rounded-full px-3 py-1">{waitingCount(d)} waiting</span>
                </div>
                {cur ? (
                  <div>
                    <div className="text-7xl font-black tracking-tight">{cur.code}</div>
                    <div className="text-2xl mt-1 opacity-90">→ {cur.room}</div>
                    <div className="text-sm mt-1 opacity-75">{cur.patientName}</div>
                  </div>
                ) : (
                  <div className="text-3xl opacity-60">— Waiting —</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-3 rounded-2xl bg-black overflow-hidden flex items-center justify-center relative">
          {currentAd ? (
            currentAd.type === 'image' ? (
              <div 
                ref={containerRef}
                className="w-full h-full relative overflow-hidden flex items-center"
              >
                <div 
                  ref={textRef}
                  className="absolute whitespace-nowrap text-white text-4xl font-bold px-8"
                  style={{
                    transform: `translateX(-${scrollPosition}px)`,
                    transition: 'none',
                    willChange: 'transform',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  }}
                >
                  {currentAd.title}
                </div>
              </div>
            ) : (
              <video
                key={currentAd.id}
                src={currentAd.dataUrl}
                autoPlay
                muted
                playsInline
                onEnded={() => setAdIdx(i => (i + 1) % Math.max(ads.length, 1))}
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="text-center text-slate-500 p-8">
              <p className="text-2xl">No advertisements configured.</p>
              <p className="text-sm mt-2">Marketing can upload media from the Advertisements page.</p>
            </div>
          )}
          {currentAd && currentAd.type === 'image' && (
            <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur px-4 py-2 rounded-lg">
              <p className="text-sm font-medium">
                {currentAd.description || 'Scroll message'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
