'use client';

import { useState, type FormEvent } from 'react';
import { Mail, Settings2, Languages } from 'lucide-react';

import { useAdmin } from './admin-provider';
import { useLanguage } from '../../_components/language-provider';

import type { AdminSettings } from '../_data/settings';

const fieldClass =
  'mt-2 w-full rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-arom focus:ring-2 focus:ring-arom/15';

export function SettingsView() {
  const { settings, saveSettings } = useAdmin();
  const { language, setLanguage } = useLanguage();

  const km = language === 'km';

  const [draft, setDraft] = useState<AdminSettings>({
    ...settings,
    defaultAdminLanguage: language,
  });

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function update<K extends keyof AdminSettings>(
    key: K,
    value: AdminSettings[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError('');
    setNotice('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleaned: AdminSettings = {
      platformName: draft.platformName.trim(),
      supportEmail: draft.supportEmail.trim(),
      supportPhone: draft.supportPhone.trim(),
      supportHours: draft.supportHours.trim(),
      kmSupportHours: draft.kmSupportHours.trim(),
      defaultAdminLanguage: draft.defaultAdminLanguage,
    };

    if (!cleaned.platformName) {
      setError(km ? 'សូមបញ្ចូលឈ្មោះវេទិកា។' : 'Enter a platform name.');
      return;
    }

    saveSettings(cleaned);
    setDraft(cleaned);
    setLanguage(cleaned.defaultAdminLanguage);

    setNotice(
      cleaned.defaultAdminLanguage === 'km'
        ? 'បានរក្សាទុកការកំណត់។'
        : 'Settings saved.',
    );
  }

  function resetChanges() {
    setDraft({
      ...settings,
      defaultAdminLanguage: language,
    });
    setError('');
    setNotice(km ? 'បានបោះបង់ការកែប្រែ។' : 'Unsaved changes discarded.');
  }

  return (
    <>
      <p className="text-sm font-medium text-arom">
        {km ? 'ការកំណត់វេទិកា' : 'Platform preferences'}
      </p>

      <h1 className="mt-2 text-3xl font-semibold">
        {km ? 'ការកំណត់' : 'Settings'}
      </h1>

      <p className="mt-3 text-sm text-ink-muted">
        {km
          ? 'គ្រប់គ្រងព័ត៌មានទំនាក់ទំនង និងភាសាសម្រាប់អ្នកគ្រប់គ្រង។'
          : 'Manage platform contact information and your admin language.'}
      </p>

      <form onSubmit={submit} className="mt-8 space-y-6">
        <section className="rounded-3xl border border-arom-border bg-white p-6">
          <div className="flex items-center gap-3">
            <Settings2
              size={38}
              aria-hidden="true"
              className="rounded-xl bg-arom-soft p-2 text-arom"
            />
            <h2 className="text-lg font-semibold">
              {km ? 'ព័ត៌មានទូទៅ' : 'General information'}
            </h2>
          </div>

          <label className="mt-5 block max-w-xl text-sm font-medium">
            {km ? 'ឈ្មោះវេទិកា' : 'Platform name'} *
            <input
              required
              maxLength={80}
              value={draft.platformName}
              onChange={(event) => update('platformName', event.target.value)}
              className={fieldClass}
            />
          </label>
        </section>

        <section className="rounded-3xl border border-arom-border bg-white p-6">
          <div className="flex items-center gap-3">
            <Mail
              size={38}
              aria-hidden="true"
              className="rounded-xl bg-arom-soft p-2 text-arom"
            />
            <h2 className="text-lg font-semibold">
              {km ? 'ព័ត៌មានទំនាក់ទំនង' : 'Support contact'}
            </h2>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-medium">
              {km ? 'អ៊ីមែលជំនួយ' : 'Support email'}
              <input
                type="email"
                maxLength={254}
                value={draft.supportEmail}
                onChange={(event) => update('supportEmail', event.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="text-sm font-medium">
              {km ? 'លេខទូរស័ព្ទជំនួយ' : 'Support phone'}
              <input
                type="tel"
                maxLength={40}
                value={draft.supportPhone}
                onChange={(event) => update('supportPhone', event.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="text-sm font-medium">
              {km ? 'ម៉ោងជំនួយជាភាសាអង់គ្លេស' : 'Support hours (English)'}
              <input
                maxLength={200}
                value={draft.supportHours}
                onChange={(event) => update('supportHours', event.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="text-sm font-medium">
              {km ? 'ម៉ោងជំនួយជាភាសាខ្មែរ' : 'Support hours (Khmer)'}
              <input
                maxLength={250}
                value={draft.kmSupportHours}
                onChange={(event) =>
                  update('kmSupportHours', event.target.value)
                }
                className={fieldClass}
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-arom-border bg-white p-6">
          <div className="flex items-center gap-3">
            <Languages
              size={38}
              aria-hidden="true"
              className="rounded-xl bg-arom-soft p-2 text-arom"
            />
            <h2 className="text-lg font-semibold">
              {km ? 'ភាសាសម្រាប់អ្នកគ្រប់គ្រង' : 'Admin language'}
            </h2>
          </div>

          <label className="mt-5 block max-w-xl text-sm font-medium">
            {km ? 'ភាសាដែលពេញចិត្ត' : 'Preferred language'}
            <select
              value={draft.defaultAdminLanguage}
              onChange={(event) =>
                update(
                  'defaultAdminLanguage',
                  event.target.value === 'km' ? 'km' : 'en',
                )
              }
              className={fieldClass}>
              <option value="en">English</option>
              <option value="km">ខ្មែរ</option>
            </select>
          </label>
        </section>

        {error && (
          <p role="alert" className="text-sm text-arom-danger">
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={resetChanges}
            className="rounded-full border border-arom-border bg-white px-5 py-2.5 text-sm">
            {km ? 'បោះបង់ការកែប្រែ' : 'Discard changes'}
          </button>

          <button
            type="submit"
            className="rounded-full bg-arom px-5 py-2.5 text-sm text-white hover:bg-arom-deep">
            {km ? 'រក្សាទុកការកំណត់' : 'Save settings'}
          </button>
        </div>
      </form>

      <p
        role="status"
        aria-live="polite"
        className="mt-4 min-h-5 text-sm text-arom">
        {notice}
      </p>
    </>
  );
}
