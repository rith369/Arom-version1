'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Building2, CalendarCheck, CalendarClock, CalendarDays, CheckCircle2, ClipboardList, FileText, FolderOpen, List, Link2, Lock, MessageCircle, Monitor, NotebookPen, Repeat, Target, UserRound, UserX, X, XCircle } from 'lucide-react';

import { AddTaskDialog } from './care-plan-card';
import { usePro } from './pro-provider';
import { SuggestSessionDialog } from './suggest-session-dialog';
import { WeekCalendar } from './week-calendar';
import { cambodiaToday } from '../../_components/care/care-store';
import { useLanguage } from '../../_components/language-provider';
import { JoinButton } from '../../_components/sessions/join-button';
import { seriesPosition } from '../../_components/sessions/session-store';
import { MAX_NOTE, MAX_REASON, type ProBooking } from '../_data/bookings';
import { JOIN_OPENS_MINUTES, cambodiaDate, isMeetingUrl, openSlots } from '../_data/schedule';

type Tab = 'upcoming' | 'past';
type Action = 'reschedule' | 'cancel' | null;

const TIME_ZONE = 'Asia/Phnom_Penh';
const endOf = (booking: ProBooking) => Date.parse(booking.startsAt) + booking.durationMinutes * 60_000;

function useFormats(km: boolean) {
  const locale = km ? 'km-KH' : 'en-GB';
  return {
    time: new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TIME_ZONE }),
    day: new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: TIME_ZONE }),
    short: new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', timeZone: TIME_ZONE }),
    stamp: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TIME_ZONE }),
  };
}

const textareaClass =
  'mt-2 w-full rounded-xl border border-arom/30 bg-arom-wash/60 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-arom focus:bg-white focus:ring-4 focus:ring-arom/10';

