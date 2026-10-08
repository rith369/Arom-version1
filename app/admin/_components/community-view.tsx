'use client';

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';

import { Plus, Search, Pencil, Archive, RotateCcw, X } from 'lucide-react';

import { useAdmin } from './admin-provider';
import { useLanguage } from '../../_components/language-provider';

import type {
  AdminGroup,
  AdminGroupActivity,
  CommunityReport,
} from '../_data/community';

const fieldClass =
  'mt-2 w-full rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm outline-none focus:border-arom focus:ring-2 focus:ring-arom/15';

const buttonClass =
  'rounded-full border border-arom-border px-4 py-2 text-sm text-arom hover:bg-arom-wash';

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { language } = useLanguage();

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      aria-labelledby="community-modal-title"
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-3xl border border-arom-border bg-white p-6 text-ink shadow-card backdrop:bg-ink/35">
      <header className="mb-5 flex items-center justify-between gap-4">
        <h2 id="community-modal-title" className="text-xl font-semibold">
          {title}
        </h2>

        <button
          type="button"
          onClick={onClose}
          aria-label={language === 'km' ? 'បិទ' : 'Close'}
          className="rounded-full p-2 hover:bg-arom-wash">
          <X size={20} />
        </button>
      </header>

      {children}
    </dialog>
  );
}

