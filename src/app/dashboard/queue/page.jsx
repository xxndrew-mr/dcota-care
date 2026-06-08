'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  PaperClipIcon,
  ChevronDownIcon,
  ExclamationCircleIcon,
  UserIcon,
  PhoneIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentCheckIcon,
  CheckBadgeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

/* ═════════════════════════════════════════════
   ACTION PANEL — SHARED SHELL
   Semua role pakai shell yang sama, beda di:
   - code (① ② ③ ④)
   - section title
   - tombol & label
═════════════════════════════════════════════ */
function ActionPanelShell({ code, title, children }) {
  return (
    <div className="mt-6 border border-slate-200 bg-slate-50/50" onClick={(e) => e.stopPropagation()}>
      {/* Header strip */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-3">
        <span className="dcota-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#ed1c24]">
          {code}
        </span>
        <span className="dcota-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-slate-900">
          {title}
        </span>
      </div>
      <div className="p-5 space-y-4">
        {children}
      </div>
    </div>
  );
}

/* Textarea Swiss: border bawah only */
const TEXTAREA_CLASSES =
  "w-full border-0 border-b border-slate-300 bg-transparent px-0 py-3 text-[13.5px] font-medium text-slate-900 placeholder-slate-400 focus:border-[#ed1c24] focus:outline-none focus:ring-0 transition-colors resize-none";

/* Tombol mono uppercase */
const BTN_PRIMARY =
  "dcota-mono px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white bg-slate-900 hover:bg-[#ed1c24] transition-colors disabled:opacity-50";
const BTN_OUTLINE =
  "dcota-mono px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-900 border border-slate-300 hover:border-slate-900 transition-colors disabled:opacity-50";
const BTN_DANGER =
  "dcota-mono px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white bg-[#ed1c24] hover:bg-[#c8131a] transition-colors disabled:opacity-50";
const BTN_SUCCESS =
  "dcota-mono px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white bg-emerald-700 hover:bg-emerald-800 transition-colors disabled:opacity-50";

/* ═════════════════════════════════════════════
   PIC OMI - Triage
═════════════════════════════════════════════ */
function TriageActions({ ticketId, onSuccess, onError }) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (actionType) => {
    setIsLoading(true);
    onError(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: actionType, notes }),
      });
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
    <ActionPanelShell code="①" title="Tindak Lanjut · PIC OMI">
      <div>
        <label className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Catatan
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Berikan catatan penanganan..."
          rows={3}
          className={TEXTAREA_CLASSES}
        />
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        <button onClick={() => handleSubmit('Feedback')} disabled={isLoading} className={BTN_PRIMARY}>
          {isLoading ? 'Memproses…' : '→ Hanya Informasi'}
        </button>
      </div>
    </ActionPanelShell>
  );
}

/* ═════════════════════════════════════════════
   SALES MANAGER
═════════════════════════════════════════════ */
function SalesManagerActions({ ticketId, onSuccess, onError }) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (actionType) => {
    if (notes.trim() === '') {
      onError('Catatan wajib diisi untuk aksi ini.');
      return;
    }
    setIsLoading(true);
    onError(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/sm-process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType, notes }),
      });
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
    <ActionPanelShell code="②" title="Keputusan · Sales Manager">
      <div>
        <label className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Catatan (Wajib)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Berikan catatan keputusan..."
          rows={3}
          className={TEXTAREA_CLASSES}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
        <button onClick={() => handleSubmit('approve')} disabled={isLoading} className={BTN_SUCCESS}>
          {isLoading ? '…' : '✓ Approve'}
        </button>
        <button onClick={() => handleSubmit('reject')} disabled={isLoading} className={BTN_DANGER}>
          ✕ Reject
        </button>
        <button onClick={() => handleSubmit('complete')} disabled={isLoading} className={BTN_PRIMARY}>
          → Selesaikan
        </button>
      </div>
    </ActionPanelShell>
  );
}

