'use client';

import { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';

import { FigmaIcon } from '../../components/figma-icon';
import { saveTodayMood } from '../../_components/mood/mood-store';
import { MOOD_COLORS, MOOD_ICONS } from '../../_components/mood/mood-visuals';
import { MOOD_LABELS, MOOD_LEVELS, type MoodLevel } from '@/lib/mood';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Today's check in on the Progress Dashboard (BACKEND-HANDOFF.md section 22).
 * The same rules as Home: nothing is preselected, a tap saves, and "Saved"
 * shows only after the server confirms. The charts update from the store.
 */
export function TodayCheckIn({ today, km }: { today: MoodLevel | null; km: boolean }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [state, setState] = useState<SaveState>('idle');
  const [pending, setPending] = useState<MoodLevel | null>(null);
  const [last, setLast] = useState<MoodLevel | null>(null);
  const selected = pending ?? today;

  async function save(mood: MoodLevel) {
    if (state === 'saving') return;
    setLast(mood);
    setPending(mood);
    setState('saving');
    const result = await saveTodayMood(mood);
    setPending(null);
    setState(result.ok ? 'saved' : 'error');
  }

  return (
    <div className="mt-3 rounded-2xl border border-black/10 bg-white p-4 shadow-[4px_4px_12px_rgba(0,0,0,0.08)]">
      <p className="font-medium text-ink">
        {today
          ? `${t('ថ្ងៃនេះ', 'Today')}: ${km ? MOOD_LABELS[today].km : MOOD_LABELS[today].en}`
          : t('តើអ្នកមានអារម្មណ៍យ៉ាងណាថ្ងៃនេះ?', 'How are you feeling today?')}
      </p>
      <p className="text-sm font-light text-ink">
        {today
          ? t('ចុចលើអារម្មណ៍ផ្សេង ដើម្បីប្តូរ។', 'Tap another mood to change it.')
          : t('ចុចលើអារម្មណ៍មួយ ដើម្បីកត់ត្រា។', 'Tap a mood to check in.')}
      </p>

      <div
        role="group"
        aria-label={t('អារម្មណ៍ថ្ងៃនេះ', "Today's mood")}
        aria-busy={state === 'saving'}
        className="mt-3 grid grid-cols-5 gap-1.5 sm:gap-2"
      >
        {[...MOOD_LEVELS].reverse().map((mood) => {
          const active = selected === mood;
          return (
            <button
              key={mood}
              type="button"
              aria-pressed={active}
              disabled={state === 'saving'}
              onClick={() => void save(mood)}
              className={`flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-xl border px-0.5 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom disabled:cursor-wait ${
                active ? 'border-arom bg-arom-wash' : 'border-arom-border bg-white hover:bg-arom-wash/60'
              }`}
            >
              <span
                className="flex size-9 items-center justify-center rounded-full"
                style={{ backgroundColor: active ? `${MOOD_COLORS[mood]}40` : '#f1f5f3' }}
              >
                <FigmaIcon name={MOOD_ICONS[mood]} size={22} />
              </span>
              <span className={`text-center text-[11px] leading-tight ${active ? 'font-semibold text-arom' : 'text-ink-muted'}`}>
                {km ? MOOD_LABELS[mood].km.split(' (')[0] : MOOD_LABELS[mood].en}
              </span>
            </button>
          );
        })}
      </div>

      <p role="status" aria-live="polite" className="mt-2 flex min-h-5 items-center justify-center gap-1 text-xs">
        {state === 'saving' && <span className="text-ink-muted">{t('កំពុងរក្សាទុក...', 'Saving...')}</span>}
        {state === 'saved' && (
          <span className="flex items-center gap-1 font-semibold text-arom">
            <Check size={14} aria-hidden="true" />
            {t('បានរក្សាទុក', 'Saved')}
          </span>
        )}
        {state === 'error' && (
          <span className="flex items-center gap-1.5 text-arom-danger">
            {t('មិនអាចរក្សាទុកបានទេ។', 'That could not be saved.')}
            {last && (
              <button type="button" onClick={() => void save(last)} className="inline-flex items-center gap-1 font-semibold underline">
                <RotateCcw size={12} aria-hidden="true" />
                {t('ព្យាយាមម្ដងទៀត', 'Try again')}
              </button>
            )}
          </span>
        )}
      </p>
    </div>
  );
}
