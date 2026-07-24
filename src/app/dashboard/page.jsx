"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

import {
  Sparkles,
  ListChecks,
  ShieldCheck,
  Users,
  BarChart3,
  UserPlus,
  Inbox,
  ClipboardList,
  History,
  MessageSquare,
  ArrowUpRight,
  Bookmark,
  Archive,
} from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();

  if (!session || !session.user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f26a21] border-t-transparent" />
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400 dcota-mono">
          Loading session
        </p>
      </div>
    );
  }

  const user = session.user;
  const role = user.role;

  const isAdmin = role === "Administrator";
  const isSalesAgen = ["Salesman", "Agen"].includes(role);
  const isPIC = ["PIC OMI", "PIC OMI (SS)"].includes(role);
  const isApprover = ["Sales Manager", "Acting Manager", "Acting PIC"].includes(role);
  const isUserFeedback = role === "User Feedback";
  const isViewer = role === "Viewer";

  const getMenuCards = () => {
    if (isAdmin) {
      return [
        {
          href: "/dashboard/admin/users",
          code: "01",
          title: "User Management",
          desc: "Kelola akses, role, dan akun karyawan.",
          icon: Users,
        },
        {
          href: "/dashboard/admin/analytics",
          code: "02",
          title: "Data Warehouse",
          desc: "Monitoring data BigQuery real-time.",
          icon: BarChart3,
        },
      ];
    }

    if (isSalesAgen) {
      return [
        {
          href: "/dashboard/submit",
          code: "01",
          title: "Isi Formulir",
          desc: "Laporan barang & kendala toko.",
          icon: Sparkles,
        },
        {
          href: "/dashboard/my-tickets",
          code: "02",
          title: "Status Laporan",
          desc: "Pantau progres secara real-time.",
          icon: ListChecks,
        },
      ];
    }

    if (isPIC) {
      return [
        {
          href: "/dashboard/queue",
          code: "01",
          title: "Antrian Triase",
          desc: "Tindak lanjuti laporan lapangan.",
          icon: ClipboardList,
        },
        {
          href: "/dashboard/history",
          code: "02",
          title: "Riwayat Saya",
          desc: "Aksi penanganan yang selesai.",
          icon: History,
        },
      ];
    }

    if (isApprover) {
      const cards = [
        {
          href: "/dashboard/queue",
          code: "01",
          title: "Antrian Tugas",
          desc: "Kelola tugas antrian divisi.",
          icon: Inbox,
        },
        {
          href: "/dashboard/history",
          code: "02",
          title: "Riwayat Penanganan",
          desc: "Tinjau performa tugas selesai.",
          icon: History,
        },
      ];

      // Halaman feedback hanya tersedia untuk Sales Manager di grup ini
      // (lihat FEEDBACK_ALLOWED di layout dashboard).
      if (role === "Sales Manager") {
        cards.push({
          href: "/dashboard/feedback",
          code: "03",
          title: "Analisis Feedback",
          desc: "Evaluasi kualitas layanan.",
          icon: MessageSquare,
        });
      }

      return cards;
    }

    if (isUserFeedback) {
      return [
        {
          href: "/dashboard/feedback",
          code: "01",
          title: "Antrian Feedback",
          desc: "Review feedback yang masuk.",
          icon: MessageSquare,
        },
        {
          href: "/dashboard/bookmarks",
          code: "02",
          title: "Bookmark",
          desc: "Feedback yang ditandai penting.",
          icon: Bookmark,
        },
        {
          href: "/dashboard/archive",
          code: "03",
          title: "Arsip",
          desc: "Feedback yang telah diarsipkan.",
          icon: Archive,
        },
      ];
    }

    if (isViewer) {
      return [
        {
          href: "/dashboard/history",
          code: "01",
          title: "Riwayat Tiket",
          desc: "Pantau seluruh riwayat penanganan.",
          icon: History,
        },
        {
          href: "/dashboard/admin/analytics",
          code: "02",
          title: "Analytics",
          desc: "Monitoring data BigQuery real-time.",
          icon: BarChart3,
        },
        {
          href: "/dashboard/feedback",
          code: "03",
          title: "Analisis Feedback",
          desc: "Evaluasi kualitas layanan.",
          icon: MessageSquare,
        },
      ];
    }

    return [];
  };

  const menuCards = getMenuCards();
  const firstName = user.name?.split(" ")[0] || "User";

  const now = new Date();
  const dateStr = now
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <>
      <style>{`
        .hairline-b { border-bottom: 1px solid rgba(15,23,42,0.08); }
        .hairline-t { border-top: 1px solid rgba(15,23,42,0.08); }

        .display-headline {
          font-size: clamp(48px, 8vw, 104px);
          line-height: 0.94;
          letter-spacing: -0.04em;
          font-weight: 800;
        }
      `}</style>

      <div className="dcota-sans w-full bg-white text-slate-900">

        {/* ═══════════ META BAR ═══════════ */}
        <div className="hairline-b w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <div className="mx-auto max-w-7xl px-6 lg:px-12 py-3 flex items-center justify-between dcota-mono text-[10.5px] uppercase tracking-[0.18em] text-slate-500">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                System Online
              </span>
              <span className="hidden md:inline">{dateStr}</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="hidden md:inline text-slate-400">Onda Cloud Engine</span>
              <span>v2.4</span>
            </div>
          </div>
        </div>

        {/* ═══════════ HERO ═══════════ */}
        <section className="hairline-b w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <div className="mx-auto max-w-7xl px-6 lg:px-12 pt-16 pb-14 lg:pt-20 lg:pb-16">

            {/* Eyebrow */}
            <div className="grid grid-cols-12 gap-6 mb-10 lg:mb-12">
              <div className="col-span-12 dcota-mono text-[10.5px] uppercase tracking-[0.22em] text-slate-400 flex flex-wrap items-center gap-3">
                <span className="bg-[#f26a21] text-white px-2 py-1 font-semibold tracking-[0.2em]">
                  {isAdmin ? "ADMIN" : isSalesAgen ? "FIELD" : isPIC ? "TRIAGE" : isApprover ? "APPROVAL" : "REVIEW"}
                </span>
                <span className="text-slate-900 font-semibold">DCOTA CARE</span>
                <span className="text-slate-300">/</span>
                <span>{role}</span>
                <span className="text-slate-300">/</span>
                <span>SESI AKTIF</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6 items-end">
              <h1 className="col-span-12 lg:col-span-8 display-headline">
                Halo,
                <br />
                <span className="text-[#f26a21]">{firstName}.</span>
              </h1>

              {/* Note kanan + CTA jelas */}
              <div className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l-2 lg:border-[#f26a21]">
                <p className="dcota-mono text-[10.5px] uppercase tracking-[0.18em] text-[#f26a21] mb-3 font-semibold">
                  ▸ Catatan
                </p>
                <p className="text-[14px] leading-relaxed text-slate-700 font-medium mb-5">
                  {isAdmin && "Kontrol penuh atas infrastruktur dan pengguna sistem."}
                  {isSalesAgen && "Setiap laporan Anda menjadi bahan keputusan tim manajemen."}
                  {isPIC && "Prioritaskan label urgent untuk menjaga kualitas layanan."}
                  {isApprover && "Tindak lanjuti antrian tugas Anda agar layanan tetap terjaga."}
                  {(isUserFeedback || isViewer) && "Tinjau tren feedback mingguan untuk evaluasi divisi."}
                </p>
                {menuCards[0] && (
                  <Link
                    href={menuCards[0].href}
                    className="inline-flex items-center gap-2 bg-[#f26a21] text-white text-[12px] font-semibold uppercase tracking-[0.15em] px-4 py-2.5 hover:bg-[#d4551a] transition-colors"
                  >
                    Mulai {menuCards[0].title}
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
                  </Link>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* ═══════════ SECTION HEADER ═══════════ */}
        <div className="hairline-b w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-slate-50/60">
          <div className="mx-auto max-w-7xl px-6 lg:px-12 py-5 flex items-end justify-between">
            <div className="flex items-baseline gap-4">
              <span className="dcota-mono text-[10.5px] uppercase tracking-[0.22em] text-[#f26a21] font-semibold">
                §  Section
              </span>
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
                {isAdmin ? "Manajemen Sistem" : "Layanan Utama"}
              </h2>
            </div>
            <div className="dcota-mono text-[10.5px] uppercase tracking-[0.22em] text-slate-400">
              {String(menuCards.length).padStart(2, "0")} ITEM
            </div>
          </div>
        </div>

        <div className="hairline-b w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <div className="mx-auto max-w-7xl">

            {menuCards.map((card, i) => (
              <Link
                key={i}
                href={card.href}
                className={`group block px-6 lg:px-12 transition-colors duration-200 hover:bg-[#f26a21]/[0.04] ${i < menuCards.length - 1 ? "hairline-b" : ""
                  }`}
              >
                <div className="grid grid-cols-12 gap-4 lg:gap-6 py-7 lg:py-8 items-center relative">
                  <span className="absolute left-0 lg:-left-12 top-1/2 -translate-y-1/2 h-10 w-1 bg-[#f26a21] opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Code */}
                  <div className="col-span-2 lg:col-span-1 dcota-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-[#f26a21]">
                    {card.code}
                  </div>

                  <div className="col-span-2 lg:col-span-1 flex justify-start">
                    <span className="flex items-center justify-center w-11 h-11 border border-slate-200 group-hover:border-[#f26a21] group-hover:bg-[#f26a21] transition-all duration-200">
                      <card.icon
                        className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors"
                        strokeWidth={1.6}
                      />
                    </span>
                  </div>

                  {/* Title */}
                  <div className="col-span-8 lg:col-span-4">
                    <h3 className="text-xl lg:text-2xl font-extrabold tracking-tight leading-tight">
                      <span className="relative inline-block">
                        {card.title}
                        <span className="absolute left-0 -bottom-0.5 w-full h-[2px] bg-[#f26a21] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                      </span>
                    </h3>
                  </div>

                  {/* Desc */}
                  <div className="col-span-9 lg:col-span-4 col-start-3 lg:col-start-7">
                    <p className="text-[14px] text-slate-600 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="col-span-3 lg:col-span-2 flex items-center justify-end gap-2">
                    <span className="hidden lg:inline dcota-mono text-[10.5px] uppercase tracking-[0.18em] text-slate-400 group-hover:text-[#f26a21] transition-colors">
                      Buka
                    </span>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 group-hover:border-[#f26a21] group-hover:bg-[#f26a21] transition-all duration-200">
                      <ArrowUpRight
                        className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors"
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}

          </div>
        </div>

        {/* ═══════════ BOTTOM GRID — 3 kolom ═══════════ */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <div className="mx-auto max-w-7xl px-6 lg:px-12 py-14 lg:py-16">

            <div className="grid grid-cols-12 gap-x-6 gap-y-12">

              {/* KOL 1 : SESSION */}
              <div className="col-span-12 md:col-span-4">
                <p className="dcota-mono text-[10.5px] uppercase tracking-[0.22em] text-[#f26a21] font-semibold mb-6">
                  ① Session
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-12 h-12 bg-[#f26a21] text-white text-lg font-extrabold">
                      {firstName.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-lg font-extrabold tracking-tight leading-tight">
                        {user.name}
                      </p>
                      <p className="dcota-mono text-[12px] font-semibold text-slate-500">
                        {role}
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 text-[10px] dcota-mono font-semibold uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-3 py-1.5 border border-emerald-200">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Authenticated
                  </div>
                </div>
              </div>

              {/* KOL 2 : QUICK ACTION */}
              <div className="col-span-12 md:col-span-4">
                <p className="dcota-mono text-[10.5px] uppercase tracking-[0.22em] text-[#f26a21] font-semibold mb-6">
                  ② {isAdmin ? "Quick Action" : "Tips Operasional"}
                </p>

                {isAdmin ? (
                  <Link
                    href="/dashboard/admin/users"
                    className="group block relative bg-[#f26a21] text-white p-7 hover:bg-[#d4551a] transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between mb-10">
                      <UserPlus className="h-6 w-6" strokeWidth={1.5} />
                      <span className="dcota-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                        → ACT
                      </span>
                    </div>
                    <h4 className="text-xl font-extrabold tracking-tight leading-tight mb-2">
                      Registrasi<br />Personel Baru
                    </h4>
                    <p className="text-[12.5px] text-white/80 leading-relaxed mb-6">
                      Tambah akun karyawan ke sistem Dcota Care.
                    </p>
                    <div className="dcota-mono text-[10.5px] uppercase tracking-[0.2em] flex items-center gap-2 group-hover:gap-3 transition-all">
                      Open <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                ) : (
                  <div className="relative border-l-2 border-[#f26a21] border-t border-r border-b border-slate-200 p-7">
                    <ShieldCheck className="h-6 w-6 text-[#f26a21] mb-10" strokeWidth={1.5} />
                    <p className="text-[15px] text-slate-900 font-semibold leading-snug mb-2">
                      {isSalesAgen && "Pastikan koneksi stabil."}
                      {isPIC && "Prioritaskan label urgent."}
                      {(isApprover || isUserFeedback || isViewer) && "Tinjau tren mingguan."}
                    </p>
                    <p className="text-[12.5px] text-slate-600 leading-relaxed">
                      {isSalesAgen && "Gunakan jaringan yang stabil saat mengirim laporan agar data tersinkronisasi sempurna ke server."}
                      {isPIC && "Tangani antrian dengan label urgent terlebih dahulu untuk menjaga kualitas layanan kepada pelanggan."}
                      {(isApprover || isUserFeedback || isViewer) && "Lakukan review tren feedback setiap minggu sebagai bahan evaluasi performa divisi."}
                    </p>
                  </div>
                )}
              </div>

              {/* KOL 3 : SYSTEM */}
              <div className="col-span-12 md:col-span-4">
                <p className="dcota-mono text-[10.5px] uppercase tracking-[0.22em] text-[#f26a21] font-semibold mb-6">
                  ③ System
                </p>
                <div className="space-y-5">
                  <div className="flex items-baseline justify-between hairline-b pb-3">
                    <span className="dcota-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      Engine
                    </span>
                    <span className="dcota-mono text-[12px] font-semibold text-slate-900">
                      Onda Cloud
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between hairline-b pb-3">
                    <span className="dcota-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      Version
                    </span>
                    <span className="dcota-mono text-[12px] font-semibold text-slate-900">
                      v2.4.0
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between hairline-b pb-3">
                    <span className="dcota-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      Backend
                    </span>
                    <span className="dcota-mono text-[12px] font-semibold text-slate-900">
                      BigQuery
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between hairline-b pb-3">
                    <span className="dcota-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      Encryption
                    </span>
                    <span className="dcota-mono text-[12px] font-semibold text-emerald-600">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
                    Data tersinkronisasi otomatis dengan infrastruktur PT. Onda Mega Integra.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ═══════════ FOOTER ═══════════ */}
        <div className="hairline-t w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <div className="mx-auto max-w-7xl px-6 lg:px-12 py-5 flex items-center justify-between dcota-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
            <span>© {now.getFullYear()} · PT Onda Mega Integra</span>
            <span className="hidden md:inline">Dcota Care · Internal Use</span>
          </div>
        </div>

      </div>
    </>
  );
}