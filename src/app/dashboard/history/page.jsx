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

// Helper: Format tanggal
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d)) return '-';
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Helper: Badge status (Swiss style — flat, sudut tegas)
const StatusBadge = ({ status }) => {
  const styles = {
    Open: 'bg-slate-900 text-white',
    Pending: 'bg-amber-400 text-slate-900',
    Done: 'bg-emerald-600 text-white',
    Rejected: 'bg-red-600 text-white',
  };

  const icons = {
    Done: <CheckCircleIcon className="h-3 w-3" />,
    Rejected: <XCircleIcon className="h-3 w-3" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${styles[status] || 'bg-slate-200 text-slate-700'
        }`}
    >
      {icons[status]}
      {status}
    </span>
  );
};

// Helper: key bulan (YYYY-MM)
const getMonthKey = (dateString) => {
  const d = new Date(dateString);
  if (isNaN(d)) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const getMonthLabel = (dateString) => {
  const d = new Date(dateString);
  if (isNaN(d)) return '-';
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

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
          const data = await res.json();
          setTickets(data);
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
        <ArrowPathIcon className="h-8 w-8 animate-spin text-red-600" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Menyusun riwayat data
        </p>
      </div>
    );
  }

  const monthMap = new Map();
  tickets.forEach((t) => {
    const baseDate = t.updatedAt || t.createdAt;
    if (!baseDate) return;
    const key = getMonthKey(baseDate);
    if (!key) return;
    if (!monthMap.has(key)) {
      monthMap.set(key, { value: key, label: getMonthLabel(baseDate) });
    }
  });

  const monthOptions = Array.from(monthMap.values()).sort((a, b) =>
    b.value.localeCompare(a.value)
  );
  const kategoriOptions = Array.from(
    new Set(tickets.map((t) => t.kategori).filter((k) => !!k))
  );

  const filteredTickets = tickets.filter((t) => {
    const baseDate = t.updatedAt || t.createdAt;
    if (!baseDate) return false;
    if (selectedMonth !== 'all' && getMonthKey(baseDate) !== selectedMonth) return false;
    if (selectedCategory && t.kategori !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const combined = `${t.title} ${t.detail?.description || ''} ${t.nama_pengisi || ''} ${t.toko || ''} ${t.kategori || ''} ${t.status || ''} ${t.submittedBy?.name || ''}`.toLowerCase();
      if (!combined.includes(q)) return false;
    }
    return true;
  });

  const hasFilter = selectedMonth !== 'all' || selectedCategory || searchQuery;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* --- HEADER --- */}
      <div className="mb-8 flex items-center gap-3">
        <span className="bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
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
              <>Monitoring <span className="text-red-600">Laporan.</span></>
            ) : (
              <>Riwayat <span className="text-red-600">Aksi.</span></>
            )}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-500">
            {isViewer
              ? 'Pantau seluruh aliran request dan feedback antar divisi untuk keperluan evaluasi performa layanan.'
              : 'Tinjau kembali daftar permintaan yang telah Anda proses, verifikasi, atau tindak lanjuti.'}
          </p>
        </div>

        {/* Total record */}
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

      {/* --- FILTER --- */}
      <section className="mb-8 border border-slate-200">
        <div className="flex flex-col gap-0 lg:flex-row lg:items-stretch lg:divide-x lg:divide-slate-200">
          {/* Search */}
          <div className="relative flex-1 border-b border-slate-200 lg:border-b-0">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari laporan, toko, atau pengirim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* Category */}
          <div className="relative border-b border-slate-200 lg:border-b-0">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setExpandedId(null);
              }}
              className="h-full w-full cursor-pointer appearance-none bg-transparent py-3.5 pl-4 pr-10 text-[11px] font-bold uppercase tracking-widest text-slate-700 focus:outline-none lg:w-48"
            >
              <option value="">Semua Kategori</option>
              {kategoriOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Month */}
          <div className="relative border-b border-slate-200 lg:border-b-0">
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setExpandedId(null);
              }}
              className="h-full w-full cursor-pointer appearance-none bg-transparent py-3.5 pl-4 pr-10 text-[11px] font-bold uppercase tracking-widest text-slate-700 focus:outline-none lg:w-48"
            >
              <option value="all">Semua Bulan</option>
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Reset */}
          {hasFilter && (
            <button
              onClick={() => {
                setSelectedMonth('all');
                setSelectedCategory('');
                setSearchQuery('');
                setExpandedId(null);
              }}
              className="bg-slate-900 px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-600"
            >
              Reset
            </button>
          )}
        </div>
      </section>

      {/* --- LIST --- */}
      {filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 py-24 text-slate-400">
          <InboxIcon className="mb-3 h-10 w-10" />
          <p className="text-[11px] font-bold uppercase tracking-widest">
            Tidak ada data riwayat
          </p>
        </div>
      ) : (
        <div className="grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTickets.map((ticket) => {
            const isExpanded = expandedId === ticket.ticket_id;
            const baseDate = ticket.updatedAt || ticket.createdAt;

            return (
              <div
                key={ticket.ticket_id}
                onClick={() =>
                  setExpandedId(isExpanded ? null : ticket.ticket_id)
                }
                className={`flex cursor-pointer flex-col bg-white transition-colors ${isExpanded ? 'ring-2 ring-inset ring-red-600' : 'hover:bg-slate-50'
                  }`}
              >
                {/* Header */}
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-[11px] font-bold text-slate-400">
                      #{ticket.ticket_id}
                    </span>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <h3 className="text-sm font-bold leading-snug text-slate-900">
                    {ticket.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <ClockIcon className="h-3 w-3" />
                    {formatDate(baseDate)}
                  </div>
                </div>

                {/* Info pengirim */}
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

                {/* Detail expand */}
                <div
                  className={`transition-all duration-300 ease-in-out ${isExpanded
                      ? 'max-h-[1000px] opacity-100'
                      : 'max-h-0 overflow-hidden opacity-0'
                    }`}
                >
                  <div className="space-y-4 border-t border-slate-100 px-5 pb-5 pt-4">
                    <div className="border-l-2 border-slate-900 pl-3">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Deskripsi Permintaan
                      </p>
                      <p className="whitespace-pre-line text-xs leading-relaxed text-slate-600">
                        {ticket.detail?.description ||
                          'Tidak ada deskripsi tambahan.'}
                      </p>
                    </div>

                    {/* Catatan terakhir */}
                    {ticket.logs?.[0]?.notes && (
                      <div className="border-l-2 border-amber-500 bg-amber-50 p-3">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-amber-600">
                          Catatan Aksi Terakhir
                        </p>
                        <p className="whitespace-pre-line text-xs text-slate-700">
                          {ticket.logs[0].notes}
                        </p>
                        <p className="mt-2 text-[10px] text-slate-400">
                          Oleh: {ticket.logs[0]?.actor?.name} •{' '}
                          {formatDate(ticket.logs[0]?.timestamp)}
                        </p>
                      </div>
                    )}

                    {/* Lampiran */}
                    {ticket.detail?.attachments_json?.length > 0 && (
                      <div className="space-y-2">
                        <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          <PaperClipIcon className="h-3 w-3" /> Lampiran (
                          {ticket.detail.attachments_json.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {ticket.detail.attachments_json.map((file, idx) => (
                            <a
                              key={idx}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-2 border border-slate-900 px-3 py-1.5 text-[10px] font-bold text-slate-900 transition-colors hover:bg-slate-900 hover:text-white"
                            >
                              <span className="max-w-[100px] truncate">
                                {file.name}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PJ terakhir */}
                    <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                      <div className="flex h-8 w-8 items-center justify-center bg-slate-900 text-xs font-bold uppercase text-white">
                        {ticket.assignments?.[0]?.user?.name?.charAt(0) || '?'}
                      </div>
                      <div className="text-[10px]">
                        <p className="font-bold uppercase tracking-widest text-slate-400">
                          Penanggung Jawab Terakhir
                        </p>
                        <p className="font-bold text-slate-700">
                          {ticket.assignments?.[0]?.user?.name ||
                            'Sistem / Selesai'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 px-5 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">
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

      {/* FOOTER */}
      <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Data riwayat diperbarui otomatis sesuai aktivitas tim di lapangan
      </p>
    </div>
  );
}