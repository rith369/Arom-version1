'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Lock, Monitor, UserRound } from 'lucide-react';

import { usePro, type ActionResult } from './pro-provider';
import { useLanguage } from '../../_components/language-provider';
import {
  EMPTY_SOAP,
  MAX_SESSION_NOTE,
  SOAP_LABELS,
  SOAP_SECTIONS,
  sessionNoteLength,
  sessionNotePlain,
  type NoteFormat,
  type SessionRecord,
  type SoapNote,
  type SoapSection,
} from '../_data/bookings';

// Private session notes (one per session, only the professional reads them),
// as free text or SOAP. Saved on the server a moment after the professional
// stops typing, so a closed window or a dropped connection does not lose a
// long note. Note text is never kept in the browser's storage: the computer
// may be shared. Only the preferred format (free or SOAP) is remembered.

const TIME_ZONE = 'Asia/Phnom_Penh';
// Wait this long after the last key before saving, and longer after a failure.
const SAVE_AFTER = 1500;
const RETRY_AFTER = 8000;
const FORMAT_KEY = 'arom.pro.noteFormat';

export type NoteStatus = 'saved' | 'unsaved' | 'saving' | 'failed';
type Draft = { format: NoteFormat; text: string; soap: SoapNote };

function preferredFormat(): NoteFormat {
  try {
    return window.localStorage.getItem(FORMAT_KEY) === 'soap' ? 'soap' : 'free';
  } catch {
    return 'free';
  }
}

function rememberFormat(format: NoteFormat) {
  try {
    window.localStorage.setItem(FORMAT_KEY, format);
  } catch {
    // Not stored; the next note starts as free text.
  }
}

const isEmpty = (draft: Draft) => !draft.text.trim() && SOAP_SECTIONS.every((key) => !draft.soap[key].trim());

// The server trims every part, so spaces at either end are not a change.
function sameNote(draft: Draft, saved: SessionRecord | undefined) {
  if (!saved) return isEmpty(draft);
  if (isEmpty(draft)) return false;
  if (draft.format !== saved.format) return false;
  if (draft.format === 'free') return draft.text.trim() === saved.text.trim();
  return SOAP_SECTIONS.every((key) => draft.soap[key].trim() === saved.soap[key].trim());
}

export function useSessionNoteDraft(bookingId: string) {
  const { language } = useLanguage();
  const { sessionNotes, saveSessionNote } = usePro();
  const saved = sessionNotes[bookingId];
  const savedAt = saved?.updatedAt ?? null;
  const [draft, setDraft] = useState<Draft>(() =>
    saved ? { format: saved.format, text: saved.text, soap: saved.soap } : { format: preferredFormat(), text: '', soap: EMPTY_SOAP },
  );
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState('');

  // The latest values, for the timer and for saving when the editor closes.
  const latest = useRef({ draft, saved, save: saveSessionNote, saving: false });
  useEffect(() => {
    latest.current = { ...latest.current, draft, saved, save: saveSessionNote };
  });

  async function save(): Promise<ActionResult> {
    const current = latest.current;
    if (current.saving || sameNote(current.draft, current.saved)) return { ok: true };
    latest.current.saving = true;
    setSaving(true);
    const result = await current.save(bookingId, current.draft);
    latest.current.saving = false;
    setSaving(false);
    setFailure(result.ok ? '' : result.message);
    return result;
  }

  const dirty = !sameNote(draft, saved);

  // Save a moment after typing stops (and again if typing went on while saving).
  useEffect(() => {
    if (!dirty || saving) return;
    const id = window.setTimeout(() => void save(), failure ? RETRY_AFTER : SAVE_AFTER);
    return () => window.clearTimeout(id);
    // save reads the latest values from the ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, saved, saving, failure]);

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
      if (!current.saving && !sameNote(current.draft, current.saved)) void current.save(bookingId, current.draft);
    },
    [bookingId],
  );

  // Switching format keeps every word: free text becomes the first SOAP
  // section, and SOAP sections become free text with their headings.
  function setFormat(format: NoteFormat) {
    rememberFormat(format);
    setDraft((current) => {
      if (current.format === format) return current;
      if (format === 'soap') {
        const keepText = current.text.trim() && SOAP_SECTIONS.every((key) => !current.soap[key].trim());
        return { format, text: '', soap: keepText ? { ...EMPTY_SOAP, subjective: current.text } : current.soap };
      }
      const text = sessionNotePlain({ ...current, updatedAt: '' }, language === 'km');
      return { format, text, soap: EMPTY_SOAP };
    });
  }

  const status: NoteStatus = saving ? 'saving' : failure && dirty ? 'failed' : dirty ? 'unsaved' : 'saved';
  return {
    draft,
    setText: (text: string) => setDraft((current) => ({ ...current, text })),
    setSection: (key: SoapSection, value: string) => setDraft((current) => ({ ...current, soap: { ...current.soap, [key]: value } })),
    setFormat,
    length: sessionNoteLength(draft.format, draft.text, draft.soap),
    status,
    failure,
    savedAt,
    save,
  };
}

export type SessionNoteDraft = ReturnType<typeof useSessionNoteDraft>;

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

