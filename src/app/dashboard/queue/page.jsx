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
  CheckBadgeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const TEXTAREA_CLASSES =
  'w-full resize-none border-0 border-b border-slate-300 bg-transparent px-0 py-3 text-[13.5px] font-medium text-slate-900 placeholder-slate-400 transition-colors focus:border-[#f26a21] focus:outline-none focus:ring-0';

const BTN_PRIMARY =
  'dcota-mono px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white bg-slate-900 hover:bg-[#f26a21] transition-colors disabled:opacity-50';
const BTN_OUTLINE =
  'dcota-mono px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-900 border border-slate-300 hover:border-slate-900 transition-colors disabled:opacity-50';
const BTN_DANGER =
  'dcota-mono px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white bg-[#f26a21] hover:bg-[#d4551a] transition-colors disabled:opacity-50';
const BTN_SUCCESS =
  'dcota-mono px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white bg-emerald-700 hover:bg-emerald-800 transition-colors disabled:opacity-50';

const ROLE_ACTION_CONFIGS = {
  Triage: {
    code: '①',
    title: 'Tindak Lanjut · PIC OMI',
    label: 'Catatan',
    placeholder: 'Berikan catatan penanganan...',
    endpoint: 'triage',
    bodyKey: 'type',
    requireNotes: false,
    wrapClass: 'flex flex-wrap gap-2 pt-2',
    buttons: [
      { value: 'Feedback', className: BTN_PRIMARY, label: '→ Hanya Informasi', loadingLabel: 'Memproses…' },
    ],
  },
  SalesManager: {
    code: '②',
    title: 'Keputusan · Sales Manager',
    label: 'Catatan (Wajib)',
    placeholder: 'Berikan catatan keputusan...',
    endpoint: 'sm-process',
    bodyKey: 'action',
    requireNotes: true,
    wrapClass: 'grid grid-cols-1 gap-2 pt-2 sm:grid-cols-3',
    buttons: [
      { value: 'approve', className: BTN_SUCCESS, label: '✓ Approve', loadingLabel: '…' },
      { value: 'reject', className: BTN_DANGER, label: '✕ Reject' },
      { value: 'complete', className: BTN_PRIMARY, label: '→ Selesaikan' },
    ],
  },
  ActingManager: {
    code: '③',
    title: 'Persetujuan · Acting Manager',
    label: 'Alasan Keputusan (Wajib)',
    placeholder: 'Tuliskan alasan keputusan...',
    endpoint: 'am-process',
    bodyKey: 'action',
    requireNotes: true,
    wrapClass: 'grid grid-cols-2 gap-2 pt-2',
    buttons: [
      { value: 'approve', className: BTN_SUCCESS, label: '✓ Approve' },
      { value: 'reject', className: BTN_DANGER, label: '✕ Reject' },
    ],
  },
  ActingPic: {
    code: '④',
    title: 'Finalisasi · Acting PIC',
    label: 'Catatan Penyelesaian (Wajib)',
    placeholder: 'Tuliskan catatan penyelesaian...',
    endpoint: 'ap-process',
    bodyKey: 'action',
    requireNotes: true,
    wrapClass: 'grid grid-cols-2 gap-2 pt-2',
    buttons: [
      { value: 'complete', className: BTN_PRIMARY, label: '→ Selesaikan' },
      { value: 'return', className: BTN_OUTLINE, label: '↩ Kembalikan' },
    ],
  },
};

function ActionPanelShell({ code, title, children }) {
  return (
    <div
      className="mt-6 border border-slate-200 bg-slate-50/50"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-3">
        <span className="dcota-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#f26a21]">
          {code}
        </span>
        <span className="dcota-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-slate-900">
          {title}
        </span>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </div>
  );
}

