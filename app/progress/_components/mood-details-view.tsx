'use client';

import { useState } from 'react';
import { Activity } from 'lucide-react';

import { useLanguage } from '../../_components/language-provider';
import { PROGRESS_RANGES, type ProgressRange } from '@/lib/mood';
import { InsightsPanel } from './insights-panel';
import { MoodBarChart, MoodDonut } from './progress-charts';
import { MascotNote, PillSwitch, ProgressShell, ProgressStatus, RANGE_LABELS, SampleBadge } from './progress-parts';
import { useProgress } from './use-progress';

// Mood & Activity Details (Figma, BACKEND-HANDOFF.md section 22). Mood and
// Insights use the check ins (7 days real, longer ranges sample data).

type Tab = 'mood' | 'activities' | 'insights';

function Soon({ icon: Icon, title, text, km }: { icon: typeof Activity; title: string; text: string; km: boolean }) {
  return (
    <section className="rounded-3xl border border-dashed border-arom/30 bg-white px-6 py-10 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-arom-soft text-arom">
        <Icon size={22} aria-hidden="true" />
      </span>
      <p className="mt-3 inline-flex rounded-full bg-arom-wash px-2.5 py-0.5 text-xs font-semibold text-arom">
        {km ? 'ឆាប់ៗនេះ' : 'Coming soon'}
      </p>
      <h2 className="mt-2 text-lg font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">{text}</p>
    </section>
  );
}

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

      {tab === 'activities' && (
        <Soon
          icon={Activity}
          km={km}
          title={t('សកម្មភាពរបស់អ្នក', 'Your activities')}
          text={t(
            'ឆាប់ៗនេះ អ្នកនឹងឃើញលំហាត់ និងមេរៀនដែលអ្នកបានធ្វើនៅទីនេះ។',
            'Soon you will see the practices and lessons you have done here.',
          )}
        />
      )}

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