/* ═════════════════════════════════════════════
   ACTING MANAGER
═════════════════════════════════════════════ */
function ActingManagerActions({ ticketId, onSuccess, onError }) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (actionType) => {
    if (notes.trim() === '') {
      onError('Catatan wajib diisi untuk aksi ini.');
      return;
    }
    setIsLoading(true);
    onError(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/am-process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType, notes }),
      });
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
    <ActionPanelShell code="③" title="Persetujuan · Acting Manager">
      <div>
        <label className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Alasan Keputusan (Wajib)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tuliskan alasan keputusan..."
          rows={3}
          className={TEXTAREA_CLASSES}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 pt-2">
        <button onClick={() => handleSubmit('approve')} disabled={isLoading} className={BTN_SUCCESS}>
          ✓ Approve
        </button>
        <button onClick={() => handleSubmit('reject')} disabled={isLoading} className={BTN_DANGER}>
          ✕ Reject
        </button>
      </div>
    </ActionPanelShell>
  );
}

/* ═════════════════════════════════════════════
   ACTING PIC
═════════════════════════════════════════════ */
function ActingPicActions({ ticketId, onSuccess, onError }) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (actionType) => {
    if (notes.trim() === '') {
      onError('Catatan wajib diisi untuk aksi ini.');
      return;
    }
    setIsLoading(true);
    onError(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/ap-process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType, notes }),
      });
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
    <ActionPanelShell code="④" title="Finalisasi · Acting PIC">
      <div>
        <label className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Catatan Penyelesaian (Wajib)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tuliskan catatan penyelesaian..."
          rows={3}
          className={TEXTAREA_CLASSES}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 pt-2">
        <button onClick={() => handleSubmit('complete')} disabled={isLoading} className={BTN_PRIMARY}>
          → Selesaikan
        </button>
        <button onClick={() => handleSubmit('return')} disabled={isLoading} className={BTN_OUTLINE}>
          ↩ Kembalikan
        </button>
      </div>
    </ActionPanelShell>
  );
}

