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
    textClass: 'text-[#f26a21]',
    bgClass: 'bg-[#f26a21]/[0.05] border-[#f26a21]/30',
    borderClass: 'border-l-[#f26a21]',
    dotClass: 'bg-[#f26a21]',
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

const SELECT_ARROW_STYLE = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.5rem center',
  backgroundSize: '14px',
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || {
    label: status,
    textClass: 'text-slate-700',
    bgClass: 'bg-slate-100 border-slate-200',
    borderClass: 'border-l-slate-300',
    dotClass: 'bg-slate-400',
  };

const formatDate = (value) =>
  new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const formatTime = (value) =>
  new Date(value).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

function StatusBadge({ status }) {
  const config = getStatusConfig(status);
  return (
    <span
      className={`dcota-mono inline-flex items-center gap-1.5 border px-2 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] ${config.bgClass} ${config.textClass}`}
    >
      <span className={`inline-block h-1.5 w-1.5 ${config.dotClass}`} />
      {config.label}
    </span>
  );
}

function InfoCell({ label, value, code }) {
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-baseline gap-2">
        {code && (
          <span className="dcota-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-300">
            {code}
          </span>
        )}
        <p className="dcota-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </p>
      </div>
      <p className="truncate text-[12.5px] font-bold text-slate-900">
        {value || <span className="text-slate-300">—</span>}
      </p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse border border-l-[6px] border-slate-200 border-l-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="mb-3 h-5 w-20 bg-slate-200" />
        <div className="mb-2 h-5 w-3/4 bg-slate-200" />
        <div className="h-3 w-1/2 bg-slate-100" />
      </div>
      <div className="space-y-3 bg-slate-50/40 px-5 py-4">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-1.5">
              <div className="h-2 w-12 bg-slate-200" />
              <div className="h-3 w-16 bg-slate-100" />
            </div>
          ))}
        </div>
        <div className="space-y-2 border border-slate-200 bg-white p-4">
          <div className="h-2 w-20 bg-slate-200" />
          <div className="h-3 w-full bg-slate-100" />
          <div className="h-3 w-4/5 bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function TicketCard({ ticket, index }) {
  const config = getStatusConfig(ticket.status);
  const rowNum = String(index + 1).padStart(3, '0');
  const attachments = ticket.detail?.attachments_json || [];

  return (
    <article
      className={`border border-l-[6px] border-slate-200 bg-white ${config.borderClass} transition-all duration-200 hover:border-[#f26a21] hover:shadow-[0_8px_24px_-16px_rgba(15,23,42,0.18)]`}
      style={{ animation: 'fadeUp 0.4s ease both' }}
    >
      <header className="border-b border-slate-100 bg-slate-50/40 px-4 py-4 sm:px-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-baseline gap-3">
            <span className="dcota-mono shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
              {rowNum}
            </span>
            <span className="dcota-mono shrink-0 bg-[#f26a21] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
              #{ticket.ticket_id}
            </span>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        <h2 className="mb-2 line-clamp-2 text-[15px] font-extrabold leading-snug tracking-tight text-slate-900 sm:text-base">
          {ticket.title}
        </h2>

        <div className="dcota-mono flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.14em] text-slate-400">
          <span>{formatDate(ticket.createdAt)}</span>
          <span className="text-slate-300">·</span>
          <span>{formatTime(ticket.createdAt)}</span>
          {ticket.kategori && (
            <>
              <span className="text-slate-300">·</span>
              <span className="font-bold text-slate-900">{ticket.kategori}</span>
            </>
          )}
        </div>
      </header>

      <div className="space-y-5 px-4 py-5 sm:px-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InfoCell code="01" label="Pelapor" value={ticket.nama_pengisi} />
          <InfoCell code="02" label="Toko" value={ticket.toko} />
          <InfoCell code="03" label="WhatsApp" value={ticket.no_telepon} />
        </div>

        <div>
          <div className="mb-2 flex items-baseline gap-2">
            <span className="dcota-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-300">
              04
            </span>
            <p className="dcota-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Detail Permintaan
            </p>
          </div>
          <div className="border-l-2 border-[#f26a21]/40 pl-3">
            <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-slate-700">
              {ticket.detail?.description || (
                <span className="italic text-slate-400">Tidak ada deskripsi tambahan.</span>
              )}
            </p>
          </div>
        </div>

        {attachments.length > 0 && (
          <div>
            <div className="mb-2 flex items-baseline gap-2">
              <span className="dcota-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-300">
                05
              </span>
              <p className="dcota-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Lampiran ({attachments.length})
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {attachments.map((attachment, attachmentIndex) => (
                <a
                  key={attachmentIndex}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dcota-mono flex items-center gap-1.5 border border-slate-300 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700 transition-colors hover:border-[#f26a21] hover:text-[#f26a21]"
                >
                  <PaperClipIcon className="h-3 w-3 shrink-0" strokeWidth={2} />
                  <span className="max-w-[120px] truncate font-semibold normal-case tracking-normal">
                    {attachment.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {ticket.logs?.length > 0 && (
        <details className="group/details border-t border-slate-200">
          <summary className="flex cursor-pointer select-none list-none items-center justify-between px-4 py-3.5 transition-colors hover:bg-[#f26a21]/[0.03] sm:px-5">
            <div className="flex items-baseline gap-3">
              <span className="dcota-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#f26a21]">
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

          <div className="max-h-[300px] overflow-y-auto px-4 pb-5 sm:px-5">
            <div className="space-y-4 pt-2">
              {ticket.logs.map((log) => (
                <div key={log.log_id} className="relative border-l-2 border-slate-200 pl-5">
                  <span className="absolute -left-[5px] top-1 h-2 w-2 bg-[#f26a21] ring-2 ring-white" />
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="truncate text-[12px] font-extrabold text-slate-900">
                      {log.actor.name}
                    </p>
                    <span className="dcota-mono shrink-0 bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
                      {log.action_type}
                    </span>
                  </div>
                  {log.notes && (
                    <p className="mb-1 text-[11.5px] leading-relaxed text-slate-600">{log.notes}</p>
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
}

function StatBlock({ label, value, code, accent, success }) {
  const colorClass = success
    ? 'text-emerald-600'
    : accent
      ? 'text-[#f26a21]'
      : 'text-slate-900';

  return (
    <div className="border-r border-slate-200 py-1 pl-3 last:border-r-0 sm:pl-6 lg:pl-8">
      <div className="dcota-mono mb-1.5 truncate text-[8.5px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-[9px] sm:tracking-[0.22em]">
        {code} · {label}
      </div>
      <div
        className={`text-2xl font-extrabold leading-none tracking-tight sm:text-3xl lg:text-5xl ${colorClass}`}
      >
        {String(value).padStart(2, '0')}
      </div>
    </div>
  );
}

function EmptyState({ hasFilters, onReset }) {
  return (
    <div className="border border-slate-200 py-16 text-center sm:py-20">
      <Ticket className="mx-auto mb-4 h-10 w-10 text-slate-300" strokeWidth={1.5} />
      <p className="dcota-mono mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-900">
        No Reports Found
      </p>
      <p className="dcota-mono mb-4 text-[10px] uppercase tracking-[0.18em] text-slate-400">
        {hasFilters ? 'Coba ubah kata kunci atau filter' : 'Belum ada laporan yang dikirim'}
      </p>
      {hasFilters && (
        <button
          onClick={onReset}
          className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#f26a21] hover:underline"
        >
          → Reset Filter
        </button>
      )}
    </div>
  );
}

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

  useEffect(() => {
    loadHistory();
  }, []);

  const kategoriOptions = useMemo(
    () => Array.from(new Set(tickets.map((ticket) => ticket.kategori).filter(Boolean))),
    [tickets]
  );

  const visibleTickets = tickets.filter((ticket) => {
    const date = new Date(ticket.createdAt);
    if (Number.isNaN(date.getTime())) return false;

    if (selectedMonth) {
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthStr !== selectedMonth) return false;
    }
    if (selectedCategory && ticket.kategori !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const haystack =
        `${ticket.title} ${ticket.detail?.description ?? ''} ${ticket.nama_pengisi ?? ''} ${ticket.toko ?? ''} ${ticket.kategori ?? ''} ${ticket.status ?? ''}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const hasFilters = Boolean(selectedMonth || selectedCategory || searchQuery);

  const clearFilter = () => {
    setSelectedMonth('');
    setSelectedCategory('');
    setSearchQuery('');
  };

  const doneCount = tickets.filter((ticket) => ticket.status === 'Done').length;
  const pendingCount = tickets.filter(
    (ticket) => ticket.status === 'Pending' || ticket.status === 'Open'
  ).length;
  const rejectedCount = tickets.filter((ticket) => ticket.status === 'Rejected').length;

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

      <div className="dcota-sans animate-in fade-in min-h-screen bg-slate-50/60 pb-12 duration-500">
        <section className="border-b border-t-[3px] border-slate-200 border-t-[#f26a21] bg-white">
          <div className="mx-auto max-w-[1200px] px-4 pb-6 pt-8 sm:px-6 sm:pb-10 sm:pt-12 lg:px-12">
            <div className="dcota-mono mb-4 flex flex-wrap items-center gap-2 text-[9.5px] uppercase tracking-[0.22em] text-slate-400 sm:mb-5 sm:gap-3 sm:text-[10.5px]">
              <span className="bg-[#f26a21] px-2 py-1 font-semibold tracking-[0.2em] text-white">
                MY TICKETS
              </span>
              <span className="font-semibold text-slate-900">DCOTA CARE</span>
              <span className="text-slate-300">/</span>
              <span>HISTORY</span>
            </div>

            <div className="grid grid-cols-12 items-end gap-4 sm:gap-6">
              <div className="col-span-12 lg:col-span-7">
                <h1 className="text-3xl font-extrabold leading-[0.95] tracking-tight sm:text-4xl lg:text-5xl">
                  Riwayat <span className="text-[#f26a21]">Laporan.</span>
                </h1>
                <p className="mt-3 max-w-md text-[12.5px] leading-relaxed text-slate-500 sm:mt-4 sm:text-sm">
                  Pantau status laporan dan tinjau kembali data yang telah Anda kirimkan.
                </p>
              </div>

              <div className="col-span-12 grid grid-cols-3 gap-0 border-t border-slate-200 pt-4 lg:col-span-5 lg:border-l lg:border-t-0 lg:pt-0">
                <StatBlock label="Total" value={tickets.length} code="01" />
                <StatBlock label="Selesai" value={doneCount} code="02" success />
                <StatBlock label="Proses" value={pendingCount} code="03" accent />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 sm:mt-10">
              <button
                onClick={loadHistory}
                className="dcota-mono flex items-center gap-2 bg-[#f26a21] px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#d4551a] sm:px-5 sm:py-3 sm:text-[11px]"
              >
                <ArrowPathIcon
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isLoading ? 'animate-spin' : ''}`}
                  strokeWidth={2}
                />
                Refresh
              </button>
              {rejectedCount > 0 && (
                <div className="dcota-mono ml-auto text-[10px] uppercase tracking-[0.16em] text-slate-400">
                  <span>Rejected:</span>
                  <span className="ml-1.5 font-bold text-slate-900">{rejectedCount}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="sticky top-16 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
          <div className="mx-auto max-w-[1200px] px-4 py-3 sm:px-6 lg:px-12">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <MagnifyingGlassIcon
                  className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  placeholder="Cari laporan, toko, atau kata kunci…"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full border-0 border-b border-slate-200 bg-transparent py-2 pl-6 pr-4 text-[13px] font-semibold text-slate-900 placeholder-slate-300 transition-colors focus:border-[#f26a21] focus:outline-none focus:ring-0"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="dcota-mono hidden text-[10px] uppercase tracking-[0.18em] text-slate-400 sm:inline">
                  Filter:
                </span>

                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="dcota-mono cursor-pointer appearance-none border border-slate-200 bg-white px-3 py-2 pr-7 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-900 transition-colors hover:border-slate-900 focus:border-[#f26a21] focus:outline-none"
                  style={SELECT_ARROW_STYLE}
                >
                  <option value="">Semua Kategori</option>
                  {kategoriOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <CalendarIcon
                    className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                    strokeWidth={2}
                  />
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(event) => setSelectedMonth(event.target.value)}
                    className="dcota-mono border border-slate-200 bg-white py-2 pl-8 pr-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-900 transition-colors hover:border-slate-900 focus:border-[#f26a21] focus:outline-none"
                  />
                </div>

                {hasFilters && (
                  <button
                    onClick={clearFilter}
                    className="dcota-mono flex items-center gap-1.5 border border-slate-200 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 transition-colors hover:border-[#f26a21] hover:text-[#f26a21]"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" strokeWidth={2} />
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="border-b border-[#f26a21]/20 bg-[#f26a21]/[0.04]">
            <div className="mx-auto max-w-[1200px] px-4 py-4 sm:px-6 lg:px-12">
              <p className="dcota-mono text-[12px] font-semibold text-[#f26a21]">{error}</p>
            </div>
          </div>
        )}

        <section>
          <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-12">
            <div className="mb-5 flex items-baseline justify-between border-b border-slate-200 pb-4">
              <div className="flex min-w-0 items-baseline gap-3 sm:gap-4">
                <span className="dcota-mono hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f26a21] sm:inline sm:text-[10.5px]">
                  §  Inbox
                </span>
                <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">Daftar Laporan</h2>
              </div>
              <span className="dcota-mono shrink-0 text-[10px] uppercase tracking-[0.22em] text-slate-400 sm:text-[10.5px]">
                {String(visibleTickets.length).padStart(3, '0')} /{' '}
                {String(tickets.length).padStart(3, '0')}
              </span>
            </div>

            {isLoading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : visibleTickets.length === 0 ? (
              <EmptyState hasFilters={hasFilters} onReset={clearFilter} />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {visibleTickets.map((ticket, index) => (
                  <TicketCard key={ticket.ticket_id} ticket={ticket} index={index} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}