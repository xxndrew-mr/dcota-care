'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import {
  CloudArrowUpIcon,
  PaperClipIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
  MegaphoneIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  EllipsisHorizontalCircleIcon,
  PhotoIcon,
  ArrowPathIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

const CATEGORIES = [
  { value: 'PRODUK', label: 'Produk', desc: 'Masalah seputar produk', icon: ShoppingBagIcon },
  { value: 'PROGRAM PENJUALAN', label: 'Program Penjualan', desc: 'Promo & program aktif', icon: MegaphoneIcon },
  { value: 'KOMISI', label: 'Komisi', desc: 'Pertanyaan komisi', icon: CurrencyDollarIcon },
  { value: 'TOOLS PENJUALAN', label: 'Tools Penjualan', desc: 'Alat bantu penjualan', icon: WrenchScrewdriverIcon },
  { value: 'LAINNYA', label: 'Lainnya', desc: 'Pertanyaan lainnya', icon: EllipsisHorizontalCircleIcon },
];

const TOTAL_SECTIONS = 4;
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/', 'video/', 'application/pdf'];

const INPUT_CLASSES =
  'block w-full border-0 border-b border-slate-300 bg-transparent px-0 py-3 text-[15px] font-semibold text-slate-900 placeholder-slate-300 focus:border-[#f26a21] focus:outline-none focus:ring-0 transition-colors';

const INPUT_READONLY =
  'block w-full border-0 border-b border-slate-200 bg-transparent px-0 py-3 text-[15px] font-semibold text-slate-500 cursor-not-allowed';

function Field({ label, required, helper, badge, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="dcota-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-slate-700">
          {label}
          {required && <span className="ml-1.5 text-[#f26a21]">*</span>}
        </label>
        {badge && (
          <span className="dcota-mono bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {badge}
          </span>
        )}
      </div>
      {children}
      {helper && <p className="mt-2 text-[11.5px] leading-relaxed text-slate-400">{helper}</p>}
    </div>
  );
}

function SectionCard({ code, title, subtitle, status, optional, badge, badgeAccent, children }) {
  const isComplete = status === 'complete';
  const isPartial = status === 'partial';

  const leftBorderClass = isComplete
    ? 'border-l-[6px] border-l-emerald-500'
    : isPartial
      ? 'border-l-[6px] border-l-[#f26a21]'
      : 'border-l-[6px] border-l-slate-200';

  const statusLabel = isComplete
    ? 'Selesai'
    : isPartial
      ? 'Dalam Pengisian'
      : optional
        ? 'Opsional'
        : 'Belum Diisi';

  const statusTextClass = isComplete
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : isPartial
      ? 'text-[#f26a21] bg-[#f26a21]/[0.04] border-[#f26a21]/30'
      : 'text-slate-500 bg-slate-100 border-slate-200';

  return (
    <article
      className={`border border-slate-200 bg-white ${leftBorderClass} transition-all duration-300`}
      style={{ animation: 'fadeUp 0.4s ease both' }}
    >
      <header className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/40 px-6 py-5">
        <div className="flex min-w-0 items-start gap-5">
          <div className="relative shrink-0">
            <span
              className={`block text-[44px] font-extrabold leading-none tracking-tight transition-colors duration-300 ${isComplete ? 'text-emerald-600' : isPartial ? 'text-[#f26a21]' : 'text-slate-300'
                }`}
            >
              {code}
            </span>
            {isComplete && (
              <span className="absolute -right-2 -top-1 flex h-5 w-5 items-center justify-center bg-emerald-500 text-white">
                <CheckIcon className="h-3 w-3" strokeWidth={3} />
              </span>
            )}
          </div>

          <div className="min-w-0 pt-1">
            <div className="dcota-mono mb-1 text-[9.5px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Section {code}
            </div>
            <h2 className="text-xl font-extrabold leading-tight tracking-tight text-slate-900 lg:text-2xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-500">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {badge && (
            <span
              className={`dcota-mono border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] ${badgeAccent
                  ? 'border-[#f26a21]/30 bg-[#f26a21]/[0.04] text-[#f26a21]'
                  : 'border-slate-200 bg-white text-slate-500'
                }`}
            >
              {badge}
            </span>
          )}
          <span
            className={`dcota-mono border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] ${statusTextClass}`}
          >
            {statusLabel}
          </span>
        </div>
      </header>

      <div className="p-6 lg:p-8">{children}</div>
    </article>
  );
}

