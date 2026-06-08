'use client';

import { useState, useEffect } from 'react';
import {
  ArchiveBoxIcon,
  CalendarDaysIcon,
  UserIcon,
  PaperClipIcon, // <-- TAMBAHAN
} from '@heroicons/react/24/outline';

// Helpers ----------------------------------------------------
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getMonthKey = (dateString) => {
  if (!dateString) return null;
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const getMonthLabel = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });
};
// ------------------------------------------------------------

export default function ArchivePage() {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState('all');

  useEffect(() => {
    fetch('/api/tickets/archive')
      .then((res) => res.json())
      .then((data) => {
        setAssignments(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const monthOptions = Array.from(
    new Map(
      assignments
        .filter((a) => a.ticket?.createdAt)
        .map((a) => [
          getMonthKey(a.ticket.createdAt),
          getMonthLabel(a.ticket.createdAt),
        ])
    )
  )
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => (a.value < b.value ? 1 : -1));

  const filteredAssignments =
    monthFilter === 'all'
      ? assignments
      : assignments.filter(
          (a) => getMonthKey(a.ticket.createdAt) === monthFilter
        );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-slate-500 text-sm">
        <span className="h-5 w-5 rounded-full border-[2px] border-slate-300 border-t-[#ed781e] animate-spin mr-2"></span>
        Memuat arsip...
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {/* HEADER */}
      <div className="relative mb-8 rounded-3xl bg-gradient-to-br from-[#5c1602] via-[#dc2626] to-[#ed781e] px-6 py-6 shadow-lg overflow-hidden">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-semibold text-white">
              <span className="h-9 w-9 flex items-center justify-center rounded-2xl bg-white/10">
                <ArchiveBoxIcon className="h-5 w-5 text-white" />
              </span>
              Arsip Saya
            </h1>
            <p className="mt-1 text-sm text-orange-100">
              Daftar feedback yang Anda arsipkan secara pribadi.
            </p>
          </div>

          {/* FILTER BULAN */}
          <div className="mt-3 sm:mt-0 flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur text-xs text-white">
            <CalendarDaysIcon className="h-4 w-4" />
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-white/90 text-slate-700 text-xs rounded-lg px-2 py-1 border-none shadow-sm focus:outline-none"
            >
              <option value="all">Semua bulan</option>
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-10 -bottom-10 h-28 w-28 bg-white/20 rounded-full blur-2xl" />
      </div>

      {/* BODY */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        {filteredAssignments.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-sm">
            Arsip kosong pada bulan ini.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredAssignments.map((asg) => (
              <div
                key={asg.assignment_id}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm hover:border-indigo-300 hover:shadow-md transition"
              >
                {/* Header kartu */}
                <div className="flex justify-between items-start">
                  <h2 className="line-clamp-2 font-semibold text-slate-800">
                    {asg.ticket.title}
                  </h2>

                  <span className="px-2 py-1 text-[10px] rounded-full bg-slate-200 text-slate-700 font-semibold">
                    Archived
                  </span>
                </div>

                {/* Info pengirim & tanggal */}
                <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                  <UserIcon className="h-3 w-3 text-slate-400" />
                  <span>{asg.ticket.submittedBy?.name}</span>
                  <span>•</span>
                  <span>{formatDate(asg.ticket.createdAt)}</span>
                </div>

                {/* Deskripsi */}
                <p className="mt-3 text-xs leading-relaxed bg-slate-50 rounded-xl px-3 py-2 line-clamp-3 text-slate-700">
                  {asg.ticket.detail?.description || '(Tidak ada deskripsi)'}
                </p>

                {/* Lampiran */}
                {asg.ticket.detail?.attachments_json &&
                  Array.isArray(asg.ticket.detail.attachments_json) &&
                  asg.ticket.detail.attachments_json.length > 0 && (
                    <div className="mt-3">
                      <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        <PaperClipIcon className="h-3 w-3" />
                        Lampiran
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {asg.ticket.detail.attachments_json.map((file, idx) => (
                          <a
                            key={idx}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-100"
                          >
                            <PaperClipIcon className="h-4 w-4" />
                            <span className="max-w-[140px] truncate font-medium">
                              {file.name}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
