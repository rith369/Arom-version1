'use client';

import { useState } from 'react';
import { BarChart3 } from 'lucide-react';

import { MoodBarChart } from '../../progress/_components/progress-charts';
import { sampleProgress } from '../../progress/_data/sample-progress';
import { cambodiaDay } from '@/lib/mood';

/**
 * Where a client's shared mood check ins will show (BACKEND-HANDOFF.md
 * section 22). Not active yet: clients cannot share moods, so the chart is an
 * EXAMPLE, dimmed and labeled, never this client's data. Moods only, never
 * the journal; off by default; the client can turn it off at any time.
 */
export function SharedMoodPreview({ km }: { km: boolean }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [today] = useState(() => cambodiaDay(Date.now()));
  const example = sampleProgress(today, 30);

  return (
    <section className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="flex items-center gap-2 text-base font-bold text-ink">
          <BarChart3 size={18} aria-hidden="true" className="text-arom" />
          {t('ការកត់ត្រាអារម្មណ៍', 'Mood check ins')}
        </h2>
        <span className="rounded-full bg-arom-wash px-2.5 py-0.5 text-xs font-semibold text-arom">
          {t('ឆាប់ៗនេះ', 'Coming soon')}
        </span>
      </div>
      <p className="mt-1 text-xs leading-5 text-ink-muted">
        {t(
          'នៅពេលអតិថិជនជ្រើសរើសចែករំលែក អារម្មណ៍ ៣០ ថ្ងៃចុងក្រោយរបស់ពួកគេនឹងបង្ហាញនៅទីនេះ។ មានតែអារម្មណ៍ មិនមែនកំណត់ហេតុឡើយ។ ពួកគេអាចបិទវាគ្រប់ពេល។',
          "When a client chooses to share, their last 30 days of moods will show here. Moods only, never their journal. They can turn it off at any time.",
        )}
      </p>

      <div className="relative mt-4">
        <p className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink shadow-sm ring-1 ring-arom-border">
          {t('ឧទាហរណ៍ មិនមែនអតិថិជននេះទេ', 'An example, not this client')}
        </p>
        <div aria-hidden="true" inert className="pointer-events-none opacity-40 grayscale-[30%]">
          <MoodBarChart days={example.days} km={km} range="30d" />
        </div>
      </div>
    </section>
  );
}
