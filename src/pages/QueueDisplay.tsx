import { useEffect, useMemo, useRef, useState } from 'react';
import { useAds } from '@/lib/adsStore';
import { useQueueTickets, QueueDept } from '@/lib/queueStore';

const DEPT_LABELS: Record<QueueDept, string> = {
  doctor: 'Doctor',
  triage: 'Triage',
  pharmacy: 'Pharmacy',
};

const IMAGE_MS = 9000;
const VIDEO_MAX_MS = 90000;

export default function QueueDisplay() {
  const tickets = useQueueTickets();
  const { ads } = useAds();
  const activeAds = useMemo(() => ads.filter((a) => a.active), [ads]);

  const [adIndex, setAdIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const adCount = activeAds.length;
  const currentAd = adCount > 0 ? activeAds[adIndex % adCount] : null;

  useEffect(() => {
    if (adIndex >= adCount) setAdIndex(0);
  }, [adCount, adIndex]);

  const advance = () => setAdIndex((p) => (adCount === 0 ? 0 : (p + 1) % adCount));

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (!currentAd) return;
    const ms = currentAd.type === 'image' ? IMAGE_MS : VIDEO_MAX_MS;
    timerRef.current = window.setTimeout(advance, ms);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAd?.id, adCount]);

  useEffect(() => {
    const v = videoRef.current;
    if (v && currentAd?.type === 'video') {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  }, [currentAd?.id, currentAd?.type]);

  // Now-serving / called tickets, per department
  const byDept = (d: QueueDept) => {
    const items = tickets.filter((t) => t.dept === d);
    const nowServing = items.find((t) => t.status === 'serving' || t.status === 'called') || null;
    const waiting = items.filter((t) => t.status === 'waiting');
    return { nowServing, waiting };
  };

  const depts: QueueDept[] = ['doctor', 'triage', 'pharmacy'];

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white flex flex-col">
      {/* Header */}
      <header className="px-8 py-5 border-b border-white/10 flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Now Serving</h1>
        <div className="text-white/60 text-sm">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      {/* Main grid: queue takes 2/3, ads take 1/3 */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 min-h-0">
        {/* Queue panel */}
        <section className="lg:col-span-2 grid grid-rows-3 gap-4 min-h-0">
          {depts.map((d) => {
            const { nowServing, waiting } = byDept(d);
            return (
              <div
                key={d}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 flex items-center justify-between"
              >
                <div>
                  <div className="text-white/50 uppercase tracking-widest text-sm mb-1">
                    {DEPT_LABELS[d]}
                  </div>
                  {nowServing ? (
                    <>
                      <div className="text-6xl md:text-7xl font-black text-emerald-400 leading-none">
                        {nowServing.code}
                      </div>
                      <div className="mt-2 text-lg text-white/80">
                        {nowServing.patientName}
                        {nowServing.room ? ` → ${nowServing.room}` : ''}
                      </div>
                    </>
                  ) : (
                    <div className="text-4xl md:text-5xl font-bold text-white/30">—</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-white/50 text-xs uppercase tracking-widest">Waiting</div>
                  <div className="text-5xl font-bold">{waiting.length}</div>
                  {waiting.slice(0, 3).length > 0 && (
                    <div className="mt-2 flex flex-col items-end gap-1">
                      {waiting.slice(0, 3).map((t) => (
                        <span
                          key={t.id}
                          className="text-xs bg-white/10 rounded px-2 py-0.5 font-mono"
                        >
                          {t.code}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* Ads panel */}
        <aside className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden flex flex-col min-h-0">
          <div className="px-4 py-2 text-white/50 text-xs uppercase tracking-widest border-b border-white/10">
            Announcements
          </div>
          {currentAd ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0">
              <h2 className="text-xl md:text-2xl font-semibold text-center mb-3">
                {currentAd.title}
              </h2>
              <div className="flex-1 w-full flex items-center justify-center min-h-0">
                {currentAd.type === 'image' ? (
                  <img
                    src={currentAd.dataUrl}
                    alt={currentAd.title}
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={currentAd.dataUrl}
                    autoPlay
                    muted
                    playsInline
                    onEnded={advance}
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                )}
              </div>
              {adCount > 1 && (
                <div className="mt-3 flex gap-1.5">
                  {activeAds.map((a, i) => (
                    <span
                      key={a.id}
                      className={
                        'h-1.5 rounded-full transition-all ' +
                        (i === adIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30')
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
              No announcements
            </div>
          )}
        </aside>
      </div>

      <footer className="px-8 py-3 text-center text-white/40 text-xs border-t border-white/10">
        Please wait for your number to be called
      </footer>
    </div>
  );
}