'use client';

import Image from 'next/image';
import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import { Clock, Eye, ImageUp, Pencil, Save, Trash2, Undo2 } from 'lucide-react';

import { usePro } from './pro-provider';
import { ProfilePreview } from './profile-preview';
import { reviewedFieldLabels } from './pro-home';
import { useLanguage } from '../../_components/language-provider';
import { getTherapist } from '@/lib/therapists';
import { MAX_PRICE_USD, formatPrice, isValidPrice, type SessionPrice } from '@/lib/pricing';
import {
  LANGUAGE_OPTIONS,
  PLACEHOLDER_PHOTO,
  REVIEWED_FIELDS,
  SPECIALTY_OPTIONS,
  toPublicTherapist,
  type ProProfile,
  type ReviewedField,
  type SessionType,
} from '../_data/profile';

const fieldClass =
  'mt-2 w-full rounded-xl border border-arom/30 bg-arom-wash/60 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-arom focus:bg-white focus:ring-4 focus:ring-arom/10';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

function Section({ id, title, hint, children }: { id?: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
      <h2 className="text-base font-bold text-ink sm:text-lg">{title}</h2>
      {hint && <p className="mt-1 text-sm leading-6 text-ink-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

const sameProfile = (a: ProProfile, b: ProProfile) => JSON.stringify(a) === JSON.stringify(b);

export function ProfileEditor() {
  const { profile, pendingChanges, saveProfile, withdrawChange, freeDuringTesting } = usePro();
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const [draft, setDraft] = useState<ProProfile>(profile);
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const isDirty = !sameProfile(draft, profile);
  const priceKind = draft.price?.kind ?? null;

  function setPriceKind(kind: SessionPrice['kind']) {
    const current = draft.price;
    const amount = current?.kind === 'fixed' ? current.amount : current?.kind === 'range' ? current.min : 20;
    set(
      'price',
      kind === 'free'
        ? { kind }
        : kind === 'fixed'
          ? { kind, amount }
          : { kind, min: amount, max: current?.kind === 'range' ? current.max : amount + 20 },
    );
  }

  const numberValue = (value: string) => (value === '' ? Number.NaN : Number(value));
  const pendingFor = (field: ReviewedField) => pendingChanges.find((change) => change.field === field);
  const specialtyChoices = [...new Set([...SPECIALTY_OPTIONS, ...profile.specialties])];

  // Preview shows what users would see after saving: reviewed fields stay
  // at the live value until an admin approves them.
  const previewProfile = { ...draft };
  for (const field of REVIEWED_FIELDS) previewProfile[field] = profile[field];
  const previewTherapist = toPublicTherapist(previewProfile, getTherapist(profile.slug));

  useEffect(() => {
    if (!isDirty) return;
    const message = km ? 'អ្នកមានការផ្លាស់ប្តូរមិនទាន់រក្សាទុក។ ចាកចេញ?' : 'You have unsaved changes. Leave without saving?';

    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    function onClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest('a[href]');
      if (!link || link.getAttribute('href')?.startsWith('#')) return;
      if (!window.confirm(message)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [isDirty, km]);

  function set<Key extends keyof ProProfile>(key: Key, value: ProProfile[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setNotice(null);
  }

  function toggle(list: string[], value: string) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setNotice({ tone: 'error', text: t('សូមប្រើរូបថត JPG, PNG ឬ WebP។', 'Use a JPG, PNG or WebP photo.') });
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setNotice({ tone: 'error', text: t('រូបថតត្រូវតូចជាង 5 MB។', 'The photo must be 5 MB or smaller.') });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => set('photoUrl', String(reader.result));
    reader.readAsDataURL(file);
  }

  function save() {
    if (!draft.displayName.trim() || !draft.title.trim()) {
      setNotice({ tone: 'error', text: t('ត្រូវការឈ្មោះ និងមុខតំណែងជាភាសាអង់គ្លេស។', 'Your name and title in English are required.') });
      return;
    }
    if (draft.price && !isValidPrice(draft.price)) {
      setNotice({
        tone: 'error',
        text: t(
          `សូមពិនិត្យតម្លៃ (1 ដល់ ${MAX_PRICE_USD} ដុល្លារ ហើយតម្លៃទាបត្រូវតិចជាងតម្លៃខ្ពស់)។`,
          `Check the price (1 to ${MAX_PRICE_USD} USD, and the lowest must be below the highest).`,
        ),
      });
      return;
    }
    if (draft.yearsExperience !== null && (!Number.isInteger(draft.yearsExperience) || draft.yearsExperience < 0 || draft.yearsExperience > 60)) {
      setNotice({ tone: 'error', text: t('សូមពិនិត្យចំនួនឆ្នាំបទពិសោធន៍។', 'Check your years of experience.') });
      return;
    }

    const result = saveProfile({
      ...draft,
      bio: draft.bio.trim(),
      kmBio: draft.kmBio.trim(),
    });

    // Reviewed fields go back to the live value; the waiting value shows under them.
    const next = { ...draft, bio: draft.bio.trim(), kmBio: draft.kmBio.trim() };
    for (const field of REVIEWED_FIELDS) next[field] = profile[field];
    setDraft(next);

    const parts = [];
    if (result.applied.length) parts.push(t('ការផ្លាស់ប្តូរត្រូវបានរក្សាទុក។', 'Changes saved.'));
    if (result.pending.length) {
      parts.push(
        t(
          `ការផ្លាស់ប្តូរ ${result.pending.length} កំពុងរង់ចាំអ្នកគ្រប់គ្រងពិនិត្យ។`,
          `${result.pending.length} change${result.pending.length > 1 ? 's' : ''} sent to an admin for review.`,
        ),
      );
    }
    setNotice({ tone: 'ok', text: parts.join(' ') || t('មិនមានអ្វីផ្លាស់ប្តូរទេ។', 'Nothing changed.') });
  }

  function reviewedField(field: ReviewedField, isKhmer = false) {
    const pending = pendingFor(field);
    const label = km ? reviewedFieldLabels[field].km : reviewedFieldLabels[field].en;

    return (
      <label className="block text-sm font-medium text-ink">
        {label}
        {(field === 'displayName' || field === 'title') && ' *'}
        <input
          value={draft[field]}
          maxLength={120}
          onChange={(event) => set(field, event.target.value)}
          className={`${fieldClass} ${isKhmer ? 'font-khmer' : ''}`}
        />
        {pending && (
          <span className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-normal text-arom-warning">
            <Clock size={13} aria-hidden="true" />
            {t('រង់ចាំពិនិត្យ:', 'Waiting for review:')} <strong className="font-semibold">{pending.to}</strong>
            <button type="button" onClick={() => withdrawChange(field)} className="font-semibold text-arom underline">
              {t('ដកវិញ', 'Withdraw')}
            </button>
          </span>
        )}
      </label>
    );
  }

  const chip = (selected: boolean) =>
    `rounded-full border px-4 py-2 text-sm transition-colors ${
      selected ? 'border-arom bg-arom text-white' : 'border-arom-border bg-white text-ink hover:border-arom/50'
    }`;

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t('ប្រវត្តិរូបរបស់ខ្ញុំ', 'My profile')}</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {t('នេះជាអ្វីដែលអ្នកប្រើឃើញ មុនពេលកក់ការណាត់ជួបជាមួយអ្នក។', 'This is what people see before they book a session with you.')}
      </p>

      <div className="sticky top-0 z-10 mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-arom-border bg-white/95 p-3 shadow-sm backdrop-blur">
        <div role="tablist" aria-label={t('របៀបមើល', 'View')} className="flex gap-1 rounded-full border border-arom-border p-1">
          {(['edit', 'preview'] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={view === value}
              onClick={() => setView(value)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium ${view === value ? 'bg-arom text-white' : 'text-ink-muted hover:bg-arom-wash'}`}>
              {value === 'edit' ? <Pencil size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
              {value === 'edit' ? t('កែសម្រួល', 'Edit') : t('មើលជាមុន', 'Preview')}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {isDirty && <span className="text-xs font-medium text-arom-warning">{t('មិនទាន់រក្សាទុក', 'Unsaved changes')}</span>}
          <button
            type="button"
            onClick={() => {
              setDraft(profile);
              setNotice(null);
            }}
            disabled={!isDirty}
            className="flex items-center gap-1.5 rounded-full border border-arom-border px-4 py-2 text-sm text-ink-muted hover:bg-arom-wash disabled:opacity-40">
            <Undo2 size={15} aria-hidden="true" />
            {t('មិនធ្វើវិញ', 'Undo')}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!isDirty}
            className="flex items-center gap-1.5 rounded-full bg-arom px-5 py-2 text-sm font-semibold text-white hover:bg-arom-deep disabled:opacity-40">
            <Save size={15} aria-hidden="true" />
            {t('រក្សាទុក', 'Save changes')}
          </button>
        </div>
      </div>

      <p role="status" aria-live="polite" className={`mt-3 min-h-5 text-sm ${notice?.tone === 'error' ? 'text-arom-danger' : 'text-arom'}`}>
        {notice?.text}
      </p>

      {view === 'preview' ? (
        <div className="mt-2">
          <ProfilePreview therapist={previewTherapist} />
        </div>
      ) : (
        <div className="mt-2 space-y-5">
          <Section
            id="pro-photo"
            title={t('រូបថត', 'Photo')}
            hint={t('រូបថតច្បាស់ និងរួសរាយនៃមុខរបស់អ្នក។ អ្នកប្រើទុកចិត្តប្រវត្តិរូបដែលមានរូបថតពិត។', 'A clear, friendly photo of your face. People trust profiles with a real photo.')}>
            <div className="flex flex-wrap items-center gap-5">
              <div className="relative size-24 overflow-hidden rounded-full ring-4 ring-arom-soft">
                <Image src={draft.photoUrl || PLACEHOLDER_PHOTO} alt="" fill sizes="96px" className="object-cover" />
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-arom">
                  <ImageUp size={16} aria-hidden="true" />
                  {draft.photoUrl ? t('ប្តូររូបថត', 'Change photo') : t('ផ្ទុករូបថត', 'Upload photo')}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} className="sr-only" />
                </label>
                {draft.photoUrl && (
                  <button type="button" onClick={() => set('photoUrl', '')} className="flex items-center gap-1.5 rounded-full border border-arom-border px-4 py-2 text-sm text-ink-muted hover:bg-arom-wash">
                    <Trash2 size={15} aria-hidden="true" />
                    {t('លុប', 'Remove')}
                  </button>
                )}
              </div>
            </div>
            <p className="mt-3 text-xs text-ink-muted">{t('JPG, PNG ឬ WebP មិនលើស 5 MB។', 'JPG, PNG or WebP, up to 5 MB.')}</p>
          </Section>

          <Section
            title={t('ឈ្មោះ និងមុខតំណែង', 'Name and title')}
            hint={t(
              'ការផ្លាស់ប្តូរឈ្មោះ មុខតំណែង ឬអាជ្ញាប័ណ្ណ ត្រូវរង់ចាំអ្នកគ្រប់គ្រងពិនិត្យ។ ប្រវត្តិរូបសាធារណៈរក្សាព័ត៌មានបច្ចុប្បន្នរហូតដល់ពេលនោះ។',
              'Changes to your name, title or license wait for an admin to check them. Your public profile keeps the current details until then.',
            )}>
            <div className="grid gap-4 sm:grid-cols-2">
              {reviewedField('displayName')}
              {reviewedField('kmDisplayName', true)}
              {reviewedField('title')}
              {reviewedField('kmTitle', true)}
            </div>
          </Section>

          <Section title={t('អំពីអ្នក', 'About you')}>
            <div className="space-y-4">
              <label id="pro-bio" className="block scroll-mt-6 text-sm font-medium text-ink">
                {t('ប្រវត្តិរូប (អង់គ្លេស)', 'Bio (English)')}
                <textarea value={draft.bio} rows={5} maxLength={2000} onChange={(event) => set('bio', event.target.value)} className={fieldClass} />
                <span className={`mt-1 block text-xs font-normal ${draft.bio.trim().length < 80 ? 'text-arom-warning' : 'text-ink-muted'}`}>
                  {draft.bio.trim().length < 80
                    ? t(`យ៉ាងហោចណាស់ ៨០ តួអក្សរ (${draft.bio.trim().length}/80)`, `At least 80 characters (${draft.bio.trim().length}/80)`)
                    : `${draft.bio.trim().length}/2000`}
                </span>
              </label>
              <label id="pro-kmBio" className="block scroll-mt-6 text-sm font-medium text-ink">
                {t('ប្រវត្តិរូប (ខ្មែរ)', 'Bio (Khmer)')}
                <textarea value={draft.kmBio} rows={5} maxLength={2000} onChange={(event) => set('kmBio', event.target.value)} className={`${fieldClass} font-khmer`} />
                <span className={`mt-1 block text-xs font-normal ${draft.kmBio.trim().length < 40 ? 'text-arom-warning' : 'text-ink-muted'}`}>
                  {draft.kmBio.trim().length < 40
                    ? t(`យ៉ាងហោចណាស់ ៤០ តួអក្សរ (${draft.kmBio.trim().length}/40)`, `At least 40 characters (${draft.kmBio.trim().length}/40)`)
                    : `${draft.kmBio.trim().length}/2000`}
                </span>
              </label>
              <label className="block max-w-xs text-sm font-medium text-ink">
                {t('បទពិសោធន៍ (ឆ្នាំ)', 'Years of experience')}
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={60}
                  value={draft.yearsExperience ?? ''}
                  onChange={(event) => set('yearsExperience', event.target.value === '' ? null : event.target.valueAsNumber)}
                  className={fieldClass}
                />
              </label>
            </div>
          </Section>

          <Section id="pro-specialties" title={t('អ្វីដែលអ្នកជួយ', 'What you help with')}>
            <div className="flex flex-wrap gap-2">
              {specialtyChoices.map((option) => (
                <button key={option} type="button" aria-pressed={draft.specialties.includes(option)} onClick={() => set('specialties', toggle(draft.specialties, option))} className={chip(draft.specialties.includes(option))}>
                  {option}
                </button>
              ))}
            </div>
          </Section>

          <div className="grid gap-5 sm:grid-cols-2">
            <Section id="pro-languages" title={t('ភាសាពិគ្រោះ', 'Session languages')}>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((option) => (
                  <button key={option} type="button" aria-pressed={draft.languages.includes(option)} onClick={() => set('languages', toggle(draft.languages, option))} className={chip(draft.languages.includes(option))}>
                    {option === 'Khmer' ? t('ខ្មែរ', 'Khmer') : t('អង់គ្លេស', 'English')}
                  </button>
                ))}
              </div>
            </Section>

            <Section id="pro-sessions" title={t('របៀបពិគ្រោះ', 'How you meet clients')}>
              <div className="flex flex-wrap gap-2">
                {([
                  { value: 'online', label: t('អនឡាញ', 'Online') },
                  { value: 'in_person', label: t('ជួបផ្ទាល់', 'In person') },
                ] as { value: SessionType; label: string }[]).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={draft.sessionTypes.includes(option.value)}
                    onClick={() => set('sessionTypes', toggle(draft.sessionTypes, option.value) as SessionType[])}
                    className={chip(draft.sessionTypes.includes(option.value))}>
                    {option.label}
                  </button>
                ))}
              </div>
            </Section>
          </div>

          <Section
            id="pro-price"
            title={t('តម្លៃការពិគ្រោះ', 'Session price')}
            hint={
              freeDuringTesting
                ? t('អ្នកប្រើឃើញតម្លៃនេះលើប្រវត្តិរូបរបស់អ្នក។ មិនទាន់មាននរណាបង់ប្រាក់ទេ ខណៈ AROM កំពុងសាកល្បង។', 'Users see this on your profile. Nobody pays while AROM is in testing.')
                : t('អ្នកប្រើឃើញតម្លៃនេះលើប្រវត្តិរូបរបស់អ្នក។', 'Users see this on your profile.')
            }>
            <div className="flex flex-wrap gap-2">
              {([
                { value: 'free', label: t('ឥតគិតថ្លៃ', 'Free') },
                { value: 'fixed', label: t('តម្លៃមួយ', 'One price') },
                { value: 'range', label: t('ចន្លោះតម្លៃ', 'Price range') },
              ] as { value: SessionPrice['kind']; label: string }[]).map((option) => (
                <button key={option.value} type="button" aria-pressed={priceKind === option.value} onClick={() => setPriceKind(option.value)} className={chip(priceKind === option.value)}>
                  {option.label}
                </button>
              ))}
            </div>

            {draft.price?.kind === 'fixed' && (
              <label className="mt-4 block max-w-xs text-sm font-medium text-ink">
                {t('តម្លៃក្នុងមួយវគ្គ (ដុល្លារ)', 'Price a session (USD)')}
                <input
                  type="number"
                  inputMode="decimal"
                  min={1}
                  max={MAX_PRICE_USD}
                  value={Number.isNaN(draft.price.amount) ? '' : draft.price.amount}
                  onChange={(event) => set('price', { kind: 'fixed', amount: numberValue(event.target.value) })}
                  className={fieldClass}
                />
              </label>
            )}

            {draft.price?.kind === 'range' && (
              <div className="mt-4 grid max-w-md grid-cols-2 gap-3">
                <label className="block text-sm font-medium text-ink">
                  {t('ទាបបំផុត (ដុល្លារ)', 'From (USD)')}
                  <input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    max={MAX_PRICE_USD}
                    value={Number.isNaN(draft.price.min) ? '' : draft.price.min}
                    onChange={(event) => draft.price?.kind === 'range' && set('price', { ...draft.price, min: numberValue(event.target.value) })}
                    className={fieldClass}
                  />
                </label>
                <label className="block text-sm font-medium text-ink">
                  {t('ខ្ពស់បំផុត (ដុល្លារ)', 'To (USD)')}
                  <input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    max={MAX_PRICE_USD}
                    value={Number.isNaN(draft.price.max) ? '' : draft.price.max}
                    onChange={(event) => draft.price?.kind === 'range' && set('price', { ...draft.price, max: numberValue(event.target.value) })}
                    className={fieldClass}
                  />
                </label>
              </div>
            )}

            {draft.price && isValidPrice(draft.price) && (
              <p className="mt-3 text-sm text-ink-muted">
                {t('អ្នកប្រើនឹងឃើញ:', 'Users will see:')} <strong className="font-semibold text-ink">{formatPrice(draft.price, km)}</strong>
              </p>
            )}
          </Section>

          <Section title={t('អាជ្ញាប័ណ្ណ', 'License')} hint={t('មិនបង្ហាញលើប្រវត្តិរូបសាធារណៈទេ។ ការផ្លាស់ប្តូរត្រូវរង់ចាំអ្នកគ្រប់គ្រងពិនិត្យ។', 'Not shown on your public profile. Changes wait for an admin to check them.')}>
            <div className="grid gap-4 sm:grid-cols-2">
              {reviewedField('licenseNumber')}
              {reviewedField('issuingBody')}
            </div>
          </Section>
        </div>
      )}
    </>
  );
}
