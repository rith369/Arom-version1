'use client';

import Link from 'next/link';
import { AlertCircle, ArrowRight, CalendarCheck, CheckCircle2, ClipboardList, MessageCircle, Monitor, Target, UserRound } from 'lucide-react';

import { usePro } from './pro-provider';
import { mondayOf } from './weekly-sessions-chart';
import { cambodiaToday, isActive, progressBetween, sharingKey, shiftDate, useCareStore } from '../../_components/care/care-store';
import { conversationId, unreadCount, useMessageStore } from '../../_components/messages/message-store';
import { JoinButton } from '../../_components/sessions/join-button';
import { useSessionStore } from '../../_components/sessions/session-store';
import type { ProBooking } from '../_data/bookings';
import { clientsFrom } from '../_data/clients';
import { addDays, cambodiaDate, openSlots } from '../_data/schedule';

const TIME_ZONE = 'Asia/Phnom_Penh';
const endOf = (booking: ProBooking) => Date.parse(booking.startsAt) + booking.durationMinutes * 60_000;

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6 ${className}`}>{children}</section>;
}

// The session happening now or next, with Join, Prepare and Message.
export function NextSessionCard({ now, km }: { now: number; km: boolean }) {
  const { bookings } = usePro();
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const next = bookings
    .filter((item) => item.status === 'booked' && endOf(item) > now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  const when = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TIME_ZONE });
  const isToday = next && cambodiaDate(Date.parse(next.startsAt)) === cambodiaDate(now);

  return (
    <Card className="border-arom/30 bg-gradient-to-br from-white to-arom-wash/60">
      <p className="flex items-center gap-2 text-sm font-medium text-arom">
        <CalendarCheck size={16} aria-hidden="true" />
        {next ? (isToday ? t('វគ្គបន្ទាប់ ថ្ងៃនេះ', 'Next session, today') : t('វគ្គបន្ទាប់', 'Next session')) : t('វគ្គបន្ទាប់', 'Next session')}
      </p>
      {next ? (
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xl font-bold text-ink sm:text-2xl">{next.clientName}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
              <span className="font-medium text-ink">{when.format(new Date(next.startsAt))}</span>
              <span className="flex items-center gap-1">
                {next.sessionType === 'online' ? <Monitor size={14} aria-hidden="true" /> : <UserRound size={14} aria-hidden="true" />}
                {next.sessionType === 'online' ? t('អនឡាញ', 'Online') : t('ជួបផ្ទាល់', 'In person')} · {next.durationMinutes} {t('នាទី', 'min')}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <JoinButton booking={next} now={now} km={km} />
            <Link href={`/pro/bookings/${next.id}`} className="flex items-center gap-1.5 rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep">
              <Target size={15} aria-hidden="true" />
              {t('រៀបចំ', 'Prepare')}
            </Link>
            <Link href={`/pro/messages/${next.clientId}`} className="flex items-center gap-1.5 rounded-full border border-arom-border bg-white px-4 py-2 text-sm font-medium text-arom hover:bg-arom-wash">
              <MessageCircle size={15} aria-hidden="true" />
              {t('ផ្ញើសារ', 'Message')}
            </Link>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm text-ink-muted">{t('មិនមានវគ្គខាងមុខទេ។', 'No upcoming sessions.')}</p>
      )}
    </Card>
  );
}

function Tile({ label, value, note, children }: { label: string; value: string; note?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-arom-border bg-white p-4 shadow-card sm:p-5">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-ink">{value}</p>
      {children}
      {note && <p className="mt-1 text-xs text-ink-muted">{note}</p>}
    </div>
  );
}

// Four numbers: this week, next 7 days, active clients, how full the week is.
export function StatTiles({ now, km }: { now: number; km: boolean }) {
  const { bookings, archivedClients, schedule } = usePro();
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const thisMonday = mondayOf(cambodiaDate(now));
  const inWeek = (monday: string) =>
    bookings.filter((item) => {
      const date = cambodiaDate(Date.parse(item.startsAt));
      return item.status !== 'cancelled' && date >= monday && date <= addDays(monday, 6);
    });
  const thisWeek = inWeek(thisMonday);
  const lastWeek = inWeek(addDays(thisMonday, -7)).length;
  const difference = thisWeek.length - lastWeek;

  const nextSeven = bookings.filter((item) => item.status === 'booked' && Date.parse(item.startsAt) > now && Date.parse(item.startsAt) < now + 7 * 86_400_000).length;
  const active = clientsFrom(bookings, now).filter((client) => !archivedClients.includes(client.id)).length;

  // Capacity: every slot the weekly hours offer this week (time off removed), whether or not it is booked.
  const capacity = openSlots(schedule, { fromDate: thisMonday, days: 7, now: 0, booked: [] }).length;
  const full = capacity > 0 ? Math.min(100, Math.round((thisWeek.length / capacity) * 100)) : null;

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <Tile
        label={t('វគ្គសប្តាហ៍នេះ', 'Sessions this week')}
        value={String(thisWeek.length)}
        note={
          difference === 0
            ? t('ដូចសប្តាហ៍មុន', 'Same as last week')
            : difference > 0
              ? t(`ច្រើនជាងសប្តាហ៍មុន ${difference}`, `${difference} more than last week`)
              : t(`តិចជាងសប្តាហ៍មុន ${-difference}`, `${-difference} fewer than last week`)
        }
      />
      <Tile label={t('៧ ថ្ងៃខាងមុខ', 'Next 7 days')} value={String(nextSeven)} note={t('វគ្គដែលបានកក់', 'booked sessions')} />
      <Tile label={t('អតិថិជនសកម្ម', 'Active clients')} value={String(active)} note={t('មិនរាប់អតិថិជនចាស់', 'not counting archived')} />
      <Tile label={t('សប្តាហ៍របស់អ្នកពេញប៉ុណ្ណា', 'How full your week is')} value={full === null ? '0%' : `${full}%`}>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={full ?? 0}
          aria-label={t('ម៉ោងបើកដែលបានកក់', 'Open hours booked')}
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-arom-wash">
          <div className="h-full rounded-full bg-arom" style={{ width: `${full ?? 0}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-ink-muted">
          {full === null ? (
            <Link href="/pro/schedule" className="font-semibold text-arom underline">
              {t('មិនមានម៉ោងបើកសប្តាហ៍នេះ', 'No open hours this week')}
            </Link>
          ) : (
            t(`${thisWeek.length} ក្នុងចំណោម ${capacity} ម៉ោងបើក`, `${thisWeek.length} of ${capacity} open slots booked`)
          )}
        </p>
      </Tile>
    </div>
  );
}

