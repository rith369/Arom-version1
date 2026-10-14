'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ClipboardList, FileText, FolderOpen, History, Lock, MessageCircle, Monitor, NotebookPen, Pin, Repeat, Share2, Target, UserRound } from 'lucide-react';

import { usePro, useSharedByClient } from './pro-provider';
import {
  cambodiaToday,
  isActive,
  progressBetween,
  sharingKey,
  taskTitle,
  useCareStore,
} from '../../_components/care/care-store';
import { useLanguage } from '../../_components/language-provider';
import { conversationId, useThread } from '../../_components/messages/message-store';
import { JoinButton } from '../../_components/sessions/join-button';
import { seriesPosition } from '../../_components/sessions/session-store';
import { MAX_NOTE, type ProBooking } from '../_data/bookings';
import { LEVEL_LABELS, SYMPTOM_TYPE_LABELS, sharingFor, type SymptomLevel } from '../_data/clients';

const TIME_ZONE = 'Asia/Phnom_Penh';
const endOf = (booking: ProBooking) => Date.parse(booking.startsAt) + booking.durationMinutes * 60_000;

const levelStyles: Record<SymptomLevel, string> = {
  none: 'bg-arom-wash text-ink-muted',
  low: 'bg-arom-soft text-arom-deep',
  medium: 'bg-arom-warning-soft text-arom-warning',
  high: 'bg-arom-danger-soft text-arom-danger',
};