/* ═════════════════════════════════════════════
   MAIN PAGE
═════════════════════════════════════════════ */
export default function QueuePage() {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const loadQueue = async () => {
    setError(null);
    setActionError(null);
    try {
      const res = await fetch('/api/queue/my-queue?type=Active');
      if (!res.ok) throw new Error('Gagal mengambil data antrian');
      const data = await res.json();
      setAssignments(data);
      if (selectedId && !data.find((a) => a.assignment_id === selectedId)) setSelectedId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (session) loadQueue(); }, [session]);

  const requestCount = assignments.filter(a => a.ticket?.type === 'Request').length;
  const feedbackCount = assignments.length - requestCount;
  const role = session?.user?.role || '';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .dcota-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        .dcota-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="dcota-sans bg-white animate-in fade-in duration-500">

        {/* ═══════════════════════════════════════════════════════
            PAGE HEADER + STATS
        ═══════════════════════════════════════════════════════ */}
        <section className="border-b border-slate-200">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12 pt-12 pb-10">

            {/* Eyebrow */}
            <div className="dcota-mono text-[10.5px] uppercase tracking-[0.22em] text-slate-400 mb-5 flex items-center gap-3">
              <span className="text-slate-900 font-semibold">DCOTA CARE</span>
              <span className="text-slate-300">/</span>
              <span>QUEUE</span>
              <span className="text-slate-300">/</span>
              <span>ACTIVE</span>
            </div>

            <div className="grid grid-cols-12 gap-6 items-end">
              {/* Headline */}
              <div className="col-span-12 lg:col-span-7">
                <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[0.95]">
                  Antrian <span className="text-[#ed1c24]">Tugas.</span>
                </h1>
                <p className="text-sm text-slate-500 mt-4 max-w-md leading-relaxed">
                  Tinjau laporan masuk, berikan keputusan atau penanganan teknis sesuai role Anda.
                </p>
              </div>

              {/* Stats 3 kolom */}
              <div className="col-span-12 lg:col-span-5 grid grid-cols-3 gap-0 border-l border-slate-200">
                <StatBlock label="Total" value={assignments.length} code="01" />
                <StatBlock label="Request" value={requestCount} code="02" accent />
                <StatBlock label="Feedback" value={feedbackCount} code="03" />
              </div>
            </div>

            {/* Action row */}
            <div className="mt-10 flex flex-wrap items-center gap-2">
              <button
                onClick={loadQueue}
                className="dcota-mono flex items-center gap-2 bg-slate-900 hover:bg-[#ed1c24] text-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors"
              >
                <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={2} />
                Refresh
              </button>
              <div className="ml-auto hidden md:flex items-center gap-2 dcota-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                <span>Role:</span>
                <span className="text-slate-900 font-bold">{role || '—'}</span>
              </div>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            ERROR BANNER
        ═══════════════════════════════════════════════════════ */}
        {(error || actionError) && (
          <div className="border-b border-[#ed1c24]/20 bg-[#ed1c24]/[0.04]">
            <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-4 flex items-center gap-3">
              <ExclamationCircleIcon className="h-5 w-5 text-[#ed1c24] shrink-0" strokeWidth={2} />
              <p className="dcota-mono text-[12px] font-semibold text-[#ed1c24]">
                {error || actionError}
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            QUEUE LIST
        ═══════════════════════════════════════════════════════ */}
        <section>
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-8">

            {/* Section header */}
            <div className="flex items-baseline justify-between mb-6 pb-4 border-b border-slate-200">
              <div className="flex items-baseline gap-4">
                <span className="dcota-mono text-[10.5px] uppercase tracking-[0.22em] text-slate-400">
                  §  Inbox
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight">
                  Daftar Antrian
                </h2>
              </div>
              <span className="dcota-mono text-[10.5px] uppercase tracking-[0.22em] text-slate-400">
                {String(assignments.length).padStart(3, '0')} ITEM
              </span>
            </div>

            {isLoading ? (
              <LoadingState />
            ) : assignments.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="divide-y divide-slate-100 border-t border-slate-200 border-b">
                {assignments.map((assignment, idx) => {
                  const isSelected = selectedId === assignment.assignment_id;
                  const isActiveAssignment = assignment.assignment_type === 'Active';
                  const isPicOmi = ['PIC OMI', 'PIC OMI (SS)'].includes(role);
                  const rowNum = idx + 1;

                  return (
                    <article
                      key={assignment.assignment_id}
                      className={`group transition-colors duration-200 ${isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/50'
                        }`}
                    >
                      {/* Card header — clickable */}
                      <div
                        onClick={() => setSelectedId(isSelected ? null : assignment.assignment_id)}
                        className="cursor-pointer"
                      >
                        <div className="grid grid-cols-12 gap-6 px-2 py-6 items-start">

                          {/* Row number */}
                          <div className="col-span-1">
                            <span className={`dcota-mono text-[11px] font-semibold transition-colors ${isSelected ? 'text-[#ed1c24]' : 'text-slate-300 group-hover:text-slate-500'
                              }`}>
                              {String(rowNum).padStart(3, '0')}
                            </span>
                          </div>

                          {/* Main content */}
                          <div className="col-span-10 min-w-0">
                            {/* Meta row */}
                            <div className="flex items-center flex-wrap gap-3 mb-2.5">
                              <span className="dcota-mono text-[10px] font-bold uppercase tracking-[0.16em] bg-slate-900 text-white px-2 py-1">
                                #{assignment.ticket.ticket_id}
                              </span>
                              <span className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                {assignment.ticket.kategori}
                              </span>
                              {assignment.ticket.type && (
                                <>
                                  <span className="text-slate-300">·</span>
                                  <span className={`dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] ${assignment.ticket.type === 'Request' ? 'text-[#ed1c24]' : 'text-slate-500'
                                    }`}>
                                    {assignment.ticket.type}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Title */}
                            <h3 className={`text-lg lg:text-xl font-extrabold tracking-tight leading-snug transition-colors ${isSelected ? 'text-[#ed1c24]' : 'text-slate-900 group-hover:text-slate-900'
                              }`}>
                              {assignment.ticket.title}
                            </h3>

                            {/* Quick metadata */}
                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 dcota-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-500">
                              <span className="flex items-center gap-1.5">
                                <UserIcon className="h-3 w-3" strokeWidth={2} />
                                {assignment.ticket.submittedBy?.name || '—'}
                              </span>
                              {assignment.ticket.toko && (
                                <span className="flex items-center gap-1.5">
                                  <BuildingStorefrontIcon className="h-3 w-3" strokeWidth={2} />
                                  {assignment.ticket.toko}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Chevron */}
                          <div className="col-span-1 flex justify-end pt-1">
                            <ChevronDownIcon
                              className={`h-5 w-5 transition-all duration-300 ${isSelected ? 'rotate-180 text-[#ed1c24]' : 'text-slate-300 group-hover:text-slate-500'
                                }`}
                              strokeWidth={2}
                            />
                          </div>

                        </div>
                      </div>

                      {/* Expanded detail */}
                      <div className={`grid transition-all duration-500 ease-out ${isSelected ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}>
                        <div className="overflow-hidden">
                          <div className="px-2 pb-8 border-t border-slate-200 pt-6">

                            <div className="grid grid-cols-12 gap-6">

                              {/* LEFT 8 col: detail */}
                              <div className="col-span-12 lg:col-span-8 space-y-6">

                                {/* Info pengirim grid */}
                                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                                  <DetailField
                                    code="01"
                                    label="Nama Pengisi"
                                    value={assignment.ticket.nama_pengisi}
                                    icon={UserIcon}
                                  />
                                  <DetailField
                                    code="02"
                                    label="No. Telepon"
                                    value={assignment.ticket.no_telepon}
                                    icon={PhoneIcon}
                                  />
                                </div>

                                {/* Deskripsi */}
                                <div>
                                  <div className="flex items-baseline gap-3 mb-2">
                                    <span className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                                      03
                                    </span>
                                    <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                      Deskripsi Permintaan
                                    </p>
                                  </div>
                                  <div className="border-l-2 border-slate-200 pl-4 py-1">
                                    <p className="text-[13.5px] text-slate-800 leading-relaxed whitespace-pre-line">
                                      {assignment.ticket.detail?.description || (
                                        <span className="italic text-slate-400">Tidak ada deskripsi tambahan.</span>
                                      )}
                                    </p>
                                  </div>
                                </div>

                                {/* Lampiran */}
                                {Array.isArray(assignment.ticket.detail?.attachments_json) &&
                                  assignment.ticket.detail.attachments_json.length > 0 && (
                                    <div>
                                      <div className="flex items-baseline gap-3 mb-3">
                                        <span className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                                          04
                                        </span>
                                        <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                          Lampiran ({assignment.ticket.detail.attachments_json.length})
                                        </p>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {assignment.ticket.detail.attachments_json.map((file, fIdx) => (
                                          <a
                                            key={fIdx}
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="dcota-mono flex items-center gap-2 border border-slate-300 hover:border-[#ed1c24] hover:text-[#ed1c24] px-3 py-2 text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-700 transition-colors"
                                          >
                                            <PaperClipIcon className="h-3.5 w-3.5" strokeWidth={2} />
                                            <span className="truncate max-w-[140px]">{file.name}</span>
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                              </div>

                              {/* RIGHT 4 col: meta sidebar */}
                              <div className="col-span-12 lg:col-span-4 lg:border-l lg:border-slate-200 lg:pl-6 space-y-5">
                                <div>
                                  <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-2">
                                    Ticket ID
                                  </p>
                                  <p className="dcota-mono text-lg font-bold text-slate-900">
                                    #{assignment.ticket.ticket_id}
                                  </p>
                                </div>
                                <div>
                                  <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-2">
                                    Kategori
                                  </p>
                                  <p className="dcota-mono text-[12px] font-bold text-slate-900 uppercase">
                                    {assignment.ticket.kategori || '—'}
                                  </p>
                                </div>
                                {assignment.ticket.type && (
                                  <div>
                                    <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-2">
                                      Type
                                    </p>
                                    <p className={`dcota-mono text-[12px] font-bold uppercase ${assignment.ticket.type === 'Request' ? 'text-[#ed1c24]' : 'text-slate-900'
                                      }`}>
                                      {assignment.ticket.type}
                                    </p>
                                  </div>
                                )}
                              </div>

                            </div>

                            {/* ACTIONS PANEL */}
                            <div className="mt-2">
                              {isPicOmi && isActiveAssignment && (
                                <TriageActions
                                  ticketId={assignment.ticket.ticket_id}
                                  onSuccess={loadQueue}
                                  onError={setActionError}
                                />
                              )}
                              {role === 'Sales Manager' && assignment.ticket.type === 'Request' && (
                                <SalesManagerActions
                                  ticketId={assignment.ticket.ticket_id}
                                  onSuccess={loadQueue}
                                  onError={setActionError}
                                />
                              )}
                              {role === 'Acting Manager' && assignment.ticket.type === 'Request' && (
                                <ActingManagerActions
                                  ticketId={assignment.ticket.ticket_id}
                                  onSuccess={loadQueue}
                                  onError={setActionError}
                                />
                              )}
                              {role === 'Acting PIC' && assignment.ticket.type === 'Request' && (
                                <ActingPicActions
                                  ticketId={assignment.ticket.ticket_id}
                                  onSuccess={loadQueue}
                                  onError={setActionError}
                                />
                              )}
                            </div>

                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

          </div>
        </section>

      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
function StatBlock({ label, value, code, accent }) {
  return (
    <div className="border-r border-slate-200 last:border-r-0 pl-6 lg:pl-8 py-2">
      <div className="dcota-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400 mb-2">
        {code} · {label}
      </div>
      <div className={`text-5xl lg:text-6xl font-extrabold tracking-tight leading-none ${accent ? 'text-[#ed1c24]' : 'text-slate-900'}`}>
        {String(value).padStart(2, '0')}
      </div>
    </div>
  );
}

function DetailField({ code, label, value, icon: Icon }) {
  return (
    <div>
      <div className="flex items-baseline gap-3 mb-1">
        <span className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
          {code}
        </span>
        <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 flex items-center gap-1.5">
          {Icon && <Icon className="h-3 w-3" strokeWidth={2} />}
          {label}
        </p>
      </div>
      <p className="text-[14px] font-bold text-slate-900 pl-7">
        {value || <span className="text-slate-300">—</span>}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="border-t border-b border-slate-200 divide-y divide-slate-100">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="grid grid-cols-12 gap-6 px-2 py-6 animate-pulse">
          <div className="col-span-1">
            <div className="h-3 w-6 bg-slate-100" />
          </div>
          <div className="col-span-10 space-y-3">
            <div className="flex gap-3">
              <div className="h-5 w-16 bg-slate-200" />
              <div className="h-5 w-20 bg-slate-100" />
            </div>
            <div className="h-6 w-2/3 bg-slate-200" />
            <div className="flex gap-4">
              <div className="h-3 w-24 bg-slate-100" />
              <div className="h-3 w-32 bg-slate-100" />
            </div>
          </div>
          <div className="col-span-1 flex justify-end">
            <div className="h-5 w-5 bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-slate-200 py-20 text-center">
      <CheckBadgeIcon className="h-10 w-10 mx-auto mb-4 text-slate-300" strokeWidth={1.5} />
      <p className="dcota-mono text-[11px] font-bold uppercase tracking-[0.22em] text-slate-900 mb-2">
        Inbox Zero
      </p>
      <p className="dcota-mono text-[10.5px] uppercase tracking-[0.18em] text-slate-400">
        Tidak ada tugas tertunda saat ini
      </p>
    </div>
  );
}