// Things waiting for the professional, each linking to where it is done.
export function NeedsAttention({ now, km }: { now: number; km: boolean }) {
  const { bookings, profile, archivedClients } = usePro();
  const { messages } = useMessageStore();
  const { suggestions } = useSessionStore();
  const care = useCareStore();
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const today = cambodiaToday(now);

  const outcomes = bookings.filter((item) => item.status === 'booked' && endOf(item) <= now);
  const clients = clientsFrom(bookings, now).filter((client) => !archivedClients.includes(client.id));
  const unread = clients.reduce((sum, client) => sum + unreadCount(messages, conversationId(profile.slug, client.id), 'professional'), 0);
  const waiting = suggestions.filter((item) => item.professionalId === profile.slug && item.status === 'open');
  const noPlan = clients.filter(
    (client) =>
      client.completedSessions > 0 &&
      !care.tasks.some((task) => task.professionalId === profile.slug && task.clientId === client.id && isActive(task, today)),
  );

  const items = [
    outcomes.length > 0 && {
      key: 'outcomes',
      icon: AlertCircle,
      text: t(`${outcomes.length} វគ្គកំពុងរង់ចាំលទ្ធផល`, `${outcomes.length} ${outcomes.length === 1 ? 'session needs' : 'sessions need'} an outcome`),
      href: `/pro/bookings?open=${outcomes[0].id}`,
    },
    unread > 0 && {
      key: 'unread',
      icon: MessageCircle,
      text: t(`${unread} សារមិនទាន់អាន`, `${unread} unread ${unread === 1 ? 'message' : 'messages'}`),
      href: '/pro/messages',
    },
    waiting.length > 0 && {
      key: 'waiting',
      icon: CalendarCheck,
      text: t(`${waiting.length} ការណែនាំម៉ោងកំពុងរង់ចាំអតិថិជនជ្រើសរើស`, `${waiting.length} suggested ${waiting.length === 1 ? 'time is' : 'times are'} waiting for the client`),
      href: `/pro/messages/${waiting[0].clientId}`,
    },
    noPlan.length > 0 && {
      key: 'plan',
      icon: ClipboardList,
      text: t(
        `${noPlan.length} អតិថិជនមិនទាន់មានផែនការថែទាំ: ${noPlan.slice(0, 2).map((client) => client.name).join(', ')}`,
        `${noPlan.length} ${noPlan.length === 1 ? 'client has' : 'clients have'} no care plan: ${noPlan.slice(0, 2).map((client) => client.name).join(', ')}${noPlan.length > 2 ? '...' : ''}`,
      ),
      href: `/pro/clients/${noPlan[0].id}#care-plan`,
    },
  ].filter((item): item is { key: string; icon: typeof AlertCircle; text: string; href: string } => Boolean(item));

  return (
    <Card>
      <h2 className="text-base font-bold text-ink">{t('ត្រូវការការយកចិត្តទុកដាក់', 'Needs your attention')}</h2>
      {items.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-ink-muted">
          <CheckCircle2 size={16} aria-hidden="true" className="text-arom" />
          {t('រួចរាល់ទាំងអស់ហើយ។', 'All caught up.')}
        </p>
      ) : (
        <ul className="mt-3 space-y-1">
          {items.map(({ key, icon: Icon, text, href }) => (
            <li key={key}>
              <Link href={href} className="flex items-start gap-3 rounded-2xl px-2.5 py-2 text-sm text-ink hover:bg-arom-wash">
                <Icon size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-arom" />
                <span className="min-w-0 flex-1">{text}</span>
                <ArrowRight size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-arom" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// Only clients who share progress are counted; others stay private.
export function CareGlance({ now, km }: { now: number; km: boolean }) {
  const { bookings, profile, archivedClients } = usePro();
  const care = useCareStore();
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const today = cambodiaToday(now);
  const from = shiftDate(today, -6);

  const clients = clientsFrom(bookings, now).filter((client) => !archivedClients.includes(client.id));
  const sharing = clients.filter((client) => care.sharing[sharingKey(profile.slug, client.id)] === true);
  const totals = care.tasks
    .filter((task) => task.professionalId === profile.slug && sharing.some((client) => client.id === task.clientId))
    .map((task) => progressBetween(task, care.checkIns, from, today))
    .reduce<{ due: number; done: number }>((acc, item) => (item ? { due: acc.due + item.due, done: acc.done + item.done } : acc), { due: 0, done: 0 });

  return (
    <Card>
      <h2 className="flex items-center gap-2 text-base font-bold text-ink">
        <ClipboardList size={18} aria-hidden="true" className="text-arom" />
        {t('ផែនការថែទាំ', 'Care plans')}
      </h2>
      <dl className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <dt className="text-xs text-ink-muted">{t('ចែករំលែកវឌ្ឍនភាព', 'Share progress')}</dt>
          <dd className="text-2xl font-semibold tabular-nums text-ink">
            {sharing.length}
            <span className="text-sm font-normal text-ink-muted"> / {clients.length}</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-muted">{t('កិច្ចការបានធ្វើ ៧ ថ្ងៃ', 'Tasks done, 7 days')}</dt>
          <dd className="text-2xl font-semibold tabular-nums text-ink">{totals.due > 0 ? `${Math.round((totals.done / totals.due) * 100)}%` : t('មិនមាន', 'None')}</dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-ink-muted">
        {totals.due > 0
          ? t(`${totals.done} ក្នុងចំណោម ${totals.due} ថ្ងៃដែលត្រូវធ្វើ ពីអតិថិជនដែលចែករំលែក`, `${totals.done} of ${totals.due} due days, from clients who share`)
          : t('មិនទាន់មានកិច្ចការត្រូវធ្វើពីអតិថិជនដែលចែករំលែក។', 'No tasks due yet from clients who share.')}
      </p>
    </Card>
  );
}
