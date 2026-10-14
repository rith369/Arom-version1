'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CalendarCheck, CheckCircle2, X } from 'lucide-react';

import { usePro } from './pro-provider';
import { useLanguage } from '../../_components/language-provider';
import { conversationId, sendMessage } from '../../_components/messages/message-store';
import {
  MAX_SUGGESTED_TIMES,
  MAX_SUGGESTION_NOTE,
  REPEAT_OPTIONS,
  createSuggestion,
  seriesTimes,
  type SessionRepeat,
} from '../../_components/sessions/session-store';
import type { SessionType } from '../_data/profile';
import { cambodiaDate, openSlots } from '../_data/schedule';

const TIME_ZONE = 'Asia/Phnom_Penh';
// Suggested first sessions fall within the next three weeks.
const SUGGEST_DAYS = 21;

// The professional offers up to three times; the client picks one in Messages.
export function SuggestSessionDialog({
  clientId,
  clientName,
  defaultType,
  onClose,
}: {
  clientId: string;
  clientName: string;
  defaultType: SessionType;
  onClose: () => void;
}) {
  const { profile, schedule, bookings } = usePro();
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const locale = km ? 'km-KH' : 'en-GB';

  const [now] = useState(() => Date.now());
  const types = profile.sessionTypes.length > 0 ? profile.sessionTypes : [defaultType];
  const [sessionType, setSessionType] = useState<SessionType>(types.includes(defaultType) ? defaultType : types[0]);
  const [repeatIndex, setRepeatIndex] = useState(0);
  const [times, setTimes] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const repeat: SessionRepeat = REPEAT_OPTIONS[repeatIndex].value;
  const lastOffset = (repeat.count - 1) * repeat.everyWeeks * 7;

  // Every open time of this type, far enough ahead to cover the whole series.
  const allSlots = openSlots(schedule, {
    fromDate: cambodiaDate(now),
    days: SUGGEST_DAYS + lastOffset,
    now,
    booked: bookings.filter((item) => item.status === 'booked'),
  }).filter((slot) => slot.sessionTypes.includes(sessionType));
  const free = new Set(allSlots.map((slot) => Date.parse(`${slot.date}T${slot.start}:00+07:00`)));
  const candidates = allSlots
    .map((slot) => ({ ...slot, value: `${slot.date}T${slot.start}:00+07:00` }))
    .filter((slot) => Date.parse(slot.value) < now + SUGGEST_DAYS * 86_400_000)
    // The whole series must fit the schedule, not only the first session.
    .filter((slot) => seriesTimes(slot.value, repeat).every((time) => free.has(Date.parse(time))));
  const days = [...new Set(candidates.map((slot) => slot.date))].slice(0, 8);

  const dayFormat = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', timeZone: TIME_ZONE });
  const needsLink = sessionType === 'online' && !schedule.meetingUrl;

  function toggle(value: string) {
    setError('');
    if (times.includes(value)) setTimes(times.filter((item) => item !== value));
    else if (times.length < MAX_SUGGESTED_TIMES) setTimes([...times, value]);
    else setError(t(`អាចណែនាំបានច្រើនបំផុត ${MAX_SUGGESTED_TIMES} ម៉ោង។`, `You can suggest up to ${MAX_SUGGESTED_TIMES} times.`));
  }

  function send() {
    if (times.length === 0) {
      setError(t('សូមជ្រើសរើសយ៉ាងហោចណាស់មួយម៉ោង។', 'Choose at least one time.'));
      return;
    }
    const suggestion = createSuggestion({
      professionalId: profile.slug,
      clientId,
      clientName,
      sessionType,
      durationMinutes: schedule.sessionMinutes,
      times: [...times].sort(),
      repeat,
      note: note.trim(),
      meetingUrl: sessionType === 'online' ? schedule.meetingUrl || null : null,
    });
    void sendMessage(
      {
        id: conversationId(profile.slug, clientId),
        professionalId: profile.slug,
        professionalName: profile.displayName,
        kmProfessionalName: profile.kmDisplayName,
        clientId,
        clientName,
      },
      'professional',
      { kind: 'suggestion', suggestionId: suggestion.id },
    );
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="suggest-title">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 text-ink shadow-xl sm:rounded-3xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="suggest-title" className="flex items-center gap-2 text-lg font-bold">
              <CalendarCheck size={19} aria-hidden="true" className="text-arom" />
              {t('ណែនាំវគ្គបន្ទាប់', 'Suggest the next session')}
            </h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              {t(`${clientName} ទទួលបានម៉ោងទាំងនេះក្នុងសារ ហើយជ្រើសរើសមួយ។`, `${clientName} gets these times in Messages and picks one.`)}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label={t('បិទ', 'Close')} className="rounded-full p-2 hover:bg-arom-wash">
            <X size={20} />
          </button>
        </div>

        {sent ? (
          <div className="mt-6 rounded-2xl bg-arom-wash p-5 text-center">
            <CheckCircle2 size={28} aria-hidden="true" className="mx-auto text-arom" />
            <p className="mt-2 font-semibold">{t('បានផ្ញើ', 'Sent')}</p>
            <p className="mt-1 text-sm text-ink-muted">
              {t(`ពេល ${clientName} កក់ វានឹងបង្ហាញក្នុងការកក់របស់ខ្ញុំ។`, `When ${clientName} books, it shows in My bookings.`)}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link href={`/pro/messages/${clientId}`} className="rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep">
                {t('បើកសារ', 'Open the chat')}
              </Link>
              <button type="button" onClick={onClose} className="rounded-full border border-arom-border px-4 py-2 text-sm font-medium hover:bg-arom-wash">
                {t('បិទ', 'Close')}
              </button>
            </div>
          </div>
        ) : (
          <>
            {types.length > 1 && (
              <fieldset className="mt-5">
                <legend className="text-sm font-semibold">{t('ប្រភេទវគ្គ', 'Session type')}</legend>
                <div className="mt-2 flex gap-2">
                  {types.map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={sessionType === value}
                      onClick={() => {
                        setSessionType(value);
                        setTimes([]);
                      }}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium ${sessionType === value ? 'border-arom bg-arom text-white' : 'border-arom-border bg-white hover:bg-arom-wash'}`}>
                      {value === 'online' ? t('អនឡាញ', 'Online') : t('ជួបផ្ទាល់', 'In person')}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <label className="mt-5 block text-sm font-semibold">
              {t('ធ្វើម្តងទៀត', 'Repeat')}
              <select
                value={repeatIndex}
                onChange={(event) => {
                  setRepeatIndex(Number(event.target.value));
                  setTimes([]);
                }}
                className="mt-1.5 block w-full rounded-xl border border-arom-border bg-white px-3.5 py-2.5 text-sm font-normal">
                {REPEAT_OPTIONS.map((option, index) => (
                  <option key={option.en} value={index}>
                    {km ? option.km : option.en}
                  </option>
                ))}
              </select>
              {repeat.count > 1 && (
                <span className="mt-1 block text-xs font-normal text-ink-muted">
                  {t('បង្ហាញតែម៉ោងដែលទំនេរសម្រាប់គ្រប់វគ្គទាំងអស់។', 'Only times that are free for every session in the series are shown.')}
                </span>
              )}
            </label>

            <fieldset className="mt-5">
              <legend className="text-sm font-semibold">
                {t(`ជ្រើសរើសរហូតដល់ ${MAX_SUGGESTED_TIMES} ម៉ោង`, `Choose up to ${MAX_SUGGESTED_TIMES} times`)}{' '}
                <span className="font-normal text-ink-muted">({times.length}/{MAX_SUGGESTED_TIMES})</span>
              </legend>
              {days.length === 0 ? (
                <p className="mt-2 rounded-2xl bg-arom-wash p-3.5 text-sm text-ink-muted">
                  {t('គ្មានម៉ោងទំនេរក្នុង ៣ សប្តាហ៍ខាងមុខទេ។ ', 'No open times in the next 3 weeks. ')}
                  <Link href="/pro/schedule" className="font-semibold text-arom underline">
                    {t('បើកម៉ោងបន្ថែម', 'Open more times')}
                  </Link>
                </p>
              ) : (
                <div className="mt-2 space-y-3">
                  {days.map((date) => (
                    <div key={date}>
                      <p className="text-xs font-semibold">{dayFormat.format(new Date(`${date}T12:00:00+07:00`))}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {candidates
                          .filter((slot) => slot.date === date)
                          .map((slot) => (
                            <button
                              key={slot.value}
                              type="button"
                              aria-pressed={times.includes(slot.value)}
                              onClick={() => toggle(slot.value)}
                              className={`rounded-lg border px-2.5 py-1 text-xs font-medium tabular-nums ${times.includes(slot.value) ? 'border-arom bg-arom text-white' : 'border-arom-border bg-white text-arom-deep hover:border-arom/50'}`}>
                              {slot.start}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </fieldset>

            <label className="mt-5 block text-sm font-semibold">
              {t('កំណត់ចំណាំទៅអតិថិជន (ស្រេចចិត្ត)', 'Note to the client (optional)')}
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={2}
                maxLength={MAX_SUGGESTION_NOTE}
                placeholder={t('ឧ. យើងនឹងបន្តនិយាយអំពីការគេង។', 'For example: we will keep working on sleep.')}
                className="mt-1.5 w-full rounded-xl border border-arom-border px-3.5 py-2.5 text-sm font-normal outline-none focus:border-arom focus:ring-4 focus:ring-arom/10"
              />
            </label>

            {needsLink && (
              <p className="mt-3 rounded-xl bg-arom-warning-soft px-3.5 py-2.5 text-sm text-arom-warning">
                {t('អ្នកមិនទាន់មានតំណប្រជុំទេ។ ', 'You have no meeting link yet. ')}
                <Link href="/pro/schedule#meeting-link" className="font-semibold underline">
                  {t('បន្ថែមក្នុងកាលវិភាគរបស់ខ្ញុំ', 'Add it in My schedule')}
                </Link>
              </p>
            )}

            {error && (
              <p role="alert" className="mt-3 text-sm text-arom-danger">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={onClose} className="rounded-full border border-arom-border px-4 py-2 text-sm font-medium hover:bg-arom-wash">
                {t('បោះបង់', 'Cancel')}
              </button>
              <button type="button" onClick={send} className="rounded-full bg-arom px-5 py-2 text-sm font-semibold text-white hover:bg-arom-deep">
                {t('ផ្ញើទៅអតិថិជន', 'Send to the client')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
