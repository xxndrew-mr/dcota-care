'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  PaperClipIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ChevronDownIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Ticket } from 'lucide-react';

/* ─────────────────────────────────────────────
   STATUS CONFIG — palet Dcota
   (warna status = makna fungsional, dipertahankan)
───────────────────────────────────────────── */
const STATUS_CONFIG = {
  Open: {
    label: 'Open',
    textClass: 'text-slate-900',
    bgClass: 'bg-slate-100 border-slate-300',
    borderClass: 'border-l-slate-400',
    dotClass: 'bg-slate-500',
  },
  Pending: {
    label: 'Pending',
    textClass: 'text-[#ed1c24]',
    bgClass: 'bg-[#ed1c24]/[0.05] border-[#ed1c24]/30',
    borderClass: 'border-l-[#ed1c24]',
    dotClass: 'bg-[#ed1c24]',
  },
  Done: {
    label: 'Done',
    textClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50 border-emerald-200',
    borderClass: 'border-l-emerald-500',
    dotClass: 'bg-emerald-500',
  },
  Rejected: {
    label: 'Rejected',
    textClass: 'text-slate-700',
    bgClass: 'bg-slate-100 border-slate-300',
    borderClass: 'border-l-slate-700',
    dotClass: 'bg-slate-700',
  },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || {
    label: status,
    textClass: 'text-slate-700',
    bgClass: 'bg-slate-100 border-slate-200',
    borderClass: 'border-l-slate-300',
    dotClass: 'bg-slate-400',
  };

/* ─────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const cfg = getStatusConfig(status);
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] dcota-mono ${cfg.bgClass} ${cfg.textClass}`}>
      <span className={`inline-block w-1.5 h-1.5 ${cfg.dotClass}`} />
      {cfg.label}
    </span>
  );
};

/* ─────────────────────────────────────────────
   INFO CELL
───────────────────────────────────────────── */
const InfoCell = ({ label, value, code }) => (
  <div className="min-w-0">
    <div className="flex items-baseline gap-2 mb-1">
      {code && (
        <span className="dcota-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-300">
          {code}
        </span>
      )}
      <p className="dcota-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
    </div>
    <p className="text-[12.5px] font-bold text-slate-900 truncate">
      {value || <span className="text-slate-300">—</span>}
    </p>
  </div>
);

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="animate-pulse border border-slate-200 border-l-[6px] border-l-slate-200 bg-white">
    <div className="px-5 py-4 border-b border-slate-100">
      <div className="h-5 w-20 bg-slate-200 mb-3" />
      <div className="h-5 w-3/4 bg-slate-200 mb-2" />
      <div className="h-3 w-1/2 bg-slate-100" />
    </div>
    <div className="px-5 py-4 bg-slate-50/40 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5"><div className="h-2 w-12 bg-slate-200" /><div className="h-3 w-16 bg-slate-100" /></div>
        <div className="space-y-1.5"><div className="h-2 w-12 bg-slate-200" /><div className="h-3 w-16 bg-slate-100" /></div>
        <div className="space-y-1.5"><div className="h-2 w-12 bg-slate-200" /><div className="h-3 w-16 bg-slate-100" /></div>
      </div>
      <div className="border border-slate-200 bg-white p-4 space-y-2">
        <div className="h-2 w-20 bg-slate-200" />
        <div className="h-3 w-full bg-slate-100" />
        <div className="h-3 w-4/5 bg-slate-100" />
      </div>
    </div>
  </div>
);

