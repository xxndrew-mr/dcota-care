'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Konfirmasi password baru tidak sesuai.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal mengubah password');
      }

      setSuccess('Password berhasil diperbarui. Demi keamanan, silakan login ulang.');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // === DINONAKTIFKAN ATAS PERMINTAAN DIREKSI ===
  // Fitur ganti password dimatikan khusus untuk akun Salesman.
  // Hapus blok ini untuk mengaktifkan kembali.
  if (session?.user?.role === 'Salesman') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
            Akun
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Dcota Care / Keamanan
          </span>
        </div>
        <div className="border-l-4 border-amber-500 bg-amber-50 px-5 py-6">
          <p className="text-sm font-bold uppercase tracking-wide text-amber-900">
            Fitur Dinonaktifkan
          </p>
          <p className="mt-2 text-sm leading-relaxed text-amber-900">
            Fitur ganti password tidak tersedia untuk akun Salesman. Silakan
            hubungi Administrator jika Anda perlu mengubah kata sandi.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-5 bg-red-600 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-700"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }
  // === END NONAKTIF ===

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <span className="bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
          Akun
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Dcota Care / Keamanan
        </span>
      </div>

      <div className="mb-10 border-b-2 border-slate-900 pb-8">
        <h1 className="text-4xl font-black uppercase leading-none tracking-tight text-slate-900 sm:text-5xl">
          Ganti <span className="text-red-600">Password.</span>
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-500">
          Perbarui kata sandi akun Anda secara berkala. Isi tiga kolom di bawah
          ini secara berurutan.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 border-l-4 border-red-600 bg-red-50 px-4 py-3">
          <span className="mt-px text-[11px] font-bold uppercase tracking-widest text-red-600">
            Error
          </span>
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-start gap-3 border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3">
          <span className="mt-px text-[11px] font-bold uppercase tracking-widest text-emerald-600">
            Sukses
          </span>
          <p className="text-sm font-medium text-emerald-700">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="divide-y divide-slate-200 border border-slate-200">
        <SwissField
          index="01"
          label="Password Saat Ini"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          show={showCurrent}
          onToggle={() => setShowCurrent(!showCurrent)}
          placeholder="Masukkan password lama"
          required
        />

        <SwissField
          index="02"
          label="Password Baru"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          show={showNew}
          onToggle={() => setShowNew(!showNew)}
          placeholder="Minimal 8 karakter"
          minLength={8}
          hint="Gunakan kombinasi huruf besar, kecil, dan angka."
          required
        />

        <SwissField
          index="03"
          label="Konfirmasi Password Baru"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          show={showConfirm}
          onToggle={() => setShowConfirm(!showConfirm)}
          placeholder="Ulangi password baru"
          required
        />

        <div className="bg-slate-50 p-6">
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 bg-red-600 px-4 py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-700 active:translate-y-px disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                Memproses
              </>
            ) : (
              'Simpan Perubahan'
            )}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-4 w-full text-center text-[11px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-900"
          >
            Batal dan Kembali
          </button>
        </div>
      </form>

      <div className="mt-8 border-l-4 border-amber-500 bg-amber-50 px-4 py-4">
        <p className="text-xs leading-relaxed text-amber-900">
          <span className="font-bold uppercase tracking-wide">Catatan — </span>
          Setelah mengganti password, sesi aktif Anda di perangkat lain mungkin
          akan berakhir. Simpan password baru Anda di tempat yang aman.
        </p>
      </div>
    </div>
  );
}

/* ---- Reusable Swiss-style field ---- */
function SwissField({
  index,
  label,
  name,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  hint,
  minLength,
  required,
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-5 p-6">
      <span className="font-mono text-sm font-bold text-slate-300">{index}</span>

      <div>
        <label
          htmlFor={name}
          className="block text-[11px] font-bold uppercase tracking-widest text-slate-700"
        >
          {label}
        </label>

        <div className="relative mt-3">
          <input
            id={name}
            type={show ? 'text' : 'password'}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            minLength={minLength}
            placeholder={placeholder}
            className="w-full border-0 border-b-2 border-slate-200 bg-transparent pb-2 pr-10 text-base text-slate-900 placeholder:text-slate-300 transition-colors focus:border-red-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={onToggle}
            tabIndex={-1}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-900"
            aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {show ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {hint && (
          <p className="mt-2 text-[11px] text-slate-400">{hint}</p>
        )}
      </div>
    </div>
  );
}