function RoleActions({ ticketId, onSuccess, onError, config }) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (actionType) => {
    if (config.requireNotes && notes.trim() === '') {
      onError('Catatan wajib diisi untuk aksi ini.');
      return;
    }
    setIsLoading(true);
    onError(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/${config.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [config.bodyKey]: actionType, notes }),
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
    <ActionPanelShell code={config.code} title={config.title}>
      <div>
        <label className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          {config.label}
        </label>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder={config.placeholder}
          rows={3}
          className={TEXTAREA_CLASSES}
        />
      </div>
      <div className={config.wrapClass}>
        {config.buttons.map((button) => (
          <button
            key={button.value}
            onClick={() => handleSubmit(button.value)}
            disabled={isLoading}
            className={button.className}
          >
            {isLoading && button.loadingLabel ? button.loadingLabel : button.label}
          </button>
        ))}
      </div>
    </ActionPanelShell>
  );
}

function StatBlock({ label, value, code, accent }) {
  return (
    <div className="border-r border-slate-200 py-2 pl-6 last:border-r-0 lg:pl-8">
      <div className="dcota-mono mb-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {code} · {label}
      </div>
      <div
        className={`text-5xl font-extrabold leading-none tracking-tight lg:text-6xl ${accent ? 'text-[#f26a21]' : 'text-slate-900'
          }`}
      >
        {String(value).padStart(2, '0')}
      </div>
    </div>
  );
}

function DetailField({ code, label, value, icon: Icon }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline gap-3">
        <span className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
          {code}
        </span>
        <p className="dcota-mono flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          {Icon && <Icon className="h-3 w-3" strokeWidth={2} />}
          {label}
        </p>
      </div>
      <p className="pl-7 text-[14px] font-bold text-slate-900">
        {value || <span className="text-slate-300">—</span>}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="divide-y divide-slate-100 border-b border-t border-slate-200">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="grid animate-pulse grid-cols-12 gap-6 px-2 py-6">
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
      <CheckBadgeIcon className="mx-auto mb-4 h-10 w-10 text-slate-300" strokeWidth={1.5} />
      <p className="dcota-mono mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-900">
        Inbox Zero
      </p>
      <p className="dcota-mono text-[10.5px] uppercase tracking-[0.18em] text-slate-400">
        Tidak ada tugas tertunda saat ini
      </p>
    </div>
  );
}

