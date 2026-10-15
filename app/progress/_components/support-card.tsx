'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HeartHandshake, LifeBuoy, Stethoscope, Wind } from 'lucide-react';

import type { MoodDay } from '@/lib/mood';

// Decided with Rith (16 Oct 2026, BACKEND-HANDOFF.md section 22): show a calm
// support card when 3 or more of the last 7 check ins are Low or Very Low.
// It states a fact and offers help; it never diagnoses or scores. Real
// check ins only, never sample data.
export const SUPPORT_MIN_HARD_DAYS = 3;

export function needsSupport(week: MoodDay[]) {
  const hard = week.filter((entry) => entry.mood === 'low' || entry.mood === 'very_low').length;
  return hard >= SUPPORT_MIN_HARD_DAYS;
}

export function SupportCard({ km }: { km: boolean }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  // "Not now" hides it for this visit only; nothing is saved.
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  const action =
    'inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom';

  return (
    <section aria-labelledby="support-title" className="rounded-3xl border border-arom-border bg-arom-wash p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-arom shadow-sm">
          <HeartHandshake size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id="support-title" className="text-base font-semibold text-ink">
            {t('ថ្ងៃខ្លះថ្មីៗនេះពិបាកសម្រាប់អ្នក។', 'Some of your recent days were hard.')}
          </h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            {t('អ្នកមិនចាំបាច់ប្រឈមវាតែម្នាក់ឯងទេ។', "You don't have to handle it alone.")}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/practice" className={`${action} border-arom-border bg-white text-arom hover:bg-arom-soft`}>
          <Wind size={16} aria-hidden="true" />
          {t('លំហាត់ដកដង្ហើម', 'Breathing practice')}
        </Link>
        <Link href="/professional" className={`${action} border-arom-border bg-white text-arom hover:bg-arom-soft`}>
          <Stethoscope size={16} aria-hidden="true" />
          {t('និយាយជាមួយអ្នកជំនាញ', 'Talk to a professional')}
        </Link>
        <Link
          href="/profile#get-help-title"
          className={`${action} border-arom-danger/25 bg-white text-arom-danger hover:bg-arom-danger-soft`}
        >
          <LifeBuoy size={16} aria-hidden="true" />
          {t('ជំនួយបន្ទាន់', 'Get help now')}
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setHidden(true)}
        className="mt-3 text-xs font-medium text-ink-muted underline-offset-2 hover:underline"
      >
        {t('មិនមែនឥឡូវនេះ', 'Not now')}
      </button>
    </section>
  );
}
