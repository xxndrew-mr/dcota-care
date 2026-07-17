'use client';

import { useState, useEffect } from 'react';
import { BookmarkIcon, UserIcon } from '@heroicons/react/24/solid';
import { CalendarDaysIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import { formatDate, getMonthKey, getMonthLabel } from '@/lib/format';

export default function BookmarksPage() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState('all');

  useEffect(() => {
    fetch('/api/tickets/bookmarks')
      .then((res) => {
        if (!res.ok) throw new Error('Gagal mengambil data bookmark');
        return res.json();
      })
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const monthOptions = Array.from(
    new Map(
      tickets
        .filter((t) => t.createdAt)
        .map((t) => {
          const key = getMonthKey(t.createdAt);
          return [key, getMonthLabel(t.createdAt)];
        })
    ).entries()
  )
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => (a.value < b.value ? 1 : -1));

  const filteredTickets =
    monthFilter === 'all'
      ? tickets
      : tickets.filter((t) => getMonthKey(t.createdAt) === monthFilter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-slate-500 text-sm">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-[2px] border-slate-300 border-t-[#ed781e] mr-2" />
        Memuat bookmark...
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#5c1602] via-[#dc2626] to-[#ed781e] px-6 py-6 shadow-lg">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-white">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15">
                <BookmarkIcon className="h-5 w-5 text-yellow-300" />
              </span>
              Bookmark Bersama
            </h1>
            <p className="mt-1 text-sm text-orange-100 max-w-xl">
              Daftar feedback yang ditandai penting oleh tim untuk dipantau
              bersama.
            </p>
          </div>

          <div className="mt-3 sm:mt-0">
            <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-xs text-orange-50 backdrop-blur">
              <CalendarDaysIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Filter bulan:</span>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="rounded-xl border-none bg-white/90 px-2 py-1 text-xs font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
        </div>

        <div className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan{' '}
            <span className="font-semibold text-slate-800">
              {filteredTickets.length}
            </span>{' '}
            Feedback yang di-bookmark
            {monthFilter !== 'all' && ' pada bulan terpilih'}.
          </span>
        </div>

        {tickets.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Belum ada Feedback yang di-bookmark.
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Tidak ada Feedback yang di-bookmark pada bulan ini.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.ticket_id}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h2 className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
                      {ticket.title}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 font-medium">
                        #{ticket.ticket_id}
                      </span>
                      {ticket.kategori && (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-800">
                          {ticket.kategori}
                          {ticket.sub_kategori ? ` • ${ticket.sub_kategori}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <BookmarkIcon className="h-5 w-5 flex-shrink-0 text-yellow-400" />
                </div>

                <p className="mt-3 line-clamp-3 rounded-xl bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-700">
                  {ticket.detail?.description || '(Tidak ada deskripsi)'}
                </p>

                {ticket.detail?.attachments_json &&
                  Array.isArray(ticket.detail.attachments_json) &&
                  ticket.detail.attachments_json.length > 0 && (
                    <div className="mt-3">
                      <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        <PaperClipIcon className="h-3 w-3" />
                        Lampiran
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ticket.detail.attachments_json.map((file, idx) => (
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

                <div className="mt-3 border-t border-dashed border-slate-200 pt-3 text-[11px] text-slate-500">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5">
                        <UserIcon className="h-3 w-3 text-slate-400" />
                        <span className="font-medium text-slate-700">
                          {ticket.submittedBy?.name || 'Tidak diketahui'}
                        </span>
                      </span>
                      {ticket.createdAt && (
                        <span className="rounded-full bg-slate-50 px-2 py-0.5">
                          {formatDate(ticket.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {ticket.assignments && ticket.assignments.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      <span className="text-[11px] text-slate-400">
                        Di-bookmark oleh:
                      </span>
                      {ticket.assignments.map((asg, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800"
                        >
                          <UserIcon className="h-3 w-3" />
                          {asg.user?.name || '-'}
                          {asg.user?.role?.role_name
                            ? ` (${asg.user.role.role_name})`
                            : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
