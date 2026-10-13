'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Circle,
  Clock,
  Eye,
  EyeOff,
  Gift,
  Monitor,
  UserRound,
} from 'lucide-react';

import { JoinButton } from '../../_components/sessions/join-button';
import { usePro } from './pro-provider';
import { useLanguage } from '../../_components/language-provider';
import { profileChecklist, type ReviewedField } from '../_data/profile';

const TIME_ZONE = 'Asia/Phnom_Penh';

function dayKey(value: string | Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

export const reviewedFieldLabels: Record<ReviewedField, { en: string; km: string }> = {
  displayName: { en: 'Name (English)', km: 'ឈ្មោះ (អង់គ្លេស)' },
  kmDisplayName: { en: 'Name (Khmer)', km: 'ឈ្មោះ (ខ្មែរ)' },
  title: { en: 'Title (English)', km: 'មុខតំណែង (អង់គ្លេស)' },
  kmTitle: { en: 'Title (Khmer)', km: 'មុខតំណែង (ខ្មែរ)' },
  licenseNumber: { en: 'License number', km: 'លេខអាជ្ញាប័ណ្ណ' },
  issuingBody: { en: 'Issuing body', km: 'ស្ថាប័នចេញអាជ្ញាប័ណ្ណ' },
};

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6 ${className}`}>{children}</section>;
}

export function ProHome() {
  const { profile, pendingChanges, hasSchedule, freeDuringTesting, demoMode, bookings } = usePro();
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [today] = useState(() => dayKey(new Date()));
  const [now] = useState(() => Date.now());

  const checklist = profileChecklist(profile, { hasSchedule });
  const remaining = checklist.filter((item) => !item.done);
  const isVisible = remaining.length === 0;
  const name = (km && profile.kmDisplayName) || profile.displayName;

  const todaySessions = bookings
    .filter((booking) => booking.status !== 'cancelled' && dayKey(booking.startsAt) === today)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const timeFormat = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TIME_ZONE });

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        {t(`សួស្តី ${name}`, `Hello, ${name}`)}
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        {t('នេះជាកន្លែងគ្រប់គ្រងប្រវត្តិរូប និងការណាត់ជួបរបស់អ្នក។', 'This is where you manage your profile and sessions.')}
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <Card>
            <div className="flex items-start gap-4">
              <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${isVisible ? 'bg-arom-soft text-arom' : 'bg-arom-warning-soft text-arom-warning'}`}>
                {isVisible ? <Eye size={24} aria-hidden="true" /> : <EyeOff size={24} aria-hidden="true" />}
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-ink">
                  {isVisible
                    ? t('អ្នកប្រើអាចមើលឃើញប្រវត្តិរូបរបស់អ្នក', 'Users can see your profile')
                    : t('អ្នកប្រើមិនទាន់ឃើញប្រវត្តិរូបរបស់អ្នកទេ', 'Users cannot see your profile yet')}
                </h2>
                <p className="mt-1 text-sm leading-6 text-ink-muted">
                  {isVisible
                    ? t('អ្នកប្រើអាចរកឃើញ និងកក់ការណាត់ជួបជាមួយអ្នកបាន។', 'People can find you and book sessions.')
                    : t(
                        `សូមបំពេញ ${remaining.length} ជំហានខាងក្រោម។ ប្រវត្តិរូបរបស់អ្នកនឹងបង្ហាញភ្លាមៗ នៅពេលរួចរាល់។`,
                        `Finish the ${remaining.length} step${remaining.length > 1 ? 's' : ''} below. Your profile appears to users as soon as it is complete.`,
                      )}
                </p>
                {isVisible && demoMode === 'established' && (
                  <Link href={`/professional/${profile.slug}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-arom hover:underline">
                    {t('មើលប្រវត្តិរូបសាធារណៈ', 'View your public profile')}
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>

            <ul className="mt-5 space-y-2">
              {checklist.map((item) => (
                <li key={item.key}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm ${item.done ? 'text-ink-muted' : 'bg-arom-wash/60 font-medium text-ink hover:bg-arom-wash'}`}>
                      {item.done ? (
                        <CheckCircle2 size={18} aria-hidden="true" className="shrink-0 text-arom" />
                      ) : (
                        <Circle size={18} aria-hidden="true" className="shrink-0 text-arom-warning" />
                      )}
                      <span className={item.done ? 'line-through decoration-ink-muted/40' : ''}>{km ? item.label.km : item.label.en}</span>
                      {!item.done && <ArrowRight size={15} aria-hidden="true" className="ml-auto text-arom" />}
                    </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
              <CalendarCheck size={20} aria-hidden="true" className="text-arom" />
              {t('ការណាត់ជួបថ្ងៃនេះ', "Today's sessions")}
            </h2>
            {todaySessions.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">{t('មិនមានការណាត់ជួបថ្ងៃនេះទេ។', 'No sessions today.')}</p>
            ) : (
              <ul className="mt-4 divide-y divide-arom-border">
                {todaySessions.map((session) => (
                  <li key={session.id} className="flex items-center gap-4 py-3 text-sm">
                    <span className="flex items-center gap-1.5 font-semibold tabular-nums text-ink">
                      <Clock size={15} aria-hidden="true" className="text-arom" />
                      {timeFormat.format(new Date(session.startsAt))}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-ink">{session.clientName}</span>
                    <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                      {session.sessionType === 'online' ? <Monitor size={14} aria-hidden="true" /> : <UserRound size={14} aria-hidden="true" />}
                      {session.sessionType === 'online' ? t('អនឡាញ', 'Online') : t('ជួបផ្ទាល់', 'In person')}
                    </span>
                    <JoinButton booking={session} now={now} km={km} size="sm" />
                    <Link href={`/pro/bookings/${session.id}`} className="text-xs font-semibold text-arom hover:underline">
                      {t('រៀបចំ', 'Prepare')}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/pro/bookings" className="mt-3 inline-block text-sm font-semibold text-arom hover:underline">
              {t('មើលការកក់ទាំងអស់', 'See all bookings')}
            </Link>
          </Card>
        </div>

        <aside className="space-y-5">
          {pendingChanges.length > 0 && (
            <Card className="border-arom-warning/30">
              <h2 className="text-base font-bold text-ink">{t('រង់ចាំអ្នកគ្រប់គ្រងពិនិត្យ', 'Waiting for admin review')}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {pendingChanges.map((change) => (
                  <li key={change.field}>
                    <p className="text-xs text-ink-muted">{km ? reviewedFieldLabels[change.field].km : reviewedFieldLabels[change.field].en}</p>
                    <p className="font-medium text-ink">{change.to}</p>
                  </li>
                ))}
              </ul>
              <Link href="/pro/profile" className="mt-3 inline-block text-sm font-semibold text-arom hover:underline">
                {t('មើលក្នុងប្រវត្តិរូប', 'See in My profile')}
              </Link>
            </Card>
          )}

          {freeDuringTesting && (
            <Card>
              <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                <Gift size={18} aria-hidden="true" className="text-arom" />
                {t('មិនទាន់គិតប្រាក់ក្នុងអំឡុងពេលសាកល្បង', 'No payments during testing')}
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                {t(
                  'អ្នកប្រើឃើញតម្លៃរបស់អ្នក ប៉ុន្តែមិនទាន់មាននរណាបង់ប្រាក់ទេ ខណៈ AROM កំពុងសាកល្បង។',
                  'Users see your price, but nobody pays while AROM is in testing.',
                )}
              </p>
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}
