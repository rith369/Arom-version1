'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import {
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Info,
  Search,
  ShieldCheck,
  UserX,
  UsersRound,
  X,
} from 'lucide-react';

import { useAdmin } from './admin-provider';
import { useLanguage } from '../../_components/language-provider';

import type {
  Professional,
  ReviewedField,
} from '../_data/professionals';

type Stage = 'application' | 'changes' | 'live' | 'suspended' | 'rejected';
type Filter = 'all' | 'review' | 'live' | 'suspended' | 'rejected';
type ActionKind =
  | 'approve'
  | 'reject'
  | 'approveChanges'
  | 'declineChanges'
  | 'suspend'
  | 'reinstate';

function getStage(item: Professional): Stage {
  if (item.verificationStatus === 'rejected') return 'rejected';
  if (item.accountStatus === 'suspended') return 'suspended';
  if (item.verificationStatus === 'pending') return 'application';
  if (item.pendingChanges.length) return 'changes';
  return 'live';
}

function matchesFilter(item: Professional, filter: Filter) {
  const stage = getStage(item);

  if (filter === 'all') return true;
  if (filter === 'review') return stage === 'application' || stage === 'changes';
  if (filter === 'live') return stage === 'live' || stage === 'changes';

  return stage === filter;
}

function getInitials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

const stageStyles: Record<Stage, string> = {
  application: 'bg-arom-warning-soft text-arom-warning',
  changes: 'bg-arom-warning-soft text-arom-warning',
  live: 'bg-arom-soft text-arom',
  suspended: 'bg-arom-danger-soft text-arom-danger',
  rejected: 'bg-gray-100 text-gray-600',
};

const fieldClass =
  'mt-2 w-full rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-arom focus:ring-2 focus:ring-arom/15';

function Avatar({ item, size }: { item: Professional; size: 'sm' | 'lg' }) {
  const box = size === 'sm' ? 'h-11 w-11 text-sm' : 'h-16 w-16 text-lg';

  return item.image ? (
    <Image
      src={item.image}
      width={size === 'sm' ? 44 : 64}
      height={size === 'sm' ? 44 : 64}
      alt=""
      className={`${box} shrink-0 rounded-full object-cover`}
    />
  ) : (
    <span
      aria-hidden="true"
      className={`${box} flex shrink-0 items-center justify-center rounded-full bg-arom-soft font-semibold text-arom`}>
      {getInitials(item.name)}
    </span>
  );
}

// Admin only: the clinic this therapist works at (section 34). A clinic
// therapist leaves the Professional page; students book the clinic and the
// clinic desk assigns them. A UP only clinic makes them UP only too.
function ClinicSection({ item }: { item: Professional }) {
  const { clinics, setProfessionalClinic, setUpStudentsOnly } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const current = item.clinicId ?? '';

  async function change(clinicId: string) {
    if (busy) return;
    setBusy(true);
    setError('');
    const result = await setProfessionalClinic(item.id, clinicId || null);
    setBusy(false);
    if (!result.ok) setError(result.message);
  }

  async function turnOffUpOnly() {
    if (busy) return;
    setBusy(true);
    setError('');
    const result = await setUpStudentsOnly(item.id, false);
    setBusy(false);
    if (!result.ok) setError(result.message);
  }

  return (
    <section className="rounded-2xl border border-arom-border p-4">
      <label className="block">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Building2 size={16} className="text-arom" />
          Clinic
        </span>
        <span className="mt-1 block text-xs leading-5 text-ink-muted">
          {current
            ? 'Shown in this clinic only, not on the Professional page. Students book the clinic and the clinic desk assigns sessions.'
            : 'Not linked: listed on the Professional page and booked directly, as usual.'}
        </span>
        <select
          value={current}
          disabled={busy || clinics.length === 0}
          onChange={(event) => void change(event.target.value)}
          className={fieldClass}>
          <option value="">No clinic</option>
          {clinics.map((clinic) => (
            <option key={clinic.id} value={clinic.id}>
              {clinic.name}
            </option>
          ))}
        </select>
      </label>
      {item.upStudentsOnly && (
        <p className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-arom-wash px-3 py-2 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5">
            <GraduationCap size={14} className="text-arom" />
            Old setting: UP students and staff only is on.
          </span>
          <button
            type="button"
            disabled={busy}
            onClick={() => void turnOffUpOnly()}
            className="font-semibold text-arom underline disabled:opacity-60">
            Turn off
          </button>
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-arom-danger">
          {error}
        </p>
      )}
    </section>
  );
}

