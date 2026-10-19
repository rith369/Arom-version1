'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import {
  ArrowUpRight,
  CalendarCheck,
  CalendarClock,
  Headphones,
  HeartHandshake,
  Home,
  Menu,
  UserRound,
  UsersRound,
  MessageCircle,
  Star,
  X,
  type LucideIcon,
} from 'lucide-react';

import { AccountMenu } from '../../_components/account-menu';
import { LanguageSwitcher, useLanguage } from '../../_components/language-provider';

type NavLink = {
  href: string;
  en: string;
  km: string;
  icon: LucideIcon;
  soon?: boolean;
};

const LINKS: NavLink[] = [
  { href: '/pro', en: 'Home', km: 'ទំព័រដើម', icon: Home },
  { href: '/pro/profile', en: 'My profile', km: 'ប្រវត្តិរូបរបស់ខ្ញុំ', icon: UserRound },
  { href: '/pro/schedule', en: 'My schedule', km: 'កាលវិភាគរបស់ខ្ញុំ', icon: CalendarClock },
  { href: '/pro/bookings', en: 'My bookings', km: 'ការកក់របស់ខ្ញុំ', icon: CalendarCheck },
  { href: '/pro/clients', en: 'My clients', km: 'អតិថិជនរបស់ខ្ញុំ', icon: UsersRound },
  { href: '/pro/messages', en: 'Messages', km: 'សារ', icon: MessageCircle },
  { href: '/pro/groups', en: 'Support groups', km: 'ក្រុមគាំទ្រ', icon: HeartHandshake },
  { href: '/pro/podcasts', en: 'My podcasts', km: 'ផតខាសរបស់ខ្ញុំ', icon: Headphones },
  { href: '/pro/reviews', en: 'Reviews', km: 'ការវាយតម្លៃ', icon: Star },
];

export function ProShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
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
    <Link href="/pro" onClick={() => setMenuOpen(false)} className="flex min-w-0 items-center gap-2.5">
      <Image src="/brand/arom-mark.svg" width={40} height={32} alt="" unoptimized className="shrink-0" />
      <span className="text-xl font-bold leading-tight tracking-tight text-arom">
        AROM
        <span className="block whitespace-nowrap text-xs font-medium text-ink-muted">
          {t('ផ្នែកអ្នកជំនាញ', 'Professional area')}
        </span>
      </span>
    </Link>
  );

  const menu = (
    <>
      <nav aria-label={t('ម៉ឺនុយអ្នកជំនាញ', 'Professional menu')} className="mt-6 flex flex-col gap-2 lg:mt-8">
        {LINKS.map(({ href, en, km: kmLabel, icon: Icon, soon }) => {
          const isActive = pathname === href || (href !== '/pro' && pathname.startsWith(`${href}/`));
          const label = km ? kmLabel : en;

          if (soon) {
            return (
              <span
                key={href}
                aria-disabled="true"
                className="flex cursor-default items-center gap-3 rounded-2xl px-4 py-3 text-sm text-ink-muted/70">
                <Icon size={19} aria-hidden="true" />
                {label}
                <span className="ml-auto rounded-full bg-arom-wash px-2 py-0.5 text-[0.65rem] font-semibold text-arom">
                  {t('ឆាប់ៗ', 'Soon')}
                </span>
              </span>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${
                isActive ? 'bg-arom text-white shadow-sm' : 'text-ink hover:bg-arom-wash hover:text-arom'
              }`}>
              <Icon size={19} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/"
        onClick={() => setMenuOpen(false)}
        className="mt-auto flex items-center gap-2 pt-6 text-sm text-ink-muted hover:text-arom">
        {t('មើល AROM ដូចអ្នកប្រើ', 'View AROM as a user')}
        <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </>
  );

  return (
    <div className={`min-h-screen bg-canvas lg:pl-64 ${km ? 'font-khmer' : ''}`}>
      {/* Desktop sidebar */}
      <aside className="hidden border-r border-arom-border bg-white p-6 lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:overflow-y-auto">
        {brand}
        {menu}
      </aside>

      {/* Mobile top bar with hamburger */}
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-arom-border bg-white px-4 py-2.5 lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label={t('បើកម៉ឺនុយ', 'Open menu')}
          aria-expanded={menuOpen}
          aria-controls="pro-mobile-menu"
          className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-ink hover:bg-arom-wash hover:text-arom">
          <Menu size={24} aria-hidden="true" />
        </button>
        {brand}
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <LanguageSwitcher compact />
          <AccountMenu compact />
        </div>
      </header>

      {/* Mobile sidebar drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${menuOpen ? '' : 'pointer-events-none'}`}>
        <div
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          id="pro-mobile-menu"
          aria-hidden={!menuOpen}
          inert={!menuOpen}
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto bg-white p-5 shadow-xl transition-transform duration-200 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-start justify-between gap-3">
            {brand}
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={t('បិទម៉ឺនុយ', 'Close menu')}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-ink-muted hover:bg-arom-wash hover:text-arom">
              <X size={22} aria-hidden="true" />
            </button>
          </div>
          {menu}
        </aside>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-5 sm:px-8 lg:px-10 lg:py-8">
        <div className="hidden items-center justify-end gap-3 lg:flex">
          <div className="flex shrink-0 items-center gap-3">
            <LanguageSwitcher />
            <AccountMenu />
          </div>
        </div>

        <div className="lg:mt-6">{children}</div>
      </main>
    </div>
  );
}
