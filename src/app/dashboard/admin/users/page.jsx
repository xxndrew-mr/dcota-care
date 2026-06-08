'use client';

import { useState, useEffect, Fragment, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Dialog, Transition } from '@headlessui/react';
import {
  UserPlusIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  XCircleIcon,
  IdentificationIcon,
  BriefcaseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UsersIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

const ROWS_PER_PAGE = 10;

/* ─────────────────────────────────────────────
   INPUT STYLE — Swiss: underline-only, bukan box
───────────────────────────────────────────── */
const INPUT_CLASSES =
  "block w-full border-0 border-b border-slate-200 bg-transparent px-0 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-300 transition-colors focus:border-[#ed1c24] focus:outline-none focus:ring-0";
const SELECT_CLASSES = `${INPUT_CLASSES} cursor-pointer appearance-none bg-no-repeat bg-[length:14px] bg-[right_center] pr-6`;

/* Inline arrow untuk select */
const selectArrowStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
};

/* ─────────────────────────────────────────────
   BADGE — flat, no rounded-full, no ring
───────────────────────────────────────────── */
const Badge = ({ children, variant }) => {
  const styles = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Inactive: 'bg-slate-100 text-slate-500 border-slate-200',
    role: 'bg-slate-900 text-white border-slate-900',
  };
  const cls = styles[children] || styles[variant] || styles.role;

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] dcota-mono ${cls}`}
    >
      {(children === 'Active' || children === 'Inactive') && (
        <span
          className={`inline-block w-1.5 h-1.5 ${children === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
        />
      )}
      {children}
    </span>
  );
};

/* ─────────────────────────────────────────────
   SKELETON — sesuai grid baru
───────────────────────────────────────────── */
const SkeletonRow = ({ idx }) => (
  <tr className="animate-pulse border-b border-slate-100">
    <td className="px-6 py-5">
      <div className="h-3 w-6 bg-slate-100" />
    </td>
    <td className="px-6 py-5">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-slate-200" />
        <div className="space-y-2">
          <div className="h-3 w-32 bg-slate-200" />
          <div className="h-2 w-20 bg-slate-100" />
        </div>
      </div>
    </td>
    <td className="px-6 py-5"><div className="h-4 w-24 bg-slate-100" /></td>
    <td className="px-6 py-5"><div className="h-4 w-24 bg-slate-100" /></td>
    <td className="px-6 py-5"><div className="h-5 w-16 bg-slate-200" /></td>
    <td className="px-6 py-5">
      <div className="flex justify-end gap-2">
        <div className="h-8 w-8 bg-slate-100" />
        <div className="h-8 w-8 bg-slate-100" />
      </div>
    </td>
  </tr>
);

const SkeletonMobile = () => (
  <div className="flex items-center gap-3 px-6 py-4 animate-pulse border-b border-slate-100">
    <div className="h-10 w-10 bg-slate-200 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-32 bg-slate-200" />
      <div className="h-2 w-24 bg-slate-100" />
    </div>
    <div className="h-5 w-14 bg-slate-200" />
  </div>
);

/* ─────────────────────────────────────────────
   FORM FIELD — label mono kecil + input
───────────────────────────────────────────── */
const FormField = ({ label, code, children }) => (
  <div>
    <div className="flex items-baseline gap-3 mb-1">
      {code && (
        <span className="dcota-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
          {code}
        </span>
      )}
      <label className="dcota-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </label>
    </div>
    {children}
  </div>
);