function ReviewDialog({
  item,
  onClose,
  onDone,
}: {
  item: Professional;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const { reviewApplication, reviewProfileChanges, setProfessionalAccess } =
    useAdmin();
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [action, setAction] = useState<ActionKind | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;

    dialog?.showModal();

    return () => {
      dialog?.close();
    };
  }, []);

  const stage = getStage(item);
  const displayName = km && item.kmName ? item.kmName : item.name;

  const fieldLabels: Record<ReviewedField, string> = {
    name: t('ឈ្មោះ', 'Name'),
    kmName: 'Name (Khmer)',
    role: t('មុខតំណែង', 'Title'),
    kmRole: 'Title (Khmer)',
    licenseNumber: t('លេខអាជ្ញាប័ណ្ណ', 'License number'),
    issuingBody: t('ស្ថាប័នចេញអាជ្ញាប័ណ្ណ', 'Issuing body'),
  };

  const actions: Record<
    ActionKind,
    {
      label: string;
      title: string;
      description: string;
      needsReason: boolean;
      isDestructive: boolean;
      done: string;
    }
  > = {
    approve: {
      label: t('អនុម័ត', 'Approve'),
      title: t('អនុម័តអ្នកជំនាញនេះ?', 'Approve this professional?'),
      description: t(
        'ប្រវត្តិរូបនឹងបង្ហាញក្នុងបញ្ជីអ្នកជំនាញ ហើយអ្នកប្រើប្រាស់អាចកក់ការណាត់ជួបបាន។',
        'Their profile will appear in the directory and seekers can book sessions.',
      ),
      needsReason: false,
      isDestructive: false,
      done: t('បានអនុម័ត។', 'approved and now live.'),
    },
    reject: {
      label: t('បដិសេធ', 'Reject'),
      title: t('បដិសេធពាក្យស្នើសុំនេះ?', 'Reject this application?'),
      description: t(
        'អ្នកជំនាញនឹងឃើញមូលហេតុរបស់អ្នក។',
        'The applicant will see your reason.',
      ),
      needsReason: true,
      isDestructive: true,
      done: t('បានបដិសេធ។', 'application rejected.'),
    },
    approveChanges: {
      label: t('អនុម័តការផ្លាស់ប្តូរ', 'Approve changes'),
      title: t('អនុម័តការផ្លាស់ប្តូរ?', 'Approve these changes?'),
      description: t(
        'ព័ត៌មានថ្មីនឹងបង្ហាញលើប្រវត្តិរូបភ្លាមៗ។',
        'The new details will show on their public profile right away.',
      ),
      needsReason: false,
      isDestructive: false,
      done: t('បានអនុម័តការផ្លាស់ប្តូរ។', 'profile changes approved.'),
    },
    declineChanges: {
      label: t('មិនអនុម័ត', 'Decline changes'),
      title: t('មិនអនុម័តការផ្លាស់ប្តូរ?', 'Decline these changes?'),
      description: t(
        'ប្រវត្តិរូបនឹងរក្សាព័ត៌មានចាស់ ហើយអ្នកជំនាញនឹងឃើញមូលហេតុរបស់អ្នក។',
        'Their profile keeps the current details. They will see your reason.',
      ),
      needsReason: true,
      isDestructive: true,
      done: t('មិនបានអនុម័តការផ្លាស់ប្តូរ។', 'profile changes declined.'),
    },
    suspend: {
      label: t('ផ្អាក', 'Suspend'),
      title: t('ផ្អាកអ្នកជំនាញនេះ?', 'Suspend this professional?'),
      description: t(
        'ប្រវត្តិរូបនឹងត្រូវលាក់ពីបញ្ជី ហើយមិនអាចទទួលការកក់ថ្មីបានទេ។ ការណាត់ជួបដែលមានស្រាប់ត្រូវដោះស្រាយនៅទំព័រការកក់។',
        'Their profile is hidden from the directory and cannot take new bookings. Handle existing sessions on the Bookings page.',
      ),
      needsReason: true,
      isDestructive: true,
      done: t('បានផ្អាក។', 'suspended and hidden from the directory.'),
    },
    reinstate: {
      label: t('បើកឡើងវិញ', 'Reinstate'),
      title: t('បើកអ្នកជំនាញនេះឡើងវិញ?', 'Reinstate this professional?'),
      description: t(
        'ប្រវត្តិរូបនឹងបង្ហាញក្នុងបញ្ជីម្តងទៀត។',
        'Their profile will appear in the directory again.',
      ),
      needsReason: false,
      isDestructive: false,
      done: t('បានបើកឡើងវិញ។', 'reinstated and live again.'),
    },
  };

  const available: ActionKind[] =
    stage === 'application'
      ? ['reject', 'approve']
      : stage === 'changes'
        ? ['suspend', 'declineChanges', 'approveChanges']
        : stage === 'live'
          ? ['suspend']
          : stage === 'suspended'
            ? ['reinstate']
            : [];

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!action || busy) return;

    const config = actions[action];
    const note = String(
      new FormData(event.currentTarget).get('note') ?? '',
    ).trim();

    if (config.needsReason && !note) {
      setError(t('សូមសរសេរមូលហេតុ។', 'Please write a reason.'));
      return;
    }

    setBusy(true);
    const result =
      action === 'approve' || action === 'reject'
        ? await reviewApplication(item.id, action, note)
        : action === 'approveChanges' || action === 'declineChanges'
          ? await reviewProfileChanges(
              item.id,
              action === 'approveChanges' ? 'approve' : 'reject',
              note,
            )
          : await setProfessionalAccess(
              item.id,
              action === 'suspend' ? 'suspended' : 'active',
              note,
            );
    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onDone(km ? `${displayName}: ${config.done}` : `${item.name}: ${config.done}`);
  }

  const current = action ? actions[action] : null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      aria-labelledby="professional-review-title"
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-3xl border border-arom-border bg-white p-0 text-ink shadow-card backdrop:bg-ink/35">
      <div className="flex items-start justify-between gap-4 border-b border-arom-border p-6">
        <div className="flex items-center gap-4">
          <Avatar item={item} size="lg" />
          <div>
            <h2
              id="professional-review-title"
              className="text-xl font-semibold">
              {displayName}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {km && item.kmRole ? item.kmRole : item.role}
            </p>
            <p className="mt-2 inline-block rounded-full bg-arom-wash px-2.5 py-0.5 text-xs text-ink-muted">
              {item.source === 'admin'
                ? t('បានតែងតាំងដោយអ្នកគ្រប់គ្រង', 'Promoted by admin')
                : t('បានដាក់ពាក្យស្នើសុំ', 'Applied')}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('បិទ', 'Close')}
          className="rounded-full p-2 hover:bg-arom-wash">
          <X size={20} />
        </button>
      </div>

      {current ? (
        <form onSubmit={confirm} className="p-6">
          <h3 className="text-lg font-semibold">{current.title}</h3>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            {current.description}
          </p>
          <label className="mt-5 block text-sm font-medium">
            {current.needsReason
              ? t('មូលហេតុ *', 'Reason *')
              : t('កំណត់ចំណាំ (ស្រេចចិត្ត)', 'Note (optional)')}
            <textarea
              name="note"
              rows={3}
              maxLength={1000}
              required={current.needsReason}
              onChange={() => setError('')}
              className={fieldClass}
            />
          </label>
          {error && (
            <p role="alert" className="mt-2 text-sm text-arom-danger">
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              autoFocus
              onClick={() => {
                setAction(null);
                setError('');
              }}
              className="rounded-full border border-arom-border px-5 py-2.5 text-sm">
              {t('ត្រឡប់ក្រោយ', 'Back')}
            </button>
            <button
              type="submit"
              disabled={busy}
              className={`rounded-full px-5 py-2.5 text-sm text-white disabled:opacity-60 ${
                current.isDestructive
                  ? 'bg-arom-danger hover:opacity-90'
                  : 'bg-arom hover:bg-arom-deep'
              }`}>
              {busy ? 'Saving...' : current.label}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="space-y-6 p-6">
            {stage === 'changes' && (
              <section className="rounded-2xl border border-arom-warning/30 bg-arom-warning-soft p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-arom-warning">
                  <Clock size={16} />
                  {t('ការផ្លាស់ប្តូរដែលរង់ចាំការពិនិត្យ', 'Changes waiting for review')}
                </h3>
                <p className="mt-1 text-xs text-ink-muted">
                  {t(
                    'ប្រវត្តិរូបសាធារណៈនៅតែបង្ហាញព័ត៌មានចាស់ រហូតដល់អ្នកអនុម័ត។',
                    'The public profile keeps the current details until you approve.',
                  )}
                </p>
                <dl className="mt-4 space-y-3">
                  {item.pendingChanges.map((change) => (
                    <div key={change.field} className="text-sm">
                      <dt className="text-xs text-ink-muted">
                        {fieldLabels[change.field]}
                      </dt>
                      <dd className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-ink-muted line-through">
                          {change.from}
                        </span>
                        <span aria-hidden="true">→</span>
                        <span className="font-medium">{change.to}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {item.verificationStatus === 'verified' && <ClinicSection item={item} />}

            {item.reviewNote && (
              <section className="rounded-2xl bg-arom-wash p-4 text-sm">
                <h3 className="text-xs font-medium text-ink-muted">
                  {t('កំណត់ចំណាំចុងក្រោយ', 'Latest review note')}
                </h3>
                <p className="mt-1">{item.reviewNote}</p>
              </section>
            )}

            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck size={16} className="text-arom" />
                {t('អាជ្ញាប័ណ្ណ', 'License')}
              </h3>
              <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-ink-muted">
                    {fieldLabels.licenseNumber}
                  </dt>
                  <dd className="mt-1 font-medium">
                    {item.credential.licenseNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">
                    {fieldLabels.issuingBody}
                  </dt>
                  <dd className="mt-1">
                    {item.credential.issuingBody || t('មិនមាន', 'Not provided')}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-ink-muted">
                    {t('ឯកសារ', 'Document')}
                  </dt>
                  <dd className="mt-1 flex flex-wrap items-center gap-2">
                    <FileText size={16} className="text-ink-muted" />
                    {item.credential.documentName || t('មិនមាន', 'Not provided')}
                    {item.credential.documentName && item.applicationId && (
                      <a
                        href={`/api/admin/applications/${item.applicationId}/license`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-arom underline hover:text-arom-deep">
                        Open file
                      </a>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">
                    {t('ទូរស័ព្ទ (សម្រាប់ផ្ទៀងផ្ទាត់)', 'Phone (for verification)')}
                  </dt>
                  <dd className="mt-1">
                    {item.phone ? (
                      <a href={`tel:${item.phone.replace(/\s/g, '')}`} className="font-medium text-arom underline">
                        {item.phone}
                      </a>
                    ) : (
                      t('មិនមាន', 'Not provided')
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">Telegram</dt>
                  <dd className="mt-1">
                    {!item.telegram
                      ? t('មិនមាន', 'Not provided')
                      : item.telegram === item.phone
                        ? t('លេខដូចទូរស័ព្ទ', 'Same as phone')
                        : item.telegram}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-ink-muted">
                {t(
                  'ព័ត៌មានទំនាក់ទំនងមើលឃើញតែអ្នកគ្រប់គ្រងប៉ុណ្ណោះ ហើយមិនបង្ហាញលើប្រវត្តិរូបសាធារណៈទេ។',
                  'Contact details are visible to admins only and never shown on the public profile.',
                )}
              </p>
            </section>

            <section>
              <h3 className="text-sm font-semibold">
                {t('ប្រវត្តិរូប', 'Profile')}
              </h3>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                {km && item.kmAbout ? item.kmAbout : item.about}
              </p>
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-ink-muted">
                    {t('បទពិសោធន៍', 'Experience')}
                  </dt>
                  <dd className="mt-1">{item.experience}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">
                    {t('ភាសា', 'Languages')}
                  </dt>
                  <dd className="mt-1">{item.languages.join(', ')}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">
                    {t('ប្រភេទជំនួប', 'Sessions')}
                  </dt>
                  <dd className="mt-1">
                    {item.session === 'Both'
                      ? t('អនឡាញ និងជួបផ្ទាល់', 'Online and in person')
                      : item.session === 'Online'
                        ? t('អនឡាញ', 'Online')
                        : t('ជួបផ្ទាល់', 'In person')}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {item.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="rounded-lg bg-arom-wash px-2 py-1 text-xs text-arom">
                    {specialty}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <footer className="flex flex-wrap justify-end gap-3 border-t border-arom-border p-6">
            {available.length === 0 && (
              <p className="mr-auto self-center text-sm text-ink-muted">
                {t(
                  'អ្នកជំនាញនេះអាចដាក់ពាក្យម្តងទៀតបាន។',
                  'This applicant can apply again with a new application.',
                )}
              </p>
            )}
            {available.map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setAction(kind)}
                className={`rounded-full px-5 py-2.5 text-sm ${
                  actions[kind].isDestructive
                    ? 'border border-arom-border text-arom-danger hover:bg-arom-danger-soft'
                    : 'bg-arom text-white hover:bg-arom-deep'
                }`}>
                {actions[kind].label}
              </button>
            ))}
          </footer>
        </>
      )}
    </dialog>
  );
}

export function ProfessionalsView() {
  const {
    professionalRecords: professionals,
    professionalsLoad,
    reloadProfessionals,
    clinics,
  } = useAdmin();
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const stageLabels: Record<Stage, string> = {
    application: t('ពាក្យស្នើសុំថ្មី', 'New application'),
    changes: t('មានការផ្លាស់ប្តូរ', 'Changes to review'),
    live: t('កំពុងបង្ហាញ', 'Live'),
    suspended: t('បានផ្អាក', 'Suspended'),
    rejected: t('បានបដិសេធ', 'Rejected'),
  };

  const filterCards: { value: Exclude<Filter, 'all'>; label: string; icon: typeof Clock }[] = [
    { value: 'review', label: t('ត្រូវពិនិត្យ', 'Needs review'), icon: Clock },
    { value: 'live', label: t('កំពុងបង្ហាញ', 'Live in directory'), icon: CheckCircle2 },
    { value: 'suspended', label: t('បានផ្អាក', 'Suspended'), icon: UserX },
    { value: 'rejected', label: t('បានបដិសេធ', 'Rejected'), icon: X },
  ];

  const searchText = query.trim().toLocaleLowerCase();
  const visible = professionals
    .filter(
      (item) =>
        matchesFilter(item, filter) &&
        `${item.name} ${item.kmName} ${item.role} ${item.credential.licenseNumber} ${item.specialties.join(' ')}`
          .toLocaleLowerCase()
          .includes(searchText),
    )
    .sort((a, b) => {
      const order: Stage[] = ['application', 'changes', 'suspended', 'live', 'rejected'];
      return order.indexOf(getStage(a)) - order.indexOf(getStage(b));
    });

  const openItem = professionals.find((item) => item.id === openId) ?? null;
  const dateFormat = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <>
      <div>
        <p className="text-sm font-medium text-arom">
          {t('ការថែទាំប្រកបដោយទំនុកចិត្ត', 'People who make a difference')}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {t('អ្នកជំនាញ', 'Professionals')}
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          {t(
            'ពិនិត្យពាក្យស្នើសុំ ផ្ទៀងផ្ទាត់អាជ្ញាប័ណ្ណ និងគ្រប់គ្រងអ្នកដែលបង្ហាញក្នុងបញ្ជី។',
            'Review applications, check licenses and control who appears in the directory.',
          )}
        </p>
      </div>

      <p className="mt-5 flex items-start gap-2 rounded-2xl border border-arom-border bg-white p-4 text-sm text-ink-muted">
        <Info size={18} className="mt-0.5 shrink-0 text-arom" />
        {t(
          'អ្នកជំនាញកែសម្រួលប្រវត្តិរូបរបស់ខ្លួនដោយខ្លួនឯង។ ការផ្លាស់ប្តូរឈ្មោះ មុខតំណែង ឬអាជ្ញាប័ណ្ណ នឹងមកកាន់ទីនេះដើម្បីពិនិត្យជាមុនសិន។',
          'Professionals edit their own profiles. Changes to their name, title or license come here for review first.',
        )}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {filterCards.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(filter === value ? 'all' : value)}
            aria-pressed={filter === value}
            className={`rounded-2xl border bg-white p-5 text-left ${
              filter === value
                ? 'border-arom ring-2 ring-arom/10'
                : 'border-arom-border'
            }`}>
            <Icon size={18} className="text-arom" />
            <p className="mt-3 text-2xl font-semibold">
              {professionals.filter((item) => matchesFilter(item, value)).length}
            </p>
            <p className="mt-1 text-sm text-ink-muted">{label}</p>
          </button>
        ))}
      </div>

      {professionalsLoad !== 'ready' && (
        <div
          role={professionalsLoad === 'error' ? 'alert' : 'status'}
          className={`mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 text-sm ${
            professionalsLoad === 'error'
              ? 'border-arom-danger/25 bg-arom-danger-soft/50 text-arom-danger'
              : 'border-arom-border bg-white text-ink-muted'
          }`}>
          {professionalsLoad === 'error'
            ? 'Could not load professionals.'
            : 'Loading professionals...'}
          {professionalsLoad === 'error' && (
            <button
              type="button"
              onClick={() => void reloadProfessionals()}
              className="rounded-full border border-arom-danger/30 px-4 py-1.5 text-xs font-semibold hover:bg-white">
              Try again
            </button>
          )}
        </div>
      )}

      <section className="mt-6 overflow-hidden rounded-3xl border border-arom-border bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-arom-border p-5">
          <div className="relative min-w-48 flex-1">
            <Search size={18} className="absolute left-3 top-3 text-ink-muted" />
            <input
              aria-label={t('ស្វែងរកអ្នកជំនាញ', 'Search professionals')}
              placeholder={t(
                'ស្វែងរកឈ្មោះ ជំនាញ ឬលេខអាជ្ញាប័ណ្ណ...',
                'Search by name, specialty or license number...',
              )}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-xl border border-arom-border bg-arom-wash py-2.5 pl-10 pr-3 text-sm outline-none focus:border-arom focus:ring-2 focus:ring-arom/15"
            />
          </div>
          <select
            aria-label={t('តម្រងស្ថានភាព', 'Filter by status')}
            value={filter}
            onChange={(event) => setFilter(event.target.value as Filter)}
            className="rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm">
            <option value="all">{t('គ្រប់ស្ថានភាព', 'All statuses')}</option>
            {filterCards.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <caption className="sr-only">
              {t('បញ្ជីអ្នកជំនាញ', 'Professional profiles')}
            </caption>
            <thead className="bg-arom-wash text-xs text-ink-muted">
              <tr>
                {[
                  t('អ្នកជំនាញ', 'Professional'),
                  t('អាជ្ញាប័ណ្ណ', 'License'),
                  t('ស្ថានភាព', 'Status'),
                  t('បានដាក់ស្នើ', 'Submitted'),
                  t('សកម្មភាព', 'Actions'),
                ].map((heading) => (
                  <th key={heading} scope="col" className="px-5 py-4 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-arom-border">
              {visible.map((item) => {
                const stage = getStage(item);
                const needsReview = stage === 'application' || stage === 'changes';

                return (
                  <tr key={item.id} className="hover:bg-arom-wash/50">
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        <Avatar item={item} size="sm" />
                        <div>
                          <p className="font-medium">
                            {km && item.kmName ? item.kmName : item.name}
                          </p>
                          <p className="mt-1 text-xs text-ink-muted">
                            {km && item.kmRole ? item.kmRole : item.role}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <p>{item.credential.licenseNumber}</p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {item.credential.issuingBody || t('មិនមាន', 'Not provided')}
                      </p>
                    </td>
                    <td className="px-5 py-5">
                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${stageStyles[stage]}`}>
                        {stageLabels[stage]}
                      </span>
                      {item.clinicId && (
                        <span className="mt-1.5 flex w-fit items-center gap-1 whitespace-nowrap rounded-full bg-arom-wash px-2.5 py-0.5 text-xs text-arom">
                          <Building2 size={12} aria-hidden="true" />
                          {clinics.find((clinic) => clinic.id === item.clinicId)?.name ?? 'Clinic'}
                        </span>
                      )}
                      {item.upStudentsOnly && (
                        <span className="mt-1.5 flex w-fit items-center gap-1 whitespace-nowrap rounded-full bg-arom-wash px-2.5 py-0.5 text-xs text-arom">
                          <GraduationCap size={12} aria-hidden="true" />
                          UP only
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-5 text-ink-muted">
                      {dateFormat.format(new Date(item.credential.submittedAt))}
                    </td>
                    <td className="px-5 py-5">
                      <button
                        type="button"
                        onClick={() => setOpenId(item.id)}
                        aria-label={`${needsReview ? t('ពិនិត្យ', 'Review') : t('មើល', 'View')} ${item.name}`}
                        className={`rounded-full px-4 py-2 text-xs font-medium ${
                          needsReview
                            ? 'bg-arom text-white hover:bg-arom-deep'
                            : 'border border-arom-border text-arom hover:bg-arom-soft'
                        }`}>
                        {needsReview ? t('ពិនិត្យ', 'Review') : t('មើល', 'View')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!visible.length && (
          <div className="p-12 text-center">
            <UsersRound size={32} className="mx-auto text-ink-muted" />
            <h2 className="mt-4 font-medium">
              {t('មិនមានលទ្ធផល', 'No matching professionals')}
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              {t('សាកល្បងពាក្យស្វែងរក ឬតម្រងផ្សេង។', 'Try another search or clear your filters.')}
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setFilter('all');
              }}
              className="mt-4 text-sm font-medium text-arom underline">
              {t('សម្អាតតម្រង', 'Clear filters')}
            </button>
          </div>
        )}

        <p className="border-t border-arom-border px-5 py-4 text-xs text-ink-muted">
          {t('លទ្ធផល', 'Showing')} {visible.length} / {professionals.length}
        </p>
      </section>

      <p role="status" aria-live="polite" className="mt-4 min-h-5 text-sm text-arom">
        {notice}
      </p>

      {openItem && (
        <ReviewDialog
          key={openItem.id}
          item={openItem}
          onClose={() => setOpenId(null)}
          onDone={(message) => {
            setOpenId(null);
            setNotice(message);
          }}
        />
      )}
    </>
  );
}
