'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    // Logika pengalihan tetap sama
    if (session) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [session, status, router]);

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .dcota-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        .dcota-mono { font-family: 'JetBrains Mono', monospace; }

        @keyframes loadingBar {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="dcota-sans relative flex min-h-screen items-center justify-center bg-white px-6">

        {/* strip merah pengikat identitas */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#ed1c24]" />

        <div
          className="flex w-full max-w-[360px] flex-col items-center"
          style={{ animation: 'fadeUp 0.5s ease both' }}
        >
          {/* Logo box — merah, flat */}
          <div className="flex h-16 w-16 items-center justify-center bg-[#ed1c24] mb-6">
            <Image
              src="/dcota-logo.png"
              alt="Dcota Care"
              width={34}
              height={34}
              className="object-contain invert brightness-0"
              priority
            />
          </div>

          {/* Brand */}
          <h1 className="text-lg font-extrabold uppercase tracking-[0.28em] text-slate-900">
            Dcota Care
          </h1>
          <p className="dcota-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 mt-2">
            PT Onda Mega Integra
          </p>

          {/* Status card — flat hairline */}
          <div className="mt-9 w-full border border-slate-200 border-l-[3px] border-l-[#ed1c24] bg-white p-5">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="h-4 w-4 animate-spin text-[#ed1c24]" strokeWidth={2.2} />
              <span className="dcota-mono text-[11px] font-bold uppercase tracking-[0.16em] text-slate-900">
                Verifikasi Sesi…
              </span>
            </div>

            {/* progress bar — track abu, fill merah */}
            <div className="h-1 w-full overflow-hidden bg-slate-100">
              <div
                className="h-full w-1/3 bg-[#ed1c24]"
                style={{ animation: 'loadingBar 1.4s ease-in-out infinite' }}
              />
            </div>

            <div className="mt-4 flex items-center gap-2 dcota-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />
              Terhubung · Protokol Keamanan OMI
            </div>
          </div>

          {/* Footer */}
          <p className="dcota-mono text-[9px] font-bold uppercase tracking-[0.22em] text-slate-300 mt-10">
            v2.0.4 · Workspace
          </p>
        </div>

      </div>
    </>
  );
}