'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PaperClipIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';

const STATUS_STYLES = {
  Open: 'bg-slate-900 text-white',
  Pending: 'bg-amber-400 text-slate-900',
  Done: 'bg-emerald-600 text-white',
  Rejected: 'bg-red-600 text-white',
};

const STATUS_ICONS = {
  Done: <CheckCircleIcon className="h-3 w-3" />,
  Rejected: <XCircleIcon className="h-3 w-3" />,
};

const isValidDate = (date) => !Number.isNaN(date.getTime());

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (!isValidDate(date)) return '-';
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getMonthKey = (value) => {
  const date = new Date(value);
  if (!isValidDate(date)) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const getMonthLabel = (value) => {
  const date = new Date(value);
  if (!isValidDate(date)) return '-';
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${STATUS_STYLES[status] || 'bg-slate-200 text-slate-700'
        }`}
    >
      {STATUS_ICONS[status]}
      {status}
    </span>
  );
}

export default function ActionHistoryPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const isViewer = userRole === 'Viewer';

  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/tickets/history');
        if (res.ok) {
          setTickets(await res.json());
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-[#f26a21]" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Menyusun riwayat data
        </p>
      </div>
    );
  }

  const monthMap = new Map();
  tickets.forEach((ticket) => {
    const baseDate = ticket.updatedAt || ticket.createdAt;
    if (!baseDate) return;
    const key = getMonthKey(baseDate);
    if (key && !monthMap.has(key)) {
      monthMap.set(key, { value: key, label: getMonthLabel(baseDate) });
    }
  });

  const monthOptions = Array.from(monthMap.values()).sort((a, b) =>
    b.value.localeCompare(a.value)
  );
  const kategoriOptions = Array.from(
    new Set(tickets.map((ticket) => ticket.kategori).filter(Boolean))
  );

  const filteredTickets = tickets.filter((ticket) => {
    const baseDate = ticket.updatedAt || ticket.createdAt;
    if (!baseDate) return false;
    if (selectedMonth !== 'all' && getMonthKey(baseDate) !== selectedMonth) return false;
    if (selectedCategory && ticket.kategori !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const combined =
        `${ticket.title} ${ticket.detail?.description || ''} ${ticket.nama_pengisi || ''} ${ticket.toko || ''} ${ticket.kategori || ''} ${ticket.status || ''} ${ticket.submittedBy?.name || ''}`.toLowerCase();
      if (!combined.includes(query)) return false;
    }
    return true;
  });

  const hasFilter = selectedMonth !== 'all' || selectedCategory || searchQuery;

  const resetFilters = () => {
    setSelectedMonth('all');
    setSelectedCategory('');
    setSearchQuery('');
    setExpandedId(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <span className="bg-[#f26a21] px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
          Riwayat
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Dcota Care / Log Aktivitas
        </span>
      </div>

      <div className="mb-10 flex flex-col justify-between gap-6 border-b-2 border-slate-900 pb-8 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-4xl font-black uppercase leading-none tracking-tight text-slate-900 sm:text-5xl">
            {isViewer ? (
              <>
                Monitoring <span className="text-[#f26a21]">Laporan.</span>
              </>
            ) : (
              <>
                Riwayat <span className="text-[#f26a21]">Aksi.</span>
              </>
            )}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-500">
            {isViewer
              ? 'Pantau seluruh aliran request dan feedback antar divisi untuk keperluan evaluasi performa layanan.'
              : 'Tinjau kembali daftar permintaan yang telah Anda proses, verifikasi, atau tindak lanjuti.'}
          </p>
        </div>

        <div className="flex items-center gap-4 border border-slate-900 px-5 py-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Total Record
            </p>
            <p className="font-mono text-3xl font-black leading-none text-slate-900">
              {String(tickets.length).padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>

      <section className="mb-8 border border-slate-200">
        <div className="flex flex-col gap-0 lg:flex-row lg:items-stretch lg:divide-x lg:divide-slate-200">
          <div className="relative flex-1 border-b border-slate-200 lg:border-b-0">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari laporan, toko, atau pengirim..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <div className="relative border-b border-slate-200 lg:border-b-0">
            <select
              value={selectedCategory}
              onChange={(event) => {
                setSelectedCategory(event.target.value);
                setExpandedId(null);
              }}
              className="h-full w-full cursor-pointer appearance-none bg-transparent py-3.5 pl-4 pr-10 text-[11px] font-bold uppercase tracking-widest text-slate-700 focus:outline-none lg:w-48"
            >
              <option value="">Semua Kategori</option>
              {kategoriOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative border-b border-slate-200 lg:border-b-0">
            <select
              value={selectedMonth}
              onChange={(event) => {
                setSelectedMonth(event.target.value);
                setExpandedId(null);
              }}
              className="h-full w-full cursor-pointer appearance-none bg-transparent py-3.5 pl-4 pr-10 text-[11px] font-bold uppercase tracking-widest text-slate-700 focus:outline-none lg:w-48"
            >
              <option value="all">Semua Bulan</option>
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          {hasFilter && (
            <button
              onClick={resetFilters}
              className="bg-slate-900 px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#f26a21]"
            >
              Reset
            </button>
          )}
        </div>
      </section>

      {filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 py-24 text-slate-400">
          <InboxIcon className="mb-3 h-10 w-10" />
          <p className="text-[11px] font-bold uppercase tracking-widest">Tidak ada data riwayat</p>
        </div>
      ) : (
        <div className="grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTickets.map((ticket) => {
            const isExpanded = expandedId === ticket.ticket_id;
            const baseDate = ticket.updatedAt || ticket.createdAt;
            const lastLog = ticket.logs?.[0];
            const attachments = ticket.detail?.attachments_json || [];
            const lastAssignee = ticket.assignments?.[0]?.user?.name;

            return (
              <div
                key={ticket.ticket_id}
                onClick={() => setExpandedId(isExpanded ? null : ticket.ticket_id)}
                className={`flex cursor-pointer flex-col bg-white transition-colors ${isExpanded ? 'ring-2 ring-inset ring-[#f26a21]' : 'hover:bg-slate-50'
                  }`}
              >
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-[11px] font-bold text-slate-400">
                      #{ticket.ticket_id}
                    </span>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <h3 className="text-sm font-bold leading-snug text-slate-900">{ticket.title}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <ClockIcon className="h-3 w-3" />
                    {formatDate(baseDate)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      Pelapor
                    </p>
                    <p className="truncate text-xs font-bold text-slate-700">
                      {ticket.nama_pengisi || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      Toko
                    </p>
                    <p className="truncate text-xs font-bold text-slate-700">
                      {ticket.toko || '-'}
                    </p>
                  </div>
                </div>

                <div
                  className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 overflow-hidden opacity-0'
                    }`}
                >
                  <div className="space-y-4 border-t border-slate-100 px-5 pb-5 pt-4">
                    <div className="border-l-2 border-slate-900 pl-3">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Deskripsi Permintaan
                      </p>
                      <p className="whitespace-pre-line text-xs leading-relaxed text-slate-600">
                        {ticket.detail?.description || 'Tidak ada deskripsi tambahan.'}
                      </p>
                    </div>

                    {lastLog?.notes && (
                      <div className="border-l-2 border-amber-500 bg-amber-50 p-3">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-amber-600">
                          Catatan Aksi Terakhir
                        </p>
                        <p className="whitespace-pre-line text-xs text-slate-700">
                          {lastLog.notes}
                        </p>
                        <p className="mt-2 text-[10px] text-slate-400">
                          Oleh: {lastLog.actor?.name} • {formatDate(lastLog.timestamp)}
                        </p>
                      </div>
                    )}

                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          <PaperClipIcon className="h-3 w-3" /> Lampiran ({attachments.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {attachments.map((attachment, index) => (
                            <a
                              key={index}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(event) => event.stopPropagation()}
                              className="inline-flex items-center gap-2 border border-slate-900 px-3 py-1.5 text-[10px] font-bold text-slate-900 transition-colors hover:bg-slate-900 hover:text-white"
                            >
                              <span className="max-w-[100px] truncate">{attachment.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                      <div className="flex h-8 w-8 items-center justify-center bg-slate-900 text-xs font-bold uppercase text-white">
                        {lastAssignee?.charAt(0) || '?'}
                      </div>
                      <div className="text-[10px]">
                        <p className="font-bold uppercase tracking-widest text-slate-400">
                          Penanggung Jawab Terakhir
                        </p>
                        <p className="font-bold text-slate-700">
                          {lastAssignee || 'Sistem / Selesai'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 px-5 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#f26a21]">
                    {ticket.kategori}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {isExpanded ? 'Tutup' : 'Detail'}
                    <ChevronDownIcon
                      className={`h-3 w-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''
                        }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Data riwayat diperbarui otomatis sesuai aktivitas tim di lapangan
      </p>
    </div>
  );
}