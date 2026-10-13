'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CalendarClock, CheckCircle2, ClipboardList, FileText, FolderOpen, Lock, MessageCircle, Monitor, NotebookPen, UserRound, UserX, X, XCircle } from 'lucide-react';

import { usePro } from './pro-provider';
import { useLanguage } from '../../_components/language-provider';
import { MAX_NOTE, MAX_REASON, type ProBooking } from '../_data/bookings';
import { cambodiaDate, openSlots } from '../_data/schedule';

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
  const { bookings, schedule, sessionNotes, cancelBooking, rescheduleBooking, setBookingOutcome, saveSessionNote } = usePro();
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

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  const isUpcoming = booking.status === 'booked' && endOf(booking) > now;
  const needsOutcome = booking.status === 'booked' && endOf(booking) <= now;
  const savedNote = sessionNotes[booking.id];

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

  function confirmAction() {
    if (!reason.trim()) {
      setError(t('សូមសរសេរមូលហេតុ។ អតិថិជននឹងឃើញវា។', 'Write a reason. The client will see it.'));
      return;
    }
    if (action === 'reschedule') {
      if (!newStart) {
        setError(t('សូមជ្រើសរើសម៉ោងថ្មី។', 'Choose a new time.'));
        return;
      }
      rescheduleBooking(booking.id, newStart, reason.trim());
    } else if (action === 'cancel') {
      cancelBooking(booking.id, reason.trim());
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
            {showClientLink && (booking.status === 'completed' || needsOutcome) && (
              <Link href={`/pro/clients/${booking.clientId}#care-plan`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-arom hover:underline">
                <ClipboardList size={15} aria-hidden="true" />
                {t('ផ្ដល់កិច្ចការថែទាំ', 'Give care tasks')}
              </Link>
            )}
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label={t('បិទ', 'Close')} className="rounded-full p-2 hover:bg-arom-wash">
          <X size={20} />
        </button>
      </header>

      <div className="space-y-5 p-5 sm:p-6">
        {booking.rescheduledFrom && (
          <p className="rounded-2xl bg-arom-wash p-3.5 text-sm text-ink">
            {t('បានប្តូរពី', 'Moved from')} {formats.stamp.format(new Date(booking.rescheduledFrom))}.{' '}
            <span className="text-ink-muted">{booking.rescheduleReason}</span>
          </p>
        )}

        {booking.status === 'cancelled' && (
          <p className="rounded-2xl bg-arom-danger-soft p-3.5 text-sm text-ink">
            <span className="font-semibold text-arom-danger">
              {booking.cancelledBy === 'professional'
                ? t('អ្នកបានបោះបង់', 'You cancelled this session.')
                : booking.cancelledBy === 'admin'
                  ? t('អ្នកគ្រប់គ្រង AROM បានបោះបង់', 'The AROM team cancelled this session.')
                  : t('អតិថិជនបានបោះបង់', 'The client cancelled this session.')}
            </span>{' '}
            {booking.cancelReason}
          </p>
        )}

        <section>
          <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
            <FileText size={16} aria-hidden="true" className="text-arom" />
            {t('មុនការពិគ្រោះ', 'Before the session')}
          </h3>
          <p className="mt-1 text-xs text-ink-muted">{t('អតិថិជនបានចែករំលែកព័ត៌មាននេះសម្រាប់វគ្គនេះតែប៉ុណ្ណោះ។', 'The client shared this for this session only.')}</p>
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
            <button type="button" onClick={() => setAction('reschedule')} className="flex items-center gap-2 rounded-full border border-arom-border px-4 py-2 text-sm font-medium text-arom hover:bg-arom-wash">
              <CalendarClock size={16} aria-hidden="true" />
              {t('ប្តូរពេល', 'Reschedule')}
            </button>
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
                onClick={confirmAction}
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

        {needsOutcome && (
          <section className="border-t border-arom-border pt-5">
            <h3 className="text-sm font-bold text-ink">{t('វគ្គនេះយ៉ាងម៉េចដែរ?', 'How did this session go?')}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => setBookingOutcome(booking.id, 'completed')} className="flex items-center gap-2 rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep">
                <CheckCircle2 size={16} aria-hidden="true" />
                {t('បានបញ្ចប់', 'Completed')}
              </button>
              <button type="button" onClick={() => setBookingOutcome(booking.id, 'no_show')} className="flex items-center gap-2 rounded-full border border-arom-border px-4 py-2 text-sm font-medium text-ink hover:bg-arom-wash">
                <UserX size={16} aria-hidden="true" />
                {t('អតិថិជនមិនបានមក', 'Client did not come')}
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
              onClick={() => {
                saveSessionNote(booking.id, note);
                setNoteSaved(t('បានរក្សាទុក។', 'Saved.'));
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
    </dialog>
  );
}

export function ProBookingsView() {
  const { bookings, sessionNotes } = usePro();
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const formats = useFormats(km);

  const [now] = useState(() => Date.now());
  const [tab, setTab] = useState<Tab>('upcoming');
  const [openId, setOpenId] = useState<string | null>(null);

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

      <div role="tablist" aria-label={t('ការកក់', 'Bookings')} className="mt-6 flex gap-2">
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

      {groups.length === 0 ? (
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
                    <li key={booking.id}>
                      <button
                        type="button"
                        onClick={() => setOpenId(booking.id)}
                        className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-arom-border bg-white px-4 py-3.5 text-left shadow-sm hover:border-arom/40 hover:bg-arom-wash/40">
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
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${chip.style}`}>{chip.label}</span>
                      </button>
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
