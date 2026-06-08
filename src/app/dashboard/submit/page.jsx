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

/* ─────────────────────────────────────────────
   KATEGORI dengan icon
───────────────────────────────────────────── */
const categories = [
  { value: 'PRODUK', label: 'Produk', desc: 'Masalah seputar produk', icon: ShoppingBagIcon },
  { value: 'PROGRAM PENJUALAN', label: 'Program Penjualan', desc: 'Promo & program aktif', icon: MegaphoneIcon },
  { value: 'KOMISI', label: 'Komisi', desc: 'Pertanyaan komisi', icon: CurrencyDollarIcon },
  { value: 'TOOLS PENJUALAN', label: 'Tools Penjualan', desc: 'Alat bantu penjualan', icon: WrenchScrewdriverIcon },
  { value: 'LAINNYA', label: 'Lainnya', desc: 'Pertanyaan lainnya', icon: EllipsisHorizontalCircleIcon },
];

const INPUT_CLASSES =
  "block w-full border-0 border-b border-slate-300 bg-transparent px-0 py-3 text-[15px] font-semibold text-slate-900 placeholder-slate-300 focus:border-[#ed1c24] focus:outline-none focus:ring-0 transition-colors";

const INPUT_READONLY =
  "block w-full border-0 border-b border-slate-200 bg-transparent px-0 py-3 text-[15px] font-semibold text-slate-500 cursor-not-allowed";

/* ─────────────────────────────────────────────
   FIELD wrapper
───────────────────────────────────────────── */
const Field = ({ label, required, helper, badge, children }) => (
  <div>
    <div className="flex items-baseline justify-between mb-1.5">
      <label className="dcota-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-slate-700">
        {label}
        {required && <span className="text-[#ed1c24] ml-1.5">*</span>}
      </label>
      {badge && (
        <span className="dcota-mono text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 bg-slate-100 px-2 py-0.5">
          {badge}
        </span>
      )}
    </div>
    {children}
    {helper && (
      <p className="mt-2 text-[11.5px] text-slate-400 leading-relaxed">
        {helper}
      </p>
    )}
  </div>
);

