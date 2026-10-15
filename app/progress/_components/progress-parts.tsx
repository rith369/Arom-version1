'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronLeft, LogIn, RotateCcw } from 'lucide-react';

import { DesktopNavigation, MobileNavigation } from '../../_components/app-navigation';
import { TopHeader } from '../../components/top-header';
import { loadMoodWeek } from '../../_components/mood/mood-store';
import type { MoodStatus } from '../../_components/mood/mood-store';
import type { ProgressRange } from '@/lib/mood';

export const RANGE_LABELS: Record<ProgressRange, { en: string; km: string }> = {
  '7d': { en: '7 days', km: '៧ ថ្ងៃ' },
  '30d': { en: '30 days', km: '៣០ ថ្ងៃ' },
  '90d': { en: '3 months', km: '៣ ខែ' },
};

/** "Mon" for the 7 day view, "Oct 5" for longer ranges (Cambodia dates). */
export function dayLabel(day: string, km: boolean, short: boolean) {
  return new Intl.DateTimeFormat(km ? 'km-KH' : 'en-US', {
    timeZone: 'UTC',
    ...(short ? { weekday: 'short' } : { month: 'short', day: 'numeric' }),
  }).format(new Date(`${day}T00:00:00Z`));
}

/** Page frame with the same header as other pages (My appointments, Messages). */
export function ProgressShell({
  title,
  subtitle,
  back,
  children,
}: {
  title: string;
  subtitle: string;
  // Sub pages show a small link back to their parent page above the title.
  back?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="Progress" />
      <main className="min-w-0 px-4 pb-28 pt-5 sm:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto w-full max-w-2xl">
          {/* AROM brand, menu and profile, the same as Home and Community. */}
          <TopHeader />
          <header className="mt-6 lg:mt-2">
            {back && (
              <Link
                href={back.href}
                className="-ml-1 mb-2 inline-flex min-h-9 items-center gap-0.5 rounded-full pr-2 text-sm font-semibold text-arom hover:underline focus-visible:outline-2 focus-visible:outline-arom"
              >
                <ChevronLeft size={18} aria-hidden="true" />
                {back.label}
              </Link>
            )}
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
            <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
          </header>
          <div className="mt-6 space-y-6">{children}</div>
        </div>
      </main>
      <MobileNavigation active="Progress" />
    </div>
  );
}

/** The pill switch from the design: the chosen option is solid green. */
export function PillSwitch<Value extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: Value; text: string }[];
  value: Value;
  onChange: (value: Value) => void;
}) {
  return (
    <div role="group" aria-label={label} className="grid auto-cols-fr grid-flow-col rounded-full bg-arom/25 p-0.5">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`min-h-9 rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom ${
              active ? 'bg-arom text-white shadow-sm' : 'text-arom hover:bg-white/40'
            }`}
          >
            {option.text}
          </button>
        );
      })}
    </div>
  );
}

/** Soft green card with the AROM sprout, for honest encouragement. */
export function MascotNote({ title, text, compact = false }: { title?: string; text: string; compact?: boolean }) {
  return (
    <section className="relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-arom-accent/12 to-arom-deep/12 py-3 pl-5 pr-2">
      <div className="min-w-0 flex-1 py-1">
        {title && <h2 className="text-lg font-semibold text-arom">{title}</h2>}
        <p className={`${title ? 'mt-1 text-[#444]' : 'font-medium text-arom'} text-sm leading-6`}>{text}</p>
      </div>
      <Image
        src="/progress/mascot.png"
        alt=""
        width={480}
        height={395}
        className={`${compact ? 'w-20' : 'w-28 sm:w-32'} h-auto shrink-0`}
      />
    </section>
  );
}

/** "Oct 9 to Oct 15": the days a range covers, under the range switch. */
export function RangeDates({ first, last, km }: { first?: string; last?: string; km: boolean }) {
  if (!first || !last) return null;
  return (
    <p className="-mt-1 px-1 text-xs text-ink-muted">
      {dayLabel(first, km, false)} {km ? 'ដល់' : 'to'} {dayLabel(last, km, false)}
    </p>
  );
}

export function SampleBadge({ km }: { km: boolean }) {
  return (
    <p className="inline-flex rounded-full bg-arom-warning-soft px-2.5 py-0.5 text-xs font-semibold text-arom-warning">
      {km ? 'ទិន្នន័យគំរូ (មិនទាន់ពិត)' : 'Sample data, not yours yet'}
    </p>
  );
}

/** Loading, signed out and error states, shared by both pages. */
export function ProgressStatus({ status, km, next }: { status: MoodStatus; km: boolean; next: string }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  if (status === 'loading') {
    return (
      <div aria-busy="true" aria-label={t('កំពុងផ្ទុក', 'Loading')} className="space-y-3">
        <div className="h-24 animate-pulse rounded-2xl bg-arom-soft/70" />
        <div className="h-48 animate-pulse rounded-2xl bg-arom-wash" />
      </div>
    );
  }

  if (status === 'signed_out') {
    return (
      <section className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
        <h2 className="text-lg font-bold text-ink">{t('តាមដានការវិវត្តរបស់អ្នក', 'Keep track of how you feel')}</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {t(
            'ចូលគណនី ដើម្បីកត់ត្រាអារម្មណ៍ប្រចាំថ្ងៃ និងមើលការវិវត្តរបស់អ្នកនៅទីនេះ។ មានតែអ្នកទេដែលអាចមើលឃើញ។',
            'Log in to check in each day and see your progress here. Only you can see it.',
          )}
        </p>
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep"
        >
          <LogIn size={16} aria-hidden="true" />
          {t('ចូលគណនី', 'Log in')}
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-arom-border bg-white p-5 shadow-card">
      <p role="alert" className="text-sm text-ink-muted">
        {t('មិនអាចផ្ទុកការវិវត្តរបស់អ្នកបានទេ។', 'Your progress could not be loaded.')}
      </p>
      <button
        type="button"
        onClick={() => void loadMoodWeek()}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-arom hover:underline"
      >
        <RotateCcw size={14} aria-hidden="true" />
        {t('ព្យាយាមម្ដងទៀត', 'Try again')}
      </button>
    </section>
  );
}
