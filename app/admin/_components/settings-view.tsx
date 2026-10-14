'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Gift,
  Globe,
  LifeBuoy,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

import { useAdmin } from './admin-provider';
import { AnnouncementsSection } from './announcements-section';
import { useLanguage } from '../../_components/language-provider';

import type { AdminSettings } from '../_data/settings';
import {
  isValidEmail,
  isValidPhone,
  isValidWebsite,
  type CrisisHelpline,
} from '../../_components/support-contacts';

const fieldClass =
  'mt-2 w-full rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-arom focus:ring-2 focus:ring-arom/15';

function emptyHelpline(): CrisisHelpline {
  return {
    id: crypto.randomUUID(),
    name: '',
    kmName: '',
    description: '',
    kmDescription: '',
    phone: '',
    sms: '',
    website: '',
    hours: '',
    kmHours: '',
    isActive: true,
    sortOrder: 0,
  };
}

function HelplineDialog({
  record,
  isNew,
  onCancel,
  onSave,
}: {
  record: CrisisHelpline;
  isNew: boolean;
  onCancel: () => void;
  onSave: (record: CrisisHelpline) => Promise<string | null>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(record);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  function set<Key extends keyof CrisisHelpline>(key: Key, value: CrisisHelpline[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const cleaned: CrisisHelpline = {
      ...draft,
      name: draft.name.trim(),
      kmName: draft.kmName.trim(),
      description: draft.description.trim(),
      kmDescription: draft.kmDescription.trim(),
      phone: draft.phone.trim(),
      sms: draft.sms.trim(),
      website: draft.website.trim(),
      hours: draft.hours.trim(),
      kmHours: draft.kmHours.trim(),
    };

    // Stricter than other content: a wrong number here can hurt someone in crisis.
    if (!cleaned.name || !cleaned.kmName) {
      setError('Add the name in English and Khmer.');
    } else if (!cleaned.phone && !cleaned.website) {
      setError('Add a phone number or a website, so users can reach the service.');
    } else if (cleaned.phone && !isValidPhone(cleaned.phone)) {
      setError('Check the phone number. Use 3 to 15 digits, for example 1294 or 012 345 678.');
    } else if (cleaned.sms && !isValidPhone(cleaned.sms)) {
      setError('Check the SMS number. Use 3 to 15 digits.');
    } else if (cleaned.website && !isValidWebsite(cleaned.website)) {
      setError('The website must start with https://');
    } else if (!checked) {
      setError('Confirm that you checked the number and it reaches the right service.');
    } else {
      setSaving(true);
      const failure = await onSave(cleaned);
      setSaving(false);
      if (failure) setError(failure);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={onCancel}
      aria-labelledby="helpline-title"
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-3xl border border-arom-border bg-white p-0 text-ink shadow-card backdrop:bg-ink/35">
      <form onSubmit={submit} noValidate>
        <header className="flex items-center justify-between gap-4 border-b border-arom-border p-6">
          <h2 id="helpline-title" className="text-xl font-semibold">
            {isNew ? 'Add crisis helpline' : 'Edit crisis helpline'}
          </h2>
          <button type="button" onClick={onCancel} aria-label="Close" className="rounded-full p-2 hover:bg-arom-wash">
            <X size={20} />
          </button>
        </header>

        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Name (English) *
            <input value={draft.name} maxLength={120} onChange={(event) => set('name', event.target.value)} className={fieldClass} />
          </label>
          <label className="text-sm font-medium">
            Name (Khmer) *
            <input value={draft.kmName} maxLength={160} onChange={(event) => set('kmName', event.target.value)} className={`${fieldClass} font-khmer`} />
          </label>
          <label className="text-sm font-medium">
            Short description (English)
            <input value={draft.description} maxLength={200} placeholder="For example, Free mental health support line" onChange={(event) => set('description', event.target.value)} className={fieldClass} />
          </label>
          <label className="text-sm font-medium">
            Short description (Khmer)
            <input value={draft.kmDescription} maxLength={260} onChange={(event) => set('kmDescription', event.target.value)} className={`${fieldClass} font-khmer`} />
          </label>
          <label className="text-sm font-medium">
            Phone
            <input type="tel" inputMode="tel" value={draft.phone} maxLength={30} onChange={(event) => set('phone', event.target.value)} className={fieldClass} />
          </label>
          <label className="text-sm font-medium">
            SMS (optional)
            <input type="tel" inputMode="tel" value={draft.sms} maxLength={30} onChange={(event) => set('sms', event.target.value)} className={fieldClass} />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Website (optional)
            <input type="url" value={draft.website} maxLength={300} placeholder="https://" onChange={(event) => set('website', event.target.value)} className={fieldClass} />
          </label>
          <label className="text-sm font-medium">
            Hours (English)
            <input value={draft.hours} maxLength={120} placeholder="For example, 24 hours, every day" onChange={(event) => set('hours', event.target.value)} className={fieldClass} />
          </label>
          <label className="text-sm font-medium">
            Hours (Khmer)
            <input value={draft.kmHours} maxLength={160} onChange={(event) => set('kmHours', event.target.value)} className={`${fieldClass} font-khmer`} />
          </label>

          <label className="flex items-start gap-3 rounded-2xl bg-arom-warning-soft p-4 text-sm font-medium text-ink sm:col-span-2">
            <input
              type="checkbox"
              checked={checked}
              onChange={(event) => {
                setChecked(event.target.checked);
                setError('');
              }}
              className="mt-1 size-4 shrink-0 accent-arom"
            />
            I checked this number or website myself, and it reaches the right
            service. People in crisis will use it.
          </label>

          {error && (
            <p role="alert" className="text-sm text-arom-danger sm:col-span-2">
              {error}
            </p>
          )}
        </div>

        <footer className="flex justify-end gap-3 border-t border-arom-border p-6">
          <button type="button" onClick={onCancel} className="rounded-full border border-arom-border px-5 py-2.5 text-sm">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-full bg-arom px-5 py-2.5 text-sm text-white hover:bg-arom-deep disabled:opacity-60">
            {saving ? 'Saving...' : 'Save helpline'}
          </button>
        </footer>
      </form>
    </dialog>
  );
}

function CrisisHelplinesSection() {
  const { crisisHelplines, crisisHelplinesLoad, saveCrisisHelplines } = useAdmin();
  const [editing, setEditing] = useState<{ record: CrisisHelpline; isNew: boolean } | null>(null);
  const [armedDeleteId, setArmedDeleteId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const activeCount = crisisHelplines.filter((item) => item.isActive).length;

  useEffect(() => {
    if (!armedDeleteId) return;
    const timer = window.setTimeout(() => setArmedDeleteId(null), 4000);
    return () => window.clearTimeout(timer);
  }, [armedDeleteId]);

  // Every change saves the whole list. Shows the error when the server refuses.
  async function persist(next: CrisisHelpline[], success: string) {
    const result = await saveCrisisHelplines(next);
    setNotice(result.ok ? success : result.message);
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...crisisHelplines];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    void persist(next, 'Order saved.');
  }

  // Returns the error to show inside the dialog, or null once saved.
  async function save(record: CrisisHelpline) {
    const exists = crisisHelplines.some((item) => item.id === record.id);
    const result = await saveCrisisHelplines(
      exists
        ? crisisHelplines.map((item) => (item.id === record.id ? record : item))
        : [...crisisHelplines, record],
    );
    if (!result.ok) return result.message;
    setEditing(null);
    setNotice(`${record.name} saved.`);
    return null;
  }

  return (
    <section id="crisis-helplines" className="scroll-mt-6 rounded-3xl border border-arom-border bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <LifeBuoy size={38} aria-hidden="true" className="rounded-xl bg-arom-soft p-2 text-arom" />
          <div>
            <h2 className="text-lg font-semibold">Crisis helplines</h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              Users see these in Profile and Settings under &quot;Get help now&quot;, in this order.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ record: emptyHelpline(), isNew: true })}
          className="flex items-center gap-2 rounded-full bg-arom px-4 py-2.5 text-sm font-medium text-white hover:bg-arom-deep">
          <Plus size={16} aria-hidden="true" />
          Add helpline
        </button>
      </div>

      {crisisHelplinesLoad !== 'ready' && (
        <p role={crisisHelplinesLoad === 'error' ? 'alert' : 'status'} className="mt-5 text-sm text-ink-muted">
          {crisisHelplinesLoad === 'error'
            ? 'Could not load helplines. Refresh the page to try again.'
            : 'Loading helplines...'}
        </p>
      )}

      {crisisHelplinesLoad === 'ready' && activeCount === 0 && (
        <p className="mt-5 flex items-start gap-2 rounded-2xl bg-arom-warning-soft p-4 text-sm text-arom-warning">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          No helplines are shown to users yet. Until you add one, users only see a
          general message to contact local emergency services.
        </p>
      )}

      {crisisHelplines.length > 0 && (
        <ol className="mt-5 space-y-3">
          {crisisHelplines.map((item, index) => (
            <li
              key={item.id}
              className={`rounded-2xl border p-4 ${item.isActive ? 'border-arom-border' : 'border-dashed border-arom-border bg-arom-wash/60'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {item.name}
                    {!item.isActive && (
                      <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Hidden</span>
                    )}
                  </p>
                  <p className="font-khmer text-sm text-ink-muted">{item.kmName}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
                    {item.phone && (
                      <span className="flex items-center gap-1.5"><Phone size={14} aria-hidden="true" />{item.phone}</span>
                    )}
                    {item.sms && (
                      <span className="flex items-center gap-1.5"><MessageSquare size={14} aria-hidden="true" />{item.sms}</span>
                    )}
                    {item.website && (
                      <span className="flex items-center gap-1.5"><Globe size={14} aria-hidden="true" />{item.website}</span>
                    )}
                    {item.hours && <span>{item.hours}</span>}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${item.name} up`} className="rounded-lg border border-arom-border p-2 text-arom hover:bg-arom-wash disabled:opacity-30">
                    <ArrowUp size={16} />
                  </button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === crisisHelplines.length - 1} aria-label={`Move ${item.name} down`} className="rounded-lg border border-arom-border p-2 text-arom hover:bg-arom-wash disabled:opacity-30">
                    <ArrowDown size={16} />
                  </button>
                  <button type="button" onClick={() => setEditing({ record: item, isNew: false })} aria-label={`Edit ${item.name}`} className="rounded-lg border border-arom-border p-2 text-arom hover:bg-arom-wash">
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void persist(crisisHelplines.map((entry) => (entry.id === item.id ? { ...entry, isActive: !entry.isActive } : entry)), item.isActive ? `${item.name} hidden from users.` : `${item.name} shown to users.`);
                      setNotice(`${item.name} is now ${item.isActive ? 'hidden from' : 'shown to'} users.`);
                    }}
                    aria-label={`${item.isActive ? 'Hide' : 'Show'} ${item.name}`}
                    className="rounded-lg border border-arom-border p-2 text-arom hover:bg-arom-wash">
                    {item.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (armedDeleteId === item.id) {
                        void persist(crisisHelplines.filter((entry) => entry.id !== item.id), `${item.name} deleted.`);
                        setArmedDeleteId(null);
                        setNotice(`${item.name} deleted.`);
                      } else {
                        setArmedDeleteId(item.id);
                      }
                    }}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium ${armedDeleteId === item.id ? 'border-arom-danger bg-arom-danger text-white' : 'border-arom-danger/25 text-arom-danger hover:bg-arom-danger-soft'}`}>
                    <Trash2 size={14} aria-hidden="true" />
                    {armedDeleteId === item.id ? 'Tap again to delete' : 'Delete'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm text-arom">
        {notice}
      </p>

      {editing && (
        <HelplineDialog
          key={editing.record.id}
          record={editing.record}
          isNew={editing.isNew}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}
    </section>
  );
}

// While AROM is in testing, prices are shown but nothing is paid.
function PricingSection() {
  const { freeDuringTesting, setFreeDuringTesting } = useAdmin();

  return (
    <section className="rounded-3xl border border-arom-border bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Gift size={38} aria-hidden="true" className="shrink-0 rounded-xl bg-arom-soft p-2 text-arom" />
          <div>
            <h2 className="text-lg font-semibold">No payments during testing</h2>
            <p className="mt-0.5 max-w-xl text-sm text-ink-muted">
              {freeDuringTesting
                ? 'On: users see each professional\'s price with a note that nothing is paid during testing.'
                : 'Off: the note is hidden. Only turn this off once a payment system exists.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={freeDuringTesting}
          aria-label="No payments during testing"
          onClick={() => setFreeDuringTesting(!freeDuringTesting)}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${freeDuringTesting ? 'bg-arom' : 'bg-gray-300'}`}>
          <span className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${freeDuringTesting ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
    </section>
  );
}

export function SettingsView() {
  const { settings, saveSettings } = useAdmin();
  const { language } = useLanguage();
  const km = language === 'km';

  const [draft, setDraft] = useState<AdminSettings>(settings);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function update<K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError('');
    setNotice('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleaned: AdminSettings = {
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      hours: draft.hours.trim(),
      kmHours: draft.kmHours.trim(),
    };

    if (cleaned.email && !isValidEmail(cleaned.email)) {
      setError('Check the support email address.');
      return;
    }

    if (cleaned.phone && !isValidPhone(cleaned.phone)) {
      setError('Check the support phone number. Use 3 to 15 digits.');
      return;
    }

    saveSettings(cleaned);
    setDraft(cleaned);
    setNotice('Support contact saved.');
  }

  function resetChanges() {
    setDraft(settings);
    setError('');
    setNotice('Unsaved changes discarded.');
  }

  return (
    <>
      <p className="text-sm font-medium text-arom">Platform preferences</p>
      <h1 className="mt-2 text-3xl font-semibold">Settings</h1>
      <p className="mt-3 text-sm text-ink-muted">
        Manage announcements, crisis helplines and how users contact AROM support.
      </p>

      <div className="mt-8 space-y-6">
        <AnnouncementsSection />

        <PricingSection />

        <CrisisHelplinesSection />

        <form onSubmit={submit} noValidate className="rounded-3xl border border-arom-border bg-white p-6">
          <div className="flex items-center gap-3">
            <Mail size={38} aria-hidden="true" className="rounded-xl bg-arom-soft p-2 text-arom" />
            <div>
              <h2 className="text-lg font-semibold">
                {km ? 'ព័ត៌មានទំនាក់ទំនង' : 'Support contact'}
              </h2>
              <p className="mt-0.5 text-sm text-ink-muted">
                Shown to users in Profile and Settings as &quot;AROM support&quot;, for app questions, not emergencies. Leave empty to hide it.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-medium">
              {km ? 'អ៊ីមែលជំនួយ' : 'Support email'}
              <input type="email" maxLength={254} value={draft.email} onChange={(event) => update('email', event.target.value)} className={fieldClass} />
            </label>

            <label className="text-sm font-medium">
              {km ? 'លេខទូរស័ព្ទជំនួយ' : 'Support phone'}
              <input type="tel" maxLength={40} value={draft.phone} onChange={(event) => update('phone', event.target.value)} className={fieldClass} />
            </label>

            <label className="text-sm font-medium">
              {km ? 'ម៉ោងជំនួយជាភាសាអង់គ្លេស' : 'Support hours (English)'}
              <input maxLength={200} value={draft.hours} onChange={(event) => update('hours', event.target.value)} className={fieldClass} />
            </label>

            <label className="text-sm font-medium">
              {km ? 'ម៉ោងជំនួយជាភាសាខ្មែរ' : 'Support hours (Khmer)'}
              <input maxLength={250} value={draft.kmHours} onChange={(event) => update('kmHours', event.target.value)} className={`${fieldClass} font-khmer`} />
            </label>
          </div>

          {error && (
            <p role="alert" className="mt-4 text-sm text-arom-danger">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
            <p role="status" aria-live="polite" className="mr-auto min-h-5 text-sm text-arom">
              {notice}
            </p>
            <button type="button" onClick={resetChanges} className="rounded-full border border-arom-border bg-white px-5 py-2.5 text-sm">
              {km ? 'បោះបង់ការកែប្រែ' : 'Discard changes'}
            </button>
            <button type="submit" className="rounded-full bg-arom px-5 py-2.5 text-sm text-white hover:bg-arom-deep">
              Save support contact
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
