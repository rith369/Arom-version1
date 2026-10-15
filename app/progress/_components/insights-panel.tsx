'use client';

import { Activity, CalendarCheck, Compass, HeartPulse, ShieldCheck, type LucideIcon } from 'lucide-react';

import { PROGRESS_RANGES, type ProgressRange } from '@/lib/mood';
import { moodInsights, type InsightKind } from './insights';
import { PillSwitch, ProgressStatus, RANGE_LABELS, SampleBadge } from './progress-parts';
import type { ProgressData } from './use-progress';

const ICONS: Record<InsightKind, LucideIcon> = {
  checkins: CalendarCheck,
  common: Compass,
  range: Activity,
  weekday: CalendarCheck,
  hard: HeartPulse,
};

export function InsightsPanel({
  data,
  range,
  onRange,
  km,
}: {
  data: ProgressData;
  range: ProgressRange;
  onRange: (range: ProgressRange) => void;
  km: boolean;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  if (data.status !== 'ready') return <ProgressStatus status={data.status} km={km} next="/progress/details" />;

  const insights = moodInsights(data.days);

  return (
    <section aria-labelledby="insights-title" className="space-y-3">
      <h2 id="insights-title" className="text-lg font-semibold text-ink">
        {t('អ្វីដែលការកត់ត្រារបស់អ្នកបង្ហាញ', 'What your check ins show')}
      </h2>
      <PillSwitch
        label={t('រយៈពេល', 'Time range')}
        options={PROGRESS_RANGES.map((value) => ({ value, text: km ? RANGE_LABELS[value].km : RANGE_LABELS[value].en }))}
        value={range}
        onChange={onRange}
      />
      {data.sample && <SampleBadge km={km} />}

      {insights.length === 0 ? (
        <p className="rounded-3xl border border-arom-border bg-white px-5 py-8 text-center text-sm text-ink-muted shadow-card">
          {t(
            'កត់ត្រាអារម្មណ៍ពីរបីថ្ងៃ ហើយការយល់ដឹងនឹងបង្ហាញនៅទីនេះ។',
            'Check in on a few days, and simple facts about them will show here.',
          )}
        </p>
      ) : (
        <ul className="space-y-3">
          {insights.map((insight) => {
            const Icon = ICONS[insight.kind];
            return (
              <li
                key={insight.kind}
                className="flex items-start gap-3 rounded-2xl border border-arom-border bg-white p-4 text-sm leading-6 text-ink shadow-card"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-arom-soft text-arom">
                  <Icon size={17} aria-hidden="true" />
                </span>
                <span className="pt-1.5">{km ? insight.km : insight.en}</span>
              </li>
            );
          })}
        </ul>
      )}

      <p className="flex items-start gap-2 px-1 text-xs leading-5 text-ink-muted">
        <ShieldCheck size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-arom" />
        {t(
          'ទាំងនេះគ្រាន់តែជាការពិតពីការកត់ត្រារបស់អ្នក។ AROM មិនដាក់ពិន្ទុ ឬវិនិច្ឆ័យអារម្មណ៍របស់អ្នកឡើយ។',
          'These are only facts from your check ins. AROM never scores or judges your mood.',
        )}
      </p>
    </section>
  );
}
