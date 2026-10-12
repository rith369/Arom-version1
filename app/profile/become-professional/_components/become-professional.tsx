'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  LogOut,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import {
  AromBrand,
  DesktopNavigation,
  MobileNavigation,
} from '../../../_components/app-navigation';
import { useAuth } from '../../../_components/auth-provider';
import { useLanguage } from '../../../_components/language-provider';
import {
  LANGUAGE_OPTIONS,
  SPECIALTY_OPTIONS,
  createApplicationSchema,
  demoRejectedNote,
  initialApplication,
  type ApplicationFormInput,
  type ApplicationFormValues,
  type ApplicationStatus,
  type ProfessionalApplication,
} from '../_data/application';

const inputClass = (hasError: boolean) =>
  `mt-2 h-12 w-full rounded-xl border bg-arom-wash/75 px-4 text-[0.94rem] text-ink outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-ink-muted/72 focus:bg-white focus:ring-4 ${
    hasError
      ? 'border-arom-danger/70 focus:border-arom-danger focus:ring-arom-danger/10'
      : 'border-arom/35 hover:border-arom/60 focus:border-arom focus:ring-arom/10'
  }`;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-arom-danger">
      {message}
    </p>
  );
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

function ApplicationForm({
  previous,
  onSubmit,
}: {
  previous: ProfessionalApplication | null;
  onSubmit: (values: ApplicationFormValues, documentName: string) => void;
}) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const schema = useMemo(() => createApplicationSchema(km), [km]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormInput, unknown, ApplicationFormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      fullName: previous?.fullName ?? user?.fullName ?? '',
      title: previous?.title ?? '',
      licenseNumber: previous?.licenseNumber ?? '',
      issuingBody: previous?.issuingBody ?? 'Ministry of Health, Cambodia',
      specialties: previous?.specialties ?? [],
      languages: previous?.languages ?? [],
      yearsExperience: previous?.yearsExperience,
      phone: previous?.phone ?? '',
      sameTelegram: previous ? previous.telegram === previous.phone : true,
      telegram:
        previous && previous.telegram !== previous.phone ? previous.telegram : '',
      motivation: previous?.motivation ?? '',
      confirm: false,
    },
  });

  const sameTelegram = useWatch({ control, name: 'sameTelegram' });

  const submit = handleSubmit((values) => {
    onSubmit(values, values.document[0]?.name ?? '');
  });

  const chipClass =
    'cursor-pointer rounded-full border border-arom-border bg-white px-4 py-2 text-sm text-ink transition-colors duration-150 hover:border-arom/50 has-[:checked]:border-arom has-[:checked]:bg-arom has-[:checked]:text-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-arom';

  return (
    <form onSubmit={submit} noValidate className="mt-6 space-y-6">
      <Card>
        <h2 className="text-base font-bold text-ink sm:text-lg">
          {t('អំពីអ្នក (About you)', 'About you')}
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-ink sm:col-span-2">
            {t('ឈ្មោះពេញ *', 'Full name *')}
            <input
              {...register('fullName')}
              autoComplete="name"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby="fullName-error"
              className={inputClass(Boolean(errors.fullName))}
            />
            <FieldError id="fullName-error" message={errors.fullName?.message} />
          </label>

          <label className="block text-sm font-semibold text-ink">
            {t('លេខទូរស័ព្ទ *', 'Phone number *')}
            <input
              {...register('phone')}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="012 345 678"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby="phone-error"
              className={inputClass(Boolean(errors.phone))}
            />
            <FieldError id="phone-error" message={errors.phone?.message} />
          </label>

          <div>
            <label className="flex h-full cursor-pointer items-center gap-3 pt-2 text-sm text-ink sm:pt-7">
              <input
                {...register('sameTelegram')}
                type="checkbox"
                className="size-4 accent-arom"
              />
              {t('ប្រើលេខដូចគ្នាលើ Telegram', 'Same number on Telegram')}
            </label>
          </div>

          {!sameTelegram && (
            <label className="block text-sm font-semibold text-ink sm:col-span-2">
              {t('ឈ្មោះ Telegram (ស្រេចចិត្ត)', 'Telegram username (optional)')}
              <input
                {...register('telegram')}
                placeholder="@username"
                aria-invalid={Boolean(errors.telegram)}
                aria-describedby="telegram-error"
                className={inputClass(Boolean(errors.telegram))}
              />
              <FieldError id="telegram-error" message={errors.telegram?.message} />
            </label>
          )}
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-arom-wash/70 p-3 text-xs leading-5 text-ink-muted">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-arom" />
          {t(
            'មានតែក្រុម AROM ទេដែលឃើញលេខទូរស័ព្ទ និង Telegram របស់អ្នក។ យើងប្រើវាសម្រាប់តែផ្ទៀងផ្ទាត់ពាក្យស្នើសុំប៉ុណ្ណោះ ហើយវាមិនបង្ហាញលើប្រវត្តិរូបសាធារណៈទេ។',
            'Only the AROM team sees your phone and Telegram. We use them only to verify your application, and they never appear on your public profile.',
          )}
        </p>
      </Card>

      <Card>
        <h2 className="text-base font-bold text-ink sm:text-lg">
          {t('អាជ្ញាប័ណ្ណរបស់អ្នក (Your license)', 'Your license')}
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-ink sm:col-span-2">
            {t('មុខតំណែង *', 'Professional title *')}
            <input
              {...register('title')}
              placeholder={t('ឧ. អ្នកចិត្តសាស្ត្រគ្លីនិក', 'For example, Clinical Psychologist')}
              aria-invalid={Boolean(errors.title)}
              aria-describedby="title-error"
              className={inputClass(Boolean(errors.title))}
            />
            <FieldError id="title-error" message={errors.title?.message} />
          </label>

          <label className="block text-sm font-semibold text-ink">
            {t('លេខអាជ្ញាប័ណ្ណ *', 'License number *')}
            <input
              {...register('licenseNumber')}
              aria-invalid={Boolean(errors.licenseNumber)}
              aria-describedby="licenseNumber-error"
              className={inputClass(Boolean(errors.licenseNumber))}
            />
            <FieldError id="licenseNumber-error" message={errors.licenseNumber?.message} />
          </label>

          <label className="block text-sm font-semibold text-ink">
            {t('ស្ថាប័នចេញអាជ្ញាប័ណ្ណ *', 'Issuing body *')}
            <input
              {...register('issuingBody')}
              aria-invalid={Boolean(errors.issuingBody)}
              aria-describedby="issuingBody-error"
              className={inputClass(Boolean(errors.issuingBody))}
            />
            <FieldError id="issuingBody-error" message={errors.issuingBody?.message} />
          </label>

          <label className="block text-sm font-semibold text-ink sm:col-span-2">
            {t('រូបថត ឬឯកសារអាជ្ញាប័ណ្ណ *', 'License photo or PDF *')}
            <input
              {...register('document')}
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              aria-invalid={Boolean(errors.document)}
              aria-describedby="document-hint document-error"
              className="mt-2 block w-full rounded-xl border border-dashed border-arom/40 bg-arom-wash/50 p-3 text-sm text-ink-muted file:mr-4 file:rounded-full file:border-0 file:bg-arom file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-arom-deep"
            />
            <span id="document-hint" className="mt-1.5 block text-xs font-normal text-ink-muted">
              {t(
                'PDF, JPG ឬ PNG មិនលើស 5 MB។ រក្សាទុកដោយឯកជន មានតែក្រុម AROM ទេដែលអាចមើលបាន។',
                'PDF, JPG or PNG, up to 5 MB. Stored privately, only the AROM team can open it.',
              )}
              {previous?.documentName &&
                ` ${t('ឯកសារមុន:', 'Previous file:')} ${previous.documentName}`}
            </span>
            <FieldError id="document-error" message={errors.document?.message} />
          </label>
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-bold text-ink sm:text-lg">
          {t('ការងាររបស់អ្នក (Your practice)', 'Your practice')}
        </h2>

        <fieldset className="mt-4" aria-describedby="specialties-error">
          <legend className="text-sm font-semibold text-ink">
            {t('ជំនាញ *', 'Specialties *')}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {SPECIALTY_OPTIONS.map((option) => (
              <label key={option.value} className={chipClass}>
                <input
                  {...register('specialties')}
                  type="checkbox"
                  value={option.value}
                  className="sr-only"
                />
                {km ? option.km : option.value}
              </label>
            ))}
          </div>
          <FieldError id="specialties-error" message={errors.specialties?.message} />
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <fieldset aria-describedby="languages-error">
            <legend className="text-sm font-semibold text-ink">
              {t('ភាសាពិគ្រោះ *', 'Session languages *')}
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((option) => (
                <label key={option.value} className={chipClass}>
                  <input
                    {...register('languages')}
                    type="checkbox"
                    value={option.value}
                    className="sr-only"
                  />
                  {km ? option.km : option.value}
                </label>
              ))}
            </div>
            <FieldError id="languages-error" message={errors.languages?.message} />
          </fieldset>

          <label className="block text-sm font-semibold text-ink">
            {t('បទពិសោធន៍ (ឆ្នាំ) *', 'Years of experience *')}
            <input
              {...register('yearsExperience', { valueAsNumber: true })}
              type="number"
              inputMode="numeric"
              min={0}
              max={60}
              aria-invalid={Boolean(errors.yearsExperience)}
              aria-describedby="yearsExperience-error"
              className={inputClass(Boolean(errors.yearsExperience))}
            />
            <FieldError
              id="yearsExperience-error"
              message={errors.yearsExperience?.message}
            />
          </label>
        </div>

        <label className="mt-5 block text-sm font-semibold text-ink">
          {t('ហេតុអ្វីអ្នកចង់ចូលរួមជាមួយ AROM? (ស្រេចចិត្ត)', 'Why do you want to join AROM? (optional)')}
          <textarea
            {...register('motivation')}
            rows={4}
            maxLength={2000}
            className={`${inputClass(false)} h-auto py-3`}
          />
        </label>
      </Card>

      <Card>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-ink">
          <input
            {...register('confirm')}
            type="checkbox"
            aria-describedby="confirm-error"
            className="mt-1 size-4 shrink-0 accent-arom"
          />
          {t(
            'ខ្ញុំបញ្ជាក់ថាព័ត៌មានទាំងនេះពិតប្រាកដ ហើយអាជ្ញាប័ណ្ណរបស់ខ្ញុំនៅមានសុពលភាព។',
            'I confirm these details are true and my license is currently valid.',
          )}
        </label>
        <FieldError id="confirm-error" message={errors.confirm?.message} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 w-full rounded-full bg-arom px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-colors duration-150 hover:bg-arom-deep disabled:opacity-60 sm:w-auto">
          {t('ដាក់ពាក្យស្នើសុំ', 'Submit application')}
        </button>
      </Card>
    </form>
  );
}