/* ═════════════════════════════════════════════
   TICKET CARD
═════════════════════════════════════════════ */
const TicketCard = ({ ticket, idx }) => {
  const cfg = getStatusConfig(ticket.status);
  const rowNum = String(idx + 1).padStart(3, '0');

  return (
    <article
      className={`bg-white border border-slate-200 border-l-[6px] ${cfg.borderClass} transition-all duration-200 hover:border-[#ed1c24] hover:shadow-[0_8px_24px_-16px_rgba(15,23,42,0.18)]`}
      style={{ animation: 'fadeUp 0.4s ease both' }}
    >
      {/* ─── HEADER STRIP ─── */}
      <header className="px-4 sm:px-5 py-4 border-b border-slate-100 bg-slate-50/40">
        <div className="flex items-start justify-between gap-3 mb-2">
          {/* Left: row number + ticket id */}
          <div className="flex items-baseline gap-3 min-w-0 flex-1">
            <span className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300 shrink-0">
              {rowNum}
            </span>
            <span className="dcota-mono text-[10px] font-bold uppercase tracking-[0.16em] bg-[#ed1c24] text-white px-2 py-0.5 shrink-0">
              #{ticket.ticket_id}
            </span>
          </div>
          {/* Right: status */}
          <StatusBadge status={ticket.status} />
        </div>

        {/* Title */}
        <h2 className="text-[15px] sm:text-base font-extrabold tracking-tight text-slate-900 leading-snug line-clamp-2 mb-2">
          {ticket.title}
        </h2>

        {/* Meta line */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 dcota-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
          <span>
            {new Date(ticket.createdAt).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <span className="text-slate-300">·</span>
          <span>
            {new Date(ticket.createdAt).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {ticket.kategori && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-slate-900 font-bold">{ticket.kategori}</span>
            </>
          )}
        </div>
      </header>

      {/* ─── BODY ─── */}
      <div className="px-4 sm:px-5 py-5 space-y-5">

        {/* Info grid — STACKED di mobile, 3 cols di sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InfoCell code="01" label="Pelapor" value={ticket.nama_pengisi} />
          <InfoCell code="02" label="Toko" value={ticket.toko} />
          <InfoCell code="03" label="WhatsApp" value={ticket.no_telepon} />
        </div>

        {/* Deskripsi block */}
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="dcota-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-300">
              04
            </span>
            <p className="dcota-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Detail Permintaan
            </p>
          </div>
          <div className="border-l-2 border-[#ed1c24]/40 pl-3">
            <p className="text-[12.5px] text-slate-700 leading-relaxed whitespace-pre-line">
              {ticket.detail?.description || (
                <span className="italic text-slate-400">Tidak ada deskripsi tambahan.</span>
              )}
            </p>
          </div>
        </div>

        {/* Attachments */}
        {ticket.detail?.attachments_json?.length > 0 && (
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="dcota-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-300">
                05
              </span>
              <p className="dcota-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Lampiran ({ticket.detail.attachments_json.length})
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ticket.detail.attachments_json.map((f, idx) => (
                <a
                  key={idx}
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dcota-mono flex items-center gap-1.5 border border-slate-300 hover:border-[#ed1c24] hover:text-[#ed1c24] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700 transition-colors"
                >
                  <PaperClipIcon className="h-3 w-3 shrink-0" strokeWidth={2} />
                  <span className="max-w-[120px] truncate normal-case tracking-normal font-semibold">
                    {f.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── ACTIVITY LOG ─── */}
      {ticket.logs?.length > 0 && (
        <details className="group/details border-t border-slate-200">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 sm:px-5 py-3.5 hover:bg-[#ed1c24]/[0.03] transition-colors select-none">
            <div className="flex items-baseline gap-3">
              <span className="dcota-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#ed1c24]">
                LOG
              </span>
              <span className="dcota-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">
                Riwayat Aktivitas ({ticket.logs.length})
              </span>
            </div>
            <ChevronDownIcon
              className="h-4 w-4 text-slate-400 transition-transform group-open/details:rotate-180"
              strokeWidth={2}
            />
          </summary>

          <div className="px-4 sm:px-5 pb-5 max-h-[300px] overflow-y-auto">
            <div className="space-y-4 pt-2">
              {ticket.logs.map((log, lIdx) => (
                <div key={log.log_id} className="relative pl-5 border-l-2 border-slate-200">
                  <span className="absolute -left-[5px] top-1 h-2 w-2 bg-[#ed1c24] ring-2 ring-white" />
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-[12px] font-extrabold text-slate-900 truncate">
                      {log.actor.name}
                    </p>
                    <span className="dcota-mono text-[9px] font-bold uppercase tracking-[0.14em] bg-slate-900 text-white px-1.5 py-0.5 shrink-0">
                      {log.action_type}
                    </span>
                  </div>
                  {log.notes && (
                    <p className="text-[11.5px] text-slate-600 leading-relaxed mb-1">
                      {log.notes}
                    </p>
                  )}
                  <p className="dcota-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {new Date(log.timestamp).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </details>
      )}
    </article>
  );
};

/* ═════════════════════════════════════════════
   MAIN PAGE
═════════════════════════════════════════════ */
export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadHistory = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/tickets/my-history');
      if (!res.ok) throw new Error('Gagal mengambil data riwayat');
      setTickets(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, []);

  const kategoriOptions = useMemo(
    () => Array.from(new Set(tickets.map((t) => t.kategori).filter(Boolean))),
    [tickets]
  );

  const visibleTickets = tickets.filter((ticket) => {
    const d = new Date(ticket.createdAt);
    if (isNaN(d.getTime())) return false;

    if (selectedMonth) {
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthStr !== selectedMonth) return false;
    }
    if (selectedCategory && ticket.kategori !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const haystack = `${ticket.title} ${ticket.detail?.description ?? ''} ${ticket.nama_pengisi ?? ''} ${ticket.toko ?? ''} ${ticket.kategori ?? ''} ${ticket.status ?? ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const hasFilters = selectedMonth || selectedCategory || searchQuery;
  const clearFilter = () => {
    setSelectedMonth('');
    setSelectedCategory('');
    setSearchQuery('');
  };

  const doneCount = tickets.filter((t) => t.status === 'Done').length;
  const pendingCount = tickets.filter((t) => t.status === 'Pending' || t.status === 'Open').length;
  const rejectedCount = tickets.filter((t) => t.status === 'Rejected').length;

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
      `}</style>

      <div className="dcota-sans bg-slate-50/60 animate-in fade-in duration-500 min-h-screen pb-12">

        {/* ═══════════════════════════════════════════════════════
            HEADER
        ═══════════════════════════════════════════════════════ */}
        <section className="border-b border-slate-200 border-t-[3px] border-t-[#ed1c24] bg-white">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 pt-8 sm:pt-12 pb-6 sm:pb-10">

            {/* Breadcrumb */}
            <div className="dcota-mono text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.22em] text-slate-400 mb-4 sm:mb-5 flex items-center flex-wrap gap-2 sm:gap-3">
              <span className="bg-[#ed1c24] text-white px-2 py-1 font-semibold tracking-[0.2em]">MY TICKETS</span>
              <span className="text-slate-900 font-semibold">DCOTA CARE</span>
              <span className="text-slate-300">/</span>
              <span>HISTORY</span>
            </div>

            <div className="grid grid-cols-12 gap-4 sm:gap-6 items-end">
              {/* Headline */}
              <div className="col-span-12 lg:col-span-7">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[0.95]">
                  Riwayat <span className="text-[#ed1c24]">Laporan.</span>
                </h1>
                <p className="text-[12.5px] sm:text-sm text-slate-500 mt-3 sm:mt-4 max-w-md leading-relaxed">
                  Pantau status laporan dan tinjau kembali data yang telah Anda kirimkan.
                </p>
              </div>

              {/* Stats — 3 cols always (small but readable) */}
              <div className="col-span-12 lg:col-span-5 grid grid-cols-3 gap-0 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0">
                <StatBlock label="Total" value={tickets.length} code="01" />
                <StatBlock label="Selesai" value={doneCount} code="02" success />
                <StatBlock label="Proses" value={pendingCount} code="03" accent />
              </div>
            </div>

            {/* Actions row */}
            <div className="mt-6 sm:mt-10 flex flex-wrap items-center gap-2">
              <button
                onClick={loadHistory}
                className="dcota-mono flex items-center gap-2 bg-[#ed1c24] hover:bg-[#c8131a] text-white px-4 sm:px-5 py-2.5 sm:py-3 text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.14em] transition-colors"
              >
                <ArrowPathIcon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={2} />
                Refresh
              </button>
              {rejectedCount > 0 && (
                <div className="dcota-mono text-[10px] uppercase tracking-[0.16em] text-slate-400 ml-auto">
                  <span>Rejected:</span>
                  <span className="text-slate-900 font-bold ml-1.5">{rejectedCount}</span>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            FILTER TOOLBAR — Swiss
        ═══════════════════════════════════════════════════════ */}
        <section className="sticky top-16 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

              {/* Search — underline only */}
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Cari laporan, toko, atau kata kunci…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-0 border-b border-slate-200 bg-transparent pl-6 pr-4 py-2 text-[13px] font-semibold text-slate-900 placeholder-slate-300 focus:border-[#ed1c24] focus:outline-none focus:ring-0 transition-colors"
                />
              </div>

              {/* Filter selects */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="dcota-mono text-[10px] uppercase tracking-[0.18em] text-slate-400 hidden sm:inline">
                  Filter:
                </span>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="dcota-mono text-[11px] font-semibold uppercase tracking-[0.12em] border border-slate-200 hover:border-slate-900 bg-white px-3 py-2 text-slate-900 cursor-pointer appearance-none pr-7 transition-colors focus:outline-none focus:border-[#ed1c24]"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '14px',
                  }}
                >
                  <option value="">Semua Kategori</option>
                  {kategoriOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <div className="relative">
                  <CalendarIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="dcota-mono text-[11px] font-semibold uppercase tracking-[0.12em] border border-slate-200 hover:border-slate-900 bg-white pl-8 pr-3 py-2 text-slate-900 transition-colors focus:outline-none focus:border-[#ed1c24]"
                  />
                </div>

                {hasFilters && (
                  <button
                    onClick={clearFilter}
                    className="dcota-mono flex items-center gap-1.5 border border-slate-200 hover:border-[#ed1c24] hover:text-[#ed1c24] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 transition-colors"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" strokeWidth={2} />
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            ERROR BANNER
        ═══════════════════════════════════════════════════════ */}
        {error && (
          <div className="border-b border-[#ed1c24]/20 bg-[#ed1c24]/[0.04]">
            <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 py-4">
              <p className="dcota-mono text-[12px] font-semibold text-[#ed1c24]">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            CONTENT
        ═══════════════════════════════════════════════════════ */}
        <section>
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 py-6 sm:py-8">

            {/* Section header + result count */}
            <div className="flex items-baseline justify-between mb-5 pb-4 border-b border-slate-200">
              <div className="flex items-baseline gap-3 sm:gap-4 min-w-0">
                <span className="dcota-mono text-[10px] sm:text-[10.5px] uppercase tracking-[0.22em] text-[#ed1c24] font-semibold hidden sm:inline">
                  §  Inbox
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Daftar Laporan
                </h2>
              </div>
              <span className="dcota-mono text-[10px] sm:text-[10.5px] uppercase tracking-[0.22em] text-slate-400 shrink-0">
                {String(visibleTickets.length).padStart(3, '0')} / {String(tickets.length).padStart(3, '0')}
              </span>
            </div>

            {isLoading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : visibleTickets.length === 0 ? (
              <EmptyState hasFilters={hasFilters} onReset={clearFilter} />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {visibleTickets.map((ticket, idx) => (
                  <TicketCard key={ticket.ticket_id} ticket={ticket} idx={idx} />
                ))}
              </div>
            )}

          </div>
        </section>

      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   STAT BLOCK
───────────────────────────────────────────── */
function StatBlock({ label, value, code, accent, success }) {
  const colorClass = success
    ? 'text-emerald-600'
    : accent
      ? 'text-[#ed1c24]'
      : 'text-slate-900';

  return (
    <div className="border-r border-slate-200 last:border-r-0 pl-3 sm:pl-6 lg:pl-8 py-1">
      <div className="dcota-mono text-[8.5px] sm:text-[9px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.22em] text-slate-400 mb-1.5 truncate">
        {code} · {label}
      </div>
      <div className={`text-2xl sm:text-3xl lg:text-5xl font-extrabold tracking-tight leading-none ${colorClass}`}>
        {String(value).padStart(2, '0')}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────── */
function EmptyState({ hasFilters, onReset }) {
  return (
    <div className="border border-slate-200 py-16 sm:py-20 text-center">
      <Ticket className="h-10 w-10 mx-auto mb-4 text-slate-300" strokeWidth={1.5} />
      <p className="dcota-mono text-[11px] font-bold uppercase tracking-[0.22em] text-slate-900 mb-2">
        No Reports Found
      </p>
      <p className="dcota-mono text-[10px] uppercase tracking-[0.18em] text-slate-400 mb-4">
        {hasFilters
          ? 'Coba ubah kata kunci atau filter'
          : 'Belum ada laporan yang dikirim'}
      </p>
      {hasFilters && (
        <button
          onClick={onReset}
          className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#ed1c24] hover:underline"
        >
          → Reset Filter
        </button>
      )}
    </div>
  );
}