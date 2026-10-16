'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BookOpen, ChevronRight, HeartPulse, NotebookPen, type LucideIcon } from 'lucide-react';

import { ALL_LESSONS } from '../../_components/learn/learn-data';
import { ALL_PRACTICES } from '../../_components/practice/practice-data';
import type { ActivitiesResponse, ActivityKind } from '@/lib/activities';
import { PROGRESS_RANGES, RANGE_DAYS, cambodiaDay, lastDays, type ProgressRange } from '@/lib/mood';
import { PillSwitch, ProgressStatus, RANGE_LABELS, dayLabel, RangeDates } from './progress-parts';
import { useActivities } from './use-activities';
import type { ProgressData } from './use-progress';

// Activities tab (BACKEND-HANDOFF.md section 22): the person's own finished
// practices and lessons, and the days they wrote in the journal (dates only).

const KIND: Record<ActivityKind, { icon: LucideIcon; en: string; km: string }> = {
  practice: { icon: HeartPulse, en: 'Practices done', km: 'លំហាត់ដែលបានធ្វើ' },
  lesson: { icon: BookOpen, en: 'Lessons read', km: 'មេរៀនដែលបានអាន' },
  journal: { icon: NotebookPen, en: 'Journal entries', km: 'កំណត់ហេតុ' },
};

function itemTitle(kind: ActivityKind, refId: string | null, km: boolean) {
  if (kind === 'journal') return km ? 'បានសរសេរកំណត់ហេតុ' : 'Journal entry';
  const item =
    kind === 'practice' ? ALL_PRACTICES.find((entry) => entry.id === refId) : ALL_LESSONS.find((entry) => entry.id === refId);
  if (!item) return km ? 'សកម្មភាព' : 'Activity';
  return (km && item.kmTitle) || item.title;
}

export function ActivitiesPanel({
  status,
  range,
  onRange,
  km,
}: {
  status: ProgressData['status'];
  range: ProgressRange;
  onRange: (range: ProgressRange) => void;
  km: boolean;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [today] = useState(() => cambodiaDay(Date.now()));

  const { state, retry } = useActivities(range, status === 'ready');

  if (status !== 'ready') return <ProgressStatus status={status} km={km} next="/progress/details" />;

  const covered = lastDays(today, RANGE_DAYS[range]);

  return (
    <section aria-labelledby="activities-title" className="space-y-3">
      <h2 id="activities-title" className="text-lg font-semibold text-ink">
        {t('សកម្មភាពរបស់អ្នក', 'Your activities')}
      </h2>
      <PillSwitch
        label={t('រយៈពេល', 'Time range')}
        options={PROGRESS_RANGES.map((value) => ({ value, text: km ? RANGE_LABELS[value].km : RANGE_LABELS[value].en }))}
        value={range}
        onChange={onRange}
      />
      <RangeDates first={covered[0]} last={covered.at(-1)} km={km} />

      {state.status === 'loading' && (
        <div aria-busy="true" aria-label={t('កំពុងផ្ទុក', 'Loading')} className="grid grid-cols-3 gap-2 sm:gap-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl bg-arom-wash" />
          ))}
        </div>
      )}
      {state.status === 'error' && (
        <div role="alert" className="rounded-2xl border border-arom-border bg-white p-4 text-sm text-ink-muted">
          {t('មិនអាចផ្ទុកសកម្មភាពរបស់អ្នកបានទេ។', 'Your activities could not be loaded.')}{' '}
          <button type="button" onClick={retry} className="font-semibold text-arom underline-offset-2 hover:underline">
            {t('ព្យាយាមម្ដងទៀត', 'Try again')}
          </button>
        </div>
      )}
      {state.status === 'ready' && <ActivitiesSummary data={state.data} km={km} />}

      <div className="grid gap-2 sm:grid-cols-2">
        <Link
          href="/mindguide/practice"
          className="flex items-center gap-2 rounded-2xl border border-arom-border bg-white px-4 py-3 text-sm font-semibold text-arom hover:bg-arom-wash"
        >
          <HeartPulse size={17} aria-hidden="true" />
          <span className="flex-1">{t('ស្វែងរកលំហាត់', 'Find a practice')}</span>
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
        <Link
          href="/mindguide/learn"
          className="flex items-center gap-2 rounded-2xl border border-arom-border bg-white px-4 py-3 text-sm font-semibold text-arom hover:bg-arom-wash"
        >
          <BookOpen size={17} aria-hidden="true" />
          <span className="flex-1">{t('អានមេរៀន', 'Read a lesson')}</span>
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function ActivitiesSummary({ data, km }: { data: ActivitiesResponse; km: boolean }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  return (
    <>
        <ul className="grid grid-cols-3 gap-2 sm:gap-3">
          {(Object.keys(KIND) as ActivityKind[]).map((kind) => {
            const Icon = KIND[kind].icon;
            return (
              <li key={kind} className="rounded-2xl border border-arom-border bg-white p-3 text-center shadow-card sm:p-4">
                <span className="mx-auto flex size-9 items-center justify-center rounded-full bg-arom-soft text-arom">
                  <Icon size={17} aria-hidden="true" />
                </span>
                <p className="mt-2 text-2xl font-bold text-ink">{data.counts[kind]}</p>
                <p className="text-xs leading-4 text-ink-muted">{km ? KIND[kind].km : KIND[kind].en}</p>
              </li>
            );
          })}
        </ul>

        <div className="rounded-3xl border border-arom-border bg-white p-4 shadow-card sm:p-5">
          <h3 className="text-base font-semibold text-ink">{t('ថ្មីៗនេះ', 'Recent')}</h3>
          {data.recent.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">{t('មិនទាន់មានសកម្មភាពនៅឡើយទេ។', 'No activities yet.')}</p>
          ) : (
            <ul className="mt-2 divide-y divide-arom-border">
              {data.recent.slice(0, 8).map((item) => {
                const Icon = KIND[item.kind].icon;
                return (
                  <li key={item.id} className="flex items-center gap-3 py-2.5 text-sm">
                    <Icon size={17} aria-hidden="true" className="shrink-0 text-arom" />
                    <span className="min-w-0 flex-1 truncate text-ink">{itemTitle(item.kind, item.refId, km)}</span>
                    <span className="shrink-0 text-xs text-ink-muted">{dayLabel(item.day, km, false)}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-2 text-xs text-ink-muted">
            {t('កំណត់ហេតុបង្ហាញតែកាលបរិច្ឆេទប៉ុណ្ណោះ មិនដែលបង្ហាញពាក្យដែលអ្នកសរសេរទេ។', 'Journal entries show only the date, never what you wrote.')}
          </p>
        </div>
    </>
  );
}