function ApplicationSummary({ application }: { application: ProfessionalApplication }) {
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const rows = [
    { label: t('ឈ្មោះ', 'Name'), value: application.fullName },
    { label: t('មុខតំណែង', 'Title'), value: application.title },
    { label: t('លេខអាជ្ញាប័ណ្ណ', 'License number'), value: application.licenseNumber },
    { label: t('ឯកសារ', 'Document'), value: application.documentName },
    { label: t('ទូរស័ព្ទ', 'Phone'), value: application.phone },
    {
      label: 'Telegram',
      value:
        application.telegram === application.phone
          ? t('លេខដូចគ្នា', 'Same as phone')
          : application.telegram || t('មិនមាន', 'Not provided'),
    },
  ];

  return (
    <dl className="mt-5 grid gap-3 border-t border-arom-border/60 pt-5 text-sm sm:grid-cols-2">
      {rows.map(({ label, value }) => (
        <div key={label} className="rounded-2xl bg-arom-wash/70 p-3">
          <dt className="text-xs text-ink-muted">{label}</dt>
          <dd className="mt-0.5 break-words font-semibold text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function StatusCard({
  application,
  onApplyAgain,
}: {
  application: ProfessionalApplication;
  onApplyAgain: () => void;
}) {
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const submitted = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Phnom_Penh',
  }).format(new Date(application.createdAt));

  if (application.status === 'pending') {
    return (
      <Card className="mt-6">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-arom-warning-soft text-arom-warning">
            <Clock size={24} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink">
              {t('យើងកំពុងពិនិត្យពាក្យស្នើសុំរបស់អ្នក', "We're reviewing your application")}
            </h2>
            <p className="mt-1 text-sm leading-6 text-ink-muted">
              {t(
                `បានដាក់ស្នើនៅ ${submitted}។ ជាធម្មតាត្រូវការពេល ១ ទៅ ៣ ថ្ងៃធ្វើការ។ យើងនឹងទាក់ទងអ្នកតាមទូរស័ព្ទ ឬ Telegram ប្រសិនបើត្រូវការព័ត៌មានបន្ថែម។`,
                `Submitted on ${submitted}. This usually takes 1 to 3 working days. We will contact you by phone or Telegram if we need anything else.`,
              )}
            </p>
          </div>
        </div>
        <ApplicationSummary application={application} />
      </Card>
    );
  }

  if (application.status === 'approved') {
    return (
      <Card className="mt-6">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-arom-soft text-arom">
            <CheckCircle2 size={24} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink">
              {t('អ្នកត្រូវបានអនុម័ត', "You're approved")}
            </h2>
            <p className="mt-1 text-sm leading-6 text-ink-muted">
              {t(
                'សូមស្វាគមន៍មកកាន់ AROM។ សូមចាកចេញ ហើយចូលម្តងទៀត ដើម្បីបើកផ្នែកអ្នកជំនាញ។ បន្ទាប់មក សូមបំពេញប្រវត្តិរូបរបស់អ្នក (រូបថត ប្រវត្តិ តម្លៃ និងម៉ោង) មុនពេលអតិថិជនអាចកក់បាន។',
                'Welcome to AROM. Please log out and log in again to open your professional area. Then complete your profile (photo, bio, prices and schedule) before clients can book you.',
              )}
            </p>
          </div>
        </div>
        <form action="/api/auth/logout" method="post" className="mt-5">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-full bg-arom px-6 py-3 text-sm font-bold text-white hover:bg-arom-deep">
            <LogOut size={18} />
            {t('ចាកចេញ ហើយចូលម្តងទៀត', 'Log out and log in again')}
          </button>
        </form>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-arom-danger-soft text-arom-danger">
          <XCircle size={24} />
        </span>
        <div>
          <h2 className="text-lg font-bold text-ink">
            {t('ពាក្យស្នើសុំមិនត្រូវបានអនុម័តទេ', 'Your application was not approved')}
          </h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">
            {t(
              'អ្នកអាចកែតម្រូវ ហើយដាក់ពាក្យម្តងទៀតបាន។',
              'You can fix the details below and apply again.',
            )}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-arom-danger/20 bg-arom-danger-soft/50 p-4 text-sm">
        <p className="text-xs font-semibold text-arom-danger">
          {t('មូលហេតុពីក្រុម AROM', 'Reason from the AROM team')}
        </p>
        <p className="mt-1 leading-6 text-ink">{application.reviewNote}</p>
      </div>

      <button
        type="button"
        onClick={onApplyAgain}
        className="mt-5 flex items-center gap-2 rounded-full bg-arom px-6 py-3 text-sm font-bold text-white hover:bg-arom-deep">
        <RotateCcw size={18} />
        {t('ដាក់ពាក្យម្តងទៀត', 'Apply again')}
      </button>
    </Card>
  );
}

export function BecomeProfessional() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const [application, setApplication] = useState<ProfessionalApplication | null>(
    initialApplication,
  );
  const [isApplyingAgain, setIsApplyingAgain] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const alreadyProfessional = user?.role === 'professional' || user?.role === 'admin';
  const showForm = !application || isApplyingAgain;

  function submitApplication(values: ApplicationFormValues, documentName: string) {
    setApplication({
      id: crypto.randomUUID(),
      fullName: values.fullName,
      title: values.title,
      licenseNumber: values.licenseNumber,
      issuingBody: values.issuingBody,
      documentName,
      specialties: values.specialties,
      languages: values.languages,
      yearsExperience: values.yearsExperience,
      phone: values.phone,
      telegram: values.sameTelegram ? values.phone : values.telegram,
      motivation: values.motivation,
      status: 'pending',
      reviewNote: '',
      createdAt: new Date().toISOString(),
    });
    setIsApplyingAgain(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Demo only: lets the team preview every status before the backend exists.
  function previewStatus(status: ApplicationStatus | 'none') {
    setIsApplyingAgain(false);
    setIsPreviewing(true);

    if (status === 'none') {
      setApplication(null);
      return;
    }

    setApplication({
      id: 'demo-application',
      fullName: user?.fullName ?? 'Vanna Keo',
      title: 'Licensed Counselor',
      licenseNumber: 'MOH CNS 2022 207',
      issuingBody: 'Ministry of Health, Cambodia',
      documentName: 'license.jpg',
      specialties: ['Anxiety', 'Students'],
      languages: ['Khmer', 'English'],
      yearsExperience: 4,
      phone: '012345678',
      telegram: '012345678',
      motivation: '',
      status,
      reviewNote: status === 'rejected' ? demoRejectedNote : '',
      createdAt: '2026-10-09T03:00:00Z',
    });
  }

  const demoOptions: { value: ApplicationStatus | 'none'; label: string }[] = [
    { value: 'none', label: t('មិនទាន់ដាក់', 'Not applied') },
    { value: 'pending', label: t('កំពុងពិនិត្យ', 'Pending') },
    { value: 'approved', label: t('បានអនុម័ត', 'Approved') },
    { value: 'rejected', label: t('បានបដិសេធ', 'Rejected') },
  ];
  const currentPreview = isApplyingAgain ? 'none' : (application?.status ?? 'none');

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="Profile" />

      <div className="min-w-0">
        <main className="mx-auto min-h-screen w-full max-w-[48rem] px-4 pb-28 pt-5 sm:px-8 sm:pt-7 lg:px-10 lg:pb-12 lg:pt-8">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                aria-label={t('ត្រឡប់ទៅប្រវត្តិរូប', 'Back to profile')}
                className="group flex size-11 shrink-0 items-center justify-center rounded-full border border-arom-border bg-white text-arom shadow-sm transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-arom">
                <ArrowLeft
                  aria-hidden="true"
                  size={20}
                  className="transition-transform duration-150 group-hover:-translate-x-0.5"
                />
              </Link>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                  {t('ក្លាយជាអ្នកជំនាញ (Become a Professional)', 'Become a Professional')}
                </h1>
                <p className="text-xs text-ink-muted sm:text-sm">
                  {t(
                    'សម្រាប់អ្នកជំនាញសុខភាពផ្លូវចិត្តដែលមានអាជ្ញាប័ណ្ណ',
                    'For licensed mental health professionals',
                  )}
                </p>
              </div>
            </div>
            <div className="lg:hidden">
              <AromBrand compact />
            </div>
          </header>

          <div className="mt-6 rounded-2xl border border-arom-warning/25 bg-arom-warning-soft px-4 py-3 text-xs text-arom-warning">
            <p>
              {t(
                'ទិន្នន័យសាកល្បង។ មិនទាន់ផ្ញើទៅក្រុម AROM នៅឡើយទេ។ មើលស្ថានភាពនីមួយៗ:',
                'Demo data. Nothing is sent to the AROM team yet. Preview each status:',
              )}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {demoOptions.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => previewStatus(value)}
                  aria-pressed={currentPreview === value}
                  className={`rounded-full border px-3 py-1 font-semibold ${
                    currentPreview === value
                      ? 'border-arom-warning bg-arom-warning text-white'
                      : 'border-arom-warning/40 bg-white/60'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {alreadyProfessional && !isPreviewing ? (
            <Card className="mt-6">
              <div className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-arom-soft text-arom">
                  <Stethoscope size={24} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-ink">
                    {t('អ្នកជាអ្នកជំនាញរួចហើយ', 'You already have professional access')}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-ink-muted">
                    {t(
                      'គណនីរបស់អ្នកមិនចាំបាច់ដាក់ពាក្យស្នើសុំទេ។',
                      'Your account does not need to apply.',
                    )}
                  </p>
                </div>
              </div>
            </Card>
          ) : showForm ? (
            <>
              {isApplyingAgain && application?.reviewNote && (
                <div className="mt-6 rounded-2xl border border-arom-danger/20 bg-arom-danger-soft/50 p-4 text-sm">
                  <p className="text-xs font-semibold text-arom-danger">
                    {t('មូលហេតុលើកមុន', 'Reason last time')}
                  </p>
                  <p className="mt-1 leading-6 text-ink">{application.reviewNote}</p>
                </div>
              )}

              {!isApplyingAgain && (
                <Card className="mt-6">
                  <h2 className="text-base font-bold text-ink sm:text-lg">
                    {t('របៀបដែលវាដំណើរការ (How it works)', 'How it works')}
                  </h2>
                  <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[
                      {
                        icon: FileText,
                        title: t('ដាក់ពាក្យ', 'Apply'),
                        text: t('បំពេញទម្រង់ ហើយភ្ជាប់អាជ្ញាប័ណ្ណ។', 'Fill in the form and attach your license.'),
                      },
                      {
                        icon: ShieldCheck,
                        title: t('យើងពិនិត្យ', 'We check'),
                        text: t('ក្រុម AROM ផ្ទៀងផ្ទាត់អាជ្ញាប័ណ្ណក្នុងរយៈពេល ១ ទៅ ៣ ថ្ងៃ។', 'The AROM team verifies your license in 1 to 3 days.'),
                      },
                      {
                        icon: Stethoscope,
                        title: t('រៀបចំប្រវត្តិរូប', 'Set up your profile'),
                        text: t('បន្ថែមរូបថត ប្រវត្តិ តម្លៃ និងម៉ោង។', 'Add your photo, bio, prices and schedule.'),
                      },
                    ].map(({ icon: Icon, title, text }, index) => (
                      <li key={title} className="rounded-2xl bg-arom-wash/70 p-4">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-white text-arom shadow-sm">
                          <Icon size={18} />
                        </span>
                        <p className="mt-3 text-sm font-bold text-ink">
                          {index + 1}. {title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-ink-muted">{text}</p>
                      </li>
                    ))}
                  </ol>
                </Card>
              )}

              <ApplicationForm
                key={isApplyingAgain ? 'again' : 'new'}
                previous={isApplyingAgain ? application : null}
                onSubmit={submitApplication}
              />
            </>
          ) : (
            application && (
              <StatusCard
                application={application}
                onApplyAgain={() => setIsApplyingAgain(true)}
              />
            )
          )}
        </main>
      </div>

      <MobileNavigation active="Profile" />
    </div>
  );
}
