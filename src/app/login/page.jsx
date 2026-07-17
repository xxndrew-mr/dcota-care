'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, User, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });
      if (result?.ok) {
        router.push('/dashboard');
      } else {
        setError('Login gagal. Periksa username dan password Anda.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .lp-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        .lp-mono { font-family: 'JetBrains Mono', monospace; }

        .lp-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          padding: 20px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* ── CARD: Swiss flat, sudut tajam, hairline, strip oranye atas ── */
        .lp-card {
          display: flex;
          align-items: stretch;
          width: 100%;
          max-width: 820px;
          min-height: 440px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-top: 3px solid #f26a21;
          box-shadow: 0 24px 60px -24px rgba(15,23,42,0.18);
          overflow: hidden;
          animation: cardIn 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── LEFT PANEL — flat, flush, image + overlay ── */
        .lp-left {
          width: 42%;
          flex-shrink: 0;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 28px 26px;
          overflow: hidden;
        }

        .lp-left-bg {
          position: absolute; inset: 0;
          background-image: url('/dcota-bg-login.png');
          background-size: cover; background-position: center;
        }
        .lp-left-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(150deg, rgba(8,24,58,0.30) 0%, rgba(8,24,58,0.20) 45%, rgba(242,106,33,0.62) 100%);
        }

        .lp-left-top {
          position: relative; z-index: 2;
          display: flex; align-items: center; justify-content: space-between;
        }
        .lp-brand-name {
          color: #fff; font-size: 11px; font-weight: 800;
          letter-spacing: 0.22em; text-transform: uppercase; margin: 0;
          font-family: 'JetBrains Mono', monospace;
        }
        /* logo diperbesar: badge mungil 38px → 56px, jadi focal point */
        .lp-logo-box {
          width: 56px; height: 56px;
          background: rgba(255,255,255,0.16);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.30);
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }

        .lp-left-bottom { position: relative; z-index: 2; }
        .lp-tagline-small {
          color: rgba(255,255,255,0.85); font-size: 10px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 8px;
          font-family: 'JetBrains Mono', monospace;
        }
        .lp-brand-big {
          color: #fff; font-size: 22px; font-weight: 800;
          line-height: 1.2; margin: 0; letter-spacing: -0.3px;
        }

        /* ── RIGHT PANEL ── */
        .lp-right {
          flex: 1;
          display: flex; flex-direction: column; justify-content: center;
          padding: 40px 44px;
          animation: slideIn 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* logo-lockup khusus mobile (muncul saat panel kiri disembunyikan) */
        .lp-right-logo {
          display: none;
          align-items: center; gap: 12px;
          margin: 0 0 26px;
          padding-bottom: 22px;
          border-bottom: 1px solid #e2e8f0;
        }
        .lp-right-logo-box {
          width: 52px; height: 52px; flex-shrink: 0;
          background: #f26a21;
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .lp-right-logo-text { display: flex; flex-direction: column; line-height: 1; }
        .lp-right-logo-name {
          font-size: 15px; font-weight: 800; color: #0f172a; letter-spacing: -0.2px;
        }
        .lp-right-logo-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.22em; color: #94a3b8; margin-top: 5px;
        }

        .lp-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.22em; color: #94a3b8;
          display: flex; align-items: center; gap: 10px; margin: 0 0 18px;
        }
        .lp-eyebrow .tag {
          background: #f26a21; color: #fff; padding: 3px 7px; letter-spacing: 0.18em;
        }

        .lp-title {
          font-size: 30px; font-weight: 800; color: #0f172a;
          margin: 0 0 8px; letter-spacing: -0.8px; line-height: 1.1;
        }
        .lp-title span { color: #f26a21; }
        .lp-desc {
          font-size: 13px; color: #64748b; margin: 0 0 26px; line-height: 1.5;
        }

        .lp-fields { display: flex; flex-direction: column; gap: 14px; }

        .lp-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.18em; color: #475569; margin: 0 0 6px;
          display: block;
        }

        /* ── INPUT: flat, sudut tajam, hairline, focus oranye ── */
        .lp-input-wrap {
          position: relative; background: #fff;
          border: 1px solid #cbd5e1; transition: all 0.18s ease;
        }
        .lp-input-wrap:focus-within {
          border-color: #f26a21;
          box-shadow: 0 0 0 3px rgba(242,106,33,0.10);
        }
        .lp-input {
          width: 100%; height: 46px;
          padding: 0 44px 0 40px;
          border: none; background: transparent;
          font-size: 14px; color: #0f172a; outline: none;
          font-family: inherit; font-weight: 600;
        }
        .lp-input::placeholder { color: #94a3b8; font-weight: 500; }

        /* ikon kiri */
        .lp-input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #94a3b8; display: flex; align-items: center; pointer-events: none;
          transition: color 0.18s;
        }
        .lp-input-wrap:focus-within .lp-input-icon { color: #f26a21; }

        /* toggle mata kanan */
        .lp-eye {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #94a3b8;
          display: flex; align-items: center; padding: 4px; transition: color 0.18s; z-index: 2;
        }
        .lp-eye:hover { color: #f26a21; }

        .lp-error {
          display: flex; align-items: center; gap: 9px;
          background: #fef2f2; border: 1px solid #fecaca;
          padding: 10px 12px; font-size: 12.5px; font-weight: 600; color: #dc2626;
        }
        .lp-error-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #ef4444;
          flex-shrink: 0; animation: blink 1.4s infinite;
        }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

        /* ── BUTTON: rectangular oranye, uppercase mono (match app) ── */
        .lp-btn {
          width: 100%; height: 48px;
          background: #f26a21; color: #fff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em;
          border: none; cursor: pointer; margin-top: 8px;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: background 0.18s, transform 0.18s;
        }
        .lp-btn:hover:not(:disabled) { background: #d4551a; }
        .lp-btn:active:not(:disabled) { transform: translateY(1px); }
        .lp-btn:disabled { background: #cbd5e1; cursor: not-allowed; }

        .lp-btn-arrow { display: inline-flex; transition: transform 0.18s; }
        .lp-btn:hover:not(:disabled) .lp-btn-arrow { transform: translateX(3px); }

        .lp-footer {
          font-family: 'JetBrains Mono', monospace;
          text-align: center; font-size: 9px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase; color: #cbd5e1; margin-top: 24px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }

        @media (max-width: 820px) {
          .lp-card { flex-direction: column; max-width: 420px; min-height: auto; }
          .lp-left { display: none; }
          .lp-right { padding: 36px 28px; }
          .lp-right-logo { display: flex; }
          .lp-title { font-size: 27px; }
        }
      `}</style>

      <div className="lp-page lp-sans">
        <div className="lp-card">

          <div className="lp-left">
            <div className="lp-left-bg" />
            <div className="lp-left-overlay" />

            <div className="lp-left-top">
              <p className="lp-brand-name">DCOTA CARE</p>
              <div className="lp-logo-box">
                <Image
                  src="/dcota-logo.png"
                  alt="Dcota Care"
                  width={36}
                  height={36}
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </div>

            <div className="lp-left-bottom">
              <p className="lp-tagline-small">Onda Grup</p>
              <h1 className="lp-brand-big">
                Aplikasi saran &amp;<br />masukan salesman.
              </h1>
            </div>
          </div>

          <div className="lp-right">

            {/* Logo-lockup — tampil di mobile saat panel kiri disembunyikan */}
            <div className="lp-right-logo">
              <div className="lp-right-logo-box">
                <Image
                  src="/dcota-logo.png"
                  alt="Dcota Care"
                  width={34}
                  height={34}
                  className="invert brightness-0"
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
              <div className="lp-right-logo-text">
                <span className="lp-right-logo-name">Dcota Care</span>
                <span className="lp-right-logo-sub">Onda Grup</span>
              </div>
            </div>

            <p className="lp-eyebrow">
              <span className="tag">LOGIN</span>
              <span>Dcota Care</span>
            </p>

            <h2 className="lp-title">Hi, Selamat <span>Datang.</span></h2>
            <p className="lp-desc">Masuk dengan akun Anda untuk melanjutkan ke dashboard.</p>

            <form className="lp-fields" onSubmit={handleSubmit}>

              {error && (
                <div className="lp-error">
                  <div className="lp-error-dot" />
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="username" className="lp-label">Username</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon"><User size={17} /></span>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="lp-input"
                    placeholder="Masukkan username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="lp-label">Password</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon"><Lock size={17} /></span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="lp-input"
                    placeholder="Masukkan password"
                  />
                  <button
                    type="button"
                    className="lp-eye"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button className="lp-btn" disabled={isLoading} type="submit">
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Memproses…
                  </>
                ) : (
                  <>
                    Login
                    <span className="lp-btn-arrow"><ArrowRight size={16} /></span>
                  </>
                )}
              </button>

            </form>

            <p className="lp-footer">
              © {new Date().getFullYear()} PT Onda Mega Integra
            </p>
          </div>

        </div>
      </div>
    </>
  );
}