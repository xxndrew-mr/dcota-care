'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, User, Lock, Loader2 } from 'lucide-react';

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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .lp-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-image:
          background-size: cover;
          background-position: center;
          padding: 24px;
          position: relative;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .lp-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.32);
          backdrop-filter: blur(3px);
        }

        /* ── OUTER CARD (putih) ── */
        .lp-card {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: stretch;
          width: 100%;
          max-width: 940px;
          min-height: 580px;
          background: #ffffff;
          border-radius: 28px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.16), 0 6px 20px rgba(0,0,0,0.07);
          overflow: hidden;
          animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── LEFT: foto "mengambang" dengan margin di semua sisi ── */
        /*    Ini kuncinya: margin: 14px → foto punya gap dari tepi card  */
        /*    sehingga border-radius terlihat di semua sudut (persis Green Valley) */
        .lp-left {
          margin: 14px 0 14px 14px;   /* gap dari card putih */
          width: 42%;
          flex-shrink: 0;
          position: relative;
          border-radius: 18px;        /* semua sudut melengkung */
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 28px 28px 36px 28px;
        }

        .lp-left-bg {
          position: absolute;
          inset: 0;
          background-image: url('/dcota-bg-login.png');
          background-size: cover;
          background-position: center;
        }

        .lp-left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(8,24,58,0.15) 0%,
            rgba(8,24,58,0.08) 35%,
            rgba(8,24,58,0.75) 100%
          );
        }

        .lp-left-top {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: flex-end;
        }

        .lp-logo-box {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(14px);
          border: 1.5px solid rgba(255,255,255,0.38);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .lp-left-bottom {
          position: relative;
          z-index: 2;
        }

        .lp-welcome {
          color: rgba(255,255,255,0.72);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin: 0 0 8px;
        }

        .lp-brand {
          color: #fff;
          font-size: 34px;
          font-weight: 800;
          line-height: 1.12;
          margin: 0 0 10px;
          letter-spacing: -0.4px;
        }

        .lp-brand span {
          display: block;
          background: linear-gradient(90deg, #ed781eff, #e78b46ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .lp-tagline {
          color: rgba(255,255,255,0.68);
          font-size: 13px;
          margin: 0;
          line-height: 1.5;
        }

        /* ── RIGHT PANEL ── */
        .lp-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 52px 52px;
          animation: slideIn 0.6s cubic-bezier(0.22,1,0.36,1) 0.12s both;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(14px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .lp-title {
          font-size: 25px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px;
          text-align: center;
          letter-spacing: 0.03em;
        }

        .lp-desc {
          font-size: 13px;
          color: #94a3b8;
          text-align: center;
          margin: 0 0 30px;
          line-height: 1.55;
        }

        .lp-fields {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .lp-field-label {
          display: block;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 6px;
        }

        .lp-input-wrap { position: relative; }

        .lp-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          display: flex;
          align-items: center;
          pointer-events: none;
          transition: color 0.2s;
        }

        .lp-input-wrap:focus-within .lp-input-icon { color: #ed781eff; }

        .lp-input {
          width: 100%;
          height: 50px;
          padding: 0 16px 0 42px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          color: #0f172a;
          background: #f8fafc;
          outline: none;
          transition: all 0.2s;
          font-family: inherit;
        }

        .lp-input:focus {
          border-color: #ed781eff;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(237,120,30,0.08);
        }

        .lp-input::placeholder { color: #cbd5e1; }
        .lp-input.pr { padding-right: 44px; }

        .lp-eye {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s;
        }
        .lp-eye:hover { color: #ed781eff; }

        .lp-error {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 12.5px;
          font-weight: 500;
          color: #dc2626;
        }

        .lp-error-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #ef4444;
          flex-shrink: 0;
          animation: blink 1.4s infinite;
        }

        @keyframes blink {
          0%,100% { opacity: 1; } 50% { opacity: 0.3; }
        }

        .lp-btn {
          width: 100%;
          height: 50px;
          border-radius: 50px;
          background: #ed781eff;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          margin-top: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(237,120,30,0.28);
          font-family: inherit;
          letter-spacing: 0.01em;
        }

        .lp-btn:hover:not(:disabled) {
          background: #ed781eff;
          box-shadow: 0 6px 24px rgba(237,120,30,0.38);
        }

        .lp-btn:active:not(:disabled) { transform: scale(0.98); }

        .lp-btn:disabled {
          background: #cbd5e1;
          box-shadow: none;
          cursor: not-allowed;
        }

        .lp-footer {
          text-align: center;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: #cbd5e1;
          margin-top: 28px;
          font-family: inherit;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }

        @media (max-width: 768px) {
          .lp-left { display: none; }
          .lp-right { padding: 40px 28px; }
        }
      `}</style>

      <div className="lp-page">
        <div className="lp-card">

          {/* ── LEFT PANEL ── */}
          <div className="lp-left">
            <div className="lp-left-bg" />
            <div className="lp-left-overlay" />

            <div className="lp-left-top">
              <div className="lp-logo-box">
                <Image
                  src="/dcota-logo.png"
                  alt="Dcota Care"
                  width={34}
                  height={34}
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </div>

            <div className="lp-left-bottom">
              <p className="lp-welcome">SELAMAT DATANG DI</p>
              <h1 className="lp-brand">
                Dcota Care
                <span>Onda Grup</span>
              </h1>
              <p className="lp-tagline">Aplikasi saran dan masukan salesman Dcota.</p>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="lp-right">
            <h2 className="lp-title">Masuk ke Dcota Care</h2>
            <p className="lp-desc">Gunakan kredensial yang diberikan oleh admin.</p>

            <div className="lp-fields">

              {error && (
                <div className="lp-error">
                  <div className="lp-error-dot" />
                  {error}
                </div>
              )}

              {/* Username */}
              <div>
                <label className="lp-field-label" htmlFor="username">Username</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon"><User size={16} /></span>
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

              {/* Password */}
              <div>
                <label className="lp-field-label" htmlFor="password">Password</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon"><Lock size={16} /></span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="lp-input pr"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="lp-eye"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                className="lp-btn"
                disabled={isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Memproses...
                  </>
                ) : 'Masuk Sekarang'}
              </button>

            </div>

            <p className="lp-footer">
              © {new Date().getFullYear()} PT Onda Mega Integra · By : A
            </p>
          </div>

        </div>
      </div>
    </>
  );
}