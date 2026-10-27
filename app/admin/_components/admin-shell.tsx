'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UsersRound,
  BadgeCheck,
  ArrowUpRight,
  HeartHandshake,
  BookOpen,
  Calendar,
  MessagesSquare,
  NotebookPen,
  Settings2,
  ClipboardList,
  Flag,
  Star,
  Menu,
  X,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { AccountMenu } from '../../_components/account-menu';
import { useAdmin } from './admin-provider';
import {
  LanguageSwitcher,
  useLanguage,
} from '../../_components/language-provider';
// Pages that read real data from the backend. The demo banner is hidden on these.
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const km = language === 'km';
  const { reports } = useAdmin();
  const openReports = reports.filter((item) => item.status === 'open').length;
  const links: {
    href: string;
    label: string;
    icon: typeof Flag;
    badge?: number;
  }[] = [
    {
      href: '/admin',
      label: km ? 'ទិដ្ឋភាពទូទៅ' : 'Overview',
      icon: LayoutDashboard,
    },
    {
      href: '/admin/professionals',
      label: km ? 'អ្នកជំនាញ' : 'Professionals',
      icon: BadgeCheck,
    },
    {
      href: '/admin/reviews',
      label: 'Reviews',
      icon: Star,
    },
    {
      href: '/admin/mindguide',
      label: km ? 'មគ្គុទ្ទេសក៍ចិត្ត' : 'MindGuide',
      icon: BookOpen,
    },
    {
      href: '/admin/reports',
      label: km ? 'របាយការណ៍បញ្ហា' : 'Reports',
      icon: Flag,
      badge: openReports,
    },
    {
      href: '/admin/bookings',
      label: km ? 'ការកក់' : 'Bookings',
      icon: Calendar,
    },
    {
      href: '/admin/community',
      label: km ? 'សហគមន៍' : 'Community',
      icon: MessagesSquare,
    },
    {
      href: '/admin/journal-prompts',
      label: km ? 'សំណួរកំណត់ហេតុ' : 'Journal prompts',
      icon: NotebookPen,
    },
    {
      href: '/admin/settings',
      label: km ? 'ការកំណត់' : 'Settings',
      icon: Settings2,
    },
    {
      href: '/admin/audit-log',
      label: km ? 'កំណត់ហេតុសកម្មភាព' : 'Audit log',
      icon: ClipboardList,
    },
    {
      href: '/admin/users',
      label: km ? 'អ្នកប្រើប្រាស់' : 'Users',
      icon: UsersRound,
    },
  ];
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock page scroll and allow Escape to close while the mobile menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const brand = (
    <Link
      href="/admin"
      onClick={() => setMenuOpen(false)}
      className="flex min-w-0 items-center gap-2.5 lg:gap-3">
      <Image
        src="/brand/arom-mark.svg"
        width={42}
        height={42}
        alt=""
        className="size-9 shrink-0 lg:size-[42px]"
      />
      <span className="text-xl font-semibold leading-tight tracking-tight lg:text-2xl">
        AROM
        <span className="block whitespace-nowrap text-xs font-normal text-ink-muted">
          {km ? 'កន្លែងគ្រប់គ្រង' : 'Administration'}
        </span>
      </span>
    </Link>
  );

  const menu = (
    <>
      <p className="mt-9 hidden text-xs font-semibold uppercase tracking-widest text-ink-muted lg:block">
        {km ? 'គ្រប់គ្រង' : 'Workspace'}
      </p>
      <nav
        aria-label="Admin navigation"
        className="mt-6 flex flex-col gap-2 lg:mt-4">
        {links.map(({ href, label, icon: Icon, badge }) => {
          // Sub pages (for example the MindGuide editor) keep their section highlighted.
          const isActive =
            pathname === href ||
            (href !== '/admin' && pathname.startsWith(`${href}/`));

          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${isActive ? 'bg-arom text-white shadow-sm' : 'text-ink-muted hover:bg-arom-wash hover:text-arom'}`}>
              <Icon size={19} />
              {label}
              {Boolean(badge) && (
                <span
                  aria-label={km ? `${badge} បើក` : `${badge} open`}
                  className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${isActive ? 'bg-white/20 text-white' : 'bg-arom-danger-soft text-arom-danger'}`}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-10 hidden rounded-2xl bg-arom-wash p-5 lg:[@media(min-height:960px)]:block">
        <HeartHandshake className="text-arom" size={26} />
        <p className="mt-3 text-sm font-medium">
          {km ? 'ថែទាំដោយក្តីមេត្តា' : 'Care starts here'}
        </p>
        <p className="mt-2 text-xs leading-5 text-ink-muted">
          {km
            ? 'បង្កើតកន្លែងសុវត្ថិភាព និងស្វាគមន៍សម្រាប់សហគមន៍របស់យើង។'
            : 'Keep our wellness space thoughtful, helpful, and welcoming.'}
        </p>
      </div>
      <div className="mt-auto flex flex-col gap-y-2 pt-8">
        <Link
          href="/pro"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-2 text-sm text-ink-muted hover:text-arom">
          Professional area
          <ArrowUpRight size={16} />
        </Link>
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-2 text-sm text-ink-muted hover:text-arom">
          {km ? 'មើលគេហទំព័រ' : 'View website'}
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-admin-canvas lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="hidden border-r border-arom-line bg-white p-7 lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:overflow-y-auto">
        {brand}
        {menu}
      </aside>

      {/* Mobile top bar with hamburger */}
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-arom-line bg-white px-4 py-2.5 lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="admin-mobile-menu"
          className="relative -ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-ink hover:bg-arom-wash hover:text-arom">
          <Menu size={24} aria-hidden="true" />
          {/* Open reports are waiting in the menu. */}
          {openReports > 0 && (
            <span
              aria-hidden="true"
              className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-arom-danger ring-2 ring-white"
            />
          )}
        </button>
        {brand}
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <LanguageSwitcher compact />
          <AccountMenu englishOnly compact />
        </div>
      </header>

      {/* Mobile sidebar drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${menuOpen ? '' : 'pointer-events-none'}`}>
        <div
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          id="admin-mobile-menu"
          aria-hidden={!menuOpen}
          inert={!menuOpen}
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto bg-white p-5 shadow-xl transition-transform duration-200 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-start justify-between gap-3">
            {brand}
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-ink-muted hover:bg-arom-wash hover:text-arom">
              <X size={22} aria-hidden="true" />
            </button>
          </div>
          {menu}
        </aside>
      </div>

      <main id="admin-main" className="mx-auto max-w-7xl px-4 py-5 sm:p-8 lg:p-10">
        <div className="mb-5 hidden items-center justify-end gap-3 lg:flex">
          <LanguageSwitcher />
          <AccountMenu englishOnly />
        </div>
        {children}
      </main>
    </div>
  );
}
