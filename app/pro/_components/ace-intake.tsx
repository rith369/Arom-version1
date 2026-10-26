'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ClipboardList, Lock } from 'lucide-react';

import { useLanguage } from '../../_components/language-provider';
import { ACE_CREDIT, ACE_LEAD, ACE_QUESTIONS, ACE_TITLE, aceScore, type ProClientAce } from '@/lib/ace';

// ACE in the therapist intake (BACKEND-HANDOFF.md section 37): the switch on
// My profile, and the read only answers in the client file and Prepare.

/** My profile: ask clients the ACE questions before their sessions. */
export function AceSettingCard() {
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [ask, setAsk] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/pro/ace', { cache: 'no-store' })
      .then((response) => (response.ok ? (response.json() as Promise<{ ask: boolean }>) : null))
      .then((data) => {
        if (active && data) setAsk(data.ask);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  async function change(next: boolean) {
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/pro/ace', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ask: next }),
      });
      if (!response.ok) throw new Error('failed');
      setAsk(((await response.json()) as { ask: boolean }).ask);
    } catch {
      setError(t('មិនអាចរក្សាទុកបានទេ។ សូមព្យាយាមម្តងទៀត។', 'That could not be saved. Please try again.'));
    }
    setSaving(false);
  }

  return (
    <section className="mt-6 rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
      <h2 className="flex items-center gap-2 text-base font-bold text-ink sm:text-lg">
        <ClipboardList size={19} aria-hidden="true" className="text-arom" />
        {km ? ACE_TITLE.km : ACE_TITLE.en}
      </h2>
      <p className="mt-1 text-sm leading-6 text-ink-muted">
        {t(
          'នៅពេលបើក អតិថិជនដែលមានវគ្គខាងមុខជាមួយអ្នក អាចឆ្លើយសំណួរ ACE ទាំង ១០ (បាទ/ចាស ឬទេ ហើយអាចរំលងបាន) នៅក្នុង "ការណាត់ជួបរបស់ខ្ញុំ"។ មានតែអ្នកទេដែលអាចអានចម្លើយ ក្រុម AROM មិនអាចអានបានទេ។ អតិថិជនអាចកែប្រែវាមុនវគ្គ និងលុបវាបានគ្រប់ពេល។',
          'When this is on, clients with an upcoming session with you can answer the 10 ACE questions (yes or no, each can be skipped) in My appointments. Only you can read the answers, not the AROM team. Clients can change them before a session and delete them at any time.',
        )}
      </p>
      <label className="mt-4 flex w-fit cursor-pointer items-center gap-3 text-sm font-semibold text-ink">
        <input
          type="checkbox"
          role="switch"
          checked={ask === true}
          disabled={ask === null || saving}
          onChange={(event) => void change(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="relative h-6 w-11 shrink-0 rounded-full bg-gray-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-arom peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-arom peer-disabled:opacity-50"
        />
        {t('សួរអតិថិជនរបស់ខ្ញុំ', 'Ask my clients')}
      </label>
      <p className="mt-2 text-xs text-ink-muted">{t('ការបិទ មិនលុបចម្លើយដែលបានផ្តល់រួចទេ។', 'Turning it off keeps answers already given.')}</p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-arom-danger">
          {error}
        </p>
      )}
    </section>
  );
}

