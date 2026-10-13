'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  ArrowUpRight,
  CalendarCheck,
  CalendarClock,
  Headphones,
  Home,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';

import { usePro, type DemoMode } from './pro-provider';
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
  { href: '/pro/podcasts', en: 'My podcasts', km: 'ផតខាសរបស់ខ្ញុំ', icon: Headphones, soon: true },
];

export function ProShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const { demoMode, switchDemo } = usePro();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const demoOptions: { value: DemoMode; label: string }[] = [
    { value: 'established', label: t('អ្នកជំនាញដែលមានស្រាប់', 'Established professional') },
    { value: 'new', label: t('ទើបអនុម័តថ្មី', 'Newly approved') },
  ];

  return (
    <div className={`min-h-screen bg-canvas lg:pl-64 ${km ? 'font-khmer' : ''}`}>
      <aside className="border-b border-arom-border bg-white p-4 lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-b-0 lg:border-r lg:p-6">
        <Link href="/pro" className="flex items-center gap-3">
          <Image src="/brand/arom-mark.svg" width={40} height={32} alt="" unoptimized />
          <span className="text-xl font-bold tracking-tight text-arom">
            AROM
            <span className="block text-xs font-medium text-ink-muted">
              {t('ផ្នែកអ្នកជំនាញ', 'Professional area')}
            </span>
          </span>
        </Link>

        <nav aria-label={t('ម៉ឺនុយអ្នកជំនាញ', 'Professional menu')} className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:flex-col lg:overflow-visible">
          {LINKS.map(({ href, en, km: kmLabel, icon: Icon, soon }) => {
            const isActive = pathname === href || (href !== '/pro' && pathname.startsWith(`${href}/`));
            const label = km ? kmLabel : en;

            if (soon) {
              return (
                <span
                  key={href}
                  aria-disabled="true"
                  className="flex shrink-0 cursor-default items-center gap-3 rounded-2xl px-4 py-3 text-sm text-ink-muted/70">
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
                aria-current={isActive ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${
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
          className="mt-4 hidden items-center gap-2 text-sm text-ink-muted hover:text-arom lg:absolute lg:bottom-6 lg:flex">
          {t('មើល AROM ដូចអ្នកប្រើ', 'View AROM as a user')}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </aside>

      <main className="mx-auto max-w-5xl px-4 py-5 sm:px-8 lg:px-10 lg:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-arom-warning/25 bg-arom-warning-soft px-3 py-2 text-xs text-arom-warning">
            <span>{t('ទិន្នន័យសាកល្បង។ មើលជា:', 'Demo data. View as:')}</span>
            {demoOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={demoMode === option.value}
                onClick={() => switchDemo(option.value)}
                className={`rounded-full border px-2.5 py-0.5 font-semibold ${
                  demoMode === option.value
                    ? 'border-arom-warning bg-arom-warning text-white'
                    : 'border-arom-warning/40 bg-white/60'
                }`}>
                {option.label}
              </button>
            ))}
          </div>
          <LanguageSwitcher />
        </div>

        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
