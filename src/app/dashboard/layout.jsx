'use client';

import { useState, Fragment, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Dialog, Transition, Menu } from '@headlessui/react';
import Image from 'next/image';

import {
  HomeIcon,
  ArrowLeftOnRectangleIcon,
  DocumentPlusIcon,
  TicketIcon,
  ClipboardDocumentListIcon,
  InboxStackIcon,
  UsersIcon,
  Bars3Icon,
  XMarkIcon,
  ClockIcon,
  ChartBarIcon,
  ChevronDownIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dcota-sans">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
          .dcota-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
          .dcota-mono { font-family: 'JetBrains Mono', monospace; }
        `}</style>
        <div className="flex flex-col items-center gap-5">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f26a21] border-t-transparent" />
          <p className="dcota-mono text-[10.5px] font-medium uppercase tracking-[0.22em] text-slate-400">
            Loading Workspace
          </p>
        </div>
      </div>
    );
  }

  const userRole = session?.user?.role;

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: HomeIcon, roles: ['Administrator', 'Salesman', 'Agen', 'PIC OMI', 'Sales Manager', 'Acting Manager', 'Acting PIC', 'User Feedback', 'Viewer', 'PIC OMI (SS)'] },
    { href: '/dashboard/submit', label: 'Submit', icon: DocumentPlusIcon, roles: ['Salesman', 'Agen'] },
    { href: '/dashboard/my-tickets', label: 'Riwayat', icon: TicketIcon, roles: ['Salesman', 'Agen'] },
    { href: '/dashboard/queue', label: userRole === 'PIC OMI' ? 'Triase' : 'Antrian', icon: ClipboardDocumentListIcon, roles: ['PIC OMI', 'PIC OMI (SS)', 'Sales Manager', 'Acting Manager', 'Acting PIC'] },
    { href: '/dashboard/history', label: 'History', icon: ClockIcon, roles: ['PIC OMI', 'PIC OMI (SS)', 'Sales Manager', 'Acting Manager', 'Acting PIC', 'Viewer'] },
    { href: '/dashboard/admin/users', label: 'Users', icon: UsersIcon, roles: ['Administrator'] },
    { href: '/dashboard/admin/analytics', label: 'Analytics', icon: ChartBarIcon, roles: ['Administrator', 'Viewer'] },
  ];

  const FEEDBACK_ALLOWED = ['Sales Manager', 'User Feedback', 'Viewer'];
  const FEEDBACK_ROUTES = ['/dashboard/feedback', '/dashboard/bookmarks', '/dashboard/archive'];
  const filteredMenu = menuItems.filter((i) => i.roles.includes(userRole));
  const isFeedbackActive = FEEDBACK_ROUTES.includes(pathname);

  const handleLogout = () => signOut({ callbackUrl: '/login' });

  const initial = session?.user?.name?.charAt(0)?.toUpperCase() || '—';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .dcota-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        .dcota-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="dcota-sans min-h-screen bg-white">

        {/* ═══════════════════════════════════════════════════════════
            NAVBAR — Swiss flat, hairline border, aksen oranye dominan
        ═══════════════════════════════════════════════════════════ */}
        <header
          className={cn(
            "sticky top-0 z-40 w-full bg-white transition-shadow duration-300",
            "border-b border-slate-200",
            isScrolled && "shadow-[0_1px_0_0_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]"
          )}
        >
          {/* garis oranye tipis paling atas — pengikat identitas */}
          <div className="h-[3px] w-full bg-[#f26a21]" />

          <div className="mx-auto max-w-[1440px] flex h-16 items-center px-6 lg:px-12">

            {/* — LEFT: Logo + Brand — */}
            <div className="flex items-center gap-8">
              <button
                className="flex h-10 w-10 items-center justify-center text-slate-900 hover:bg-[#f26a21] hover:text-white transition-colors md:hidden -ml-1"
                onClick={() => setSidebarOpen(true)}
                aria-label="Buka menu"
              >
                <Bars3Icon className="h-5 w-5" strokeWidth={2} />
              </button>

              <Link href="/dashboard" className="flex items-center gap-3 group">
                {/* logo box oranye — warna brand dominan */}
                <div className="flex h-9 w-9 items-center justify-center bg-[#f26a21] transition-colors duration-300">
                  <Image
                    src="/dcota-logo.png"
                    alt="Dcota"
                    width={20}
                    height={20}
                    className="invert brightness-0"
                    priority
                  />
                </div>
                <div className="hidden sm:flex flex-col leading-none">
                  <span className="text-[13px] font-extrabold tracking-tight text-slate-900">
                    Dcota Care
                  </span>
                  <span className="dcota-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400 mt-1">
                    Onda Grup
                  </span>
                </div>
              </Link>
            </div>

            {/* — CENTER: Nav items (desktop) — */}
            <nav className="hidden md:flex items-center gap-1 ml-12 flex-1">
              {filteredMenu.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-2 px-3.5 h-16 text-[13px] font-semibold tracking-tight transition-colors",
                      active
                        ? "text-[#f26a21]"
                        : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    <item.icon className="h-4 w-4" strokeWidth={2} />
                    {item.label}
                    {/* underline oranye: solid saat aktif, muncul saat hover */}
                    <span
                      className={cn(
                        "absolute left-3 right-3 -bottom-px h-[2.5px] bg-[#f26a21] origin-left transition-transform duration-300",
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      )}
                    />
                  </Link>
                );
              })}

              {/* Feedback dropdown */}
              {FEEDBACK_ALLOWED.includes(userRole) && (
                <Menu as="div" className="relative">
                  <Menu.Button
                    className={cn(
                      "relative flex items-center gap-2 px-3.5 h-16 text-[13px] font-semibold tracking-tight transition-colors outline-none",
                      isFeedbackActive
                        ? "text-[#f26a21]"
                        : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    <InboxStackIcon className="h-4 w-4" strokeWidth={2} />
                    Feedback
                    <ChevronDownIcon className="h-3.5 w-3.5 ui-open:rotate-180 transition-transform" strokeWidth={2} />
                    <span
                      className={cn(
                        "absolute left-3 right-3 -bottom-px h-[2.5px] bg-[#f26a21] origin-left transition-transform duration-300",
                        isFeedbackActive ? "scale-x-100" : "scale-x-0"
                      )}
                    />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-150"
                    enterFrom="opacity-0 -translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Menu.Items className="absolute left-0 top-full mt-0 w-[280px] bg-white border border-slate-200 shadow-[0_8px_32px_-12px_rgba(15,23,42,0.12)] focus:outline-none divide-y divide-slate-100">
                      <DropdownItem href="/dashboard/feedback" code="01" title="Antrian Feedback" desc="Kelola feedback pelanggan" />
                      <DropdownItem href="/dashboard/bookmarks" code="02" title="Bookmark" desc="Akses cepat laporan penting" />
                      <DropdownItem href="/dashboard/archive" code="03" title="Arsip" desc="Data yang telah selesai" />
                    </Menu.Items>
                  </Transition>
                </Menu>
              )}
            </nav>

            {/* — RIGHT: User — */}
            <div className="flex items-center gap-4 ml-auto md:ml-0">
              <div className="hidden lg:flex items-center gap-2 dcota-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Online
              </div>

              <div className="hidden md:block h-6 w-px bg-slate-200" />

              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-3 group outline-none">
                  {/* Avatar Swiss: kotak oranye dengan initial mono */}
                  <div className="flex h-9 w-9 items-center justify-center bg-[#f26a21] group-hover:bg-[#d4551a] transition-colors duration-300 dcota-mono text-[13px] font-bold text-white">
                    {initial}
                  </div>
                  <div className="hidden sm:flex flex-col items-start leading-none">
                    <span className="text-[12.5px] font-bold tracking-tight text-slate-900 max-w-[140px] truncate">
                      {session?.user?.name}
                    </span>
                    <span className="dcota-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400 mt-1">
                      {session?.user?.role}
                    </span>
                  </div>
                  <ChevronDownIcon className="hidden sm:block h-3.5 w-3.5 text-slate-400 ui-open:rotate-180 transition-transform" strokeWidth={2} />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-150"
                  enterFrom="opacity-0 -translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Menu.Items className="absolute right-0 mt-3 w-[260px] bg-white border border-slate-200 shadow-[0_8px_32px_-12px_rgba(15,23,42,0.16)] focus:outline-none">
                    <div className="px-5 py-4 border-b border-slate-100 border-l-2 border-l-[#f26a21]">
                      <p className="dcota-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-[#f26a21] mb-1.5">
                        Signed in as
                      </p>
                      <p className="text-[14px] font-extrabold tracking-tight text-slate-900 leading-tight">
                        {session?.user?.name}
                      </p>
                      <p className="dcota-mono text-[11px] font-semibold text-slate-500 mt-1">
                        {session?.user?.role}
                      </p>
                    </div>

                    <div className="divide-y divide-slate-100">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/dashboard/change-password"
                            className={cn(
                              "flex items-center justify-between gap-3 px-5 py-3.5 text-[13px] font-semibold transition-colors",
                              active ? "bg-slate-50 text-slate-900" : "text-slate-700"
                            )}
                          >
                            <span className="flex items-center gap-3">
                              <KeyIcon className="h-4 w-4" strokeWidth={2} />
                              Ganti Password
                            </span>
                            <span className="dcota-mono text-[10px] text-slate-300">→</span>
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={cn(
                              "flex w-full items-center justify-between gap-3 px-5 py-3.5 text-[13px] font-semibold transition-colors",
                              active ? "bg-[#f26a21] text-white" : "text-[#f26a21]"
                            )}
                          >
                            <span className="flex items-center gap-3">
                              <ArrowLeftOnRectangleIcon className="h-4 w-4" strokeWidth={2} />
                              Logout
                            </span>
                            <span className="dcota-mono text-[10px] opacity-60">→</span>
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════
            MOBILE SIDEBAR — putih flat, match navbar
        ═══════════════════════════════════════════════════════════ */}
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 md:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-out duration-200"
              enterFrom="opacity-0" enterTo="opacity-100"
              leave="transition-opacity ease-in duration-150"
              leaveFrom="opacity-100" leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-out duration-300 transform"
                enterFrom="-translate-x-full" enterTo="translate-x-0"
                leave="transition ease-in duration-250 transform"
                leaveFrom="translate-x-0" leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="dcota-sans relative flex w-full max-w-[320px] flex-col bg-white">
                  {/* garis oranye pengikat identitas */}
                  <div className="h-[3px] w-full bg-[#f26a21]" />

                  {/* Sidebar header */}
                  <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200">
                    <Link href="/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center bg-[#f26a21]">
                        <Image src="/dcota-logo.png" alt="Logo" width={20} height={20} className="invert brightness-0" />
                      </div>
                      <div className="flex flex-col leading-none">
                        <span className="text-[13px] font-extrabold tracking-tight text-slate-900">
                          Dcota Care
                        </span>
                        <span className="dcota-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400 mt-1">
                          Onda Grup
                        </span>
                      </div>
                    </Link>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="flex h-10 w-10 items-center justify-center text-slate-900 hover:bg-[#f26a21] hover:text-white transition-colors -mr-1"
                      aria-label="Tutup menu"
                    >
                      <XMarkIcon className="h-5 w-5" strokeWidth={2} />
                    </button>
                  </div>

                  {/* User info strip */}
                  <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center bg-[#f26a21] dcota-mono text-[14px] font-bold text-white">
                      {initial}
                    </div>
                    <div className="flex flex-col leading-tight min-w-0">
                      <span className="text-[13px] font-extrabold tracking-tight text-slate-900 truncate">
                        {session?.user?.name}
                      </span>
                      <span className="dcota-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 mt-1">
                        {session?.user?.role}
                      </span>
                    </div>
                  </div>

                  {/* Nav items */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="px-6 pt-5 pb-2">
                      <p className="dcota-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-[#f26a21]">
                        Menu
                      </p>
                    </div>
                    <NavMobile
                      menu={filteredMenu}
                      userRole={userRole}
                      onNavigate={() => setSidebarOpen(false)}
                      feedbackAllowed={FEEDBACK_ALLOWED}
                      feedbackRoutes={FEEDBACK_ROUTES}
                    />
                  </div>

                  {/* Footer actions */}
                  <div className="border-t border-slate-200 divide-y divide-slate-100">
                    <Link
                      href="/dashboard/change-password"
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-6 py-4 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <KeyIcon className="h-4 w-4" strokeWidth={2} />
                      Ganti Password
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-6 py-4 text-[13px] font-semibold text-[#f26a21] hover:bg-[#f26a21] hover:text-white transition-colors w-full"
                    >
                      <ArrowLeftOnRectangleIcon className="h-4 w-4" strokeWidth={2} />
                      Logout
                    </button>
                  </div>

                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* ═══════════════════════════════════════════════════════════
            MAIN CONTENT
        ═══════════════════════════════════════════════════════════ */}
        <main className="w-full">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   DROPDOWN ITEM (Desktop feedback dropdown)
───────────────────────────────────────────── */
function DropdownItem({ href, code, title, desc }) {
  return (
    <Menu.Item>
      {({ active }) => (
        <Link
          href={href}
          className={cn(
            "group flex items-start gap-4 px-5 py-4 transition-colors border-l-2",
            active ? "bg-slate-50 border-[#f26a21]" : "bg-white border-transparent"
          )}
        >
          <span className="dcota-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mt-1 group-hover:text-[#f26a21] transition-colors">
            {code}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-extrabold tracking-tight text-slate-900 leading-tight">
              {title}
            </p>
            <p className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">
              {desc}
            </p>
          </div>
        </Link>
      )}
    </Menu.Item>
  );
}

/* ─────────────────────────────────────────────
   MOBILE NAV
───────────────────────────────────────────── */
function NavMobile({ menu, onNavigate, feedbackAllowed, userRole, feedbackRoutes }) {
  const pathname = usePathname();
  const [feedbackOpen, setFeedbackOpen] = useState(feedbackRoutes.includes(pathname));

  return (
    <nav className="flex flex-col">
      {menu.map((item, idx) => {
        const active = pathname === item.href;
        const code = String(idx + 1).padStart(2, '0');
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-4 px-6 py-4 transition-colors border-l-2",
              active
                ? "border-[#f26a21] bg-[#f26a21]/[0.06]"
                : "border-transparent hover:bg-slate-50"
            )}
          >
            <span className={cn(
              "dcota-mono text-[10px] font-semibold uppercase tracking-[0.18em]",
              active ? "text-[#f26a21]" : "text-slate-400"
            )}>
              {code}
            </span>
            <item.icon className={cn(
              "h-4 w-4",
              active ? "text-[#f26a21]" : "text-slate-500"
            )} strokeWidth={2} />
            <span className={cn(
              "text-[13px] font-semibold tracking-tight",
              active ? "text-[#f26a21]" : "text-slate-700"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}

      {feedbackAllowed.includes(userRole) && (
        <>
          <button
            onClick={() => setFeedbackOpen(!feedbackOpen)}
            className={cn(
              "relative flex items-center gap-4 px-6 py-4 transition-colors border-l-2 w-full text-left",
              feedbackRoutes.includes(pathname)
                ? "border-[#f26a21] bg-[#f26a21]/[0.06]"
                : "border-transparent hover:bg-slate-50"
            )}
          >
            <span className={cn(
              "dcota-mono text-[10px] font-semibold uppercase tracking-[0.18em]",
              feedbackRoutes.includes(pathname) ? "text-[#f26a21]" : "text-slate-400"
            )}>
              {String(menu.length + 1).padStart(2, '0')}
            </span>
            <InboxStackIcon className={cn(
              "h-4 w-4",
              feedbackRoutes.includes(pathname) ? "text-[#f26a21]" : "text-slate-500"
            )} strokeWidth={2} />
            <span className={cn(
              "text-[13px] font-semibold tracking-tight flex-1",
              feedbackRoutes.includes(pathname) ? "text-[#f26a21]" : "text-slate-700"
            )}>
              Feedback
            </span>
            <ChevronDownIcon
              className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", feedbackOpen && "rotate-180")}
              strokeWidth={2}
            />
          </button>

          {feedbackOpen && (
            <div className="bg-slate-50/50 border-l-2 border-slate-100">
              {[
                { href: '/dashboard/feedback', label: 'Antrian Feedback' },
                { href: '/dashboard/bookmarks', label: 'Bookmark' },
                { href: '/dashboard/archive', label: 'Arsip' },
              ].map((sub) => (
                <Link
                  key={sub.href}
                  href={sub.href}
                  onClick={onNavigate}
                  className={cn(
                    "block pl-[68px] pr-6 py-3 text-[12.5px] font-semibold transition-colors",
                    pathname === sub.href
                      ? "text-[#f26a21]"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </nav>
  );
}