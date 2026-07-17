'use client';

import { useState, useEffect, Fragment, useMemo, useRef } from 'react';
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

const INPUT_CLASSES =
  'block w-full border-0 border-b border-slate-200 bg-transparent px-0 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-300 transition-colors focus:border-[#f26a21] focus:outline-none focus:ring-0';

const SELECT_CLASSES = `${INPUT_CLASSES} cursor-pointer appearance-none bg-no-repeat bg-[length:14px] bg-[right_center] pr-6`;

const SELECT_ARROW_STYLE = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
};

const DIVISION_REQUIRED_ROLES = [
  'Salesman',
  'Sales Manager',
  'PIC OMI',
  'Agen',
  'Acting Manager',
  'Acting PIC',
];

function Badge({ children, variant }) {
  const styles = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Inactive: 'bg-slate-100 text-slate-500 border-slate-200',
    role: 'bg-slate-900 text-white border-slate-900',
  };
  const cls = styles[children] || styles[variant] || styles.role;
  const isStatus = children === 'Active' || children === 'Inactive';

  return (
    <span
      className={`dcota-mono inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${cls}`}
    >
      {isStatus && (
        <span
          className={`inline-block h-1.5 w-1.5 ${children === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}
        />
      )}
      {children}
    </span>
  );
}

function SkeletonRow() {
  return (
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
      <td className="px-6 py-5">
        <div className="h-4 w-24 bg-slate-100" />
      </td>
      <td className="px-6 py-5">
        <div className="h-4 w-24 bg-slate-100" />
      </td>
      <td className="px-6 py-5">
        <div className="h-5 w-16 bg-slate-200" />
      </td>
      <td className="px-6 py-5">
        <div className="flex justify-end gap-2">
          <div className="h-8 w-8 bg-slate-100" />
          <div className="h-8 w-8 bg-slate-100" />
        </div>
      </td>
    </tr>
  );
}

function SkeletonMobile() {
  return (
    <div className="flex animate-pulse items-center gap-3 border-b border-slate-100 px-6 py-4">
      <div className="h-10 w-10 shrink-0 bg-slate-200" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 bg-slate-200" />
        <div className="h-2 w-24 bg-slate-100" />
      </div>
      <div className="h-5 w-14 bg-slate-200" />
    </div>
  );
}

function FormField({ label, code, children }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline gap-3">
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
}

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

  const [viewerDivisions, setViewerDivisions] = useState(
    initialData?.viewer_division_ids || []
  );

  const selectedRoleName = roles.find(
    (role) => role.role_id.toString() === formData.role_id.toString()
  )?.role_name;

  const isDivisionRequired = DIVISION_REQUIRED_ROLES.includes(selectedRoleName);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      role_id: event.target.value,
      division_id: '',
      pic_omi_id: '',
    }));
  };

  const toggleViewerDivision = (id) => {
    setViewerDivisions((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...formData,
      viewer_division_ids: selectedRoleName === 'Viewer' ? viewerDivisions : [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="flex items-baseline gap-3 border-b border-slate-200 pb-2">
            <span className="dcota-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f26a21]">
              ①
            </span>
            <IdentificationIcon className="h-4 w-4 text-[#f26a21]" strokeWidth={1.8} />
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
              <span className="dcota-mono absolute left-0 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-300">
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
              minLength={8}
              placeholder={initialData ? '••••••••' : 'Min. 8 karakter'}
              className={INPUT_CLASSES}
            />
          </FormField>
        </div>

        <div className="space-y-5">
          <div className="flex items-baseline gap-3 border-b border-slate-200 pb-2">
            <span className="dcota-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f26a21]">
              ②
            </span>
            <BriefcaseIcon className="h-4 w-4 text-[#f26a21]" strokeWidth={1.8} />
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
              style={SELECT_ARROW_STYLE}
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
            <div className="animate-in fade-in slide-in-from-top-1 space-y-5 duration-200">
              {isDivisionRequired && (
                <FormField label="Divisi" code="07">
                  <select
                    name="division_id"
                    value={formData.division_id}
                    onChange={handleInputChange}
                    required
                    className={SELECT_CLASSES}
                    style={SELECT_ARROW_STYLE}
                  >
                    <option value="">Pilih Divisi...</option>
                    {divisions.map((division) => (
                      <option key={division.division_id} value={division.division_id}>
                        {division.division_name}
                      </option>
                    ))}
                  </select>
                </FormField>
              )}

              {selectedRoleName === 'Viewer' && (
                <FormField label="Akses Divisi Viewer" code="07">
                  <div className="mt-1 max-h-40 divide-y divide-slate-100 overflow-y-auto border border-slate-200">
                    {divisions.map((division) => (
                      <label
                        key={division.division_id}
                        className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-[12.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={viewerDivisions.includes(division.division_id)}
                          onChange={() => toggleViewerDivision(division.division_id)}
                          className="h-4 w-4 border-slate-300 accent-[#f26a21] text-[#f26a21] focus:ring-[#f26a21] focus:ring-offset-0"
                        />
                        {division.division_name}
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
                    style={SELECT_ARROW_STYLE}
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

      <div className="flex items-center justify-between border-t border-slate-200 pt-6">
        <p className="dcota-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
          {initialData ? 'Mode: Edit' : 'Mode: New'}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="dcota-mono border border-transparent px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="dcota-mono flex items-center gap-2 bg-[#f26a21] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#d4551a] disabled:opacity-50"
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

function Pagination({ currentPage, totalPages, onPageChange, totalItems, rowsPerPage }) {
  const startRange = (currentPage - 1) * rowsPerPage + 1;
  const endRange = Math.min(currentPage * rowsPerPage, totalItems);

  const pages = useMemo(() => {
    const items = [];
    const delta = 1;
    for (let page = 1; page <= totalPages; page += 1) {
      const withinRange = page >= currentPage - delta && page <= currentPage + delta;
      if (page === 1 || page === totalPages || withinRange) {
        items.push(page);
      } else if (items[items.length - 1] !== '...') {
        items.push('...');
      }
    }
    return items;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row">
      <p className="dcota-mono text-[10.5px] uppercase tracking-[0.18em] text-slate-400">
        <span className="font-bold text-slate-900">
          {String(startRange).padStart(3, '0')}–{String(endRange).padStart(3, '0')}
        </span>{' '}
        of{' '}
        <span className="font-bold text-slate-900">
          {String(totalItems).padStart(3, '0')}
        </span>
      </p>

      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Halaman sebelumnya"
          className="-mr-px flex h-9 w-9 items-center justify-center border border-slate-200 text-slate-500 transition-colors hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
        >
          <ChevronLeftIcon className="h-3.5 w-3.5" strokeWidth={2} />
        </button>

        {pages.map((page, index) =>
          page === '...' ? (
            <span
              key={`ellipsis-${index}`}
              className="dcota-mono -mr-px flex h-9 w-9 items-center justify-center border-y border-slate-200 text-[11px] text-slate-300"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-current={currentPage === page ? 'page' : undefined}
              className={`dcota-mono -mr-px flex h-9 w-9 items-center justify-center text-[11px] font-bold transition-colors ${currentPage === page
                  ? 'relative z-10 border border-[#f26a21] bg-[#f26a21] text-white'
                  : 'border border-slate-200 text-slate-500 hover:relative hover:z-10 hover:border-slate-900 hover:text-slate-900'
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
          className="flex h-9 w-9 items-center justify-center border border-slate-200 text-slate-500 transition-colors hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
        >
          <ChevronRightIcon className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
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

export default function AdminUsersPage() {
  const { data: session } = useSession();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [picOmis, setPicOmis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalState, setModalState] = useState({ isOpen: false, type: 'create', user: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDiv, setFilterDiv] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const notificationTimerRef = useRef(null);

  const triggerNotification = (type, message) => {
    setNotification({ type, message });
    clearTimeout(notificationTimerRef.current);
    notificationTimerRef.current = setTimeout(() => setNotification(null), 3500);
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

      const picRole = masterData.roles.find((role) => role.role_name === 'PIC OMI');
      if (picRole) {
        setPicOmis(usersData.filter((user) => user.role_id === picRole.role_id));
      }
    } catch {
      triggerNotification('error', 'Gagal memuat data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterDiv]);

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

  const activeUsersCount = users.filter((user) => user.status === 'Active').length;
  const inactiveUsersCount = users.length - activeUsersCount;
  const hasActiveFilters = Boolean(searchTerm || filterRole || filterDiv);
  const totalPagesCount = Math.max(1, Math.ceil(filteredUsers.length / ROWS_PER_PAGE));

  const handleImportCsv = async (event) => {
    const file = event.target.files[0];
    // Reset supaya memilih file yang sama dua kali tetap memicu onChange
    event.target.value = '';
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
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (payload) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${modalState.user.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal update');
      triggerNotification('success', 'User berhasil diperbarui!');
      setModalState({ isOpen: false, type: 'create', user: null });
      loadInitialData();
    } catch (err) {
      triggerNotification('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus, userName) => {
    const actionLabel = currentStatus === 'Active' ? 'Menonaktifkan' : 'Mengaktifkan';
    if (!confirm(`Apakah Anda yakin ingin ${actionLabel} user ${userName}?`)) return;

    try {
      const method = currentStatus === 'Active' ? 'DELETE' : 'PUT';
      const target = users.find((user) => user.user_id === userId);
      const body =
        currentStatus === 'Active'
          ? undefined
          : JSON.stringify({
            name: target.name,
            username: target.username,
            email: target.email,
            phone: target.phone,
            role_id: target.role_id,
            division_id: target.division_id,
            pic_omi_id: target.pic_omi_id,
            status: 'Active',
          });

      const res = await fetch(`/api/admin/users/${userId}`, {
        method,
        headers: method === 'PUT' ? { 'Content-Type': 'application/json' } : undefined,
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal mengubah status');
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

  const closeModal = () => setModalState((prev) => ({ ...prev, isOpen: false }));

  const tableHeaders = [
    { label: '#', align: 'left', width: 'w-12' },
    { label: 'Pengguna', align: 'left' },
    { label: 'Role', align: 'left' },
    { label: 'Divisi', align: 'left' },
    { label: 'Status', align: 'left' },
    { label: 'Aksi', align: 'right' },
  ];

  return (
    <>
      <div className="dcota-sans animate-in fade-in bg-white duration-500">
        <Transition
          show={Boolean(notification)}
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
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-[#f26a21] bg-[#f26a21] text-white'
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

        <section className="border-b border-t-[3px] border-slate-200 border-t-[#f26a21]">
          <div className="mx-auto max-w-[1440px] px-6 pb-10 pt-12 lg:px-12">
            <div className="dcota-mono mb-5 flex items-center gap-3 text-[10.5px] uppercase tracking-[0.22em] text-slate-400">
              <span className="bg-[#f26a21] px-2 py-1 font-semibold tracking-[0.2em] text-white">
                ADMIN
              </span>
              <span className="font-semibold text-slate-900">DCOTA CARE</span>
              <span className="text-slate-300">/</span>
              <span>USERS</span>
            </div>

            <div className="grid grid-cols-12 items-end gap-6">
              <div className="col-span-12 lg:col-span-7">
                <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight lg:text-6xl">
                  Manajemen <span className="text-[#f26a21]">User.</span>
                </h1>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-500">
                  Kelola hak akses, divisi, dan status akun seluruh anggota tim Dcota Care.
                </p>
              </div>

              <div className="col-span-12 grid grid-cols-3 gap-0 border-l border-slate-200 lg:col-span-5 lg:pl-0">
                <StatBlock label="Total" value={users.length} code="01" />
                <StatBlock label="Aktif" value={activeUsersCount} code="02" accent />
                <StatBlock label="Nonaktif" value={inactiveUsersCount} code="03" />
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setModalState({ isOpen: true, type: 'create', user: null })}
                className="dcota-mono flex items-center gap-2 bg-[#f26a21] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#d4551a]"
              >
                <UserPlusIcon className="h-4 w-4" strokeWidth={2} />
                Tambah User
              </button>
              <label className="dcota-mono flex cursor-pointer items-center gap-2 border border-slate-300 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-900 transition-colors hover:border-[#f26a21] hover:text-[#f26a21]">
                <ArrowUpTrayIcon className="h-4 w-4" strokeWidth={2} />
                Import CSV
                <input type="file" accept=".csv" className="hidden" onChange={handleImportCsv} />
              </label>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-slate-50/40">
          <div className="mx-auto max-w-[1440px] px-6 py-4 lg:px-12">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <MagnifyingGlassIcon
                  className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  placeholder="Cari nama, username, email..."
                  className="w-full border-0 border-b border-slate-200 bg-transparent py-2 pl-6 pr-4 text-[13px] font-semibold text-slate-900 placeholder-slate-300 transition-colors focus:border-[#f26a21] focus:outline-none focus:ring-0"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="dcota-mono hidden text-[10px] uppercase tracking-[0.18em] text-slate-400 sm:block">
                  Filter:
                </div>

                <select
                  value={filterRole}
                  onChange={(event) => setFilterRole(event.target.value)}
                  className="dcota-mono cursor-pointer appearance-none border border-slate-200 bg-white px-3 py-2 pr-7 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-900 transition-colors hover:border-slate-900 focus:border-[#f26a21] focus:outline-none"
                  style={SELECT_ARROW_STYLE}
                >
                  <option value="">Semua Role</option>
                  {roles.map((role) => (
                    <option key={role.role_id} value={role.role_name}>
                      {role.role_name}
                    </option>
                  ))}
                </select>

                <select
                  value={filterDiv}
                  onChange={(event) => setFilterDiv(event.target.value)}
                  className="dcota-mono cursor-pointer appearance-none border border-slate-200 bg-white px-3 py-2 pr-7 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-900 transition-colors hover:border-slate-900 focus:border-[#f26a21] focus:outline-none"
                  style={SELECT_ARROW_STYLE}
                >
                  <option value="">Semua Divisi</option>
                  {divisions.map((division) => (
                    <option key={division.division_id} value={division.division_name}>
                      {division.division_name}
                    </option>
                  ))}
                </select>

                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
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

        <section className="hidden md:block">
          <div className="mx-auto max-w-[1440px] px-6 py-2 lg:px-12">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  {tableHeaders.map((header) => (
                    <th
                      key={header.label}
                      className={`dcota-mono px-6 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 ${header.align === 'right' ? 'text-right' : 'text-left'
                        } ${header.width || ''}`}
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: ROWS_PER_PAGE }).map((_, index) => (
                    <SkeletonRow key={index} />
                  ))
                ) : pagedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <UsersIcon className="h-8 w-8 opacity-30" strokeWidth={1.5} />
                        <p className="dcota-mono text-[11px] uppercase tracking-[0.18em]">
                          No users found
                        </p>
                        {hasActiveFilters && (
                          <button
                            onClick={resetFilters}
                            className="dcota-mono mt-1 text-[10px] uppercase tracking-[0.18em] text-[#f26a21] hover:underline"
                          >
                            Reset filter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pagedUsers.map((user, index) => {
                    const rowNum = (currentPage - 1) * ROWS_PER_PAGE + index + 1;
                    return (
                      <tr
                        key={user.user_id}
                        className="group border-b border-slate-100 transition-colors hover:bg-[#f26a21]/[0.03]"
                      >
                        <td className="px-6 py-4">
                          <span className="dcota-mono text-[11px] font-semibold text-slate-300 transition-colors group-hover:text-[#f26a21]">
                            {String(rowNum).padStart(3, '0')}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="dcota-mono flex h-10 w-10 shrink-0 items-center justify-center bg-[#f26a21] text-[13px] font-bold text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-[13.5px] font-extrabold text-slate-900">
                                {user.name}
                              </p>
                              <p className="dcota-mono mt-0.5 text-[10.5px] font-semibold text-slate-400">
                                @{user.username}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <Badge variant="role">{user.role?.role_name}</Badge>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-[12.5px] font-semibold text-slate-700">
                            {user.division?.division_name || (
                              <span className="text-slate-300">—</span>
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <Badge>{user.status}</Badge>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setModalState({ isOpen: true, type: 'edit', user })}
                              className="flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-500 transition-colors hover:border-slate-900 hover:text-slate-900"
                              title="Edit user"
                            >
                              <PencilSquareIcon className="h-4 w-4" strokeWidth={1.8} />
                            </button>
                            {session?.user?.id !== user.user_id && (
                              <button
                                onClick={() =>
                                  handleToggleStatus(user.user_id, user.status, user.name)
                                }
                                className={`flex h-8 w-8 items-center justify-center border transition-colors ${user.status === 'Active'
                                    ? 'border-slate-200 text-slate-500 hover:border-[#f26a21] hover:text-[#f26a21]'
                                    : 'border-slate-200 text-slate-500 hover:border-emerald-600 hover:text-emerald-600'
                                  }`}
                                title={
                                  user.status === 'Active'
                                    ? 'Nonaktifkan user'
                                    : 'Aktifkan user'
                                }
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

        <section className="md:hidden">
          <div className="mx-auto max-w-[1440px]">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => <SkeletonMobile key={index} />)
            ) : pagedUsers.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
                <UsersIcon className="h-8 w-8 opacity-30" strokeWidth={1.5} />
                <p className="dcota-mono text-[11px] uppercase tracking-[0.18em]">No users</p>
              </div>
            ) : (
              pagedUsers.map((user, index) => {
                const rowNum = (currentPage - 1) * ROWS_PER_PAGE + index + 1;
                return (
                  <div
                    key={user.user_id}
                    className="flex items-center gap-3 border-b border-slate-100 px-6 py-4 transition-colors hover:bg-[#f26a21]/[0.03]"
                  >
                    <span className="dcota-mono w-6 text-[10px] font-semibold text-slate-300">
                      {String(rowNum).padStart(3, '0')}
                    </span>
                    <div className="dcota-mono flex h-10 w-10 shrink-0 items-center justify-center bg-[#f26a21] text-[13px] font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-extrabold text-slate-900">
                          {user.name}
                        </span>
                      </div>
                      <p className="dcota-mono mt-0.5 truncate text-[10px] font-semibold text-slate-400">
                        {user.role?.role_name} · {user.division?.division_name || 'No Div'}
                      </p>
                    </div>
                    <Badge>{user.status}</Badge>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setModalState({ isOpen: true, type: 'edit', user })}
                        className="flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-500 transition-colors hover:border-slate-900 hover:text-slate-900"
                        title="Edit user"
                      >
                        <PencilSquareIcon className="h-4 w-4" strokeWidth={1.8} />
                      </button>
                      {session?.user?.id !== user.user_id && (
                        <button
                          onClick={() => handleToggleStatus(user.user_id, user.status, user.name)}
                          className={`flex h-8 w-8 items-center justify-center border transition-colors ${user.status === 'Active'
                              ? 'border-slate-200 text-slate-500 hover:border-[#f26a21] hover:text-[#f26a21]'
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

        <Transition appear show={modalState.isOpen} as={Fragment}>
          <Dialog as="div" className="dcota-sans relative z-[100]" onClose={closeModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-start justify-center p-4 pt-16">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-3"
                  enterTo="opacity-100 translate-y-0"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Dialog.Panel className="w-full max-w-3xl overflow-hidden border border-t-[3px] border-slate-200 border-t-[#f26a21] bg-white shadow-[0_24px_80px_-20px_rgba(15,23,42,0.25)] transition-all">
                    <div className="border-b border-slate-200 px-8 py-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="dcota-mono mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f26a21]">
                            {modalState.type === 'create' ? 'New Entry' : 'Edit Mode'} · Users
                          </p>
                          <Dialog.Title className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900">
                            {modalState.type === 'create' ? 'Tambah User Baru' : 'Perbarui Akun'}
                          </Dialog.Title>
                        </div>
                        <button
                          onClick={closeModal}
                          className="-mr-2 -mt-1 flex h-9 w-9 items-center justify-center text-slate-400 transition-colors hover:bg-[#f26a21] hover:text-white"
                          aria-label="Tutup"
                        >
                          <XMarkIcon className="h-5 w-5" strokeWidth={2} />
                        </button>
                      </div>
                    </div>

                    <div className="px-8 py-8">
                      <UserForm
                        buttonText={
                          modalState.type === 'create' ? 'Buat Sekarang' : 'Simpan Perubahan'
                        }
                        initialData={modalState.user}
                        roles={roles}
                        divisions={divisions}
                        picOmis={picOmis}
                        isLoading={isSubmitting}
                        onClose={closeModal}
                        onSubmit={
                          modalState.type === 'create' ? handleCreateUser : handleUpdateUser
                        }
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