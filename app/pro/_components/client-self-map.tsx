'use client';

import { useEffect, useState } from 'react';
import { Compass, Lock } from 'lucide-react';

import { useLanguage } from '../../_components/language-provider';
import { CopingStyleBars, TraitBars, ValuesList } from '../../_components/understand/self-map-summary';
import {
  COPING_CREDIT,
  COPING_SCALE_INFO,
  PERSONALITY_CREDIT,
  scoreCoping,
  scorePersonality,
  usesSubstances,
  type CopingAnswers,
  type CopingScale,
  type PersonalityAnswers,
  type ProClientSelfMap,
} from '@/lib/self-map';

// Understand yourself, "My self map" (BACKEND-HANDOFF.md section 38): shown
// here only while the client shares it with this professional.

export function ClientSelfMapCard({ clientId }: { clientId: string }) {
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [state, setState] = useState<{ clientId: string; status: 'ready' | 'failed'; selfMap: ProClientSelfMap } | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/pro/clients/${clientId}/self-map`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('failed');
        const data = (await response.json()) as { selfMap: ProClientSelfMap };
        if (active) setState({ clientId, status: 'ready', selfMap: data.selfMap });
      })
      .catch(() => {
        if (active) setState({ clientId, status: 'failed', selfMap: null });
      });
    return () => {
      active = false;
    };
  }, [clientId]);

  const current = state?.clientId === clientId ? state : null;
  const selfMap = current?.selfMap ?? null;
  const date = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Phnom_Penh' });

  return (
    <section className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
      <h2 className="flex items-center gap-2 text-base font-bold text-ink">
        <Compass size={18} aria-hidden="true" className="text-arom" />
        {t('ផែនទីខ្លួនឯង (Self map)', 'Self map')}
      </h2>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
        <Lock size={12} aria-hidden="true" />
        {t('ចែករំលែកដោយអតិថិជន។ មានតែអ្នកទេដែលឃើញ។', 'Shared by the client. Only you can see this.')}
      </p>

      <div className="mt-4 space-y-5">
        {!current ? (
          <p className="text-sm text-ink-muted">{t('កំពុងផ្ទុក...', 'Loading...')}</p>
        ) : current.status === 'failed' ? (
          <p className="text-sm text-arom-danger">{t('មិនអាចផ្ទុកបានទេ។', 'This could not be loaded.')}</p>
        ) : !selfMap ? (
          <p className="text-sm leading-6 text-ink-muted">
            {t(
              'មិនបានចែករំលែកទេ។ អតិថិជនអាចចែករំលែកតម្លៃរបស់ពួកគេ របៀបដែលពួកគេទប់ទល់នឹងភាពតានតឹង និងបុគ្គលិកលក្ខណៈ ពីទំព័រ "ស្គាល់ខ្លួនឯង"។',
              'Not shared. Clients can share their values, how they handle stress and their personality from Understand yourself.',
            )}
          </p>
        ) : !selfMap.values && !selfMap.coping && !selfMap.personality ? (
          <p className="text-sm leading-6 text-ink-muted">
            {t('អតិថិជនចែករំលែកវា ប៉ុន្តែមិនទាន់បានធ្វើសកម្មភាពណាមួយនៅឡើយទេ។', 'The client shares it, but has not done an activity yet.')}
          </p>
        ) : (
          <>
            {selfMap.values && (
              <div>
                <h3 className="text-sm font-semibold text-ink">{t('តម្លៃ', 'Values')}</h3>
                <p className="mb-2 text-xs text-ink-muted">
                  {t(`បានឆ្លើយនៅថ្ងៃ ${date.format(new Date(selfMap.values.updatedAt))}, រស់នៅតាមក្នុង ២ សប្តាហ៍ចុងក្រោយ`, `Answered ${date.format(new Date(selfMap.values.updatedAt))}, lived in the last 2 weeks`)}
                </p>
                <ValuesList answers={selfMap.values.answers} km={km} showDescription={false} />
              </div>
            )}
            {selfMap.coping && <CopingSummary km={km} answers={selfMap.coping.answers} updatedAt={date.format(new Date(selfMap.coping.updatedAt))} />}
            {selfMap.personality && (
              <PersonalitySummary km={km} answers={selfMap.personality.answers} updatedAt={date.format(new Date(selfMap.personality.updatedAt))} />
            )}
            <p className="rounded-2xl bg-arom-wash/70 p-3 text-xs leading-5 text-ink">
              {t('ការស្គាល់ខ្លួនឯង មិនមែនជាការធ្វើរោគវិនិច្ឆ័យទេ។', 'Self knowledge, not a diagnosis.')}
            </p>
          </>
        )}
      </div>
    </section>
  );
}

function CopingSummary({ km, answers, updatedAt }: { km: boolean; answers: CopingAnswers; updatedAt: string }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const result = scoreCoping(answers);
  const name = (scale: CopingScale) => (km ? COPING_SCALE_INFO[scale].name.km : COPING_SCALE_INFO[scale].name.en);

  return (
    <div>
      <h3 className="text-sm font-semibold text-ink">{t('របៀបទប់ទល់នឹងភាពតានតឹង (Brief COPE)', 'How they handle stress (Brief COPE)')}</h3>
      <p className="mb-3 text-xs text-ink-muted">{t(`បានឆ្លើយនៅថ្ងៃ ${updatedAt}`, `Answered ${updatedAt}`)}</p>
      <CopingStyleBars result={result} km={km} showDescription={false} />
      <dl className="mt-3 space-y-2 text-sm">
        {result.most.length > 0 && (
          <div>
            <dt className="text-xs text-ink-muted">{t('ប្រើច្រើនជាងគេ', 'Used most')}</dt>
            <dd className="text-ink">{result.most.map(name).join(', ')}</dd>
          </div>
        )}
        {result.stuck.length > 0 && (
          <div>
            <dt className="text-xs text-ink-muted">{t('ការគេចចេញដែលប្រើច្រើន', 'Pulling away, used a lot')}</dt>
            <dd className="text-ink">{result.stuck.map(name).join(', ')}</dd>
          </div>
        )}
        {usesSubstances(answers) && (
          <div>
            <dt className="text-xs text-ink-muted">{t('សម្គាល់', 'Note')}</dt>
            <dd className="text-ink">{t('បានឆ្លើយថាប្រើគ្រឿងស្រវឹង ឬគ្រឿងញៀន ដើម្បីទប់ទល់។', 'Said they use alcohol or drugs to cope.')}</dd>
          </div>
        )}
      </dl>
      <p className="mt-3 text-[0.7rem] leading-5 text-ink-muted">{km ? COPING_CREDIT.km : COPING_CREDIT.en}</p>
    </div>
  );
}

function PersonalitySummary({ km, answers, updatedAt }: { km: boolean; answers: PersonalityAnswers; updatedAt: string }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const result = scorePersonality(answers);
  const style = result.letters.map((item) => item.letter).join('');

  return (
    <div>
      <h3 className="text-sm font-semibold text-ink">{t('បុគ្គលិកលក្ខណៈ (Big Five, Mini IPIP)', 'Personality (Big Five, Mini IPIP)')}</h3>
      <p className="mb-3 text-xs text-ink-muted">{t(`បានឆ្លើយនៅថ្ងៃ ${updatedAt}`, `Answered ${updatedAt}`)}</p>
      <TraitBars result={result} km={km} showBigFive />
      <p className="mt-3 text-xs leading-5 text-ink-muted">
        {t(
          `អតិថិជនបានឃើញរចនាប័ទ្មអក្សរ ៤ "${style}" សម្រាប់កម្សាន្ត (ការផ្គូផ្គងប្រហាក់ប្រហែលពី Big Five មិនមែន MBTI ទេ)។`,
          `The client was shown the 4 letter style "${style}" for fun (a rough match from the Big Five, not the MBTI).`,
        )}
      </p>
      <p className="mt-2 text-[0.7rem] leading-5 text-ink-muted">{km ? PERSONALITY_CREDIT.km : PERSONALITY_CREDIT.en}</p>
    </div>
  );
}