export function BookingDialog({
  booking,
  now,
  onClose,
  showClientLink = true,
}: {
  booking: ProBooking;
  now: number;
  onClose: () => void;
  showClientLink?: boolean;
}) {
  const { bookings, schedule, sessionNotes, cancelBooking, rescheduleBooking, setBookingOutcome, saveSessionNote, setMeetingLink, archivedClients, profile } = usePro();
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const formats = useFormats(km);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [action, setAction] = useState<Action>(null);
  const [reason, setReason] = useState('');
  const [newStart, setNewStart] = useState('');
  const [error, setError] = useState('');
  const [note, setNote] = useState(sessionNotes[booking.id]?.text ?? '');
  const [noteSaved, setNoteSaved] = useState('');
  const [link, setLink] = useState(booking.meetingUrl ?? '');
  const [linkStatus, setLinkStatus] = useState('');
  const [nextStep, setNextStep] = useState<'task' | 'suggest' | null>(null);
  const [busy, setBusy] = useState(false);
  const [outcomeError, setOutcomeError] = useState('');
  const [today] = useState(() => cambodiaToday(Date.now()));

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  const isUpcoming = booking.status === 'booked' && endOf(booking) > now;
  const needsOutcome = booking.status === 'booked' && endOf(booking) <= now;
  const savedNote = sessionNotes[booking.id];
  const ended = booking.status !== 'cancelled' && endOf(booking) <= now;
  const series = seriesPosition(bookings, booking);
  const archived = archivedClients.includes(booking.clientId);

  async function saveLink() {
    const value = link.trim();
    if (value && !isMeetingUrl(value)) {
      setLinkStatus(t('សូមបញ្ចូលតំណពេញ ចាប់ផ្តើមដោយ https://', 'Enter a full link that starts with https://'));
      return;
    }
    const result = await setMeetingLink(booking.id, value);
    setLinkStatus(result.ok ? t('បានរក្សាទុក។ អតិថិជនឃើញតំណនេះ។', 'Saved. The client sees this link.') : result.message);
  }

  async function recordOutcome(status: 'completed' | 'no_show') {
    setOutcomeError('');
    const result = await setBookingOutcome(booking.id, status);
    if (!result.ok) setOutcomeError(result.message);
  }

  // Open times that fit this session's type, leaving out every other booking.
  const slots = openSlots(schedule, {
    fromDate: cambodiaDate(now),
    days: schedule.bookingWindowWeeks * 7,
    now,
    booked: bookings.filter((item) => item.id !== booking.id && item.status !== 'cancelled'),
  }).filter(
    (slot) =>
      slot.sessionTypes.includes(booking.sessionType) &&
      // Not the time the session already has.
      Date.parse(`${slot.date}T${slot.start}:00+07:00`) !== Date.parse(booking.startsAt),
  );
  const slotDays = [...new Set(slots.map((slot) => slot.date))].slice(0, 6);

  async function confirmAction() {
    if (busy) return;
    if (!reason.trim()) {
      setError(t('សូមសរសេរមូលហេតុ។ អតិថិជននឹងឃើញវា។', 'Write a reason. The client will see it.'));
      return;
    }
    if (action === 'reschedule') {
      if (!newStart) {
        setError(t('សូមជ្រើសរើសម៉ោងថ្មី។', 'Choose a new time.'));
        return;
      }
    }
    setBusy(true);
    const result =
      action === 'reschedule'
        ? await rescheduleBooking(booking.id, newStart, reason.trim())
        : await cancelBooking(booking.id, reason.trim());
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onClose();
  }

  const typeLabel = booking.sessionType === 'online' ? t('អនឡាញ', 'Online') : t('ជួបផ្ទាល់', 'In person');
  const start = new Date(booking.startsAt);

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      aria-labelledby="pro-booking-title"
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-3xl border border-arom-border bg-white p-0 text-ink shadow-card backdrop:bg-ink/35">
      <header className="flex items-start justify-between gap-4 border-b border-arom-border p-5 sm:p-6">
        <div>
          <h2 id="pro-booking-title" className="text-xl font-bold">{booking.clientName}</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {formats.day.format(start)}, {formats.time.format(start)} · {booking.durationMinutes} {t('នាទី', 'min')} · {typeLabel}
          </p>
          {series && (
            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-arom-deep">
              <Repeat size={13} aria-hidden="true" />
              {t(`វគ្គទី ${series.index} ក្នុងចំណោម ${series.total} ដែលធ្វើម្តងទៀត`, `Session ${series.index} of ${series.total} in a repeating series`)}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {showClientLink && (
              <Link href={`/pro/clients/${booking.clientId}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-arom hover:underline">
                <FolderOpen size={15} aria-hidden="true" />
                {t('បើកឯកសារអតិថិជន', 'Open client file')}
              </Link>
            )}
            <Link href={`/pro/messages/${booking.clientId}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-arom hover:underline">
              <MessageCircle size={15} aria-hidden="true" />
              {t('ផ្ញើសារ', 'Message client')}
            </Link>
            {booking.status !== 'cancelled' && (
              <Link href={`/pro/bookings/${booking.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-arom hover:underline">
                <Target size={15} aria-hidden="true" />
                {t('រៀបចំ', 'Prepare')}
              </Link>
            )}
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label={t('បិទ', 'Close')} className="rounded-full p-2 hover:bg-arom-wash">
          <X size={20} />
        </button>
      </header>

      <div className="space-y-5 p-5 sm:p-6">
        {booking.clinic && (
          <p className="flex items-start gap-2 rounded-2xl bg-arom-soft p-3.5 text-sm text-ink">
            <Building2 size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-arom" />
            <span>
              <span className="font-semibold">{booking.clinic.name}</span>
              {booking.sessionType === 'in_person' && booking.clinic.address && ` · ${booking.clinic.address}`}
              <span className="block text-xs text-ink-muted">
                {t(
                  'វគ្គនេះកក់តាមរយៈគ្លីនិក។ តុបម្រើគ្លីនិកជាអ្នកប្តូរម៉ោង ឬបោះបង់វា។',
                  'Booked through the clinic. The clinic desk moves or cancels it.',
                )}
              </span>
            </span>
          </p>
        )}

        {booking.rescheduledFrom && (
          <p className="rounded-2xl bg-arom-wash p-3.5 text-sm text-ink">
            {booking.rescheduledBy === 'client'
              ? t('អតិថិជនបានប្តូរវគ្គនេះពី', 'The client moved this session from')
              : booking.clinic
                ? t('គ្លីនិកបានប្តូរវគ្គនេះពី', 'The clinic moved this session from')
                : t('បានប្តូរពី', 'Moved from')}{' '}
            {formats.stamp.format(new Date(booking.rescheduledFrom))}.{' '}
            <span className="text-ink-muted">{booking.rescheduleReason}</span>
          </p>
        )}

        {booking.status === 'cancelled' && (
          <p className="rounded-2xl bg-arom-danger-soft p-3.5 text-sm text-ink">
            <span className="font-semibold text-arom-danger">
              {booking.cancelledBy === 'professional'
                ? t('អ្នកបានបោះបង់', 'You cancelled this session.')
                : booking.cancelledBy === 'admin' && booking.clinic
                  ? t('គ្លីនិកបានបោះបង់វគ្គនេះ។', 'The clinic cancelled this session.')
                  : booking.cancelledBy === 'admin'
                  ? t('អ្នកគ្រប់គ្រង AROM បានបោះបង់', 'The AROM team cancelled this session.')
                  : t('អតិថិជនបានបោះបង់', 'The client cancelled this session.')}
            </span>{' '}
            {booking.cancelReason}
          </p>
        )}

        {booking.sessionType === 'online' && booking.status === 'booked' && !ended && (
          <section className="rounded-2xl border border-arom-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                <Link2 size={16} aria-hidden="true" className="text-arom" />
                {t('តំណប្រជុំ', 'Meeting link')}
              </h3>
              <JoinButton booking={booking} now={now} km={km} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                type="url"
                value={link}
                onChange={(event) => {
                  setLink(event.target.value);
                  setLinkStatus('');
                }}
                placeholder="https://meet.google.com/..."
                aria-label={t('តំណប្រជុំសម្រាប់វគ្គនេះ', 'Meeting link for this session')}
                className="min-w-0 flex-1 rounded-xl border border-arom-border px-3 py-2 text-sm outline-none focus:border-arom focus:ring-4 focus:ring-arom/10"
              />
              <button
                type="button"
                disabled={link.trim() === (booking.meetingUrl ?? '')}
                onClick={() => void saveLink()}
                className="rounded-full border border-arom-border px-4 py-2 text-sm font-medium text-arom hover:bg-arom-wash disabled:opacity-40">
                {t('រក្សាទុក', 'Save')}
              </button>
            </div>
            <p role="status" aria-live="polite" className="mt-1.5 text-xs text-ink-muted">
              {linkStatus ||
                (booking.meetingUrl
                  ? t(`អតិថិជនអាចចូលរួម ${JOIN_OPENS_MINUTES} នាទីមុនម៉ោងចាប់ផ្តើម។`, `The client can join from ${JOIN_OPENS_MINUTES} minutes before the start.`)
                  : t('មិនទាន់មានតំណ។ អតិថិជនមិនអាចចូលរួមបានទេ រហូតដល់អ្នកបន្ថែមតំណ។', 'No link yet. The client cannot join until you add one.'))}
            </p>
          </section>
        )}

        {ended && booking.status !== 'cancelled' && (
          <section className="rounded-2xl bg-arom-wash/70 p-4">
            <h3 className="text-sm font-bold text-ink">{t('ក្រោយវគ្គ', 'After the session')}</h3>
            {needsOutcome ? (
              <>
                <p className="mt-1 text-xs text-ink-muted">{t('ជំហានទី ១: វគ្គនេះយ៉ាងម៉េចដែរ?', 'Step 1: how did this session go?')}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => void recordOutcome('completed')} className="flex items-center gap-2 rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep">
                    <CheckCircle2 size={16} aria-hidden="true" />
                    {t('បានបញ្ចប់', 'Completed')}
                  </button>
                  <button type="button" onClick={() => void recordOutcome('no_show')} className="flex items-center gap-2 rounded-full border border-arom-border bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-arom-wash">
                    <UserX size={16} aria-hidden="true" />
                    {t('អតិថិជនមិនបានមក', 'Client did not come')}
                  </button>
                </div>
                {outcomeError && <p role="alert" className="mt-2 text-xs text-arom-danger">{outcomeError}</p>}
              </>
            ) : (
              <>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                  <CheckCircle2 size={13} aria-hidden="true" className="text-arom" />
                  {booking.status === 'completed' ? t('បានកត់ថាបានបញ្ចប់។', 'Marked as completed.') : t('បានកត់ថាអតិថិជនមិនបានមក។', 'Marked as did not come.')}
                </p>
                {archived ? (
                  <p className="mt-2 text-xs text-ink-muted">{t('អតិថិជននេះត្រូវបានដាក់ជាអតិថិជនចាស់។', 'This client is archived.')}</p>
                ) : (
                  <>
                    <p className="mt-3 text-xs font-semibold text-ink">{t('ជំហានបន្ទាប់', 'Next steps')}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {booking.status === 'completed' && (
                        <button type="button" onClick={() => setNextStep('task')} className="flex items-center gap-2 rounded-full border border-arom-border bg-white px-4 py-2 text-sm font-medium text-arom hover:bg-arom-wash">
                          <ClipboardList size={16} aria-hidden="true" />
                          {t('ផ្ដល់កិច្ចការថែទាំ', 'Give a care task')}
                        </button>
                      )}
                      {/* Clinic therapists: the student books the next session through the clinic. */}
                      {!profile.clinic && (
                        <button type="button" onClick={() => setNextStep('suggest')} className="flex items-center gap-2 rounded-full border border-arom-border bg-white px-4 py-2 text-sm font-medium text-arom hover:bg-arom-wash">
                          <CalendarCheck size={16} aria-hidden="true" />
                          {t('ណែនាំវគ្គបន្ទាប់', 'Suggest the next session')}
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-ink-muted">{t('ហើយសរសេរកំណត់ចំណាំឯកជនខាងក្រោម។', 'Then write your private note below.')}</p>
                  </>
                )}
              </>
            )}
          </section>
        )}

        <section>
          <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
            <FileText size={16} aria-hidden="true" className="text-arom" />
            {t('មុនការពិគ្រោះ', 'Before the session')}
          </h3>
          {booking.intakeAnswers.length === 0 && !booking.intakeNote ? (
            <p className="mt-1 text-xs text-ink-muted">{t('វគ្គតាមដាន ដែលកក់ពីការណែនាំរបស់អ្នក។ គ្មានចម្លើយថ្មីទេ។', 'A follow up booked from your suggestion. No new answers.')}</p>
          ) : (
            <p className="mt-1 text-xs text-ink-muted">{t('អតិថិជនបានចែករំលែកព័ត៌មាននេះសម្រាប់វគ្គនេះតែប៉ុណ្ណោះ។', 'The client shared this for this session only.')}</p>
          )}
          {booking.intakeNote && (
            <p className="mt-3 rounded-2xl bg-arom-wash/70 p-3.5 text-sm leading-6 text-ink">&ldquo;{booking.intakeNote}&rdquo;</p>
          )}
          <dl className="mt-3 space-y-3">
            {booking.intakeAnswers.map((item) => (
              <div key={item.question.en}>
                <dt className="text-xs font-medium text-ink-muted">{km ? item.question.km : item.question.en}</dt>
                <dd className="mt-0.5 text-sm text-ink">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        {isUpcoming && action === null && (
          <div className="flex flex-wrap gap-2 border-t border-arom-border pt-5">
            {!booking.clinic && (
              <button type="button" onClick={() => setAction('reschedule')} className="flex items-center gap-2 rounded-full border border-arom-border px-4 py-2 text-sm font-medium text-arom hover:bg-arom-wash">
                <CalendarClock size={16} aria-hidden="true" />
                {t('ប្តូរពេល', 'Reschedule')}
              </button>
            )}
            <button type="button" onClick={() => setAction('cancel')} className="flex items-center gap-2 rounded-full border border-arom-danger/25 px-4 py-2 text-sm font-medium text-arom-danger hover:bg-arom-danger-soft">
              <XCircle size={16} aria-hidden="true" />
              {t('បោះបង់វគ្គ', 'Cancel session')}
            </button>
          </div>
        )}

        {isUpcoming && action !== null && (
          <section className={`rounded-2xl p-4 ${action === 'cancel' ? 'bg-arom-danger-soft' : 'bg-arom-wash'}`}>
            <h3 className="text-sm font-bold text-ink">
              {action === 'cancel' ? t('បោះបង់វគ្គនេះ?', 'Cancel this session?') : t('ប្តូរទៅម៉ោងថ្មី', 'Move to a new time')}
            </h3>

            {action === 'reschedule' && (
              <div className="mt-3 space-y-3">
                {slotDays.length === 0 ? (
                  <p className="text-sm text-ink-muted">{t('គ្មានម៉ោងទំនេរក្នុងកាលវិភាគរបស់អ្នកទេ។', 'No open times in your schedule.')}</p>
                ) : (
                  slotDays.map((date) => (
                    <div key={date}>
                      <p className="text-xs font-semibold text-ink">{formats.short.format(new Date(`${date}T12:00:00+07:00`))}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {slots
                          .filter((slot) => slot.date === date)
                          .map((slot) => {
                            const value = `${slot.date}T${slot.start}:00+07:00`;
                            return (
                              <button
                                key={value}
                                type="button"
                                aria-pressed={newStart === value}
                                onClick={() => {
                                  setNewStart(value);
                                  setError('');
                                }}
                                className={`rounded-lg border px-2.5 py-1 text-xs font-medium tabular-nums ${newStart === value ? 'border-arom bg-arom text-white' : 'border-arom-border bg-white text-arom-deep hover:border-arom/50'}`}>
                                {slot.start}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <label className="mt-4 block text-sm font-medium text-ink">
              {t('មូលហេតុ (អតិថិជននឹងឃើញ) *', 'Reason (the client will see it) *')}
              <textarea
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                  setError('');
                }}
                rows={2}
                maxLength={MAX_REASON}
                className={`${textareaClass} bg-white`}
              />
            </label>
            <p className="mt-1 text-xs text-ink-muted">
              {action === 'cancel'
                ? t('អតិថិជននឹងទទួលបានការជូនដំណឹង ហើយអាចកក់ម៉ោងផ្សេង។', 'The client is told and can book another time.')
                : t('អតិថិជននឹងទទួលបានការជូនដំណឹង ហើយអាចបោះបង់បាន ប្រសិនបើម៉ោងថ្មីមិនស្រួល។', 'The client is told and can cancel if the new time does not work.')}
            </p>
            {error && (
              <p role="alert" className="mt-2 text-sm text-arom-danger">
                {error}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void confirmAction()}
                disabled={busy}
                className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${action === 'cancel' ? 'bg-arom-danger hover:opacity-90' : 'bg-arom hover:bg-arom-deep'}`}>
                {action === 'cancel' ? t('បោះបង់ ហើយប្រាប់អតិថិជន', 'Cancel and tell the client') : t('ប្តូរពេល ហើយប្រាប់អតិថិជន', 'Move and tell the client')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAction(null);
                  setReason('');
                  setNewStart('');
                  setError('');
                }}
                className="rounded-full border border-arom-border bg-white px-4 py-2 text-sm">
                {t('ត្រឡប់ក្រោយ', 'Back')}
              </button>
            </div>
          </section>
        )}

        <section className="border-t border-arom-border pt-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
            <NotebookPen size={16} aria-hidden="true" className="text-arom" />
            {t('កំណត់ចំណាំឯកជន', 'Private session notes')}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
            <Lock size={12} aria-hidden="true" />
            {t('មានតែអ្នកទេដែលមើលឃើញ។ អ្នកគ្រប់គ្រង និងអតិថិជនមិនអាចមើលបានទេ។', 'Only you can see these. Not admins, not the client.')}
          </p>
          <textarea
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
              setNoteSaved('');
            }}
            rows={5}
            maxLength={MAX_NOTE}
            className={textareaClass}
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={note === (savedNote?.text ?? '')}
              onClick={async () => {
                const result = await saveSessionNote(booking.id, note);
                setNoteSaved(result.ok ? t('បានរក្សាទុក។', 'Saved.') : result.message);
              }}
              className="rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep disabled:opacity-40">
              {t('រក្សាទុកកំណត់ចំណាំ', 'Save note')}
            </button>
            <span role="status" aria-live="polite" className="text-xs text-ink-muted">
              {noteSaved || (savedNote ? `${t('បានរក្សាទុក', 'Last saved')} ${formats.stamp.format(new Date(savedNote.updatedAt))}` : '')}
            </span>
          </div>
        </section>
      </div>

      {nextStep === 'task' && (
        <AddTaskDialog clientId={booking.clientId} clientName={booking.clientName} bookingId={booking.id} today={today} onClose={() => setNextStep(null)} />
      )}
      {nextStep === 'suggest' && (
        <SuggestSessionDialog clientId={booking.clientId} clientName={booking.clientName} defaultType={booking.sessionType} onClose={() => setNextStep(null)} />
      )}
    </dialog>
  );
}

export function ProBookingsView({ initialOpenId }: { initialOpenId?: string }) {
  const { bookings, sessionNotes, schedule } = usePro();
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const formats = useFormats(km);

  const [now] = useState(() => Date.now());
  const [tab, setTab] = useState<Tab>('upcoming');
  const [view, setView] = useState<'list' | 'week'>('list');
  const [openId, setOpenId] = useState<string | null>(initialOpenId ?? null);

  const upcoming = bookings
    .filter((item) => item.status === 'booked' && endOf(item) > now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = bookings
    .filter((item) => !(item.status === 'booked' && endOf(item) > now))
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const visible = tab === 'upcoming' ? upcoming : past;
  const openBooking = bookings.find((item) => item.id === openId) ?? null;

  const statusChip = (booking: ProBooking) => {
    if (booking.status === 'booked' && endOf(booking) <= now) return { label: t('ត្រូវកត់លទ្ធផល', 'Add outcome'), style: 'bg-arom-warning-soft text-arom-warning' };
    if (booking.status === 'booked') return { label: t('បានកក់', 'Booked'), style: 'bg-arom-soft text-arom' };
    if (booking.status === 'completed') return { label: t('បានបញ្ចប់', 'Completed'), style: 'bg-arom-wash text-ink-muted' };
    if (booking.status === 'no_show') return { label: t('មិនបានមក', 'Did not come'), style: 'bg-gray-100 text-gray-600' };
    return { label: t('បានបោះបង់', 'Cancelled'), style: 'bg-arom-danger-soft text-arom-danger' };
  };

  const groups = visible.reduce<{ day: string; items: ProBooking[] }[]>((list, booking) => {
    const day = cambodiaDate(Date.parse(booking.startsAt));
    const group = list.find((entry) => entry.day === day);
    if (group) group.items.push(booking);
    else list.push({ day, items: [booking] });
    return list;
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t('ការកក់របស់ខ្ញុំ', 'My bookings')}</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {t('ការពិគ្រោះជាមួយអតិថិជនរបស់អ្នក ម៉ោងកម្ពុជា។', 'Your sessions with clients, in Cambodia time.')}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <div role="tablist" aria-label={t('ការកក់', 'Bookings')} className={`flex gap-2 ${view === 'week' ? 'invisible' : ''}`}>
        {(['upcoming', 'past'] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium ${tab === value ? 'border-arom bg-arom text-white' : 'border-arom-border bg-white text-ink-muted hover:bg-arom-wash'}`}>
            {value === 'upcoming' ? t('ខាងមុខ', 'Upcoming') : t('កន្លងមក', 'Past')}
            <span className={`rounded-full px-2 py-0.5 text-xs ${tab === value ? 'bg-white/15' : 'bg-arom-wash text-arom'}`}>
              {value === 'upcoming' ? upcoming.length : past.length}
            </span>
          </button>
        ))}
      </div>
      <div className="flex rounded-full border border-arom-border bg-white p-1" role="group" aria-label={t('របៀបមើល', 'View')}>
        {([
          ['list', List, t('បញ្ជី', 'List')],
          ['week', CalendarDays, t('សប្តាហ៍', 'Week')],
        ] as const).map(([value, Icon, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={view === value}
            onClick={() => setView(value)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium ${view === value ? 'bg-arom text-white' : 'text-ink-muted hover:bg-arom-wash'}`}>
            <Icon size={15} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
      </div>

      {view === 'week' ? (
        <div className="mt-6">
          <WeekCalendar bookings={bookings} schedule={schedule} now={now} km={km} onOpen={setOpenId} />
        </div>
      ) : groups.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-arom-border bg-white p-10 text-center">
          <CalendarClock size={30} aria-hidden="true" className="mx-auto text-ink-muted" />
          <p className="mt-3 font-medium text-ink">
            {tab === 'upcoming' ? t('មិនមានការណាត់ជួបខាងមុខទេ', 'No upcoming sessions') : t('មិនទាន់មានការណាត់ជួបកន្លងមកទេ', 'No past sessions yet')}
          </p>
          {tab === 'upcoming' && (
            <p className="mt-1 text-sm text-ink-muted">{t('អ្នកប្រើកក់ពីម៉ោងដែលអ្នកបើកក្នុងកាលវិភាគ។', 'People book from the times you open in My schedule.')}</p>
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {groups.map((group) => (
            <section key={group.day}>
              <h2 className="text-sm font-bold text-ink">{formats.day.format(new Date(`${group.day}T12:00:00+07:00`))}</h2>
              <ul className="mt-2 space-y-2">
                {group.items.map((booking) => {
                  const chip = statusChip(booking);
                  const start = new Date(booking.startsAt);
                  return (
                    <li key={booking.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setOpenId(booking.id)}
                        className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-arom-border bg-white px-4 py-3.5 text-left shadow-sm hover:border-arom/40 hover:bg-arom-wash/40">
                        <span className="w-24 text-sm font-semibold tabular-nums text-ink">
                          {formats.time.format(start)}
                          <span className="font-normal text-ink-muted"> · {booking.durationMinutes}{t('នាទី', 'm')}</span>
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{booking.clientName}</span>
                        <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                          {booking.sessionType === 'online' ? <Monitor size={14} aria-hidden="true" /> : <UserRound size={14} aria-hidden="true" />}
                          {booking.sessionType === 'online' ? t('អនឡាញ', 'Online') : t('ជួបផ្ទាល់', 'In person')}
                        </span>
                        {sessionNotes[booking.id]?.text && (
                          <NotebookPen size={15} aria-label={t('មានកំណត់ចំណាំ', 'Has notes')} className="text-arom" />
                        )}
                        {booking.seriesId && <Repeat size={14} aria-label={t('វគ្គធ្វើម្តងទៀត', 'Repeating series')} className="text-arom" />}
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${chip.style}`}>{chip.label}</span>
                      </button>
                      <JoinButton booking={booking} now={now} km={km} size="sm" />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {openBooking && <BookingDialog key={openBooking.id} booking={openBooking} now={now} onClose={() => setOpenId(null)} />}
    </>
  );
}
