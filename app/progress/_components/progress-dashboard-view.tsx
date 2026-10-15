'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BarChart3, ChevronRight } from 'lucide-react';

import { FigmaIcon } from '../../components/figma-icon';
import { useLanguage } from '../../_components/language-provider';
import { useMoodStore } from '../../_components/mood/mood-store';
import { MOOD_COLORS, MOOD_ICONS } from '../../_components/mood/mood-visuals';
import { MOOD_LABELS, PROGRESS_DAYS, PROGRESS_RANGES, type ProgressRange } from '@/lib/mood';
import { MoodTrendChart } from './progress-charts';
import { MascotNote, PillSwitch, ProgressShell, ProgressStatus, RANGE_LABELS, SampleBadge } from './progress-parts';
import { useProgress } from './use-progress';

// Progress Dashboard (Figma "Progress Dashboard", BACKEND-HANDOFF.md section 22).
// Honest by design: it counts check ins and never says better or worse.

export function ProgressDashboardView() {
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [range, setRange] = useState<ProgressRange>('7d');
  const week = useMoodStore();
  const data = useProgress(range);

  return (
    <ProgressShell title={t('ផ្ទាំងតាមដានការវិវត្ត', 'Progress Dashboard')} backHref="/">
      {week.status !== 'ready' ? (
        <ProgressStatus status={week.status} km={km} next="/progress" />
      ) : (
        <>
          {week.checkIns > 0 ? (
            <MascotNote
              title={t('អរគុណដែលបានកត់ត្រា', 'Thank you for checking in')}
              text={t(
                `អ្នកបានកត់ត្រាអារម្មណ៍ ${week.checkIns} ក្នុងចំណោម ${PROGRESS_DAYS} ថ្ងៃចុងក្រោយ។ ជំហានតូចៗក៏សំខាន់ដែរ។ បន្តថែរក្សាខ្លួនឯង។`,
                `You checked in ${week.checkIns} of the last ${PROGRESS_DAYS} days. Small steps still count. Keep taking care of yourself.`,
              )}
            />
          ) : (
            <MascotNote
              title={t('ចាប់ផ្តើមពីថ្ងៃនេះ', 'Start with today')}
              text={t(
                'កត់ត្រាអារម្មណ៍របស់អ្នកថ្ងៃនេះ ហើយថ្ងៃនីមួយៗនឹងបង្ហាញនៅទីនេះ។',
                'Check in with how you feel today, and your days will show here.',
              )}
            />
          )}

          <PillSwitch
            label={t('រយៈពេល', 'Time range')}
            options={PROGRESS_RANGES.map((value) => ({ value, text: km ? RANGE_LABELS[value].km : RANGE_LABELS[value].en }))}
            value={range}
            onChange={setRange}
          />

          <section aria-labelledby="trend-title" className="rounded-3xl border border-arom-border bg-white p-4 shadow-card sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="trend-title" className="text-lg font-semibold text-arom">
                {t('និន្នាការអារម្មណ៍', 'Mood Trend')}
              </h2>
              <Link
                href="/progress/details"
                className="inline-flex min-h-9 items-center gap-0.5 rounded-full border border-arom/40 bg-arom-wash px-3 text-sm font-semibold text-arom hover:border-arom hover:bg-arom-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
              >
                {t('មើលលម្អិត', 'See details')}
                <ChevronRight size={16} aria-hidden="true" />
              </Link>
            </div>
            {data.sample && (
              <div className="mt-2">
                <SampleBadge km={km} />
              </div>
            )}
            {data.checkIns === 0 ? (
              <p className="mt-4 rounded-2xl bg-arom-wash px-4 py-6 text-center text-sm text-ink-muted">
                {t('មិនទាន់មានការកត់ត្រានៅឡើយទេ។', 'No check ins yet.')}
              </p>
            ) : (
              <div className="mt-3">
                <MoodTrendChart key={range} days={data.days} km={km} range={range} />
              </div>
            )}

            <Link
              href="/progress/details"
              className="group mt-4 flex items-center gap-3 rounded-2xl bg-arom px-4 py-3 text-white transition-colors hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                <BarChart3 size={18} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{t('មើលព័ត៌មានលម្អិតអំពីអារម្មណ៍', 'See mood details')}</span>
                <span className="block text-xs text-white/80">
                  {t('ស្ថិតិ និងការបែងចែកអារម្មណ៍របស់អ្នក', 'Statistics and how your moods are spread')}
                </span>
              </span>
              <ChevronRight size={18} aria-hidden="true" className="shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </section>

          <section aria-labelledby="today-title">
            <h2 id="today-title" className="text-base font-semibold text-ink">
              {t('ការកត់ត្រាថ្ងៃនេះ', "Today's Check in")}
            </h2>
            <div className="mt-3 flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-4 shadow-[4px_4px_12px_rgba(0,0,0,0.08)]">
              <span
                className="flex size-14 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: week.today ? `${MOOD_COLORS[week.today]}33` : '#e8f0ee' }}
              >
                <FigmaIcon name={week.today ? MOOD_ICONS[week.today] : 'ic_outline-mood'} size={30} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">
                  {week.today
                    ? km
                      ? MOOD_LABELS[week.today].km
                      : MOOD_LABELS[week.today].en
                    : t('មិនទាន់បានកត់ត្រាថ្ងៃនេះ', 'No check in yet today')}
                </p>
                <p className="text-sm font-light text-ink">
                  {week.today
                    ? t('អារម្មណ៍ដែលអ្នកបានកត់ត្រាសម្រាប់ថ្ងៃនេះ។', 'The mood you chose for today.')
                    : t('តើអ្នកមានអារម្មណ៍យ៉ាងណាថ្ងៃនេះ?', 'How are you feeling today?')}
                </p>
              </div>
              <Link
                href="/#mood-check-in"
                className="shrink-0 rounded-full border border-arom px-3.5 py-1.5 text-xs font-medium text-arom hover:bg-arom-wash"
              >
                {week.today ? t('ប្តូរ', 'Change') : t('កត់ត្រា', 'Check in')}
              </Link>
            </div>
          </section>
        </>
      )}
    </ProgressShell>
  );
}
