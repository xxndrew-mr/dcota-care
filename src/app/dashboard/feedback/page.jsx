'use client';

import { useState, useEffect } from 'react';
import {
  BookmarkIcon,
  ArchiveBoxIcon,
  ChevronDownIcon,
  PaperClipIcon,
  InboxIcon,
  UserIcon,
  BuildingStorefrontIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

function MessageSquareIconHelper({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3h9m-9 3h3m-6.75 4.125l-.625.625A2.73 2.73 0 013.75 12V5.25A2.25 2.25 0 016 3h12a2.25 2.25 0 012.25 2.25v6.75a2.25 2.25 0 01-2.25 2.25H10.5l-3 3z" />
    </svg>
  );
}

function FeedbackActions({ assignment, onSuccess, onError }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (actionType) => {
    setIsLoading(true);
    onError(null);
    try {
      const res = await fetch(
        `/api/assignments/${assignment.assignment_id}/feedback-process`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: actionType }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal melakukan aksi');
      onSuccess();
    } catch (err) {
      onError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 animate-in fade-in duration-300" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2 mb-3">
        <InformationCircleIcon className="h-4 w-4 text-blue-600" />
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Aksi Feedback</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        {assignment.status === 'Pending' && (
          <button
            onClick={() => handleSubmit('bookmark')}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-200 transition-all hover:bg-amber-600 active:scale-95 disabled:bg-slate-300"
          >
            <BookmarkIcon className="h-4 w-4" />
            {isLoading ? '...' : 'Bookmark'}
          </button>
        )}
        {assignment.status !== 'Archived' && (
          <button
            onClick={() => handleSubmit('archive')}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-slate-200 transition-all hover:bg-slate-900 active:scale-95 disabled:bg-slate-300"
          >
            <ArchiveBoxIcon className="h-4 w-4" />
            {isLoading ? '...' : 'Archive'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function FeedbackQueuePage() {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const loadQueue = async () => {
    setError(null);
    setActionError(null);
    try {
      const res = await fetch('/api/queue/my-queue?type=Feedback_Review');
      if (!res.ok) throw new Error('Gagal mengambil data antrian');
      const data = await res.json();
      setAssignments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">Memuat feedback...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#5c1602] via-[#dc2626] to-[#ed781e] p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-200 mb-2">
              <InboxIcon className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Review Feedback</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-white">Antrian Feedback</h1>
            <p className="text-blue-100/70 max-w-xl text-sm leading-relaxed">
              Kelola masukan untuk meningkatkan kualitas layanan.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-blue-200 opacity-70">Total</p>
              <p className="text-3xl font-black">{assignments.length}</p>
            </div>
            <div className="h-12 w-px bg-white/20" />
            <MessageSquareIconHelper className="h-8 w-8 text-blue-300 opacity-50" />
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
          <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-bold">{error}</p>
          <button
            onClick={loadQueue}
            className="ml-auto text-xs font-bold underline hover:text-red-900"
          >
            Coba lagi
          </button>
        </div>
      )}

      {actionError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
          <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-bold">Error Aksi: {actionError}</p>
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="text-center py-20 rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400">
          <InboxIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">Tidak ada feedback untuk diproses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => {
            const isExpanded = expandedId === assignment.assignment_id;
            const ticket = assignment.ticket;

            return (
              <div
                key={assignment.assignment_id}
                onClick={() => setExpandedId(isExpanded ? null : assignment.assignment_id)}
                className={`group flex flex-col rounded-[28px] border bg-white transition-all duration-300 cursor-pointer overflow-hidden ${
                  isExpanded ? 'border-blue-500 shadow-xl' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{ticket.kategori}</span>
                    <span className="rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700">{assignment.status}</span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">{ticket.title}</h2>
                </div>

                <div className="px-6 py-4 bg-slate-50/50 border-y border-slate-50 flex flex-wrap gap-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600"><UserIcon className="h-3 w-3" /> {ticket.submittedBy?.name || '-'}</div>
                  {ticket.toko && <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600"><BuildingStorefrontIcon className="h-3 w-3" /> {ticket.toko}</div>}
                </div>

                {isExpanded && (
                  <div className="px-6 py-6 space-y-5 animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-inner">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Deskripsi</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{ticket.detail?.description || '(Tidak ada deskripsi)'}</p>
                    </div>

                    {ticket.detail?.attachments_json?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Lampiran</p>
                        <div className="flex flex-wrap gap-2">
                          {ticket.detail.attachments_json.map((file, idx) => (
                            <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-1.5 text-[10px] font-bold text-blue-700 hover:bg-blue-100 transition-colors">
                              <PaperClipIcon className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[100px]">{file.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <FeedbackActions assignment={assignment} onSuccess={loadQueue} onError={setActionError} />
                  </div>
                )}

                <div className="px-6 py-3 border-t border-slate-50 flex items-center justify-between bg-white text-[10px] font-bold text-slate-400 uppercase">
                  <span>ID: {ticket.ticket_id}</span>
                  <div className="flex items-center gap-1">
                    {isExpanded ? 'Tutup' : 'Detail'} <ChevronDownIcon className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}