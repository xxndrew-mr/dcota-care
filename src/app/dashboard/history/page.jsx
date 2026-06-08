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
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  BuildingStorefrontIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  InboxIcon
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

// Helper: Badge status yang diperbarui
const StatusBadge = ({ status }) => {
  const styles = {
    Open: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    Done: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    Rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  };

  const icons = {
    Done: <CheckCircleIcon className="h-3.5 w-3.5" />,
    Rejected: <XCircleIcon className="h-3.5 w-3.5" />,
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${styles[status] || 'bg-slate-50 text-slate-700 ring-slate-400/20'}`}>
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
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <ArrowPathIcon className="h-10 w-10 animate-spin text-blue-600 opacity-50" />
        <p className="text-sm font-medium text-slate-500">Menyusun riwayat data...</p>
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

  const monthOptions = Array.from(monthMap.values()).sort((a, b) => b.value.localeCompare(a.value));
  const kategoriOptions = Array.from(new Set(tickets.map((t) => t.kategori).filter((k) => !!k)));

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
      
      {/* --- HERO HEADER --- */}
      <div className="relative isolate transform-gpu overflow-hidden rounded-[32px] bg-gradient-to-br from-[#5c1602] via-[#dc2626] to-[#ed781e] p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-200 mb-2">
              <ClockIcon className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Log Aktivitas Dcota Care</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              {isViewer ? 'Monitoring Laporan' : 'Riwayat Aksi Saya'}
            </h1>
            <p className="text-blue-100/70 max-w-xl text-sm sm:text-base leading-relaxed">
              {isViewer
                ? 'Pantau seluruh aliran request dan feedback antar divisi untuk keperluan evaluasi performa layanan.'
                : 'Tinjau kembali daftar permintaan yang telah Anda proses, verifikasi, atau tindak lanjuti.'}
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-blue-200">Total Record</p>
              <p className="text-2xl font-black">{tickets.length}</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <InboxIcon className="h-8 w-8 text-blue-300 opacity-50" />
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* --- FILTER SECTION --- */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sticky top-20 z-30 backdrop-blur-md bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari laporan, toko, atau pengirim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:border-blue-500 transition-all outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setExpandedId(null); }}
                className="rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-8 py-2.5 text-sm appearance-none outline-none focus:bg-white transition-all cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                {kategoriOptions.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <select
                value={selectedMonth}
                onChange={(e) => { setSelectedMonth(e.target.value); setExpandedId(null); }}
                className="rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-8 py-2.5 text-sm appearance-none outline-none focus:bg-white transition-all cursor-pointer"
              >
                <option value="all">Semua Bulan</option>
                {monthOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            {(selectedMonth !== 'all' || selectedCategory || searchQuery) && (
              <button
                onClick={() => { setSelectedMonth('all'); setSelectedCategory(''); setSearchQuery(''); setExpandedId(null); }}
                className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-2.5 rounded-xl transition-all"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </section>

      {/* --- CONTENT LIST --- */}
      {filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400">
          <InboxIcon className="h-12 w-12 mb-3 opacity-20" />
          <p className="text-sm font-medium">Tidak ada data riwayat yang ditemukan.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTickets.map((ticket) => {
            const isExpanded = expandedId === ticket.ticket_id;
            const baseDate = ticket.updatedAt || ticket.createdAt;

            return (
              <div
                key={ticket.ticket_id}
                onClick={() => setExpandedId(isExpanded ? null : ticket.ticket_id)}
                className={`group flex flex-col rounded-[24px] border transition-all duration-300 overflow-hidden cursor-pointer bg-white
                  ${isExpanded ? 'border-blue-500 shadow-xl shadow-blue-900/10' : 'border-slate-200 hover:border-blue-300 hover:shadow-lg'}
                `}
              >
                {/* Header Card */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                      #{ticket.ticket_id}
                    </span>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <h3 className={`text-sm font-bold leading-tight transition-colors ${isExpanded ? 'text-blue-700' : 'text-slate-900'}`}>
                    {ticket.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                    <ClockIcon className="h-3 w-3" />
                    {formatDate(baseDate)}
                  </div>
                </div>

                {/* Info Pengirim (Selalu tampil tipis) */}
                <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 gap-3">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><UserIcon className="h-2.5 w-2.5" /> Pelapor</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{ticket.nama_pengisi || '-'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><BuildingStorefrontIcon className="h-2.5 w-2.5" /> Toko</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{ticket.toko || '-'}</p>
                  </div>
                </div>

                {/* Detail (Expand) */}
                <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  <div className="px-5 pb-5 pt-2 space-y-5 border-t border-slate-100">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Deskripsi Permintaan</p>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {ticket.detail?.description || 'Tidak ada deskripsi tambahan.'}
                      </p>
                    </div>
                    {/* NOTES TERAKHIR */}
{ticket.logs?.[0]?.notes && (
  <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 shadow-sm">
    <p className="text-[10px] font-bold text-amber-600 uppercase mb-2">
      Catatan Aksi Terakhir
    </p>
    <p className="text-xs text-slate-700 whitespace-pre-line">
      {ticket.logs[0].notes}
    </p>
    <p className="text-[10px] text-slate-400 mt-2">
      Oleh: {ticket.logs[0]?.actor?.name} • {formatDate(ticket.logs[0]?.timestamp)}
    </p>
  </div>
)}

                    {ticket.detail?.attachments_json?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          <PaperClipIcon className="h-3 w-3" /> Lampiran ({ticket.detail.attachments_json.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {ticket.detail.attachments_json.map((file, idx) => (
                            <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-700 hover:bg-blue-100 transition-colors border border-blue-100">
                              <span className="truncate max-w-[100px]">{file.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                        {ticket.assignments?.[0]?.user?.name?.charAt(0) || '?'}
                      </div>
                      <div className="text-[10px]">
                        <p className="text-slate-400 font-medium">Penanggung Jawab Terakhir</p>
                        <p className="font-bold text-slate-700">
                          {ticket.assignments?.[0]?.user?.name || 'Sistem / Selesai'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Card */}
                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-white">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">{ticket.kategori}</span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    {isExpanded ? 'Tutup Detail' : 'Buka Detail'}
                    <ChevronDownIcon className={`h-3 w-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTER INFO */}
      <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center">
        <InformationCircleIcon className="h-4 w-4" />
        <p>Data riwayat diperbarui secara otomatis sesuai aktivitas tim di lapangan.</p>
      </div>
    </div>
  );
}