/** One client's ACE answers, for this professional only. */
export function ClientAceCard({ clientId }: { clientId: string }) {
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [state, setState] = useState<{ clientId: string; status: 'ready' | 'failed'; ace: ProClientAce } | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/pro/clients/${clientId}/ace`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('failed');
        const data = (await response.json()) as { ace: ProClientAce };
        if (active) setState({ clientId, status: 'ready', ace: data.ace });
      })
      .catch(() => {
        if (active) setState({ clientId, status: 'failed', ace: null });
      });
    return () => {
      active = false;
    };
  }, [clientId]);

  const current = state?.clientId === clientId ? state : null;
  const ace = current?.ace ?? null;
  const date = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Phnom_Penh' });

  return (
    <section className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
      <h2 className="flex items-center gap-2 text-base font-bold text-ink">
        <ClipboardList size={18} aria-hidden="true" className="text-arom" />
        {km ? ACE_TITLE.km : ACE_TITLE.en}
      </h2>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
        <Lock size={12} aria-hidden="true" />
        {t('មានតែអ្នកទេដែលឃើញ។', 'Only you can see this.')}
      </p>

      <div className="mt-4">
        {!current ? (
          <p className="text-sm text-ink-muted">{t('កំពុងផ្ទុក...', 'Loading...')}</p>
        ) : current.status === 'failed' ? (
          <p className="text-sm text-arom-danger">{t('មិនអាចផ្ទុកបានទេ។', 'This could not be loaded.')}</p>
        ) : !ace ? (
          <p className="text-sm leading-6 text-ink-muted">
            {t('មិនទាន់ឆ្លើយ។ អតិថិជនឆ្លើយតែនៅពេលអ្នកសួរសំណួរទាំងនេះ ', 'Not answered. Clients answer only if you ask these questions ')}
            (
            <Link href="/pro/profile" className="font-semibold text-arom underline">
              {t('ប្រវត្តិរូបរបស់ខ្ញុំ', 'My profile')}
            </Link>
            ){t(' ហើយពួកគេជ្រើសរើសឆ្លើយ។', ' and they choose to.')}
          </p>
        ) : (
          <AceAnswers ace={ace} km={km} date={date.format(new Date(ace.updatedAt))} showAnswers={showAnswers} onToggle={() => setShowAnswers((value) => !value)} />
        )}
      </div>
    </section>
  );
}

function AceAnswers({
  ace,
  km,
  date,
  showAnswers,
  onToggle,
}: {
  ace: NonNullable<ProClientAce>;
  km: boolean;
  date: string;
  showAnswers: boolean;
  onToggle: () => void;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const { score, answered } = aceScore(ace.answers);

  return (
    <>
      <p className="text-2xl font-bold tabular-nums text-ink">
        {score}
        <span className="text-base font-medium text-ink-muted"> / 10</span>
      </p>
      <p className="mt-0.5 text-sm text-ink-muted">
        {t('ពិន្ទុ ACE (ចំនួនចម្លើយ បាទ/ចាស)', 'ACE score (number of yes answers)')}
        {answered < 10 && t(`, បានឆ្លើយ ${answered} ក្នុងចំណោម ១០`, `, answered ${answered} of 10`)}
      </p>
      <p className="mt-0.5 text-xs text-ink-muted">{t(`បានឆ្លើយនៅថ្ងៃ ${date}`, `Answered ${date}`)}</p>
      <p className="mt-3 rounded-2xl bg-arom-wash/70 p-3 text-xs leading-5 text-ink">
        {t(
          'ជាចំនួនបទពិសោធន៍ មិនមែនជាការធ្វើរោគវិនិច្ឆ័យទេ។ សូមពិភាក្សាអំពីវាដោយប្រុងប្រយ័ត្ន ហើយតែនៅពេលអតិថិជនរួចរាល់។',
          'A count of experiences, not a diagnosis. Talk about it with care, and only when the client is ready.',
        )}
      </p>

      <button type="button" onClick={onToggle} aria-expanded={showAnswers} className="mt-3 text-sm font-semibold text-arom hover:underline">
        {showAnswers ? t('លាក់ចម្លើយ', 'Hide answers') : t('បង្ហាញចម្លើយ', 'Show answers')}
      </button>

      {showAnswers && (
        <>
          <p className="mt-3 text-xs font-semibold text-ink-muted">{km ? ACE_LEAD.km : ACE_LEAD.en}</p>
          <ol className="mt-2 space-y-2.5">
            {ACE_QUESTIONS.map((question, index) => {
              const answer = ace.answers[index];
              return (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="min-w-0 flex-1 leading-6 text-ink">
                    <span className="font-semibold">{index + 1}. </span>
                    {(km ? question.km : question.en).join(' ')}
                  </span>
                  <span
                    className={`mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      answer === true ? 'bg-arom-warning-soft text-arom-warning' : answer === false ? 'bg-arom-wash text-ink-muted' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {answer === true ? t('បាទ/ចាស', 'Yes') : answer === false ? t('ទេ', 'No') : t('បានរំលង', 'Skipped')}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-[0.7rem] leading-5 text-ink-muted">{km ? ACE_CREDIT.km : ACE_CREDIT.en}</p>
        </>
      )}
    </>
  );
}
