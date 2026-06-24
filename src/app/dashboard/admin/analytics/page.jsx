'use client';

import { useState, useEffect } from 'react';
import {
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';

const LOOKER_STUDIO_URL =
  'https://lookerstudio.google.com/embed/reporting/0B5ff6cdq.../page/1M';

const REFRESH_INTERVAL_MS = 60_000;

function MetaBlock({ label, value, code, accent, mono }) {
  return (
    <div className="border-r border-slate-200 py-2 pl-6 last:border-r-0 lg:pl-8">
      <div className="dcota-mono mb-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {code} · {label}
      </div>
      <div
        className={`${mono ? 'dcota-mono text-2xl lg:text-3xl' : 'text-3xl lg:text-4xl'} font-extrabold leading-none tracking-tight ${accent ? 'text-[#f26a21]' : 'text-slate-900'
          }`}
      >
        {value}
      </div>
    </div>
  );
}

function InfoBlock({ code, label, title, subtitle }) {
  return (
    <div className="col-span-12 md:col-span-4">
      <p className="dcota-mono mb-3 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#f26a21]">
        {code} {label}
      </p>
      <p className="mb-1 text-[15px] font-extrabold tracking-tight text-slate-900">{title}</p>
      <p className="dcota-mono text-[11px] text-slate-500">{subtitle}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(null);
  const [, setIsFullscreen] = useState(false);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const intervalId = setInterval(update, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, []);

  const timeStr = now
    ? now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  const dateStr = now
    ? now
      .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      .toUpperCase()
    : '— — —';

  const handleRefresh = () => {
    setIsLoading(true);
    window.location.reload();
  };

  const handleFullscreen = () => {
    const frame = document.getElementById('looker-frame');
    if (!frame) return;

    if (!document.fullscreenElement) {
      frame.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .dcota-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        .dcota-mono { font-family: 'JetBrains Mono', monospace; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.35; }
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }

        .live-dot { animation: pulseDot 1.6s ease-in-out infinite; }
      `}</style>

      <div className="dcota-sans bg-white">
        <section
          className="border-b border-t-[3px] border-slate-200 border-t-[#f26a21]"
          style={{ animation: 'fadeUp 0.5s ease both' }}
        >
          <div className="mx-auto max-w-[1440px] px-6 pb-10 pt-12 lg:px-12">
            <div className="dcota-mono mb-5 flex items-center gap-3 text-[10.5px] uppercase tracking-[0.22em] text-slate-400">
              <span className="bg-[#f26a21] px-2 py-1 font-semibold tracking-[0.2em] text-white">
                ADMIN
              </span>
              <span className="font-semibold text-slate-900">DCOTA CARE</span>
              <span className="text-slate-300">/</span>
              <span>ANALYTICS</span>
            </div>

            <div className="grid grid-cols-12 items-end gap-6">
              <div className="col-span-12 lg:col-span-7">
                <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight lg:text-6xl">
                  Dashboard <span className="text-[#f26a21]">Analitik.</span>
                </h1>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-500">
                  Visualisasi performa laporan secara real-time, terintegrasi langsung dengan
                  BigQuery Data Warehouse.
                </p>
              </div>

              <div className="col-span-12 grid grid-cols-3 gap-0 border-l border-slate-200 lg:col-span-5">
                <MetaBlock label="Source" value="BigQuery" code="01" mono />
                <MetaBlock label="Mode" value="Live" code="02" accent />
                <MetaBlock label="Sync" value={timeStr} code="03" mono />
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-2">
              <button
                onClick={handleRefresh}
                className="dcota-mono flex items-center gap-2 bg-[#f26a21] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#d4551a]"
              >
                <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'spin' : ''}`} strokeWidth={2} />
                Refresh
              </button>
              <button
                onClick={handleFullscreen}
                className="dcota-mono flex items-center gap-2 border border-slate-300 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-900 transition-colors hover:border-[#f26a21] hover:text-[#f26a21]"
              >
                <ArrowsPointingOutIcon className="h-4 w-4" strokeWidth={2} />
                Fullscreen
              </button>

              <div className="dcota-mono ml-auto hidden items-center gap-2 text-[10px] uppercase tracking-[0.18em] md:flex">
                <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-emerald-700">Stream Active</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-400">{dateStr}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200">
          <div className="mx-auto max-w-[1440px] px-6 py-8 lg:px-12">
            <div className="flex items-center justify-between border border-b-0 border-slate-200 bg-slate-50/50 px-5 py-3">
              <div className="dcota-mono flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span className="flex items-center gap-2">
                  <CircleStackIcon className="h-3.5 w-3.5 text-[#f26a21]" strokeWidth={2} />
                  <span className="text-slate-900">BigQuery</span>
                </span>
                <span className="text-slate-300">/</span>
                <span>Looker Studio Embed</span>
              </div>

              <div className="dcota-mono hidden items-center gap-3 text-[10px] uppercase tracking-[0.18em] sm:flex">
                <span className="text-slate-400">Engine</span>
                <span className="font-semibold text-slate-900">v2.4</span>
              </div>
            </div>

            <div
              id="looker-frame"
              className="relative overflow-hidden border border-slate-200 bg-white"
              style={{ height: '78vh', minHeight: 560, animation: 'fadeUp 0.5s 0.15s ease both' }}
            >
              {isLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-white">
                  <div className="relative">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#f26a21]" />
                  </div>

                  <div className="space-y-2 text-center">
                    <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-900">
                      Loading Report
                    </p>
                    <p className="dcota-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                      Fetching · BigQuery · {timeStr}
                    </p>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 flex">
                    {Array.from({ length: 40 }).map((_, index) => (
                      <div key={index} className="h-0.5 flex-1 border-r border-slate-100" />
                    ))}
                  </div>
                </div>
              )}

              <iframe
                src={LOOKER_STUDIO_URL}
                frameBorder="0"
                style={{ border: 0, width: '100%', height: '100%' }}
                allowFullScreen
                onLoad={() => setIsLoading(false)}
                className="relative z-10"
                title="Laporan Analisis Dcota Care"
                sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              />
            </div>

            <div className="flex flex-col justify-between gap-2 border border-t-0 border-slate-200 bg-slate-50/50 px-5 py-3 sm:flex-row sm:items-center">
              <p className="dcota-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span className="text-[#f26a21]">Tip ·</span> Gunakan kontrol di dalam laporan untuk
                filter berdasarkan tanggal atau divisi
              </p>
              <div className="dcota-mono flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                <span>Auto-refresh</span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1.5">
                  <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-emerald-700">ON</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-[1440px] px-6 py-12 lg:px-12">
            <div className="grid grid-cols-12 gap-6">
              <InfoBlock
                code="①"
                label="Source"
                title="Google BigQuery"
                subtitle="PT. Onda Mega Integra"
              />
              <InfoBlock
                code="②"
                label="Visualization"
                title="Looker Studio"
                subtitle="Embedded · Real-time"
              />
              <InfoBlock
                code="③"
                label="Update Policy"
                title="Otomatis"
                subtitle="Sinkron tiap event masuk"
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}