function Block({ title, icon: Icon, children, action }: { title: string; icon: typeof Pin; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-bold text-ink">
          <Icon size={18} aria-hidden="true" className="text-arom" />
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

// One page to read in the few minutes before a session. Private to the professional.
export function PrepareView({ bookingId }: { bookingId: string }) {
  const { bookings, sessionNotes, summaryNotes, prepNotes, savePrepNote, profile } = usePro();
  const care = useCareStore('professional');
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const locale = km ? 'km-KH' : 'en-GB';

  const [now] = useState(() => Date.now());
  const [today] = useState(() => cambodiaToday(Date.now()));
  const booking = bookings.find((item) => item.id === bookingId);
  const shared = useSharedByClient(booking?.clientId, booking ? sharingFor(bookings, booking.clientId).symptomChecks : false);
  const { messages: thread } = useThread(
    booking && {
      id: conversationId(profile.slug, booking.clientId),
      professionalId: profile.slug,
      professionalName: profile.displayName,
      kmProfessionalName: profile.kmDisplayName,
      clientId: booking.clientId,
      clientName: booking.clientName,
    },
    'professional',
  );
  const [plan, setPlan] = useState(prepNotes[bookingId]?.text ?? '');
  const [planStatus, setPlanStatus] = useState('');

  const day = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: TIME_ZONE });
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TIME_ZONE });
  const short = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: TIME_ZONE });

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

  const history = bookings
    .filter((item) => item.clientId === booking.clientId && item.id !== booking.id && item.startsAt < booking.startsAt)
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const lastSession = history.find((item) => item.status === 'completed' || item.status === 'no_show' || (item.status === 'booked' && endOf(item) <= now));
  const completedCount = history.filter((item) => item.status === 'completed').length;
  const series = seriesPosition(bookings, booking);
  const summary = summaryNotes[booking.clientId];
  const lastNote = lastSession ? sessionNotes[lastSession.id] : undefined;

  // Care plan progress since the last session (only if the client shares it).
  const since = lastSession ? new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date(lastSession.startsAt)) : null;
  const sharesCare = care.sharing[sharingKey(profile.slug, booking.clientId)] === true;
  const tasks = care.tasks.filter((task) => task.professionalId === profile.slug && task.clientId === booking.clientId && isActive(task, today));

  // Symptom checks the client chose to share.
  const sharing = sharingFor(bookings, booking.clientId);
  const checks = sharing.symptomChecks ? [...shared.symptomChecks].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3) : [];

  // Messages since the last session.
  const recent = lastSession ? thread.filter((item) => item.createdAt > lastSession.startsAt) : thread;
  const unread = recent.filter((item) => item.sender === 'client' && !item.readAt).length;

  const upcoming = booking.status === 'booked' && endOf(booking) > now;
  const start = new Date(booking.startsAt);

  return (
    <>
      <Link href="/pro/bookings" className="inline-flex items-center gap-2 text-sm font-semibold text-arom hover:underline">
        <ArrowLeft size={16} aria-hidden="true" />
        {t('ការកក់របស់ខ្ញុំ', 'My bookings')}
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-arom">{t('រៀបចំសម្រាប់វគ្គ', 'Prepare for the session')}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{booking.clientName}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
            <span className="font-medium text-ink">
              {day.format(start)}, {time.format(start)}
            </span>
            <span className="flex items-center gap-1">
              {booking.sessionType === 'online' ? <Monitor size={14} aria-hidden="true" /> : <UserRound size={14} aria-hidden="true" />}
              {booking.sessionType === 'online' ? t('អនឡាញ', 'Online') : t('ជួបផ្ទាល់', 'In person')} · {booking.durationMinutes} {t('នាទី', 'min')}
            </span>
            <span>{completedCount === 0 ? t('វគ្គដំបូងជាមួយអ្នក', 'First session with you') : t(`វគ្គទី ${completedCount + 1} ជាមួយអ្នក`, `Session ${completedCount + 1} with you`)}</span>
            {series && (
              <span className="flex items-center gap-1 text-arom-deep">
                <Repeat size={13} aria-hidden="true" />
                {t(`${series.index} ក្នុងចំណោម ${series.total}`, `${series.index} of ${series.total} in a series`)}
              </span>
            )}
          </p>
          {!upcoming && (
            <p className="mt-2 text-xs text-ink-muted">{t('វគ្គនេះបានកន្លងផុតហើយ។', 'This session has already happened.')}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <JoinButton booking={booking} now={now} km={km} />
          <Link href={`/pro/clients/${booking.clientId}`} className="flex items-center gap-2 rounded-full border border-arom-border bg-white px-4 py-2 text-sm font-medium text-arom hover:bg-arom-wash">
            <FolderOpen size={16} aria-hidden="true" />
            {t('ឯកសារអតិថិជន', 'Client file')}
          </Link>
        </div>
      </header>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted">
        <Lock size={12} aria-hidden="true" />
        {t('មានតែអ្នកទេដែលមើលឃើញទំព័រនេះ។', 'Only you can see this page.')}
      </p>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-5">
          <Block title={t('ផែនការសម្រាប់វគ្គនេះ', 'Plan for this session')} icon={Target}>
            <p className="text-xs text-ink-muted">{t('អ្វីដែលអ្នកចង់លើកឡើង។ ឯកជន។', 'What you want to bring up. Private.')}</p>
            <textarea
              value={plan}
              onChange={(event) => {
                setPlan(event.target.value);
                setPlanStatus('');
              }}
              rows={4}
              maxLength={MAX_NOTE}
              placeholder={t('ឧ. សួរអំពីអ្នកគ្រប់គ្រងរបស់នាង។ ពិនិត្យការគេង។', 'For example: ask about her manager. Check in on sleep.')}
              className="mt-2 w-full rounded-xl border border-arom/30 bg-arom-wash/60 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-arom focus:bg-white focus:ring-4 focus:ring-arom/10"
            />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={plan === (prepNotes[bookingId]?.text ?? '')}
                onClick={async () => {
                  const result = await savePrepNote(bookingId, plan);
                  setPlanStatus(result.ok ? t('បានរក្សាទុក។', 'Saved.') : t('មិនអាចរក្សាទុកបានទេ។ សូមព្យាយាមម្តងទៀត។', 'This could not be saved. Please try again.'));
                }}
                className="rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep disabled:opacity-40">
                {t('រក្សាទុកផែនការ', 'Save plan')}
              </button>
              <span role="status" aria-live="polite" className="text-xs text-ink-muted">
                {planStatus}
              </span>
            </div>
          </Block>

          <Block title={t('វគ្គចុងក្រោយ', 'Last session')} icon={History}>
            {!lastSession ? (
              <p className="text-sm text-ink-muted">{t('នេះជាវគ្គដំបូង។ មើលចម្លើយពេលកក់ខាងក្រោម។', 'This is the first session. See the booking answers below.')}</p>
            ) : (
              <>
                <p className="text-sm text-ink">
                  <span className="font-semibold">{short.format(new Date(lastSession.startsAt))}</span>
                  <span className="text-ink-muted">
                    {' · '}
                    {lastSession.status === 'completed'
                      ? t('បានបញ្ចប់', 'Completed')
                      : lastSession.status === 'no_show'
                        ? t('អតិថិជនមិនបានមក', 'Client did not come')
                        : t('មិនទាន់កត់លទ្ធផល', 'Outcome not recorded')}
                  </span>
                </p>
                {lastNote?.text ? (
                  <p className="mt-2 whitespace-pre-line rounded-2xl bg-arom-wash/70 p-3.5 text-sm leading-6 text-ink">{lastNote.text}</p>
                ) : (
                  <p className="mt-2 text-sm text-ink-muted">{t('គ្មានកំណត់ចំណាំសម្រាប់វគ្គនោះទេ។', 'No note for that session.')}</p>
                )}
              </>
            )}
          </Block>

          <Block
            title={t('ផែនការថែទាំ ចាប់តាំងពីវគ្គចុងក្រោយ', 'Care plan since the last session')}
            icon={ClipboardList}
            action={
              <Link href={`/pro/clients/${booking.clientId}#care-plan`} className="text-sm font-semibold text-arom hover:underline">
                {t('មើលទាំងអស់', 'See all')}
              </Link>
            }>
            {tasks.length === 0 ? (
              <p className="text-sm text-ink-muted">{t('គ្មានកិច្ចការសកម្ម។', 'No active tasks.')}</p>
            ) : (
              <>
                {!sharesCare && (
                  <p className="mb-3 rounded-2xl bg-arom-wash/70 px-3.5 py-2.5 text-xs text-ink-muted">
                    {t('អតិថិជនមិនបានចែករំលែកវឌ្ឍនភាពទេ។ អ្នកអាចសួរពួកគេក្នុងវគ្គ។', 'The client has not shared progress. You can ask them in the session.')}
                  </p>
                )}
                <ul className="space-y-2">
                  {tasks.map((task) => {
                    const progress = sharesCare && since ? progressBetween(task, care.checkIns, since, today) : null;
                    const doneOnce = sharesCare && task.repeat.type === 'once' && care.checkIns.some((item) => item.taskId === task.id);
                    return (
                      <li key={task.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate text-ink">{taskTitle(task, km)}</span>
                        {sharesCare && (
                          <span className="shrink-0 text-xs font-medium text-ink-muted">
                            {progress
                              ? progress.due === 0
                                ? t('មិនទាន់ដល់ថ្ងៃ', 'Not due yet')
                                : t(`${progress.done}/${progress.due} ថ្ងៃ`, `${progress.done} of ${progress.due} ${progress.due === 1 ? 'day' : 'days'}`)
                              : doneOnce
                                ? task.kind === 'goal'
                                  ? t('បានសម្រេច', 'Reached')
                                  : t('បានធ្វើ', 'Done')
                                : t('មិនទាន់', 'Not yet')}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </Block>

          <Block title={t('ចម្លើយពេលកក់វគ្គនេះ', 'Answers for this booking')} icon={FileText}>
            {booking.intakeAnswers.length === 0 && !booking.intakeNote ? (
              <p className="text-sm text-ink-muted">{t('វគ្គតាមដាន។ គ្មានចម្លើយថ្មីទេ។', 'A follow up. No new answers.')}</p>
            ) : (
              <>
                {booking.intakeNote && <p className="rounded-2xl bg-arom-wash/70 p-3.5 text-sm text-ink">&ldquo;{booking.intakeNote}&rdquo;</p>}
                <dl className="mt-3 space-y-2.5">
                  {booking.intakeAnswers.map((item) => (
                    <div key={item.question.en}>
                      <dt className="text-xs text-ink-muted">{km ? item.question.km : item.question.en}</dt>
                      <dd className="text-sm text-ink">{item.answer}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </Block>
        </div>

        <aside className="space-y-5">
          <Block title={t('កំណត់ចំណាំសង្ខេប', 'Summary note')} icon={Pin}>
            {summary?.text ? (
              <p className="whitespace-pre-line text-sm leading-6 text-ink">{summary.text}</p>
            ) : (
              <p className="text-sm text-ink-muted">
                {t('មិនទាន់មានទេ។ ', 'None yet. ')}
                <Link href={`/pro/clients/${booking.clientId}`} className="font-semibold text-arom underline">
                  {t('សរសេរក្នុងឯកសារអតិថិជន', 'Write it in the client file')}
                </Link>
              </p>
            )}
          </Block>

          <Block title={t('សារចាប់តាំងពីវគ្គចុងក្រោយ', 'Messages since the last session')} icon={MessageCircle}>
            <p className="text-sm text-ink">
              {recent.length === 0
                ? t('គ្មានសារ។', 'No messages.')
                : t(`${recent.length} សារ`, `${recent.length} ${recent.length === 1 ? 'message' : 'messages'}`)}
              {unread > 0 && <span className="ml-2 rounded-full bg-arom px-2 py-0.5 text-xs font-semibold text-white">{t(`${unread} មិនទាន់អាន`, `${unread} unread`)}</span>}
            </p>
            <Link href={`/pro/messages/${booking.clientId}`} className="mt-2 inline-block text-sm font-semibold text-arom hover:underline">
              {t('បើកសារ', 'Open the chat')}
            </Link>
          </Block>

          <Block title={t('អតិថិជនបានចែករំលែក', 'Shared by the client')} icon={Share2}>
            {checks.length === 0 ? (
              <p className="text-sm text-ink-muted">{t('គ្មានការពិនិត្យរោគសញ្ញាដែលបានចែករំលែកទេ។', 'No symptom checks shared.')}</p>
            ) : (
              <ul className="space-y-2">
                {checks.map((check) => (
                  <li key={check.createdAt} className="flex items-center gap-3 text-sm">
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-ink">{km ? SYMPTOM_TYPE_LABELS[check.type].km : SYMPTOM_TYPE_LABELS[check.type].en}</span>
                      <span className="block text-xs text-ink-muted">
                        {short.format(new Date(check.createdAt))} · {check.score}/{check.maxScore}
                      </span>
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${levelStyles[check.level]}`}>
                      {km ? LEVEL_LABELS[check.level].km : LEVEL_LABELS[check.level].en}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-ink-muted">{t('មិនមែនជាការធ្វើរោគវិនិច្ឆ័យទេ។', 'Not a diagnosis.')}</p>
          </Block>

          <Block title={t('ក្រោយវគ្គ', 'After the session')} icon={NotebookPen}>
            <p className="text-sm text-ink-muted">
              {t('បើកការកក់នេះក្នុង ការកក់របស់ខ្ញុំ ដើម្បីកត់លទ្ធផល សរសេរកំណត់ចំណាំ ផ្ដល់កិច្ចការ ឬណែនាំវគ្គបន្ទាប់។', 'Open this booking in My bookings to record the outcome, write your note, give a task or suggest the next session.')}
            </p>
            <Link href={`/pro/bookings?open=${booking.id}`} className="mt-2 inline-block text-sm font-semibold text-arom hover:underline">
              {t('បើកការកក់', 'Open the booking')}
            </Link>
          </Block>
        </aside>
      </div>
    </>
  );
}