/* ═════════════════════════════════════════════
   USER FORM (Modal content)
═════════════════════════════════════════════ */
function UserForm({
  buttonText,
  initialData,
  roles,
  divisions,
  picOmis,
  onSubmit,
  onClose,
  isLoading,
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    username: initialData?.username || '',
    email: initialData?.email || '',
    password: '',
    role_id: initialData?.role_id || '',
    division_id: initialData?.division_id || '',
    pic_omi_id: initialData?.pic_omi_id || '',
  });

  const [viewerDivisions, setViewerDivisions] = useState(initialData?.viewer_division_ids || []);

  const selectedRoleName = roles.find(
    (r) => r.role_id.toString() === formData.role_id.toString()
  )?.role_name;

  const isDivisionRequired = ['Salesman', 'Sales Manager', 'PIC OMI', 'Agen', 'Acting Manager', 'Acting PIC'].includes(selectedRoleName);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      role_id: e.target.value,
      division_id: '',
      pic_omi_id: '',
    }));
  };

  const toggleViewerDivision = (id) => {
    setViewerDivisions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      viewer_division_ids: selectedRoleName === 'Viewer' ? viewerDivisions : [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">

        {/* COL 1: Akses Akun */}
        <div className="space-y-5">
          <div className="flex items-baseline gap-3 border-b border-slate-200 pb-2">
            <span className="dcota-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ed1c24]">
              ①
            </span>
            <IdentificationIcon className="h-4 w-4 text-[#ed1c24]" strokeWidth={1.8} />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-900">
              Akses Akun
            </span>
          </div>

          <FormField label="Nama Lengkap / Toko" code="01">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className={INPUT_CLASSES}
              placeholder="John Doe"
            />
          </FormField>

          <FormField label="No. Telepon / WhatsApp" code="02">
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="08xxxxxxxxxx"
              className={INPUT_CLASSES}
            />
          </FormField>

          <FormField label="Username" code="03">
            <div className="relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 dcota-mono text-sm font-bold text-slate-300">
                @
              </span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className={`${INPUT_CLASSES} pl-5`}
              />
            </div>
          </FormField>

          <FormField label="Email" code="04">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={INPUT_CLASSES}
              placeholder="email@domain.com"
            />
          </FormField>

          <FormField label={`Password${initialData ? ' (Opsional)' : ''}`} code="05">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required={!initialData}
              placeholder={initialData ? '••••••••' : 'Min. 8 karakter'}
              className={INPUT_CLASSES}
            />
          </FormField>
        </div>

        {/* COL 2: Peran & Struktur */}
        <div className="space-y-5">
          <div className="flex items-baseline gap-3 border-b border-slate-200 pb-2">
            <span className="dcota-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ed1c24]">
              ②
            </span>
            <BriefcaseIcon className="h-4 w-4 text-[#ed1c24]" strokeWidth={1.8} />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-900">
              Peran & Struktur
            </span>
          </div>

          <FormField label="Pilih Role" code="06">
            <select
              name="role_id"
              value={formData.role_id}
              onChange={handleRoleChange}
              required
              className={SELECT_CLASSES}
              style={selectArrowStyle}
            >
              <option value="">Pilih Role...</option>
              {roles.map((role) => (
                <option key={role.role_id} value={role.role_id}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </FormField>

          {selectedRoleName && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200 space-y-5">
              {isDivisionRequired && (
                <FormField label="Divisi" code="07">
                  <select
                    name="division_id"
                    value={formData.division_id}
                    onChange={handleInputChange}
                    required
                    className={SELECT_CLASSES}
                    style={selectArrowStyle}
                  >
                    <option value="">Pilih Divisi...</option>
                    {divisions.map((div) => (
                      <option key={div.division_id} value={div.division_id}>
                        {div.division_name}
                      </option>
                    ))}
                  </select>
                </FormField>
              )}

              {selectedRoleName === 'Viewer' && (
                <FormField label="Akses Divisi Viewer" code="07">
                  <div className="mt-1 max-h-40 overflow-y-auto border border-slate-200 divide-y divide-slate-100">
                    {divisions.map((div) => (
                      <label
                        key={div.division_id}
                        className="flex items-center gap-3 px-3 py-2.5 text-[12.5px] font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={viewerDivisions.includes(div.division_id)}
                          onChange={() => toggleViewerDivision(div.division_id)}
                          className="h-4 w-4 border-slate-300 text-[#ed1c24] focus:ring-[#ed1c24] focus:ring-offset-0 accent-[#ed1c24]"
                        />
                        {div.division_name}
                      </label>
                    ))}
                  </div>
                </FormField>
              )}

              {['Salesman', 'Agen'].includes(selectedRoleName) && (
                <FormField label="PIC OMI Penanggung Jawab" code="08">
                  <select
                    name="pic_omi_id"
                    value={formData.pic_omi_id}
                    onChange={handleInputChange}
                    required
                    className={SELECT_CLASSES}
                    style={selectArrowStyle}
                  >
                    <option value="">Pilih PIC OMI...</option>
                    {picOmis.map((pic) => (
                      <option key={pic.user_id} value={pic.user_id}>
                        {pic.name} ({pic.division?.division_name || 'No Div'})
                      </option>
                    ))}
                  </select>
                </FormField>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-6">
        <p className="dcota-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
          {initialData ? 'Mode: Edit' : 'Mode: New'}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="dcota-mono text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 hover:text-slate-900 border border-transparent hover:border-slate-300 px-4 py-3 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="dcota-mono flex items-center gap-2 bg-[#ed1c24] hover:bg-[#c8131a] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <span>→</span>
            )}
            {buttonText}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ═════════════════════════════════════════════
   PAGINATION
═════════════════════════════════════════════ */
function Pagination({ currentPage, totalPages, onPageChange, totalItems, rowsPerPage }) {
  if (totalPages <= 1) return null;

  const startRange = (currentPage - 1) * rowsPerPage + 1;
  const endRange = Math.min(currentPage * rowsPerPage, totalItems);

  const pages = useMemo(() => {
    const items = [];
    const delta = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        items.push(i);
      } else if (items[items.length - 1] !== '...') {
        items.push('...');
      }
    }
    return items;
  }, [currentPage, totalPages]);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row">
      <p className="dcota-mono text-[10.5px] uppercase tracking-[0.18em] text-slate-400">
        <span className="font-bold text-slate-900">{String(startRange).padStart(3, '0')}–{String(endRange).padStart(3, '0')}</span>
        {' '}of{' '}
        <span className="font-bold text-slate-900">{String(totalItems).padStart(3, '0')}</span>
      </p>

      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Halaman sebelumnya"
          className="flex h-9 w-9 items-center justify-center border border-slate-200 text-slate-500 transition-colors hover:border-slate-900 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-500 -mr-px"
        >
          <ChevronLeftIcon className="h-3.5 w-3.5" strokeWidth={2} />
        </button>

        {pages.map((page, idx) =>
          page === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              className="dcota-mono flex h-9 w-9 items-center justify-center text-[11px] text-slate-300 border-y border-slate-200 -mr-px"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-current={currentPage === page ? "page" : undefined}
              className={`dcota-mono flex h-9 w-9 items-center justify-center text-[11px] font-bold transition-colors -mr-px ${currentPage === page
                ? 'bg-[#ed1c24] text-white border border-[#ed1c24] z-10 relative'
                : 'border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-900 hover:z-10 hover:relative'
                }`}
            >
              {String(page).padStart(2, '0')}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Halaman berikutnya"
          className="flex h-9 w-9 items-center justify-center border border-slate-200 text-slate-500 transition-colors hover:border-slate-900 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-500"
        >
          <ChevronRightIcon className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   MAIN PAGE
═════════════════════════════════════════════ */
export default function AdminUsersPage() {
  const { data: session } = useSession();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [picOmis, setPicOmis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalState, setModalState] = useState({ isOpen: false, type: 'create', user: null });
  const [notification, setNotification] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDiv, setFilterDiv] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const triggerNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [masterRes, usersRes] = await Promise.all([
        fetch('/api/admin/master-data'),
        fetch('/api/admin/users'),
      ]);
      const masterData = await masterRes.json();
      const usersData = await usersRes.json();

      setRoles(masterData.roles);
      setDivisions(masterData.divisions);
      setUsers(usersData);

      const picRole = masterData.roles.find((r) => r.role_name === 'PIC OMI');
      if (picRole) {
        setPicOmis(usersData.filter((u) => u.role_id === picRole.role_id));
      }
    } catch {
      triggerNotification('error', 'Gagal memuat data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadInitialData(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterRole, filterDiv]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        user.name.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query);
      const matchesRole = filterRole ? user.role?.role_name === filterRole : true;
      const matchesDiv = filterDiv ? user.division?.division_name === filterDiv : true;
      return matchesSearch && matchesRole && matchesDiv;
    });
  }, [users, searchTerm, filterRole, filterDiv]);

  const pagedUsers = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredUsers.slice(start, start + ROWS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const activeUsersCount = users.filter((u) => u.status === 'Active').length;
  const inactiveUsersCount = users.length - activeUsersCount;
  const totalRolesCount = roles.length;
  const hasActiveFilters = searchTerm || filterRole || filterDiv;
  const totalPagesCount = Math.max(1, Math.ceil(filteredUsers.length / ROWS_PER_PAGE));

  const handleImportCsv = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/import-salesman', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      triggerNotification('success', `Berhasil import ${data.inserted} user`);
      loadInitialData();
    } catch (err) {
      triggerNotification('error', err.message);
    }
  };

  const handleCreateUser = async (payload) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      triggerNotification('success', 'User berhasil dibuat!');
      setModalState({ isOpen: false, type: 'create', user: null });
      loadInitialData();
    } catch (err) {
      triggerNotification('error', err.message);
    }
  };

  const handleUpdateUser = async (payload) => {
    try {
      const res = await fetch(`/api/admin/users/${modalState.user.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Gagal update');
      triggerNotification('success', 'User berhasil diperbarui!');
      setModalState({ isOpen: false, type: 'create', user: null });
      loadInitialData();
    } catch (err) {
      triggerNotification('error', err.message);
    }
  };

  const handleToggleStatus = async (userId, currentStatus, userName) => {
    const actionLabel = currentStatus === 'Active' ? 'Menonaktifkan' : 'Mengaktifkan';
    if (!confirm(`Apakah Anda yakin ingin ${actionLabel} user ${userName}?`)) return;

    try {
      const method = currentStatus === 'Active' ? 'DELETE' : 'PUT';
      const body =
        currentStatus === 'Active'
          ? undefined
          : JSON.stringify({ status: 'Active', ...users.find((u) => u.user_id === userId) });

      const res = await fetch(`/api/admin/users/${userId}`, {
        method,
        headers: method === 'PUT' ? { 'Content-Type': 'application/json' } : undefined,
        body,
      });
      if (!res.ok) throw new Error('Gagal mengubah status');
      triggerNotification('success', 'Status user berhasil diperbarui.');
      loadInitialData();
    } catch (err) {
      triggerNotification('error', err.message);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterRole('');
    setFilterDiv('');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .dcota-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        .dcota-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="dcota-sans bg-white animate-in fade-in duration-500">

        {/* Notification */}
        <Transition
          show={!!notification}
          as={Fragment}
          enter="transition ease-out duration-300"
          enterFrom="opacity-0 -translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0 -translate-y-2"
        >
          <div
            className={`fixed right-6 top-20 z-[60] flex items-center gap-3 border px-5 py-3.5 text-[12.5px] font-bold shadow-[0_8px_24px_-12px_rgba(15,23,42,0.2)] ${notification?.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-[#ed1c24] border-[#ed1c24] text-white'
              }`}
          >
            {notification?.type === 'success' ? (
              <CheckCircleIcon className="h-4 w-4 shrink-0" strokeWidth={2} />
            ) : (
              <XCircleIcon className="h-4 w-4 shrink-0" strokeWidth={2} />
            )}
            {notification?.message}
          </div>
        </Transition>

        {/* ═══════════════════════════════════════════════════════
            PAGE HEADER + STATS — Swiss strip
        ═══════════════════════════════════════════════════════ */}
        <section className="border-b border-slate-200 border-t-[3px] border-t-[#ed1c24]">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12 pt-12 pb-10">

            {/* Eyebrow */}
            <div className="dcota-mono text-[10.5px] uppercase tracking-[0.22em] text-slate-400 mb-5 flex items-center gap-3">
              <span className="bg-[#ed1c24] text-white px-2 py-1 font-semibold tracking-[0.2em]">ADMIN</span>
              <span className="text-slate-900 font-semibold">DCOTA CARE</span>
              <span className="text-slate-300">/</span>
              <span>USERS</span>
            </div>

            <div className="grid grid-cols-12 gap-6 items-end">
              {/* Headline */}
              <div className="col-span-12 lg:col-span-7">
                <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[0.95]">
                  Manajemen <span className="text-[#ed1c24]">User.</span>
                </h1>
                <p className="text-sm text-slate-500 mt-4 max-w-md leading-relaxed">
                  Kelola hak akses, divisi, dan status akun seluruh anggota tim Dcota Care.
                </p>
              </div>

              {/* Stats raksasa di kanan — angka jadi star */}
              <div className="col-span-12 lg:col-span-5 grid grid-cols-3 gap-0 border-l border-slate-200 lg:pl-0">
                <StatBlock label="Total" value={users.length} code="01" />
                <StatBlock label="Aktif" value={activeUsersCount} code="02" accent />
                <StatBlock label="Nonaktif" value={inactiveUsersCount} code="03" />
              </div>
            </div>

            {/* Actions row */}
            <div className="mt-10 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setModalState({ isOpen: true, type: 'create', user: null })}
                className="dcota-mono flex items-center gap-2 bg-[#ed1c24] hover:bg-[#c8131a] text-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors"
              >
                <UserPlusIcon className="h-4 w-4" strokeWidth={2} />
                Tambah User
              </button>
              <label className="dcota-mono flex cursor-pointer items-center gap-2 border border-slate-300 hover:border-[#ed1c24] hover:text-[#ed1c24] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-900 transition-colors">
                <ArrowUpTrayIcon className="h-4 w-4" strokeWidth={2} />
                Import CSV
                <input type="file" accept=".csv" className="hidden" onChange={handleImportCsv} />
              </label>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            FILTER TOOLBAR
        ═══════════════════════════════════════════════════════ */}
        <section className="border-b border-slate-200 bg-slate-50/40">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Cari nama, username, email..."
                  className="w-full border-0 border-b border-slate-200 bg-transparent pl-6 pr-4 py-2 text-[13px] font-semibold text-slate-900 placeholder-slate-300 focus:border-[#ed1c24] focus:outline-none focus:ring-0 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="dcota-mono text-[10px] uppercase tracking-[0.18em] text-slate-400 hidden sm:block">
                  Filter:
                </div>

                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="dcota-mono text-[11px] font-semibold uppercase tracking-[0.12em] border border-slate-200 hover:border-slate-900 bg-white px-3 py-2 text-slate-900 cursor-pointer appearance-none pr-7 transition-colors focus:outline-none focus:border-[#ed1c24]"
                  style={selectArrowStyle}
                >
                  <option value="">Semua Role</option>
                  {roles.map((role) => (
                    <option key={role.role_id} value={role.role_name}>{role.role_name}</option>
                  ))}
                </select>

                <select
                  value={filterDiv}
                  onChange={(e) => setFilterDiv(e.target.value)}
                  className="dcota-mono text-[11px] font-semibold uppercase tracking-[0.12em] border border-slate-200 hover:border-slate-900 bg-white px-3 py-2 text-slate-900 cursor-pointer appearance-none pr-7 transition-colors focus:outline-none focus:border-[#ed1c24]"
                  style={selectArrowStyle}
                >
                  <option value="">Semua Divisi</option>
                  {divisions.map((div) => (
                    <option key={div.division_id} value={div.division_name}>{div.division_name}</option>
                  ))}
                </select>

                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
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
            TABLE DESKTOP
        ═══════════════════════════════════════════════════════ */}
        <section className="hidden md:block">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-2">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  {[
                    { label: '#', align: 'left', width: 'w-12' },
                    { label: 'Pengguna', align: 'left' },
                    { label: 'Role', align: 'left' },
                    { label: 'Divisi', align: 'left' },
                    { label: 'Status', align: 'left' },
                    { label: 'Aksi', align: 'right' },
                  ].map((header, idx) => (
                    <th
                      key={idx}
                      className={`dcota-mono px-6 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 ${header.align === 'right' ? 'text-right' : 'text-left'} ${header.width || ''}`}
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: ROWS_PER_PAGE }).map((_, i) => <SkeletonRow key={i} idx={i} />)
                ) : pagedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <UsersIcon className="h-8 w-8 opacity-30" strokeWidth={1.5} />
                        <p className="dcota-mono text-[11px] uppercase tracking-[0.18em]">
                          No users found
                        </p>
                        {hasActiveFilters && (
                          <button onClick={resetFilters} className="dcota-mono text-[10px] uppercase tracking-[0.18em] text-[#ed1c24] hover:underline mt-1">
                            Reset filter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pagedUsers.map((user, idx) => {
                    const rowNum = (currentPage - 1) * ROWS_PER_PAGE + idx + 1;
                    return (
                      <tr key={user.user_id} className="group border-b border-slate-100 hover:bg-[#ed1c24]/[0.03] transition-colors">
                        {/* Number */}
                        <td className="px-6 py-4">
                          <span className="dcota-mono text-[11px] font-semibold text-slate-300 group-hover:text-[#ed1c24] transition-colors">
                            {String(rowNum).padStart(3, '0')}
                          </span>
                        </td>

                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#ed1c24] dcota-mono text-[13px] font-bold text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13.5px] font-extrabold text-slate-900 truncate">
                                {user.name}
                              </p>
                              <p className="dcota-mono text-[10.5px] font-semibold text-slate-400 mt-0.5">
                                @{user.username}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <Badge variant="role">{user.role?.role_name}</Badge>
                        </td>

                        {/* Divisi */}
                        <td className="px-6 py-4">
                          <span className="text-[12.5px] font-semibold text-slate-700">
                            {user.division?.division_name || <span className="text-slate-300">—</span>}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <Badge>{user.status}</Badge>
                        </td>

                        {/* Actions — tombol berbingkai, hit-area jelas */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setModalState({ isOpen: true, type: 'edit', user })}
                              className="flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-colors"
                              title="Edit user"
                            >
                              <PencilSquareIcon className="h-4 w-4" strokeWidth={1.8} />
                            </button>
                            {session?.user?.id !== user.user_id && (
                              <button
                                onClick={() => handleToggleStatus(user.user_id, user.status, user.name)}
                                className={`flex h-8 w-8 items-center justify-center border transition-colors ${user.status === 'Active'
                                  ? 'border-slate-200 text-slate-500 hover:border-[#ed1c24] hover:text-[#ed1c24]'
                                  : 'border-slate-200 text-slate-500 hover:border-emerald-600 hover:text-emerald-600'
                                  }`}
                                title={user.status === 'Active' ? 'Nonaktifkan user' : 'Aktifkan user'}
                              >
                                {user.status === 'Active' ? (
                                  <NoSymbolIcon className="h-4 w-4" strokeWidth={1.8} />
                                ) : (
                                  <CheckCircleIcon className="h-4 w-4" strokeWidth={1.8} />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {!isLoading && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPagesCount}
                onPageChange={setCurrentPage}
                totalItems={filteredUsers.length}
                rowsPerPage={ROWS_PER_PAGE}
              />
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            MOBILE LIST
        ═══════════════════════════════════════════════════════ */}
        <section className="md:hidden">
          <div className="mx-auto max-w-[1440px]">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonMobile key={i} />)
            ) : pagedUsers.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
                <UsersIcon className="h-8 w-8 opacity-30" strokeWidth={1.5} />
                <p className="dcota-mono text-[11px] uppercase tracking-[0.18em]">No users</p>
              </div>
            ) : (
              pagedUsers.map((user, idx) => {
                const rowNum = (currentPage - 1) * ROWS_PER_PAGE + idx + 1;
                return (
                  <div key={user.user_id} className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 hover:bg-[#ed1c24]/[0.03] transition-colors">
                    <span className="dcota-mono text-[10px] font-semibold text-slate-300 w-6">
                      {String(rowNum).padStart(3, '0')}
                    </span>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#ed1c24] dcota-mono text-[13px] font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-extrabold text-slate-900 truncate">
                          {user.name}
                        </span>
                      </div>
                      <p className="dcota-mono text-[10px] font-semibold text-slate-400 truncate mt-0.5">
                        {user.role?.role_name} · {user.division?.division_name || 'No Div'}
                      </p>
                    </div>
                    <Badge>{user.status}</Badge>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setModalState({ isOpen: true, type: 'edit', user })}
                        className="flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-colors"
                        title="Edit user"
                      >
                        <PencilSquareIcon className="h-4 w-4" strokeWidth={1.8} />
                      </button>
                      {session?.user?.id !== user.user_id && (
                        <button
                          onClick={() => handleToggleStatus(user.user_id, user.status, user.name)}
                          className={`flex h-8 w-8 items-center justify-center border transition-colors ${user.status === 'Active'
                            ? 'border-slate-200 text-slate-500 hover:border-[#ed1c24] hover:text-[#ed1c24]'
                            : 'border-slate-200 text-slate-500 hover:border-emerald-600 hover:text-emerald-600'
                            }`}
                          title={user.status === 'Active' ? 'Nonaktifkan user' : 'Aktifkan user'}
                        >
                          {user.status === 'Active' ? <NoSymbolIcon className="h-4 w-4" strokeWidth={1.8} /> : <CheckCircleIcon className="h-4 w-4" strokeWidth={1.8} />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            {!isLoading && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPagesCount}
                onPageChange={setCurrentPage}
                totalItems={filteredUsers.length}
                rowsPerPage={ROWS_PER_PAGE}
              />
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            MODAL
        ═══════════════════════════════════════════════════════ */}
        <Transition appear show={modalState.isOpen} as={Fragment}>
          <Dialog as="div" className="dcota-sans relative z-[100]" onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
              leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-start justify-center p-4 pt-16">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300" enterFrom="opacity-0 translate-y-3" enterTo="opacity-100 translate-y-0"
                  leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                  <Dialog.Panel className="w-full max-w-3xl bg-white shadow-[0_24px_80px_-20px_rgba(15,23,42,0.25)] border border-slate-200 border-t-[3px] border-t-[#ed1c24] transition-all overflow-hidden">

                    {/* Modal header — Swiss style */}
                    <div className="border-b border-slate-200 px-8 py-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="dcota-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ed1c24] mb-2">
                            {modalState.type === 'create' ? 'New Entry' : 'Edit Mode'} · Users
                          </p>
                          <Dialog.Title className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                            {modalState.type === 'create' ? 'Tambah User Baru' : 'Perbarui Akun'}
                          </Dialog.Title>
                        </div>
                        <button
                          onClick={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
                          className="flex h-9 w-9 items-center justify-center text-slate-400 hover:bg-[#ed1c24] hover:text-white transition-colors -mr-2 -mt-1"
                          aria-label="Tutup"
                        >
                          <XMarkIcon className="h-5 w-5" strokeWidth={2} />
                        </button>
                      </div>
                    </div>

                    {/* Modal body */}
                    <div className="px-8 py-8">
                      <UserForm
                        buttonText={modalState.type === 'create' ? 'Buat Sekarang' : 'Simpan Perubahan'}
                        initialData={modalState.user}
                        roles={roles}
                        divisions={divisions}
                        picOmis={picOmis}
                        isLoading={isLoading}
                        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
                        onSubmit={modalState.type === 'create' ? handleCreateUser : handleUpdateUser}
                      />
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   STAT BLOCK — angka raksasa, label kecil
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