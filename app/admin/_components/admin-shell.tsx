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
} from 'lucide-react';
import type { ReactNode } from 'react';
import {
  LanguageSwitcher,
  useLanguage,
} from '../../_components/language-provider';
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const km = language === 'km';
  const links = [
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
      href: '/admin/users',
      label: km ? 'អ្នកប្រើប្រាស់' : 'Users',
      icon: UsersRound,
    },
  ];
  return (
    <div className="min-h-screen bg-admin-canvas lg:pl-64">
      <aside className="border-b border-arom-line bg-white p-5 lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-r lg:border-b-0 lg:p-7">
        <Link href="/admin" className="flex items-center gap-3">
          <Image src="/brand/arom-mark.svg" width={42} height={42} alt="" />
          <span className="text-2xl font-semibold tracking-tight">
            AROM
            <span className="block text-xs font-normal text-ink-muted">
              {km ? 'កន្លែងគ្រប់គ្រង' : 'Administration'}
            </span>
          </span>
        </Link>
        <p className="mt-9 hidden text-xs font-semibold uppercase tracking-widest text-ink-muted lg:block">
          {km ? 'គ្រប់គ្រង' : 'Workspace'}
        </p>
        <nav
          aria-label="Admin navigation"
          className="mt-4 flex gap-2 lg:flex-col">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${pathname === href ? 'bg-arom text-white shadow-sm' : 'text-ink-muted hover:bg-arom-wash hover:text-arom'}`}>
              <Icon size={19} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-10 hidden rounded-2xl bg-arom-wash p-5 lg:block">
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
        <Link
          href="/"
          className="mt-6 flex items-center gap-2 text-sm text-ink-muted lg:absolute lg:bottom-8">
          {km ? 'មើលគេហទំព័រ' : 'View website'}
          <ArrowUpRight size={16} />
        </Link>
      </aside>
      <main id="admin-main" className="mx-auto max-w-7xl p-5 sm:p-8 lg:p-10">
        <div className="mb-5 flex justify-end">
          <LanguageSwitcher />
        </div>
        {pathname !== '/admin' && (
          <div className="mb-7 rounded-xl border border-arom-warning/25 bg-arom-warning-soft px-4 py-3 text-xs text-arom-warning">
            {km
              ? 'ទិន្នន័យសាកល្បង។ ការផ្លាស់ប្តូរនឹងត្រូវកំណត់ឡើងវិញនៅពេលផ្ទុកទំព័រឡើងវិញ។'
              : 'Demo data on this page. Changes reset when you refresh.'}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
