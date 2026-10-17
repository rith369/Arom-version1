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
} from 'lucide-react';
import type { ReactNode } from 'react';
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
          {links.map(({ href, label, icon: Icon, badge }) => {
            // Sub pages (for example the MindGuide editor) keep their section highlighted.
            const isActive =
              pathname === href ||
              (href !== '/admin' && pathname.startsWith(`${href}/`));

            return (
              <Link
                key={href}
                href={href}
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
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 lg:absolute lg:bottom-8 lg:flex-col">
          <Link
            href="/pro"
            className="flex items-center gap-2 text-sm text-ink-muted hover:text-arom">
            Professional area
            <ArrowUpRight size={16} />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-ink-muted hover:text-arom">
            {km ? 'មើលគេហទំព័រ' : 'View website'}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </aside>
      <main id="admin-main" className="mx-auto max-w-7xl p-5 sm:p-8 lg:p-10">
        <div className="mb-5 flex items-center justify-end gap-3">
          <LanguageSwitcher />
          <AccountMenu englishOnly />
        </div>
        {children}
      </main>
    </div>
  );
}