/* ═════════════════════════════════════════════
   MAIN PAGE
═════════════════════════════════════════════ */
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

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowedTypes = ['image/', 'video/', 'application/pdf'];
    const isAllowed = allowedTypes.some((type) =>
      type.endsWith('/') ? f.type.startsWith(type) : f.type === type
    );
    if (!isAllowed) {
      alert('File harus berupa gambar, video, atau PDF');
      return;
    }
    if (f.size > 100 * 1024 * 1024) {
      alert('Ukuran file maksimal 100MB');
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      let attachments = null;
      if (file) {
        const presignRes = await fetch('/api/upload/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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

        const r2UploadRes = await fetch(presignData.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        if (!r2UploadRes.ok) {
          const text = await r2UploadRes.text();
          throw new Error(text || 'Gagal upload file ke R2');
        }
        attachments = [{
          url: presignData.fileUrl,
          name: file.name,
          type: file.type,
          fileId: presignData.key,
        }];
      }

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
      setDescription(''); setSelectedKategori(''); setJabatan('');
      setToko(''); setFile(null); setPhone('');
      setTimeout(() => router.push('/dashboard/my-tickets'), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── Progress per section ─── */
  const effectiveUserRole = session?.user?.role;

  // Status tiap section: 'empty' | 'partial' | 'complete'
  const sectionStatus = useMemo(() => {
    if (!session?.user) return {};
    const isSalesman = effectiveUserRole === 'Salesman';

    // Section 01: Identitas — phone wajib, jabatan wajib (kecuali Salesman)
    const phoneOk = phone.trim().length >= 8;
    const jabatanOk = isSalesman ? true : jabatan.trim().length > 0;
    let s01;
    if (!phoneOk && !jabatanOk && !toko) s01 = 'empty';
    else if (phoneOk && jabatanOk) s01 = 'complete';
    else s01 = 'partial';

    // Section 02: Kategori
    const s02 = selectedKategori ? 'complete' : 'empty';

    // Section 03: Deskripsi
    let s03;
    if (description.trim().length === 0) s03 = 'empty';
    else if (description.trim().length < 10) s03 = 'partial';
    else s03 = 'complete';

    // Section 04: Lampiran
    let s04;
    if (isAttachmentRequired) {
      s04 = file ? 'complete' : 'empty';
    } else {
      s04 = file ? 'complete' : 'empty'; // opsional
    }

    return { s01, s02, s03, s04 };
  }, [phone, jabatan, toko, selectedKategori, description, file, isAttachmentRequired, effectiveUserRole, session]);

  // Apakah section optional?
  const isS04Optional = !isAttachmentRequired;

  const allRequiredDone =
    sectionStatus.s01 === 'complete' &&
    sectionStatus.s02 === 'complete' &&
    sectionStatus.s03 === 'complete' &&
    (isS04Optional || sectionStatus.s04 === 'complete');

  const completedCount =
    (sectionStatus.s01 === 'complete' ? 1 : 0) +
    (sectionStatus.s02 === 'complete' ? 1 : 0) +
    (sectionStatus.s03 === 'complete' ? 1 : 0) +
    (sectionStatus.s04 === 'complete' ? 1 : 0);
  const totalSections = 4;
  const progressPct = Math.round((completedCount / totalSections) * 100);

  /* ─── Guards ─── */
  if (!session) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
          .dcota-mono { font-family: 'JetBrains Mono', monospace; }
        `}</style>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ed1c24] border-t-transparent" />
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
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
          .dcota-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
          .dcota-mono { font-family: 'JetBrains Mono', monospace; }
        `}</style>
        <div className="dcota-sans mx-auto max-w-xl mt-16 px-6">
          <div className="border border-[#ed1c24]/20 border-t-[3px] border-t-[#ed1c24] bg-[#ed1c24]/[0.04] p-8">
            <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#ed1c24] mb-3">
              403 · Access Denied
            </p>
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2">
              Akses Ditolak
            </h3>
            <p className="text-[13.5px] text-slate-600 leading-relaxed">
              Hanya pengguna dengan role <span className="dcota-mono font-bold text-slate-900">Salesman</span> atau <span className="dcota-mono font-bold text-slate-900">Agen</span> yang dapat membuat laporan baru.
            </p>
          </div>
        </div>
      </>
    );
  }

  const charCount = description.length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .dcota-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        .dcota-mono { font-family: 'JetBrains Mono', monospace; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="dcota-sans bg-slate-50/60 animate-in fade-in duration-500 pb-32 lg:pb-12 min-h-screen">

        {/* ═══════════════════════════════════════════════════════
            HEADER
        ═══════════════════════════════════════════════════════ */}
        <section className="border-b border-slate-200 border-t-[3px] border-t-[#ed1c24] bg-white">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-12 pt-12 pb-8">

            <div className="dcota-mono text-[10.5px] uppercase tracking-[0.22em] text-slate-400 mb-5 flex items-center gap-3">
              <span className="bg-[#ed1c24] text-white px-2 py-1 font-semibold tracking-[0.2em]">SUBMIT</span>
              <span className="text-slate-900 font-semibold">DCOTA CARE</span>
              <span className="text-slate-300">/</span>
              <span>NEW REPORT</span>
            </div>

            <div className="grid grid-cols-12 gap-6 items-end">
              <div className="col-span-12 lg:col-span-8">
                <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[0.95]">
                  Buat Laporan <span className="text-[#ed1c24]">Baru.</span>
                </h1>
                <p className="text-[13.5px] text-slate-500 mt-4 max-w-lg leading-relaxed">
                  Isi 4 bagian di bawah ini secara berurutan. Sistem akan otomatis meneruskan ke tim yang tepat.
                </p>
              </div>

              <div className="col-span-12 lg:col-span-4 lg:border-l border-slate-200 lg:pl-8">
                <div className="dcota-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-2">
                  Section Progress
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className={`text-5xl font-extrabold tracking-tight leading-none ${allRequiredDone ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {String(completedCount).padStart(2, '0')}
                  </span>
                  <span className="dcota-mono text-lg font-bold text-slate-300">/</span>
                  <span className="dcota-mono text-2xl font-bold text-slate-400">
                    {String(totalSections).padStart(2, '0')}
                  </span>
                  <span className="dcota-mono text-[10px] uppercase tracking-[0.18em] text-slate-400 ml-2">
                    section
                  </span>
                </div>
                {/* Progress bar — 4 segmen */}
                <div className="grid grid-cols-4 gap-1">
                  {['s01', 's02', 's03', 's04'].map((key) => {
                    const status = sectionStatus[key];
                    return (
                      <div
                        key={key}
                        className={`h-1.5 transition-all duration-500 ${status === 'complete' ? 'bg-emerald-500'
                          : status === 'partial' ? 'bg-[#ed1c24]'
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

        {/* ═══════════════════════════════════════════════════════
            STATUS BANNERS
        ═══════════════════════════════════════════════════════ */}
        {error && (
          <div className="border-b border-[#ed1c24]/20 bg-[#ed1c24]/[0.04]">
            <div className="mx-auto max-w-[1200px] px-6 lg:px-12 py-4 flex items-start gap-3">
              <ExclamationCircleIcon className="h-5 w-5 text-[#ed1c24] shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#ed1c24] mb-1">Error</p>
                <p className="text-[13px] font-semibold text-[#ed1c24]">{error}</p>
              </div>
            </div>
          </div>
        )}
        {success && (
          <div className="border-b border-emerald-200 bg-emerald-50">
            <div className="mx-auto max-w-[1200px] px-6 lg:px-12 py-4 flex items-start gap-3">
              <CheckCircleIcon className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700 mb-1">Success</p>
                <p className="text-[13px] font-semibold text-emerald-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            FORM
        ═══════════════════════════════════════════════════════ */}
        <form onSubmit={handleSubmit}>
          <div className="mx-auto max-w-[1200px] px-6 lg:px-12 py-10">
            <div className="grid grid-cols-12 gap-x-8 gap-y-6">

              {/* ═══════════════ MAIN COLUMN ═══════════════ */}
              <div className="col-span-12 lg:col-span-8 space-y-6">

                {/* SECTION 01 — IDENTITAS */}
                <SectionCard
                  code="01"
                  title="Identitas Pelapor"
                  subtitle="Otomatis terisi dari akun Anda. Lengkapi info kontak yang aktif."
                  status={sectionStatus.s01}
                >
                  {/* User chip */}
                  <div className="flex items-center gap-4 mb-7 pb-6 border-b border-slate-200">
                    <div className="flex h-12 w-12 items-center justify-center bg-[#ed1c24] dcota-mono text-lg font-bold text-white">
                      {session.user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-extrabold text-slate-900 truncate">{session.user.name}</p>
                      <p className="dcota-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-400 mt-0.5">
                        {effectiveUserRole} · {session.user.email}
                      </p>
                    </div>
                    <span className="dcota-mono text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1">
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
                      <Field label="Toko / Wilayah" helper="Opsional · Nama toko yang sedang dikunjungi">
                        <input
                          type="text"
                          value={toko}
                          onChange={(e) => setToko(e.target.value)}
                          placeholder="Contoh: Toko Berkah Jaya"
                          className={INPUT_CLASSES}
                        />
                      </Field>
                    ) : (
                      <Field label="Peran di Toko" required helper="Contoh: Pemilik, Karyawan, Kasir, dll.">
                        <input
                          type="text"
                          value={jabatan}
                          onChange={(e) => setJabatan(e.target.value)}
                          required
                          placeholder="Pemilik / Karyawan"
                          className={INPUT_CLASSES}
                        />
                      </Field>
                    )}

                    <div className="sm:col-span-2">
                      <Field label="No. Telepon / WhatsApp" required helper="Pastikan nomor aktif — tim akan menghubungi Anda di sini.">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="08xxxxxxxxxx"
                          required
                          inputMode="numeric"
                          className={INPUT_CLASSES}
                        />
                      </Field>
                    </div>
                  </div>
                </SectionCard>

                {/* SECTION 02 — KATEGORI */}
                <SectionCard
                  code="02"
                  title="Pilih Kategori"
                  subtitle="Pilih satu yang paling sesuai. Sistem akan otomatis meneruskan ke tim yang tepat."
                  status={sectionStatus.s02}
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {categories.map((cat, idx) => {
                      const Icon = cat.icon;
                      const isSelected = selectedKategori === cat.value;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setSelectedKategori(cat.value)}
                          aria-pressed={isSelected}
                          className={`group relative text-left p-4 min-h-[100px] border transition-all duration-200 ${isSelected
                            ? 'border-[#ed1c24] bg-[#ed1c24]/[0.04]'
                            : 'border-slate-200 hover:border-[#ed1c24] bg-white'
                            }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <Icon
                              className={`h-5 w-5 transition-colors ${isSelected ? 'text-[#ed1c24]' : 'text-slate-400 group-hover:text-[#ed1c24]'
                                }`}
                              strokeWidth={1.8}
                            />
                            <span className={`dcota-mono text-[9px] font-bold uppercase tracking-[0.18em] transition-colors ${isSelected ? 'text-[#ed1c24]' : 'text-slate-300'
                              }`}>
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <p className={`text-[14px] font-extrabold tracking-tight leading-tight mb-1 transition-colors ${isSelected ? 'text-[#ed1c24]' : 'text-slate-900'
                            }`}>
                            {cat.label}
                          </p>
                          <p className="text-[11px] text-slate-500 leading-snug">
                            {cat.desc}
                          </p>
                          {isSelected && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ed1c24]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <select value={selectedKategori} onChange={() => { }} required className="sr-only" tabIndex={-1}>
                    <option value="" />
                    {categories.map((c) => <option key={c.value} value={c.value} />)}
                  </select>
                </SectionCard>

                {/* SECTION 03 — DESKRIPSI */}
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
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={6}
                        placeholder="Contoh: Pelanggan di Toko ABC menanyakan tentang program diskon Mei. Mereka ingin tahu apakah masih berlaku untuk pembelian 5 unit ke atas..."
                        className={`${INPUT_CLASSES} resize-none`}
                      />
                      <div className="absolute bottom-2 right-0 flex items-center gap-2 dcota-mono text-[10px] uppercase tracking-[0.14em]">
                        <span className={charCount >= 10 ? 'text-emerald-600 font-bold' : 'text-slate-300'}>
                          {String(charCount).padStart(3, '0')} chars
                        </span>
                        {charCount >= 10 && <span className="text-emerald-600">✓</span>}
                      </div>
                    </div>
                  </Field>
                </SectionCard>

                {/* SECTION 04 — LAMPIRAN */}
                <SectionCard
                  code="04"
                  title="Lampiran"
                  subtitle={isAttachmentRequired
                    ? 'Wajib untuk kategori PRODUK. Lampirkan foto produk yang bermasalah.'
                    : 'Opsional. Tambahkan foto/video pendukung jika perlu.'
                  }
                  status={sectionStatus.s04}
                  optional={isS04Optional}
                  badge={isAttachmentRequired ? 'Wajib' : 'Opsional'}
                  badgeAccent={isAttachmentRequired}
                >
                  {!file ? (
                    <label className={`flex flex-col items-center justify-center w-full min-h-[180px] border-2 border-dashed cursor-pointer transition-colors p-6 ${isAttachmentRequired
                      ? 'border-[#ed1c24]/40 bg-[#ed1c24]/[0.02] hover:bg-[#ed1c24]/[0.04] hover:border-[#ed1c24]'
                      : 'border-slate-300 hover:border-[#ed1c24] hover:bg-slate-50'
                      }`}>
                      <CloudArrowUpIcon className={`h-10 w-10 mb-3 ${isAttachmentRequired ? 'text-[#ed1c24]' : 'text-slate-400'
                        }`} strokeWidth={1.5} />
                      <p className="text-[15px] font-extrabold text-slate-900 mb-1">
                        Tap untuk upload file
                      </p>
                      <p className="dcota-mono text-[10px] uppercase tracking-[0.16em] text-slate-400 text-center">
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
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#ed1c24] text-white">
                          {file.type.startsWith('image/') ? (
                            <PhotoIcon className="h-5 w-5" strokeWidth={1.5} />
                          ) : (
                            <PaperClipIcon className="h-5 w-5" strokeWidth={1.5} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13.5px] font-extrabold text-slate-900 truncate">{file.name}</p>
                          <p className="dcota-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="dcota-mono flex items-center gap-1.5 border border-slate-300 hover:border-[#ed1c24] hover:text-[#ed1c24] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 transition-colors"
                        >
                          <XMarkIcon className="h-3.5 w-3.5" strokeWidth={2} />
                          Ganti
                        </button>
                      </div>
                    </div>
                  )}
                </SectionCard>

                {/* Desktop submit area */}
                <div className="hidden lg:block border border-slate-200 border-t-[3px] border-t-[#ed1c24] bg-white p-6 mt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-1">
                        Status
                      </p>
                      <p className={`text-[15px] font-bold ${allRequiredDone ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {allRequiredDone
                          ? '✓ Semua section selesai — siap dikirim'
                          : `${totalSections - completedCount} section belum lengkap`}
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !allRequiredDone}
                      className="dcota-mono flex items-center gap-3 bg-[#ed1c24] hover:bg-[#c8131a] disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-4 text-[12px] font-bold uppercase tracking-[0.14em] transition-colors"
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

              {/* ═══════════════ SIDEBAR (desktop) ═══════════════ */}
              <aside className="hidden lg:block col-span-4">
                <div className="sticky top-24 space-y-4">

                  {/* Section overview */}
                  <div className="border border-slate-200 bg-white">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/60">
                      <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-900">
                        Overview
                      </p>
                      <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        {completedCount}/{totalSections}
                      </p>
                    </div>
                    <ul>
                      {[
                        { code: '01', label: 'Identitas Pelapor', status: sectionStatus.s01 },
                        { code: '02', label: 'Pilih Kategori', status: sectionStatus.s02 },
                        { code: '03', label: 'Deskripsi Lengkap', status: sectionStatus.s03 },
                        { code: '04', label: 'Lampiran', status: sectionStatus.s04, optional: isS04Optional },
                      ].map((item) => (
                        <li key={item.code} className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 last:border-b-0">
                          <span className="dcota-mono text-[10px] font-bold text-slate-300 w-6">
                            {item.code}
                          </span>
                          <span className={`text-[12.5px] font-semibold flex-1 ${item.status === 'complete' ? 'text-slate-900' :
                            item.status === 'partial' ? 'text-slate-700' :
                              'text-slate-400'
                            }`}>
                            {item.label}
                          </span>
                          <SectionStatusDot status={item.status} optional={item.optional} />
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Help */}
                  <div className="border border-slate-200 border-l-[3px] border-l-[#ed1c24] bg-white p-5">
                    <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#ed1c24] mb-3">
                      Butuh Bantuan?
                    </p>
                    <p className="text-[12.5px] text-slate-600 leading-relaxed mb-4">
                      Jika mengalami kendala saat mengisi formulir, hubungi Tim IT OMI via WhatsApp Group.
                    </p>
                    <div className="dcota-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                      Response · ‹ 1 hour
                    </div>
                  </div>

                </div>
              </aside>

            </div>
          </div>

          {/* MOBILE STICKY SUBMIT */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t-[3px] border-t-[#ed1c24] shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.12)]">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  {allRequiredDone ? (
                    <span className="text-emerald-700">✓ Siap dikirim</span>
                  ) : (
                    <span>{completedCount}/{totalSections} section selesai</span>
                  )}
                </p>
                <p className="dcota-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-900">
                  {progressPct}%
                </p>
              </div>
              <div className="grid grid-cols-4 gap-1 mb-3">
                {['s01', 's02', 's03', 's04'].map((key) => {
                  const status = sectionStatus[key];
                  return (
                    <div
                      key={key}
                      className={`h-1.5 transition-all duration-300 ${status === 'complete' ? 'bg-emerald-500'
                        : status === 'partial' ? 'bg-[#ed1c24]'
                          : 'bg-slate-200'
                        }`}
                    />
                  );
                })}
              </div>
              <button
                type="submit"
                disabled={isLoading || !allRequiredDone}
                className="dcota-mono w-full flex items-center justify-center gap-2 bg-[#ed1c24] active:bg-[#c8131a] disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 text-[12px] font-bold uppercase tracking-[0.14em] transition-colors"
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

/* ═════════════════════════════════════════════
   SECTION CARD — kotak per section yang jelas terlihat
   - Border 1px
   - Header strip dengan numbering BESAR + status
   - Active indicator (border kiri 4px) berubah warna sesuai status
═════════════════════════════════════════════ */
function SectionCard({ code, title, subtitle, status, optional, badge, badgeAccent, children }) {
  // Color mapping based on status
  const isComplete = status === 'complete';
  const isPartial = status === 'partial';
  const isEmpty = status === 'empty' || !status;

  // Border kiri sebagai indicator state
  const leftBorderClass = isComplete
    ? 'border-l-[6px] border-l-emerald-500'
    : isPartial
      ? 'border-l-[6px] border-l-[#ed1c24]'
      : 'border-l-[6px] border-l-slate-200';

  // Status badge teks
  const statusLabel = isComplete ? 'Selesai' : isPartial ? 'Dalam Pengisian' : optional ? 'Opsional' : 'Belum Diisi';
  const statusTextClass = isComplete
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : isPartial
      ? 'text-[#ed1c24] bg-[#ed1c24]/[0.04] border-[#ed1c24]/30'
      : 'text-slate-500 bg-slate-100 border-slate-200';

  return (
    <article
      className={`bg-white border border-slate-200 ${leftBorderClass} transition-all duration-300`}
      style={{ animation: 'fadeUp 0.4s ease both' }}
    >
      {/* HEADER STRIP — numbering raksasa + title + status */}
      <header className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100 bg-slate-50/40">
        <div className="flex items-start gap-5 min-w-0">
          {/* Numbering raksasa — anchor visual */}
          <div className="shrink-0 relative">
            <span className={`block text-[44px] font-extrabold tracking-tight leading-none ${isComplete ? 'text-emerald-600' : isPartial ? 'text-[#ed1c24]' : 'text-slate-300'
              } transition-colors duration-300`}>
              {code}
            </span>
            {isComplete && (
              <span className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center bg-emerald-500 text-white">
                <CheckIcon className="h-3 w-3" strokeWidth={3} />
              </span>
            )}
          </div>

          <div className="min-w-0 pt-1">
            <div className="dcota-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-1">
              Section {code}
            </div>
            <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[12.5px] text-slate-500 mt-1.5 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          {badge && (
            <span className={`dcota-mono text-[9px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 border ${badgeAccent
              ? 'text-[#ed1c24] border-[#ed1c24]/30 bg-[#ed1c24]/[0.04]'
              : 'text-slate-500 border-slate-200 bg-white'
              }`}>
              {badge}
            </span>
          )}
          <span className={`dcota-mono text-[9px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 border ${statusTextClass}`}>
            {statusLabel}
          </span>
        </div>
      </header>

      {/* CONTENT */}
      <div className="p-6 lg:p-8">
        {children}
      </div>
    </article>
  );
}

/* Status dot kecil di sidebar overview */
function SectionStatusDot({ status, optional }) {
  if (status === 'complete') {
    return (
      <span className="flex h-5 w-5 items-center justify-center bg-emerald-500 text-white">
        <CheckIcon className="h-3 w-3" strokeWidth={3} />
      </span>
    );
  }
  if (status === 'partial') {
    return (
      <span className="dcota-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#ed1c24] bg-[#ed1c24]/[0.06] border border-[#ed1c24]/20 px-1.5 py-0.5">
        ···
      </span>
    );
  }
  return (
    <span className="h-5 w-5 border border-slate-200 bg-white" />
  );
}