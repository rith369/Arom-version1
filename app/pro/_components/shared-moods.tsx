'use client';

import { BarChart3 } from 'lucide-react';

import { MoodBarChart } from '../../progress/_components/progress-charts';
import type { MoodWeekResponse } from '@/lib/mood';

/**
 * A client's mood check ins of the last 30 days, shown only while they share
 * them on a session with this professional (BACKEND-HANDOFF.md section 22).
 * Moods only, never the journal. The client can turn it off at any time, and
 * the database stops returning them at once.
 */
export function SharedMoods({ km, sharing, moods }: { km: boolean; sharing: boolean; moods: MoodWeekResponse | null }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  return (
    <section className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
      <h2 className="flex items-center gap-2 text-base font-bold text-ink">
        <BarChart3 size={18} aria-hidden="true" className="text-arom" />
        {t('ការកត់ត្រាអារម្មណ៍', 'Mood check ins')}
      </h2>
      <p className="mt-1 text-xs leading-5 text-ink-muted">
        {t(
          'អារម្មណ៍ ៣០ ថ្ងៃចុងក្រោយ នៅពេលអតិថិជនជ្រើសរើសចែករំលែក។ មានតែអារម្មណ៍ មិនមែនកំណត់ហេតុឡើយ។ ពួកគេអាចបិទវាគ្រប់ពេល។ មិនមែនជាការធ្វើរោគវិនិច្ឆ័យទេ។',
          'The last 30 days of moods, when the client chooses to share them. Moods only, never their journal. They can turn it off at any time. Not a diagnosis.',
        )}
      </p>

      {!sharing ? (
        <p className="mt-4 rounded-2xl bg-arom-wash/70 p-3.5 text-sm text-ink-muted">
          {t('អតិថិជននេះមិនបានចែករំលែកអារម្មណ៍របស់ពួកគេទេ។ នេះជាជម្រើសរបស់ពួកគេ។', 'This client has not shared their moods. That is their choice.')}
        </p>
      ) : !moods || moods.checkIns === 0 ? (
        <p className="mt-4 rounded-2xl bg-arom-wash/70 p-3.5 text-sm text-ink-muted">
          {t('មិនមានការកត់ត្រាអារម្មណ៍ក្នុង ៣០ ថ្ងៃចុងក្រោយទេ។', 'No mood check ins in the last 30 days.')}
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm text-ink">
            {km
              ? `បានកត់ត្រា ${moods.checkIns} ថ្ងៃ ក្នុងចំណោម ៣០ ថ្ងៃចុងក្រោយ។`
              : `Checked in on ${moods.checkIns} of the last 30 days.`}
          </p>
          <div className="mt-3">
            <MoodBarChart days={moods.days} km={km} range="30d" />
          </div>
        </>
      )}
    </section>
  );
}