/** Free text or SOAP, with the format switch. `page` gives bigger boxes. */
export function SessionNoteFields({ note, km, page = false }: { note: SessionNoteDraft; km: boolean; page?: boolean }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const { draft } = note;
  const box = `w-full resize-y rounded-2xl border border-arom-border bg-white text-ink outline-none focus:border-arom focus:ring-4 focus:ring-arom/10 ${
    page ? 'p-4 text-base leading-7 sm:p-5' : 'px-3.5 py-2.5 text-sm leading-6'
  }`;
  // Each box may use what the rest of the note leaves of the limit.
  const room = (current: string) => MAX_SESSION_NOTE - (note.length - current.length);

  return (
    <div>
      <div role="radiogroup" aria-label={t('ទម្រង់កំណត់ចំណាំ', 'Note format')} className="inline-flex rounded-full border border-arom-border bg-white p-1">
        {(
          [
            ['free', t('អត្ថបទសេរី', 'Free text')],
            ['soap', 'SOAP'],
          ] as [NoteFormat, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={draft.format === value}
            onClick={() => note.setFormat(value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${draft.format === value ? 'bg-arom text-white' : 'text-ink-muted hover:bg-arom-wash'}`}>
            {label}
          </button>
        ))}
      </div>

      {draft.format === 'free' ? (
        <textarea
          value={draft.text}
          onChange={(event) => note.setText(event.target.value)}
          maxLength={room(draft.text)}
          rows={page ? undefined : 6}
          aria-label={t('កំណត់ចំណាំវគ្គ', 'Session note')}
          placeholder={t('សរសេរកំណត់ចំណាំរបស់អ្នកនៅទីនេះ...', 'Write your note here...')}
          className={`mt-3 ${box} ${page ? 'min-h-[55dvh]' : ''}`}
        />
      ) : (
        <div className="mt-3 space-y-4">
          {SOAP_SECTIONS.map((key) => (
            <label key={key} className="block">
              <span className="block text-sm font-semibold text-ink">
                {km ? SOAP_LABELS[key].km : `${SOAP_LABELS[key].en}: ${SOAP_LABELS[key].hint.toLowerCase()}`}
              </span>
              {km && <span className="block text-xs text-ink-muted">{SOAP_LABELS[key].kmHint}</span>}
              <textarea
                value={draft.soap[key]}
                onChange={(event) => note.setSection(key, event.target.value)}
                maxLength={room(draft.soap[key])}
                rows={page ? 6 : 3}
                className={`mt-1.5 ${box}`}
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function countWords(note: SessionNoteDraft) {
  const all = note.draft.format === 'soap' ? SOAP_SECTIONS.map((key) => note.draft.soap[key]).join(' ') : note.draft.text;
  // Khmer has no spaces between words, so this counts space separated parts.
  return all.trim() ? all.trim().split(/\s+/).length : 0;
}

/** /pro/bookings/<id>/note: a whole page for writing a long note. */
export function SessionNotePage({ bookingId }: { bookingId: string }) {
  const { bookings } = usePro();
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const booking = bookings.find((item) => item.id === bookingId);
  const note = useSessionNoteDraft(bookingId);

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
  const left = MAX_SESSION_NOTE - note.length;

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
        <NoteStatusLine status={note.status} failure={note.failure} savedAt={note.savedAt} km={km} />
      </header>

      <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted">
        <Lock size={12} aria-hidden="true" />
        {t('មានតែអ្នកទេដែលមើលឃើញ។ អ្នកគ្រប់គ្រង និងអតិថិជនមិនអាចមើលបានទេ។ រក្សាទុកដោយស្វ័យប្រវត្តិ។', 'Only you can see this. Not admins, not the client. Saved as you write.')}
      </p>

      <div className="mt-4 flex-1">
        <SessionNoteFields note={note} km={km} page />
      </div>

      <p className={`mt-2 text-right text-xs tabular-nums ${left < 1000 ? 'text-arom-warning' : 'text-ink-muted'}`}>
        {t(`${countWords(note)} ពាក្យ · នៅសល់ ${left} តួអក្សរ`, `${countWords(note)} words · ${left} characters left`)}
      </p>
    </div>
  );
}

/**
 * A saved note to read: long notes fold after a few lines with Show more.
 * With `planFirst`, a SOAP note shows its Plan on top (Prepare).
 */
export function SessionNotePreview({ note, km, planFirst = false }: { note: SessionRecord; km: boolean; planFirst?: boolean }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [open, setOpen] = useState(false);
  const plain = sessionNotePlain(note, km);
  const plan = note.format === 'soap' ? note.soap.plan.trim() : '';
  const showPlan = planFirst && Boolean(plan);
  const long = plain.length > 400 || plain.split('\n').length > 6;

  return (
    <div>
      {showPlan && (
        <div className="rounded-2xl border border-arom/25 bg-arom-soft/60 p-3.5">
          <p className="text-xs font-semibold text-arom-deep">{km ? SOAP_LABELS.plan.km : SOAP_LABELS.plan.en}</p>
          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-ink">{plan}</p>
        </div>
      )}

      {(!showPlan || open) &&
        (open && note.format === 'soap' ? (
          <dl className={`space-y-3 ${showPlan ? 'mt-3' : ''}`}>
            {SOAP_SECTIONS.filter((key) => note.soap[key].trim() && !(showPlan && key === 'plan')).map((key) => (
              <div key={key}>
                <dt className="text-xs font-semibold text-ink-muted">{km ? SOAP_LABELS[key].km : SOAP_LABELS[key].en}</dt>
                <dd className="mt-0.5 whitespace-pre-line text-sm leading-6 text-ink">{note.soap[key]}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className={`whitespace-pre-line text-sm leading-6 text-ink ${!open && long ? 'line-clamp-6' : ''}`}>{plain}</p>
        ))}

      {(long || showPlan) && (
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="mt-1.5 text-xs font-semibold text-arom hover:underline">
          {open ? t('បង្ហាញតិច', 'Show less') : showPlan ? t('បង្ហាញកំណត់ចំណាំពេញ', 'Show the full note') : t('បង្ហាញបន្ថែម', 'Show more')}
        </button>
      )}
    </div>
  );
}
