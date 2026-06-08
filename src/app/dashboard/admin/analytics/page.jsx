'use client';

import { useState, useEffect } from 'react';
import {
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const lookerStudioUrl = "https://lookerstudio.google.com/embed/reporting/0B5ff6cdq.../page/1M";

  // Timestamp di-set client-side supaya hydration aman
  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const timeStr = now
    ? now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : '--:--';
  const dateStr = now
    ? now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
    : '— — —';

  const handleRefresh = () => {
    setIsLoading(true);
    window.location.reload();
  };

  const handleFullscreen = () => {
    const el = document.getElementById('looker-frame');
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
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

        .live-dot {
          animation: pulseDot 1.6s ease-in-out infinite;
        }
      `}</style>

      <div className="dcota-sans bg-white">

        {/* ═══════════════════════════════════════════════════════
            PAGE HEADER + STATS — Swiss strip
        ═══════════════════════════════════════════════════════ */}
        <section className="border-b border-slate-200 border-t-[3px] border-t-[#ed1c24]" style={{ animation: 'fadeUp 0.5s ease both' }}>
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12 pt-12 pb-10">

            {/* Eyebrow breadcrumb */}
            <div className="dcota-mono text-[10.5px] uppercase tracking-[0.22em] text-slate-400 mb-5 flex items-center gap-3">
              <span className="bg-[#ed1c24] text-white px-2 py-1 font-semibold tracking-[0.2em]">ADMIN</span>
              <span className="text-slate-900 font-semibold">DCOTA CARE</span>
              <span className="text-slate-300">/</span>
              <span>ANALYTICS</span>
            </div>

            <div className="grid grid-cols-12 gap-6 items-end">
              {/* Headline */}
              <div className="col-span-12 lg:col-span-7">
                <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[0.95]">
                  Dashboard <span className="text-[#ed1c24]">Analitik.</span>
                </h1>
                <p className="text-sm text-slate-500 mt-4 max-w-md leading-relaxed">
                  Visualisasi performa laporan secara real-time, terintegrasi langsung dengan BigQuery Data Warehouse.
                </p>
              </div>

              {/* Meta blocks di kanan — 3 kolom */}
              <div className="col-span-12 lg:col-span-5 grid grid-cols-3 gap-0 border-l border-slate-200">
                <MetaBlock label="Source" value="BigQuery" code="01" mono />
                <MetaBlock label="Mode" value="Live" code="02" accent />
                <MetaBlock label="Sync" value={timeStr} code="03" mono />
              </div>
            </div>

            {/* Actions row */}
            <div className="mt-10 flex flex-wrap items-center gap-2">
              <button
                onClick={handleRefresh}
                className="dcota-mono flex items-center gap-2 bg-[#ed1c24] hover:bg-[#c8131a] text-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors"
              >
                <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'spin' : ''}`} strokeWidth={2} />
                Refresh
              </button>
              <button
                onClick={handleFullscreen}
                className="dcota-mono flex items-center gap-2 border border-slate-300 hover:border-[#ed1c24] hover:text-[#ed1c24] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-900 transition-colors"
              >
                <ArrowsPointingOutIcon className="h-4 w-4" strokeWidth={2} />
                Fullscreen
              </button>

              {/* Status pill di kanan actions */}
              <div className="ml-auto hidden md:flex items-center gap-2 dcota-mono text-[10px] uppercase tracking-[0.18em]">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot" />
                <span className="text-emerald-700 font-bold">Stream Active</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-400">{dateStr}</span>
              </div>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            IFRAME SECTION
        ═══════════════════════════════════════════════════════ */}
        <section className="border-b border-slate-200">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-8">

            {/* Meta strip ATAS iframe */}
            <div className="flex items-center justify-between border border-slate-200 border-b-0 bg-slate-50/50 px-5 py-3">
              <div className="flex items-center gap-4 dcota-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span className="flex items-center gap-2">
                  <CircleStackIcon className="h-3.5 w-3.5 text-[#ed1c24]" strokeWidth={2} />
                  <span className="text-slate-900">BigQuery</span>
                </span>
                <span className="text-slate-300">/</span>
                <span>Looker Studio Embed</span>
              </div>

              <div className="hidden sm:flex items-center gap-3 dcota-mono text-[10px] uppercase tracking-[0.18em]">
                <span className="text-slate-400">Engine</span>
                <span className="text-slate-900 font-semibold">v2.4</span>
              </div>
            </div>

            {/* iframe shell flat */}
            <div
              id="looker-frame"
              className="relative border border-slate-200 bg-white overflow-hidden"
              style={{
                height: '78vh',
                minHeight: 560,
                animation: 'fadeUp 0.5s 0.15s ease both',
              }}
            >
              {isLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white gap-6">
                  {/* Spinner minimalist */}
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-[#ed1c24] animate-spin" />
                  </div>

                  {/* Label */}
                  <div className="text-center space-y-2">
                    <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-900">
                      Loading Report
                    </p>
                    <p className="dcota-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                      Fetching · BigQuery · {timeStr}
                    </p>
                  </div>

                  {/* Decorative grid lines bottom — Swiss touch */}
                  <div className="absolute bottom-0 left-0 right-0 flex">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 h-0.5 border-r border-slate-100"
                      />
                    ))}
                  </div>
                </div>
              )}

              <iframe
                src={lookerStudioUrl}
                frameBorder="0"
                style={{ border: 0, width: '100%', height: '100%' }}
                allowFullScreen
                onLoad={() => setIsLoading(false)}
                className="relative z-10"
                title="Laporan Analisis Dcota Care"
                sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              />
            </div>

            {/* Meta strip BAWAH iframe */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-slate-200 border-t-0 bg-slate-50/50 px-5 py-3">
              <p className="dcota-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span className="text-[#ed1c24]">Tip ·</span> Gunakan kontrol di dalam laporan untuk filter berdasarkan tanggal atau divisi
              </p>
              <div className="flex items-center gap-3 dcota-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                <span>Auto-refresh</span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot" />
                  <span className="text-emerald-700 font-bold">ON</span>
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            INFO STRIP BOTTOM — Swiss footer
        ═══════════════════════════════════════════════════════ */}
        <section>
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-12">
            <div className="grid grid-cols-12 gap-6">

              <div className="col-span-12 md:col-span-4">
                <p className="dcota-mono text-[10.5px] uppercase tracking-[0.22em] text-[#ed1c24] font-semibold mb-3">
                  ① Source
                </p>
                <p className="text-[15px] font-extrabold tracking-tight text-slate-900 mb-1">
                  Google BigQuery
                </p>
                <p className="dcota-mono text-[11px] text-slate-500">
                  PT. Onda Mega Integra
                </p>
              </div>

              <div className="col-span-12 md:col-span-4">
                <p className="dcota-mono text-[10.5px] uppercase tracking-[0.22em] text-[#ed1c24] font-semibold mb-3">
                  ② Visualization
                </p>
                <p className="text-[15px] font-extrabold tracking-tight text-slate-900 mb-1">
                  Looker Studio
                </p>
                <p className="dcota-mono text-[11px] text-slate-500">
                  Embedded · Real-time
                </p>
              </div>

              <div className="col-span-12 md:col-span-4">
                <p className="dcota-mono text-[10.5px] uppercase tracking-[0.22em] text-[#ed1c24] font-semibold mb-3">
                  ③ Update Policy
                </p>
                <p className="text-[15px] font-extrabold tracking-tight text-slate-900 mb-1">
                  Otomatis
                </p>
                <p className="dcota-mono text-[11px] text-slate-500">
                  Sinkron tiap event masuk
                </p>
              </div>

            </div>
          </div>
        </section>

      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   META BLOCK — kotak meta info kanan header
───────────────────────────────────────────── */
function MetaBlock({ label, value, code, accent, mono }) {
  return (
    <div className="border-r border-slate-200 last:border-r-0 pl-6 lg:pl-8 py-2">
      <div className="dcota-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400 mb-2">
        {code} · {label}
      </div>
      <div
        className={`${mono ? 'dcota-mono text-2xl lg:text-3xl' : 'text-3xl lg:text-4xl'} font-extrabold tracking-tight leading-none ${accent ? 'text-[#ed1c24]' : 'text-slate-900'
          }`}
      >
        {value}
      </div>
    </div>
  );
}