function GroupForm({
  record,
  onClose,
}: {
  record: AdminGroup | null;
  onClose: () => void;
}) {
  const { professionals, saveGroup } = useAdmin();
  const { language } = useLanguage();
  const km = language === 'km';
  const [error, setError] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? '').trim();

    const name = text('name');
    const about = text('about');
    const maxMembers = Number(text('maxMembers'));
    const mentorId = text('mentorId');

    if (
      !name ||
      !about ||
      !Number.isInteger(maxMembers) ||
      maxMembers < Math.max(1, record?.membersCount ?? 0) ||
      (mentorId && !professionals.some((item) => item.id === mentorId))
    ) {
      setError(
        km
          ? 'សូមពិនិត្យព័ត៌មាន។ ចំនួនអតិបរមាមិនអាចតិចជាងសមាជិកបច្ចុប្បន្ន។'
          : 'Check the fields. Capacity cannot be below the current member count.',
      );
      return;
    }

    saveGroup({
      id: record?.id ?? crypto.randomUUID(),
      name,
      kmName: text('kmName'),
      about,
      kmAbout: text('kmAbout'),
      maxMembers,
      membersCount: record?.membersCount ?? 0,
      mentorId,
      isAnonymous: form.get('isAnonymous') === 'on',
      rules: text('rules')
        .split('\n')
        .map((rule) => rule.trim())
        .filter(Boolean),
      status: record?.status ?? 'active',
    });

    onClose();
  }

  return (
    <Modal
      title={
        record
          ? km
            ? 'កែសម្រួលក្រុម'
            : 'Edit group'
          : km
            ? 'បន្ថែមក្រុម'
            : 'Add group'
      }
      onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm">
          {km ? 'ឈ្មោះជាភាសាអង់គ្លេស' : 'Name (English)'} *
          <input
            name="name"
            required
            maxLength={120}
            defaultValue={record?.name ?? ''}
            className={fieldClass}
          />
        </label>

        <label className="block text-sm">
          {km ? 'ឈ្មោះជាភាសាខ្មែរ' : 'Name (Khmer)'}
          <input
            name="kmName"
            maxLength={160}
            defaultValue={record?.kmName ?? ''}
            className={fieldClass}
          />
        </label>

        <label className="block text-sm">
          {km ? 'ការពិពណ៌នាជាភាសាអង់គ្លេស' : 'Description (English)'} *
          <textarea
            name="about"
            required
            rows={3}
            maxLength={3000}
            defaultValue={record?.about ?? ''}
            className={fieldClass}
          />
        </label>

        <label className="block text-sm">
          {km ? 'ការពិពណ៌នាជាភាសាខ្មែរ' : 'Description (Khmer)'}
          <textarea
            name="kmAbout"
            rows={3}
            maxLength={3000}
            defaultValue={record?.kmAbout ?? ''}
            className={fieldClass}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            {km ? 'ចំនួនសមាជិកអតិបរមា' : 'Maximum members'} *
            <input
              name="maxMembers"
              type="number"
              required
              min={Math.max(1, record?.membersCount ?? 0)}
              step={1}
              defaultValue={record?.maxMembers ?? 10}
              className={fieldClass}
            />
          </label>

          <label className="block text-sm">
            {km ? 'អ្នកសម្របសម្រួល' : 'Mentor'}
            <select
              name="mentorId"
              defaultValue={record?.mentorId ?? ''}
              className={fieldClass}>
              <option value="">{km ? 'មិនទាន់កំណត់' : 'Unassigned'}</option>

              {professionals.map((item) => (
                <option key={item.id} value={item.id}>
                  {km && item.kmName ? item.kmName : item.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm">
          {km
            ? 'ច្បាប់ក្រុម (មួយក្នុងមួយបន្ទាត់)'
            : 'Group rules (one per line)'}
          <textarea
            name="rules"
            rows={4}
            maxLength={4000}
            defaultValue={record?.rules.join('\n') ?? ''}
            className={fieldClass}
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            name="isAnonymous"
            type="checkbox"
            defaultChecked={record?.isAnonymous ?? true}
            className="accent-arom"
          />
          {km ? 'អនុញ្ញាតការចូលរួមដោយអនាមិក' : 'Allow anonymous participation'}
        </label>

        {error && (
          <p role="alert" className="text-sm text-arom-danger">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-arom-border pt-4">
          <button type="button" onClick={onClose} className={buttonClass}>
            {km ? 'បោះបង់' : 'Cancel'}
          </button>
          <button
            type="submit"
            className="rounded-full bg-arom px-5 py-2.5 text-sm text-white">
            {km ? 'រក្សាទុក' : 'Save group'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ActivityForm({ onClose }: { onClose: () => void }) {
  const { groups, saveGroupActivity } = useAdmin();
  const { language } = useLanguage();
  const km = language === 'km';
  const [error, setError] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? '').trim();

    const groupId = text('groupId');
    const title = text('title');
    const dateLabel = text('dateLabel');

    if (
      !title ||
      !dateLabel ||
      !groups.some((group) => group.id === groupId && group.status === 'active')
    ) {
      setError(
        km
          ? 'សូមបំពេញព័ត៌មាន និងជ្រើសរើសក្រុមសកម្ម។'
          : 'Complete the fields and choose an active group.',
      );
      return;
    }

    const record: AdminGroupActivity = {
      id: crypto.randomUUID(),
      groupId,
      title,
      kmTitle: text('kmTitle'),
      dateLabel,
      status: 'scheduled',
    };

    saveGroupActivity(record);
    onClose();
  }

  return (
    <Modal title={km ? 'បន្ថែមសកម្មភាព' : 'Add activity'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm">
          {km ? 'ក្រុម' : 'Group'} *
          <select
            name="groupId"
            required
            defaultValue=""
            className={fieldClass}>
            <option value="">{km ? 'ជ្រើសរើសក្រុម' : 'Choose a group'}</option>
            {groups
              .filter((group) => group.status === 'active')
              .map((group) => (
                <option key={group.id} value={group.id}>
                  {km && group.kmName ? group.kmName : group.name}
                </option>
              ))}
          </select>
        </label>

        <label className="block text-sm">
          {km ? 'ចំណងជើងជាភាសាអង់គ្លេស' : 'Title (English)'} *
          <input name="title" required maxLength={160} className={fieldClass} />
        </label>

        <label className="block text-sm">
          {km ? 'ចំណងជើងជាភាសាខ្មែរ' : 'Title (Khmer)'}
          <input name="kmTitle" maxLength={200} className={fieldClass} />
        </label>

        <label className="block text-sm">
          {km ? 'កាលបរិច្ឆេទ និងម៉ោង (ភ្នំពេញ)' : 'Date and time (Phnom Penh)'}{' '}
          *
          <input
            name="dateLabel"
            type="datetime-local"
            required
            className={fieldClass}
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-arom-danger">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className={buttonClass}>
            {km ? 'បោះបង់' : 'Cancel'}
          </button>
          <button
            type="submit"
            className="rounded-full bg-arom px-5 py-2.5 text-sm text-white">
            {km ? 'រក្សាទុក' : 'Save activity'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function CommunityView() {
  const {
    groups,
    saveGroup,
    professionals,
    groupActivities,
    saveGroupActivity,
    communityReports,
    resolveCommunityReport,
  } = useAdmin();

  const { language } = useLanguage();
  const km = language === 'km';

  const [section, setSection] = useState<'groups' | 'activities' | 'reports'>(
    'groups',
  );
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState<{ record: AdminGroup | null } | null>(
    null,
  );
  const [activityOpen, setActivityOpen] = useState(false);
  const [reportAction, setReportAction] = useState<{
    report: CommunityReport;
    status: 'dismissed' | 'removed';
  } | null>(null);
  const [notice, setNotice] = useState('');

  const search = query.trim().toLocaleLowerCase();

  function groupName(id: string) {
    const group = groups.find((item) => item.id === id);
    return group
      ? km && group.kmName
        ? group.kmName
        : group.name
      : km
        ? 'មិនមានក្រុម'
        : 'Missing group';
  }

  function mentorName(id: string) {
    const mentor = professionals.find((item) => item.id === id);
    return mentor
      ? km && mentor.kmName
        ? mentor.kmName
        : mentor.name
      : km
        ? 'មិនទាន់កំណត់'
        : 'Unassigned';
  }

  const visibleGroups = groups.filter((group) =>
    `${group.name} ${group.kmName}`.toLocaleLowerCase().includes(search),
  );

  const visibleActivities = groupActivities.filter((activity) =>
    `${activity.title} ${activity.kmTitle} ${groupName(activity.groupId)}`
      .toLocaleLowerCase()
      .includes(search),
  );

  const visibleReports = communityReports.filter((report) =>
    `${report.reason} ${report.messagePreview} ${groupName(report.groupId)}`
      .toLocaleLowerCase()
      .includes(search),
  );

  return (
    <>
      <p className="text-sm font-medium text-arom">
        {km ? 'កន្លែងគាំទ្ររួមគ្នា' : 'Support, together'}
      </p>
      <h1 className="mt-2 text-3xl font-semibold">
        {km ? 'សហគមន៍' : 'Community'}
      </h1>
      <p className="mt-3 text-sm text-ink-muted">
        {km
          ? 'គ្រប់គ្រងក្រុម សកម្មភាព និងរបាយការណ៍។'
          : 'Manage support groups, activities, and reported content.'}
      </p>

      <div
        role="group"
        aria-label={km ? 'ផ្នែកសហគមន៍' : 'Community section'}
        className="mt-7 flex flex-wrap gap-2">
        {(
          [
            ['groups', km ? 'ក្រុម' : 'Groups'],
            ['activities', km ? 'សកម្មភាព' : 'Activities'],
            ['reports', km ? 'របាយការណ៍' : 'Reports'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={section === value}
            onClick={() => {
              setSection(value);
              setQuery('');
            }}
            className={`rounded-full border px-5 py-2.5 text-sm ${
              section === value
                ? 'border-arom bg-arom text-white'
                : 'border-arom-border bg-white text-ink-muted'
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative min-w-48 flex-1">
          <Search
            size={18}
            aria-hidden="true"
            className="absolute left-3 top-3 text-ink-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={km ? 'ស្វែងរកសហគមន៍' : 'Search community records'}
            placeholder={km ? 'ស្វែងរក...' : 'Search...'}
            className={`${fieldClass} mt-0 pl-10`}
          />
        </div>

        {section !== 'reports' && (
          <button
            type="button"
            onClick={() =>
              section === 'groups'
                ? setEditor({ record: null })
                : setActivityOpen(true)
            }
            className="flex items-center gap-2 rounded-full bg-arom px-5 py-2.5 text-sm text-white">
            <Plus size={18} />
            {section === 'groups'
              ? km
                ? 'បន្ថែមក្រុម'
                : 'Add group'
              : km
                ? 'បន្ថែមសកម្មភាព'
                : 'Add activity'}
          </button>
        )}
      </div>

      {section === 'groups' && (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {visibleGroups.map((group) => (
            <article
              key={group.id}
              className="rounded-3xl border border-arom-border bg-white p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  {km && group.kmName ? group.kmName : group.name}
                </h2>
                <span className="rounded-full bg-arom-wash px-3 py-1 text-xs text-arom">
                  {group.status === 'active'
                    ? km
                      ? 'សកម្ម'
                      : 'Active'
                    : km
                      ? 'បណ្ណសារ'
                      : 'Archived'}
                </span>
              </div>

              <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink-muted">
                {km && group.kmAbout ? group.kmAbout : group.about}
              </p>

              <p className="mt-4 text-sm">
                {km ? 'សមាជិក' : 'Members'}: {group.membersCount} /{' '}
                {group.maxMembers}
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                {km ? 'អ្នកសម្របសម្រួល' : 'Mentor'}:{' '}
                {mentorName(group.mentorId)}
              </p>
              <p className="mt-2 text-xs text-ink-muted">
                {group.isAnonymous
                  ? km
                    ? 'អនុញ្ញាតអនាមិក'
                    : 'Anonymous participation allowed'
                  : km
                    ? 'ប្រើឈ្មោះគណនី'
                    : 'Account names displayed'}
              </p>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  aria-label={`${km ? 'កែសម្រួល' : 'Edit'}: ${group.name}`}
                  onClick={() => setEditor({ record: group })}
                  className="rounded-lg border border-arom-border p-2 text-arom">
                  <Pencil size={17} />
                </button>
                <button
                  type="button"
                  aria-label={`${group.status === 'active' ? 'Archive' : 'Restore'}: ${group.name}`}
                  onClick={() => {
                    saveGroup({
                      ...group,
                      status: group.status === 'active' ? 'archived' : 'active',
                    });
                    setNotice(
                      km
                        ? 'បានធ្វើបច្ចុប្បន្នភាពក្រុម។'
                        : 'Group status updated.',
                    );
                  }}
                  className="rounded-lg border border-arom-border p-2 text-ink-muted">
                  {group.status === 'active' ? (
                    <Archive size={17} />
                  ) : (
                    <RotateCcw size={17} />
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {section === 'activities' && (
        <div className="mt-6 space-y-4">
          {visibleActivities.map((activity) => (
            <article
              key={activity.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-arom-border bg-white p-5">
              <div>
                <h2 className="font-medium">
                  {km && activity.kmTitle ? activity.kmTitle : activity.title}
                </h2>
                <p className="mt-2 text-sm text-ink-muted">
                  {groupName(activity.groupId)} · {activity.dateLabel}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {activity.status === 'scheduled'
                    ? km
                      ? 'បានរៀបចំ'
                      : 'Scheduled'
                    : km
                      ? 'បានបោះបង់'
                      : 'Cancelled'}
                </p>
              </div>

              {activity.status === 'scheduled' && (
                <button
                  type="button"
                  onClick={() => {
                    saveGroupActivity({ ...activity, status: 'cancelled' });
                    setNotice(
                      km ? 'បានបោះបង់សកម្មភាព។' : 'Demo activity cancelled.',
                    );
                  }}
                  className={buttonClass}>
                  {km ? 'បោះបង់សកម្មភាព' : 'Cancel activity'}
                </button>
              )}
            </article>
          ))}
        </div>
      )}

      {section === 'reports' && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-ink-muted">
            {km
              ? 'របាយការណ៍ទាំងនេះជាទិន្នន័យសាកល្បង។'
              : 'These are fictional reports. Actions update the queue only.'}
          </p>

          {visibleReports.map((report) => (
            <article
              key={report.id}
              className="rounded-2xl border border-arom-border bg-white p-5">
              <h2 className="font-medium">{groupName(report.groupId)}</h2>
              <p className="mt-2 text-sm text-ink-muted">{report.reason}</p>
              <blockquote className="mt-3 rounded-xl bg-arom-wash p-3 text-sm">
                {report.messagePreview}
              </blockquote>

              <p className="mt-3 text-xs text-ink-muted">
                {report.status === 'pending'
                  ? km
                    ? 'រង់ចាំពិនិត្យ'
                    : 'Pending review'
                  : report.status === 'dismissed'
                    ? km
                      ? 'បានបដិសេធរបាយការណ៍'
                      : 'Report dismissed'
                    : km
                      ? 'បានកំណត់ថាត្រូវលុប'
                      : 'Marked for removal'}
              </p>

              {report.status === 'pending' && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setReportAction({ report, status: 'dismissed' })
                    }
                    className={buttonClass}>
                    {km ? 'បដិសេធរបាយការណ៍' : 'Dismiss report'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setReportAction({ report, status: 'removed' })
                    }
                    className="rounded-full border border-arom-danger/20 px-4 py-2 text-sm text-arom-danger">
                    {km ? 'កំណត់ថាត្រូវលុប' : 'Mark for removal'}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {(section === 'groups'
        ? visibleGroups.length === 0
        : section === 'activities'
          ? visibleActivities.length === 0
          : visibleReports.length === 0) && (
        <p className="mt-8 text-center text-sm text-ink-muted">
          {km ? 'មិនមានលទ្ធផល' : 'No matching records'}
        </p>
      )}

      <p
        role="status"
        aria-live="polite"
        className="mt-4 min-h-5 text-sm text-arom">
        {notice}
      </p>

      {editor && (
        <GroupForm record={editor.record} onClose={() => setEditor(null)} />
      )}

      {activityOpen && <ActivityForm onClose={() => setActivityOpen(false)} />}

      {reportAction && (
        <Modal
          title={km ? 'បញ្ជាក់សកម្មភាព' : 'Confirm moderation action'}
          onClose={() => setReportAction(null)}>
          <p className="text-sm text-ink-muted">
            {reportAction.status === 'dismissed'
              ? km
                ? 'បដិសេធរបាយការណ៍នេះ?'
                : 'Dismiss this report?'
              : km
                ? 'កំណត់របាយការណ៍នេះថាត្រូវលុប?'
                : 'Mark this report for removal?'}
          </p>
          <p className="mt-2 text-xs text-ink-muted">
            {km
              ? 'ការផ្លាស់ប្តូរនេះប៉ះពាល់តែបញ្ជីសាកល្បង។'
              : 'This changes the mock queue and does not delete public messages.'}
          </p>

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setReportAction(null)}
              className={buttonClass}>
              {km ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={() => {
                resolveCommunityReport(
                  reportAction.report.id,
                  reportAction.status,
                );
                setReportAction(null);
                setNotice(km ? 'បានពិនិត្យរបាយការណ៍។' : 'Report reviewed.');
              }}
              className="rounded-full bg-arom px-5 py-2 text-sm text-white">
              {km ? 'បញ្ជាក់' : 'Confirm'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