function SectionStatusDot({ status }) {
  if (status === 'complete') {
    return (
      <span className="flex h-5 w-5 items-center justify-center bg-emerald-500 text-white">
        <CheckIcon className="h-3 w-3" strokeWidth={3} />
      </span>
    );
  }
  if (status === 'partial') {
    return (
      <span className="dcota-mono border border-[#f26a21]/20 bg-[#f26a21]/[0.06] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#f26a21]">
        ···
      </span>
    );
  }
  return <span className="h-5 w-5 border border-slate-200 bg-white" />;
}

export default function SubmitTicketPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [description, setDescription] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [phone, setPhone] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [toko, setToko] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isAttachmentRequired = selectedKategori === 'PRODUK';
  const effectiveUserRole = session?.user?.role;

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    // Reset supaya memilih file yang sama setelah ditolak tetap memicu onChange
    event.target.value = '';
    if (!selectedFile) return;

    const isAllowed = ALLOWED_FILE_TYPES.some((type) =>
      type.endsWith('/') ? selectedFile.type.startsWith(type) : selectedFile.type === type
    );
    if (!isAllowed) {
      alert('File harus berupa gambar, video, atau PDF');
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      alert('Ukuran file maksimal 100MB');
      return;
    }
    setFile(selectedFile);
  };

  const uploadAttachment = async () => {
    const tokenRes = await fetch('/api/upload-token');
    if (!tokenRes.ok) {
      throw new Error('Sesi Anda tidak valid. Silakan muat ulang halaman lalu login kembali.');
    }
    const { token } = await tokenRes.json();

    const presignRes = await fetch('/api/go-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Upload-Token': token,
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }),
    });

    const presignContentType = presignRes.headers.get('content-type') || '';
    let presignData;
    if (presignContentType.includes('application/json')) {
      presignData = await presignRes.json();
    } else {
      const text = await presignRes.text();
      throw new Error(text || `Gagal membuat upload URL. Status ${presignRes.status}`);
    }
    if (!presignRes.ok) throw new Error(presignData.message || 'Gagal membuat upload URL');

    const uploadRes = await fetch(presignData.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!uploadRes.ok) {
      const text = await uploadRes.text();
      throw new Error(text || 'Gagal upload file ke R2');
    }

    return [
      {
        url: presignData.fileUrl,
        name: file.name,
        type: file.type,
        fileId: presignData.key,
      },
    ];
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!session?.user) {
      setError('Session tidak ditemukan. Silakan login ulang.');
      setIsLoading(false);
      return;
    }
    if (isAttachmentRequired && !file) {
      setError('Lampiran/foto wajib diisi untuk kategori PRODUK.');
      setIsLoading(false);
      return;
    }

    try {
      const attachments = file ? await uploadAttachment() : null;

      const res = await fetch('/api/tickets/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedKategori || description.slice(0, 50),
          description,
          kategori: selectedKategori,
          jabatan: jabatan || null,
          toko: toko || null,
          attachments,
          phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal submit Request');

      setSuccess('Laporan berhasil dikirim. Mengarahkan ke halaman riwayat…');
      setDescription('');
      setSelectedKategori('');
      setJabatan('');
      setToko('');
      setFile(null);
      setPhone('');
      setTimeout(() => router.push('/dashboard/my-tickets'), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sectionStatus = useMemo(() => {
    if (!session?.user) return {};
    const isSalesman = effectiveUserRole === 'Salesman';

    // Selaras dengan validasi API submit: minimal 9 digit angka
    const phoneOk = phone.replace(/[^0-9]/g, '').length >= 9;
    const jabatanOk = isSalesman ? true : jabatan.trim().length > 0;
    let s01;
    if (!phoneOk && !jabatanOk && !toko) s01 = 'empty';
    else if (phoneOk && jabatanOk) s01 = 'complete';
    else s01 = 'partial';

    const s02 = selectedKategori ? 'complete' : 'empty';

    let s03;
    if (description.trim().length === 0) s03 = 'empty';
    else if (description.trim().length < 10) s03 = 'partial';
    else s03 = 'complete';

    const s04 = file ? 'complete' : 'empty';

    return { s01, s02, s03, s04 };
  }, [phone, jabatan, toko, selectedKategori, description, file, effectiveUserRole, session]);

  const isS04Optional = !isAttachmentRequired;

  const allRequiredDone =
    sectionStatus.s01 === 'complete' &&
    sectionStatus.s02 === 'complete' &&
    sectionStatus.s03 === 'complete' &&
    (isS04Optional || sectionStatus.s04 === 'complete');

  const completedCount = ['s01', 's02', 's03', 's04'].reduce(
    (count, key) => count + (sectionStatus[key] === 'complete' ? 1 : 0),
    0
  );
  const progressPct = Math.round((completedCount / TOTAL_SECTIONS) * 100);
  const charCount = description.length;

  if (!session) {
    return (
      <>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f26a21] border-t-transparent" />
            <p className="dcota-mono text-[10.5px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Loading Form
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!['Salesman', 'Agen'].includes(session.user.role)) {
    return (
      <>
        <div className="dcota-sans mx-auto mt-16 max-w-xl px-6">
          <div className="border border-t-[3px] border-[#f26a21]/20 border-t-[#f26a21] bg-[#f26a21]/[0.04] p-8">
            <p className="dcota-mono mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#f26a21]">
              403 · Access Denied
            </p>
            <h3 className="mb-2 text-2xl font-extrabold tracking-tight text-slate-900">
              Akses Ditolak
            </h3>
            <p className="text-[13.5px] leading-relaxed text-slate-600">
              Hanya pengguna dengan role{' '}
              <span className="dcota-mono font-bold text-slate-900">Salesman</span> atau{' '}
              <span className="dcota-mono font-bold text-slate-900">Agen</span> yang dapat membuat
              laporan baru.
            </p>
          </div>
        </div>
      </>
    );
  }

  const sectionOverview = [
    { code: '01', label: 'Identitas Pelapor', status: sectionStatus.s01 },
    { code: '02', label: 'Pilih Kategori', status: sectionStatus.s02 },
    { code: '03', label: 'Deskripsi Lengkap', status: sectionStatus.s03 },
    { code: '04', label: 'Lampiran', status: sectionStatus.s04, optional: isS04Optional },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="dcota-sans animate-in fade-in min-h-screen bg-slate-50/60 pb-32 duration-500 lg:pb-12">
        <section className="border-b border-t-[3px] border-slate-200 border-t-[#f26a21] bg-white">
          <div className="mx-auto max-w-[1200px] px-6 pb-8 pt-12 lg:px-12">
            <div className="dcota-mono mb-5 flex items-center gap-3 text-[10.5px] uppercase tracking-[0.22em] text-slate-400">
              <span className="bg-[#f26a21] px-2 py-1 font-semibold tracking-[0.2em] text-white">
                SUBMIT
              </span>
              <span className="font-semibold text-slate-900">DCOTA CARE</span>
              <span className="text-slate-300">/</span>
              <span>NEW REPORT</span>
            </div>

            <div className="grid grid-cols-12 items-end gap-6">
              <div className="col-span-12 lg:col-span-8">
                <h1 className="text-4xl font-extrabold leading-[0.95] tracking-tight lg:text-5xl">
                  Buat Laporan <span className="text-[#f26a21]">Baru.</span>
                </h1>
                <p className="mt-4 max-w-lg text-[13.5px] leading-relaxed text-slate-500">
                  Isi 4 bagian di bawah ini secara berurutan. Sistem akan otomatis meneruskan ke
                  tim yang tepat.
                </p>
              </div>

              <div className="col-span-12 border-slate-200 lg:col-span-4 lg:border-l lg:pl-8">
                <div className="dcota-mono mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Section Progress
                </div>
                <div className="mb-3 flex items-baseline gap-2">
                  <span
                    className={`text-5xl font-extrabold leading-none tracking-tight ${allRequiredDone ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                  >
                    {String(completedCount).padStart(2, '0')}
                  </span>
                  <span className="dcota-mono text-lg font-bold text-slate-300">/</span>
                  <span className="dcota-mono text-2xl font-bold text-slate-400">
                    {String(TOTAL_SECTIONS).padStart(2, '0')}
                  </span>
                  <span className="dcota-mono ml-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    section
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {['s01', 's02', 's03', 's04'].map((key) => {
                    const status = sectionStatus[key];
                    return (
                      <div
                        key={key}
                        className={`h-1.5 transition-all duration-500 ${status === 'complete'
                            ? 'bg-emerald-500'
                            : status === 'partial'
                              ? 'bg-[#f26a21]'
                              : 'bg-slate-200'
                          }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="border-b border-[#f26a21]/20 bg-[#f26a21]/[0.04]">
            <div className="mx-auto flex max-w-[1200px] items-start gap-3 px-6 py-4 lg:px-12">
              <ExclamationCircleIcon
                className="mt-0.5 h-5 w-5 shrink-0 text-[#f26a21]"
                strokeWidth={2}
              />
              <div>
                <p className="dcota-mono mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f26a21]">
                  Error
                </p>
                <p className="text-[13px] font-semibold text-[#f26a21]">{error}</p>
              </div>
            </div>
          </div>
        )}
        {success && (
          <div className="border-b border-emerald-200 bg-emerald-50">
            <div className="mx-auto flex max-w-[1200px] items-start gap-3 px-6 py-4 lg:px-12">
              <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" strokeWidth={2} />
              <div>
                <p className="dcota-mono mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Success
                </p>
                <p className="text-[13px] font-semibold text-emerald-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mx-auto max-w-[1200px] px-6 py-10 lg:px-12">
            <div className="grid grid-cols-12 gap-x-8 gap-y-6">
              <div className="col-span-12 space-y-6 lg:col-span-8">
                <SectionCard
                  code="01"
                  title="Identitas Pelapor"
                  subtitle="Otomatis terisi dari akun Anda. Lengkapi info kontak yang aktif."
                  status={sectionStatus.s01}
                >
                  <div className="mb-7 flex items-center gap-4 border-b border-slate-200 pb-6">
                    <div className="dcota-mono flex h-12 w-12 items-center justify-center bg-[#f26a21] text-lg font-bold text-white">
                      {session.user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-extrabold text-slate-900">
                        {session.user.name}
                      </p>
                      <p className="dcota-mono mt-0.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {effectiveUserRole} · {session.user.email}
                      </p>
                    </div>
                    <span className="dcota-mono border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                      Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                    <Field label="Nama Lengkap" badge="Otomatis">
                      <input
                        type="text"
                        value={session.user.name || ''}
                        readOnly
                        className={INPUT_READONLY}
                      />
                    </Field>

                    {effectiveUserRole === 'Salesman' ? (
                      <Field
                        label="Toko / Wilayah"
                        helper="Opsional · Nama toko yang sedang dikunjungi"
                      >
                        <input
                          type="text"
                          value={toko}
                          onChange={(event) => setToko(event.target.value)}
                          placeholder="Contoh: Toko Berkah Jaya"
                          className={INPUT_CLASSES}
                        />
                      </Field>
                    ) : (
                      <Field
                        label="Peran di Toko"
                        required
                        helper="Contoh: Pemilik, Karyawan, Kasir, dll."
                      >
                        <input
                          type="text"
                          value={jabatan}
                          onChange={(event) => setJabatan(event.target.value)}
                          required
                          placeholder="Pemilik / Karyawan"
                          className={INPUT_CLASSES}
                        />
                      </Field>
                    )}

                    <div className="sm:col-span-2">
                      <Field
                        label="No. Telepon / WhatsApp"
                        required
                        helper="Pastikan nomor aktif — tim akan menghubungi Anda di sini."
                      >
                        <input
                          type="tel"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          placeholder="08xxxxxxxxxx"
                          required
                          inputMode="numeric"
                          className={INPUT_CLASSES}
                        />
                      </Field>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  code="02"
                  title="Pilih Kategori"
                  subtitle="Pilih satu yang paling sesuai. Sistem akan otomatis meneruskan ke tim yang tepat."
                  status={sectionStatus.s02}
                >
                  <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
                    {CATEGORIES.map((category, index) => {
                      const Icon = category.icon;
                      const isSelected = selectedKategori === category.value;
                      return (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => setSelectedKategori(category.value)}
                          aria-pressed={isSelected}
                          className={`group relative min-h-[100px] border p-4 text-left transition-all duration-200 ${isSelected
                              ? 'border-[#f26a21] bg-[#f26a21]/[0.04]'
                              : 'border-slate-200 bg-white hover:border-[#f26a21]'
                            }`}
                        >
                          <div className="mb-3 flex items-start justify-between">
                            <Icon
                              className={`h-5 w-5 transition-colors ${isSelected
                                  ? 'text-[#f26a21]'
                                  : 'text-slate-400 group-hover:text-[#f26a21]'
                                }`}
                              strokeWidth={1.8}
                            />
                            <span
                              className={`dcota-mono text-[9px] font-bold uppercase tracking-[0.18em] transition-colors ${isSelected ? 'text-[#f26a21]' : 'text-slate-300'
                                }`}
                            >
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <p
                            className={`mb-1 text-[14px] font-extrabold leading-tight tracking-tight transition-colors ${isSelected ? 'text-[#f26a21]' : 'text-slate-900'
                              }`}
                          >
                            {category.label}
                          </p>
                          <p className="text-[11px] leading-snug text-slate-500">{category.desc}</p>
                          {isSelected && (
                            <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#f26a21]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <select
                    value={selectedKategori}
                    onChange={() => { }}
                    required
                    className="sr-only"
                    tabIndex={-1}
                  >
                    <option value="" />
                    {CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value} />
                    ))}
                  </select>
                </SectionCard>

                <SectionCard
                  code="03"
                  title="Deskripsi Lengkap"
                  subtitle="Ceritakan detail kendala atau permintaan Anda dengan jelas."
                  status={sectionStatus.s03}
                >
                  <Field
                    label="Detail Laporan"
                    required
                    helper="Tips: sebutkan lokasi, waktu kejadian, dan bantuan yang dibutuhkan. Minimal 10 karakter."
                  >
                    <div className="relative">
                      <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        required
                        rows={6}
                        placeholder="Contoh: Pelanggan di Toko ABC menanyakan tentang program diskon Mei. Mereka ingin tahu apakah masih berlaku untuk pembelian 5 unit ke atas..."
                        className={`${INPUT_CLASSES} resize-none`}
                      />
                      <div className="dcota-mono absolute bottom-2 right-0 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em]">
                        <span
                          className={charCount >= 10 ? 'font-bold text-emerald-600' : 'text-slate-300'}
                        >
                          {String(charCount).padStart(3, '0')} chars
                        </span>
                        {charCount >= 10 && <span className="text-emerald-600">✓</span>}
                      </div>
                    </div>
                  </Field>
                </SectionCard>

                <SectionCard
                  code="04"
                  title="Lampiran"
                  subtitle={
                    isAttachmentRequired
                      ? 'Wajib untuk kategori PRODUK. Lampirkan foto produk yang bermasalah.'
                      : 'Opsional. Tambahkan foto/video pendukung jika perlu.'
                  }
                  status={sectionStatus.s04}
                  optional={isS04Optional}
                  badge={isAttachmentRequired ? 'Wajib' : 'Opsional'}
                  badgeAccent={isAttachmentRequired}
                >
                  {!file ? (
                    <label
                      className={`flex min-h-[180px] w-full cursor-pointer flex-col items-center justify-center border-2 border-dashed p-6 transition-colors ${isAttachmentRequired
                          ? 'border-[#f26a21]/40 bg-[#f26a21]/[0.02] hover:border-[#f26a21] hover:bg-[#f26a21]/[0.04]'
                          : 'border-slate-300 hover:border-[#f26a21] hover:bg-slate-50'
                        }`}
                    >
                      <CloudArrowUpIcon
                        className={`mb-3 h-10 w-10 ${isAttachmentRequired ? 'text-[#f26a21]' : 'text-slate-400'
                          }`}
                        strokeWidth={1.5}
                      />
                      <p className="mb-1 text-[15px] font-extrabold text-slate-900">
                        Tap untuk upload file
                      </p>
                      <p className="dcota-mono text-center text-[10px] uppercase tracking-[0.16em] text-slate-400">
                        PNG · JPG · PDF · Video · Max 100MB
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*,video/*,application/pdf"
                      />
                    </label>
                  ) : (
                    <div className="relative border border-slate-300 bg-slate-50/50 p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#f26a21] text-white">
                          {file.type.startsWith('image/') ? (
                            <PhotoIcon className="h-5 w-5" strokeWidth={1.5} />
                          ) : (
                            <PaperClipIcon className="h-5 w-5" strokeWidth={1.5} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-extrabold text-slate-900">
                            {file.name}
                          </p>
                          <p className="dcota-mono mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB ·{' '}
                            {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="dcota-mono flex items-center gap-1.5 border border-slate-300 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 transition-colors hover:border-[#f26a21] hover:text-[#f26a21]"
                        >
                          <XMarkIcon className="h-3.5 w-3.5" strokeWidth={2} />
                          Ganti
                        </button>
                      </div>
                    </div>
                  )}
                </SectionCard>

                <div className="mt-2 hidden border border-t-[3px] border-slate-200 border-t-[#f26a21] bg-white p-6 lg:block">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="dcota-mono mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                        Status
                      </p>
                      <p
                        className={`text-[15px] font-bold ${allRequiredDone ? 'text-emerald-700' : 'text-slate-700'
                          }`}
                      >
                        {allRequiredDone
                          ? '✓ Semua section selesai — siap dikirim'
                          : `${TOTAL_SECTIONS - completedCount} section belum lengkap`}
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !allRequiredDone}
                      className="dcota-mono flex items-center gap-3 bg-[#f26a21] px-8 py-4 text-[12px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#d4551a] disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {isLoading ? (
                        <>
                          <ArrowPathIcon className="h-4 w-4 animate-spin" strokeWidth={2} />
                          Mengirim Laporan…
                        </>
                      ) : (
                        <>
                          Kirim Laporan
                          <ArrowRightIcon className="h-4 w-4" strokeWidth={2} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <aside className="col-span-4 hidden lg:block">
                <div className="sticky top-24 space-y-4">
                  <div className="border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/60 px-5 py-4">
                      <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-900">
                        Overview
                      </p>
                      <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        {completedCount}/{TOTAL_SECTIONS}
                      </p>
                    </div>
                    <ul>
                      {sectionOverview.map((item) => (
                        <li
                          key={item.code}
                          className="flex items-center gap-3 border-b border-slate-100 px-5 py-3.5 last:border-b-0"
                        >
                          <span className="dcota-mono w-6 text-[10px] font-bold text-slate-300">
                            {item.code}
                          </span>
                          <span
                            className={`flex-1 text-[12.5px] font-semibold ${item.status === 'complete'
                                ? 'text-slate-900'
                                : item.status === 'partial'
                                  ? 'text-slate-700'
                                  : 'text-slate-400'
                              }`}
                          >
                            {item.label}
                          </span>
                          <SectionStatusDot status={item.status} />
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border border-l-[3px] border-slate-200 border-l-[#f26a21] bg-white p-5">
                    <p className="dcota-mono mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#f26a21]">
                      Butuh Bantuan?
                    </p>
                    <p className="mb-4 text-[12.5px] leading-relaxed text-slate-600">
                      Jika mengalami kendala saat mengisi formulir, hubungi Tim IT OMI via WhatsApp
                      Group.
                    </p>
                    <div className="dcota-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                      Response · ‹ 1 hour
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 z-30 border-t-[3px] border-t-[#f26a21] bg-white shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.12)] lg:hidden">
            <div className="px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  {allRequiredDone ? (
                    <span className="text-emerald-700">✓ Siap dikirim</span>
                  ) : (
                    <span>
                      {completedCount}/{TOTAL_SECTIONS} section selesai
                    </span>
                  )}
                </p>
                <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-900">
                  {progressPct}%
                </p>
              </div>
              <div className="mb-3 grid grid-cols-4 gap-1">
                {['s01', 's02', 's03', 's04'].map((key) => {
                  const status = sectionStatus[key];
                  return (
                    <div
                      key={key}
                      className={`h-1.5 transition-all duration-300 ${status === 'complete'
                          ? 'bg-emerald-500'
                          : status === 'partial'
                            ? 'bg-[#f26a21]'
                            : 'bg-slate-200'
                        }`}
                    />
                  );
                })}
              </div>
              <button
                type="submit"
                disabled={isLoading || !allRequiredDone}
                className="dcota-mono flex w-full items-center justify-center gap-2 bg-[#f26a21] py-4 text-[12px] font-bold uppercase tracking-[0.14em] text-white transition-colors active:bg-[#d4551a] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isLoading ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" strokeWidth={2} />
                    Mengirim…
                  </>
                ) : (
                  <>
                    Kirim Laporan
                    <ArrowRightIcon className="h-4 w-4" strokeWidth={2} />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}