function getRoleActionConfig({ role, isPicOmi, isActiveAssignment, ticketType }) {
  if (isPicOmi && isActiveAssignment) return ROLE_ACTION_CONFIGS.Triage;
  if (ticketType !== 'Request') return null;
  if (role === 'Sales Manager') return ROLE_ACTION_CONFIGS.SalesManager;
  if (role === 'Acting Manager') return ROLE_ACTION_CONFIGS.ActingManager;
  if (role === 'Acting PIC') return ROLE_ACTION_CONFIGS.ActingPic;
  return null;
}

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
      if (selectedId && !data.find((assignment) => assignment.assignment_id === selectedId)) {
        setSelectedId(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) loadQueue();
  }, [session]);

  const requestCount = assignments.filter(
    (assignment) => assignment.ticket?.type === 'Request'
  ).length;
  const feedbackCount = assignments.length - requestCount;
  const role = session?.user?.role || '';
  const isPicOmi = ['PIC OMI', 'PIC OMI (SS)'].includes(role);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .dcota-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        .dcota-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="dcota-sans animate-in fade-in bg-white duration-500">
        <section className="border-b border-slate-200">
          <div className="mx-auto max-w-[1440px] px-6 pb-10 pt-12 lg:px-12">
            <div className="dcota-mono mb-5 flex items-center gap-3 text-[10.5px] uppercase tracking-[0.22em] text-slate-400">
              <span className="font-semibold text-slate-900">DCOTA CARE</span>
              <span className="text-slate-300">/</span>
              <span>QUEUE</span>
              <span className="text-slate-300">/</span>
              <span>ACTIVE</span>
            </div>

            <div className="grid grid-cols-12 items-end gap-6">
              <div className="col-span-12 lg:col-span-7">
                <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight lg:text-6xl">
                  Antrian <span className="text-[#f26a21]">Tugas.</span>
                </h1>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-500">
                  Tinjau laporan masuk, berikan keputusan atau penanganan teknis sesuai role Anda.
                </p>
              </div>

              <div className="col-span-12 grid grid-cols-3 gap-0 border-l border-slate-200 lg:col-span-5">
                <StatBlock label="Total" value={assignments.length} code="01" />
                <StatBlock label="Request" value={requestCount} code="02" accent />
                <StatBlock label="Feedback" value={feedbackCount} code="03" />
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-2">
              <button
                onClick={loadQueue}
                className="dcota-mono flex items-center gap-2 bg-slate-900 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#f26a21]"
              >
                <ArrowPathIcon
                  className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                  strokeWidth={2}
                />
                Refresh
              </button>
              <div className="dcota-mono ml-auto hidden items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-400 md:flex">
                <span>Role:</span>
                <span className="font-bold text-slate-900">{role || '—'}</span>
              </div>
            </div>
          </div>
        </section>

        {(error || actionError) && (
          <div className="border-b border-[#f26a21]/20 bg-[#f26a21]/[0.04]">
            <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-6 py-4 lg:px-12">
              <ExclamationCircleIcon className="h-5 w-5 shrink-0 text-[#f26a21]" strokeWidth={2} />
              <p className="dcota-mono text-[12px] font-semibold text-[#f26a21]">
                {error || actionError}
              </p>
            </div>
          </div>
        )}

        <section>
          <div className="mx-auto max-w-[1440px] px-6 py-8 lg:px-12">
            <div className="mb-6 flex items-baseline justify-between border-b border-slate-200 pb-4">
              <div className="flex items-baseline gap-4">
                <span className="dcota-mono text-[10.5px] uppercase tracking-[0.22em] text-slate-400">
                  §  Inbox
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight">Daftar Antrian</h2>
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
              <div className="divide-y divide-slate-100 border-b border-t border-slate-200">
                {assignments.map((assignment, index) => {
                  const isSelected = selectedId === assignment.assignment_id;
                  const isActiveAssignment = assignment.assignment_type === 'Active';
                  const rowNum = index + 1;
                  const ticket = assignment.ticket;
                  const attachments = ticket.detail?.attachments_json;
                  const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
                  const actionConfig = getRoleActionConfig({
                    role,
                    isPicOmi,
                    isActiveAssignment,
                    ticketType: ticket.type,
                  });

                  return (
                    <article
                      key={assignment.assignment_id}
                      className={`group transition-colors duration-200 ${isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/50'
                        }`}
                    >
                      <div
                        onClick={() => setSelectedId(isSelected ? null : assignment.assignment_id)}
                        className="cursor-pointer"
                      >
                        <div className="grid grid-cols-12 items-start gap-6 px-2 py-6">
                          <div className="col-span-1">
                            <span
                              className={`dcota-mono text-[11px] font-semibold transition-colors ${isSelected
                                  ? 'text-[#f26a21]'
                                  : 'text-slate-300 group-hover:text-slate-500'
                                }`}
                            >
                              {String(rowNum).padStart(3, '0')}
                            </span>
                          </div>

                          <div className="col-span-10 min-w-0">
                            <div className="mb-2.5 flex flex-wrap items-center gap-3">
                              <span className="dcota-mono bg-slate-900 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                                #{ticket.ticket_id}
                              </span>
                              <span className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                {ticket.kategori}
                              </span>
                              {ticket.type && (
                                <>
                                  <span className="text-slate-300">·</span>
                                  <span
                                    className={`dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] ${ticket.type === 'Request' ? 'text-[#f26a21]' : 'text-slate-500'
                                      }`}
                                  >
                                    {ticket.type}
                                  </span>
                                </>
                              )}
                            </div>

                            <h3
                              className={`text-lg font-extrabold leading-snug tracking-tight transition-colors lg:text-xl ${isSelected ? 'text-[#f26a21]' : 'text-slate-900'
                                }`}
                            >
                              {ticket.title}
                            </h3>

                            <div className="dcota-mono mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[10.5px] uppercase tracking-[0.14em] text-slate-500">
                              <span className="flex items-center gap-1.5">
                                <UserIcon className="h-3 w-3" strokeWidth={2} />
                                {ticket.submittedBy?.name || '—'}
                              </span>
                              {ticket.toko && (
                                <span className="flex items-center gap-1.5">
                                  <BuildingStorefrontIcon className="h-3 w-3" strokeWidth={2} />
                                  {ticket.toko}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="col-span-1 flex justify-end pt-1">
                            <ChevronDownIcon
                              className={`h-5 w-5 transition-all duration-300 ${isSelected
                                  ? 'rotate-180 text-[#f26a21]'
                                  : 'text-slate-300 group-hover:text-slate-500'
                                }`}
                              strokeWidth={2}
                            />
                          </div>
                        </div>
                      </div>

                      <div
                        className={`grid transition-all duration-500 ease-out ${isSelected ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                          }`}
                      >
                        <div className="overflow-hidden">
                          <div className="border-t border-slate-200 px-2 pb-8 pt-6">
                            <div className="grid grid-cols-12 gap-6">
                              <div className="col-span-12 space-y-6 lg:col-span-8">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                                  <DetailField
                                    code="01"
                                    label="Nama Pengisi"
                                    value={ticket.nama_pengisi}
                                    icon={UserIcon}
                                  />
                                  <DetailField
                                    code="02"
                                    label="No. Telepon"
                                    value={ticket.no_telepon}
                                    icon={PhoneIcon}
                                  />
                                </div>

                                <div>
                                  <div className="mb-2 flex items-baseline gap-3">
                                    <span className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                                      03
                                    </span>
                                    <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                      Deskripsi Permintaan
                                    </p>
                                  </div>
                                  <div className="border-l-2 border-slate-200 py-1 pl-4">
                                    <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-slate-800">
                                      {ticket.detail?.description || (
                                        <span className="italic text-slate-400">
                                          Tidak ada deskripsi tambahan.
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>

                                {hasAttachments && (
                                  <div>
                                    <div className="mb-3 flex items-baseline gap-3">
                                      <span className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                                        04
                                      </span>
                                      <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                        Lampiran ({attachments.length})
                                      </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {attachments.map((attachment, attachmentIndex) => (
                                        <a
                                          key={attachmentIndex}
                                          href={attachment.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(event) => event.stopPropagation()}
                                          className="dcota-mono flex items-center gap-2 border border-slate-300 px-3 py-2 text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-700 transition-colors hover:border-[#f26a21] hover:text-[#f26a21]"
                                        >
                                          <PaperClipIcon className="h-3.5 w-3.5" strokeWidth={2} />
                                          <span className="max-w-[140px] truncate">
                                            {attachment.name}
                                          </span>
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="col-span-12 space-y-5 lg:col-span-4 lg:border-l lg:border-slate-200 lg:pl-6">
                                <div>
                                  <p className="dcota-mono mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                                    Ticket ID
                                  </p>
                                  <p className="dcota-mono text-lg font-bold text-slate-900">
                                    #{ticket.ticket_id}
                                  </p>
                                </div>
                                <div>
                                  <p className="dcota-mono mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                                    Kategori
                                  </p>
                                  <p className="dcota-mono text-[12px] font-bold uppercase text-slate-900">
                                    {ticket.kategori || '—'}
                                  </p>
                                </div>
                                {ticket.type && (
                                  <div>
                                    <p className="dcota-mono mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                                      Type
                                    </p>
                                    <p
                                      className={`dcota-mono text-[12px] font-bold uppercase ${ticket.type === 'Request' ? 'text-[#f26a21]' : 'text-slate-900'
                                        }`}
                                    >
                                      {ticket.type}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {actionConfig && (
                              <div className="mt-2">
                                <RoleActions
                                  ticketId={ticket.ticket_id}
                                  onSuccess={loadQueue}
                                  onError={setActionError}
                                  config={actionConfig}
                                />
                              </div>
                            )}
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