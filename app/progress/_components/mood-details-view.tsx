'use client';

import { useState } from 'react';
import { useLanguage } from '../../_components/language-provider';
import { PROGRESS_RANGES, type ProgressRange } from '@/lib/mood';
import { ActivitiesPanel } from './activities-panel';
import { InsightsPanel } from './insights-panel';
import { MoodBarChart, MoodDonut } from './progress-charts';
import { MascotNote, PillSwitch, ProgressShell, ProgressStatus, RANGE_LABELS, SampleBadge, RangeDates } from './progress-parts';
import { useProgress } from './use-progress';

// Mood & Activity Details (Figma, BACKEND-HANDOFF.md section 22). Mood and
// Insights use the check ins (7 days real, longer ranges sample data);
// Activities is sample data until practices and lessons are saved on the server.

type Tab = 'mood' | 'activities' | 'insights';

export function MoodDetailsView() {
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [tab, setTab] = useState<Tab>('mood');
  const [range, setRange] = useState<ProgressRange>('7d');
  const data = useProgress(range);
  const rangeText = km ? RANGE_LABELS[range].km : RANGE_LABELS[range].en;

  return (
    <ProgressShell
      title={t('ព័ត៌មានលម្អិតអំពីអារម្មណ៍ និងសកម្មភាព', 'Mood & Activity Details')}
      subtitle={t('ស្ថិតិ និងការបែងចែកអារម្មណ៍របស់អ្នក។', 'Statistics and how your moods are spread.')}
      back={{ href: '/progress', label: t('ផ្ទាំងតាមដានការវិវត្ត', 'Progress Dashboard') }}
    >
      <PillSwitch
        label={t('ផ្ទាំង', 'Sections')}
        options={[
          { value: 'mood' as const, text: t('អារម្មណ៍', 'Mood') },
          { value: 'activities' as const, text: t('សកម្មភាព', 'Activities') },
          { value: 'insights' as const, text: t('ការយល់ដឹង', 'Insights') },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'activities' && <ActivitiesPanel status={data.status} range={range} onRange={setRange} km={km} />}

      {tab === 'insights' && <InsightsPanel data={data} range={range} onRange={setRange} km={km} />}

      {tab === 'mood' &&
        (data.status !== 'ready' ? (
          <ProgressStatus status={data.status} km={km} next="/progress/details" />
        ) : (
          <>
            <section aria-labelledby="stats-title" className="space-y-3">
              <h2 id="stats-title" className="text-lg font-semibold text-ink">
                {t('ស្ថិតិអារម្មណ៍', 'Mood Statistics')}
              </h2>
              <PillSwitch
                label={t('រយៈពេល', 'Time range')}
                options={PROGRESS_RANGES.map((value) => ({ value, text: km ? RANGE_LABELS[value].km : RANGE_LABELS[value].en }))}
                value={range}
                onChange={setRange}
              />
              <RangeDates first={data.days[0]?.day} last={data.days.at(-1)?.day} km={km} />
              <div className="rounded-3xl border border-arom-border bg-white p-4 shadow-card sm:p-5">
                {data.sample && (
                  <div className="mb-2">
                    <SampleBadge km={km} />
                  </div>
                )}
                {data.checkIns === 0 ? (
                  <p className="rounded-2xl bg-arom-wash px-4 py-6 text-center text-sm text-ink-muted">
                    {t('មិនទាន់មានការកត់ត្រានៅឡើយទេ។', 'No check ins yet.')}
                  </p>
                ) : (
                  <MoodBarChart key={range} days={data.days} km={km} range={range} />
                )}
              </div>
            </section>

            <section aria-labelledby="distribution-title" className="space-y-3">
              <h2 id="distribution-title" className="text-lg font-semibold text-ink">
                {t('ការបែងចែកអារម្មណ៍', 'Mood Distribution')}
              </h2>
              <div className="rounded-3xl border border-arom-border bg-white p-5 shadow-card">
                <MoodDonut days={data.days} km={km} />
              </div>
            </section>

            <MascotNote
              compact
              text={
                data.checkIns > 0
                  ? t(
                      `អ្នកបានកត់ត្រា ${data.checkIns} ដងក្នុងរយៈពេល ${rangeText} ចុងក្រោយ។ ការកត់ត្រានីមួយៗជួយអ្នកឱ្យដឹងពីអារម្មណ៍ខ្លួនឯង។`,
                      `You checked in ${data.checkIns} ${data.checkIns === 1 ? 'time' : 'times'} in the last ${rangeText}. Every check in helps you notice how you feel.`,
                    )
                  : t('ការកត់ត្រានីមួយៗជួយអ្នកឱ្យដឹងពីអារម្មណ៍ខ្លួនឯង។', 'Every check in helps you notice how you feel.')
              }
            />
          </>
        ))}
    </ProgressShell>
  );
}
