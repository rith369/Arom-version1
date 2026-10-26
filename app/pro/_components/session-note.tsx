'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Lock, Monitor, UserRound } from 'lucide-react';

import { usePro, type ActionResult } from './pro-provider';
import { useLanguage } from '../../_components/language-provider';
import { MAX_NOTE } from '../_data/bookings';

// Private session notes (one per session, only the professional reads them).
// Saved on the server a moment after the professional stops typing, so a
// closed window or a dropped connection does not lose a long note. Drafts are
// never kept in the browser's storage: the computer may be shared.

const TIME_ZONE = 'Asia/Phnom_Penh';
// Wait this long after the last key before saving, and longer after a failure.
const SAVE_AFTER = 1500;
const RETRY_AFTER = 8000;

export type NoteStatus = 'saved' | 'unsaved' | 'saving' | 'failed';

// The server trims the note, so spaces at either end are not a change.
const same = (a: string, b: string) => a.trim() === b.trim();

export function useSessionNoteDraft(bookingId: string) {
  const { sessionNotes, saveSessionNote } = usePro();
  const savedText = sessionNotes[bookingId]?.text ?? '';
  const savedAt = sessionNotes[bookingId]?.updatedAt ?? null;
  const [text, setText] = useState(savedText);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState('');

  // The latest values, for the timer and for saving when the editor closes.
  const latest = useRef({ text, savedText, save: saveSessionNote, saving: false });
  useEffect(() => {
    latest.current = { ...latest.current, text, savedText, save: saveSessionNote };
  });

  async function save(): Promise<ActionResult> {
    const current = latest.current;
    if (current.saving || same(current.text, current.savedText)) return { ok: true };
    latest.current.saving = true;
    setSaving(true);
    const result = await current.save(bookingId, current.text);
    latest.current.saving = false;
    setSaving(false);
    setFailure(result.ok ? '' : result.message);
    return result;
  }

  const dirty = !same(text, savedText);

  // Save a moment after typing stops (and again if typing went on while saving).
  useEffect(() => {
    if (!dirty || saving) return;
    const id = window.setTimeout(() => void save(), failure ? RETRY_AFTER : SAVE_AFTER);
    return () => window.clearTimeout(id);
    // save reads the latest values from the ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, savedText, saving, failure]);

  // Closing the tab with unsaved text asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // Leaving the editor inside the app saves what is left.
  useEffect(
    () => () => {
      const current = latest.current;
      if (!current.saving && !same(current.text, current.savedText)) void current.save(bookingId, current.text);
    },
    [bookingId],
  );

  const status: NoteStatus = saving ? 'saving' : failure && dirty ? 'failed' : dirty ? 'unsaved' : 'saved';
  return { text, setText, status, failure, savedAt, save };
}

/** "Saved 14:32", "Saving...", or why it failed, in a live region. */
export function NoteStatusLine({ status, failure, savedAt, km }: { status: NoteStatus; failure: string; savedAt: string | null; km: boolean }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const time = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TIME_ZONE });
  return (
    <span role="status" aria-live="polite" className={`text-xs ${status === 'failed' ? 'text-arom-danger' : 'text-ink-muted'}`}>
      {status === 'saving'
        ? t('កំពុងរក្សាទុក...', 'Saving...')
        : status === 'failed'
          ? t(`មិនទាន់បានរក្សាទុក។ នឹងព្យាយាមម្តងទៀត។ ${failure}`, `Not saved yet. Trying again. ${failure}`)
          : status === 'unsaved'
            ? t('កំពុងសរសេរ...', 'Writing...')
            : savedAt
              ? t(`បានរក្សាទុក ${time.format(new Date(savedAt))}`, `Saved ${time.format(new Date(savedAt))}`)
              : ''}
    </span>
  );
}

function countWords(text: string) {
  // Khmer has no spaces between words, so this counts space separated parts.
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/** /pro/bookings/<id>/note: a whole page for writing a long note. */
export function SessionNotePage({ bookingId }: { bookingId: string }) {
  const { bookings } = usePro();
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const booking = bookings.find((item) => item.id === bookingId);
  const draft = useSessionNoteDraft(bookingId);

  if (!booking) {
    return (
      <div className="rounded-3xl border border-arom-border bg-white p-10 text-center">
        <p className="font-medium text-ink">{t('រកមិនឃើញវគ្គនេះទេ', 'This session was not found')}</p>
        <Link href="/pro/bookings" className="mt-4 inline-block text-sm font-semibold text-arom underline">
          {t('ត្រឡប់ទៅការកក់របស់ខ្ញុំ', 'Back to My bookings')}
        </Link>
      </div>
    );
  }

  const when = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: TIME_ZONE,
  }).format(new Date(booking.startsAt));
  const left = MAX_NOTE - draft.text.length;

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col">
      <Link href={`/pro/clients/${booking.clientId}`} className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-arom hover:underline">
        <ArrowLeft size={16} aria-hidden="true" />
        {t('ឯកសារអតិថិជន', 'Client file')}
      </Link>

      <header className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{t('កំណត់ចំណាំវគ្គ', 'Session note')}</h1>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-ink-muted">
            <span className="font-semibold text-ink">{booking.clientName}</span>
            <span>{when}</span>
            <span className="inline-flex items-center gap-1">
              {booking.sessionType === 'online' ? <Monitor size={13} aria-hidden="true" /> : <UserRound size={13} aria-hidden="true" />}
              {booking.sessionType === 'online' ? t('អនឡាញ', 'Online') : t('ជួបផ្ទាល់', 'In person')}
            </span>
          </p>
        </div>
        <NoteStatusLine status={draft.status} failure={draft.failure} savedAt={draft.savedAt} km={km} />
      </header>

      <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted">
        <Lock size={12} aria-hidden="true" />
        {t('មានតែអ្នកទេដែលមើលឃើញ។ អ្នកគ្រប់គ្រង និងអតិថិជនមិនអាចមើលបានទេ។ រក្សាទុកដោយស្វ័យប្រវត្តិ។', 'Only you can see this. Not admins, not the client. Saved as you write.')}
      </p>

      <textarea
        value={draft.text}
        onChange={(event) => draft.setText(event.target.value)}
        maxLength={MAX_NOTE}
        autoFocus
        aria-label={t('កំណត់ចំណាំវគ្គ', 'Session note')}
        placeholder={t('សរសេរកំណត់ចំណាំរបស់អ្នកនៅទីនេះ...', 'Write your note here...')}
        className="mt-4 min-h-[60dvh] w-full flex-1 resize-y rounded-3xl border border-arom-border bg-white p-5 text-base leading-7 text-ink shadow-card outline-none focus:border-arom focus:ring-4 focus:ring-arom/10 sm:p-6"
      />

      <p className={`mt-2 text-right text-xs tabular-nums ${left < 500 ? 'text-arom-warning' : 'text-ink-muted'}`}>
        {t(`${countWords(draft.text)} ពាក្យ · នៅសល់ ${left} តួអក្សរ`, `${countWords(draft.text)} words · ${left} characters left`)}
      </p>
    </div>
  );
}
