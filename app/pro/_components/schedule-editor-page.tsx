'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { useLanguage } from '../../_components/language-provider';
import { usePro } from './pro-provider';
import { ScheduleEditor } from './schedule-editor';

export function ScheduleEditorPage() {
  const { profile } = usePro();
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  // Clinic therapists have no schedule: the clinic books them from its own
  // times (section 34). The menu hides this page; this covers old links.
  if (profile.clinic) {
    const clinicName = (km && profile.clinic.kmName) || profile.clinic.name;
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t('កាលវិភាគរបស់ខ្ញុំ', 'My schedule')}</h1>
        <div className="mt-6 flex items-start gap-3 rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-arom-soft text-arom">
            <Building2 size={20} aria-hidden="true" />
          </span>
          <div className="text-sm leading-6 text-ink">
            <p className="font-semibold">
              {t(`អ្នកធ្វើការនៅ ${clinicName}`, `You work at ${clinicName}`)}
            </p>
            <p className="mt-1 text-ink-muted">
              {t(
                'តុបម្រើគ្លីនិកកក់វគ្គរបស់អ្នកពីម៉ោងរបស់គ្លីនិក ដូច្នេះអ្នកមិនចាំបាច់មានកាលវិភាគទេ។ សម្រាប់វគ្គអនឡាញ បន្ថែមតំណប្រជុំនៅក្នុង ការកក់របស់ខ្ញុំ។',
                "The clinic desk books your sessions from the clinic's times, so you do not need a schedule. For an online session, add the meeting link in My bookings.",
              )}
            </p>
            <Link href="/pro/bookings" className="mt-3 inline-block font-semibold text-arom hover:underline">
              {t('ទៅកាន់ការកក់របស់ខ្ញុំ', 'Go to My bookings')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ScheduleEditor />;
}
