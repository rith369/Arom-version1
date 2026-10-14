'use client';

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';

import {
  ChevronDown,
  Search,
  ShieldCheck,
  ShieldOff,
  Stethoscope,
  UserCheck,
  UserMinus,
  UserX,
  UsersRound,
  X,
} from 'lucide-react';

import { useAdmin, type ProfessionalPromotion } from './admin-provider';
import { useLanguage } from '../../_components/language-provider';

import {
  type AdminUser,
  type UserRole,
  type UserStatus,
} from '../_data/users';

type RoleFilter = UserRole | 'all';
type StatusFilter = UserStatus | 'all';

type ActionKind =
  | 'makeProfessional'
  | 'makeAdmin'
  | 'removeProfessional'
  | 'removeAdmin'
  | 'suspend'
  | 'restore';

type PendingAction = {
  user: AdminUser;
  kind: ActionKind;
};

const fieldClass =
  'mt-2 w-full rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-arom focus:ring-2 focus:ring-arom/15';

const roleBadgeStyles: Record<UserRole, string> = {
  admin: 'bg-arom text-white',
  professional: 'bg-arom-soft text-arom',
  user: '',
};

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

function ActionDialog({
  title,
  children,
  cancelLabel,
  confirmLabel,
  isDestructive,
  onCancel,
  onSubmit,
}: {
  title: string;
  children: ReactNode;
  cancelLabel: string;
  confirmLabel: string;
  isDestructive: boolean;
  onCancel: () => void;
  // Returns an error message to show, or null when done.
  onSubmit: (form: FormData) => Promise<string | null>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;

    dialog?.showModal();

    return () => {
      dialog?.close();
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    const failure = await onSubmit(new FormData(event.currentTarget));
    setBusy(false);
    if (failure) setError(failure);
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={onCancel}
      aria-labelledby="user-action-title"
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-3xl border border-arom-border bg-white p-6 text-ink shadow-card backdrop:bg-ink/35">
      <form onSubmit={submit}>
        <div className="flex items-center justify-between gap-4">
          <h2 id="user-action-title" className="text-xl font-semibold">
            {title}
          </h2>

          <button
            type="button"
            onClick={onCancel}
            aria-label={cancelLabel}
            className="rounded-full p-2 hover:bg-arom-wash">
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 text-sm leading-6 text-ink-muted">{children}</div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-arom-danger">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            className="rounded-full border border-arom-border px-5 py-2.5 text-sm">
            {cancelLabel}
          </button>

          <button
            type="submit"
            disabled={busy}
            className={`rounded-full px-5 py-2.5 text-sm text-white disabled:opacity-60 ${
              isDestructive
                ? 'bg-arom-danger hover:opacity-90'
                : 'bg-arom hover:bg-arom-deep'
            }`}>
            {confirmLabel}
          </button>
        </div>
      </form>
    </dialog>
  );
}

export function UsersView() {
  const {
    userRecords: users,
    usersLoad,
    reloadUsers,
    currentUserId,
    setUserStatus,
    setUserRole,
  } = useAdmin();
  const { language } = useLanguage();

  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [notice, setNotice] = useState('');

  const roleLabels: Record<UserRole, string> = {
    user: t('អ្នកប្រើប្រាស់', 'User'),
    professional: t('អ្នកជំនាញ', 'Professional'),
    admin: t('អ្នកគ្រប់គ្រង', 'Admin'),
  };

  const statusLabels: Record<UserStatus, string> = {
    active: t('សកម្ម', 'Active'),
    suspended: t('បានផ្អាក', 'Suspended'),
  };

  const adminCount = users.filter((user) => user.role === 'admin').length;

  const searchText = query.trim().toLocaleLowerCase();

  const filteredUsers = users.filter(
    (user) =>
      (roleFilter === 'all' || user.role === roleFilter) &&
      (statusFilter === 'all' || user.status === statusFilter) &&
      `${user.fullName} ${user.email}`.toLocaleLowerCase().includes(searchText),
  );

  const dateFormatter = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Phnom_Penh',
  });

  const dateTimeFormatter = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Phnom_Penh',
  });

  const statistics = [
    {
      label: t('អ្នកប្រើប្រាស់សរុប', 'Total accounts'),
      value: users.length,
      icon: UsersRound,
    },
    {
      label: t('អ្នកជំនាញ', 'Professionals'),
      value: users.filter((user) => user.role === 'professional').length,
      icon: Stethoscope,
    },
    {
      label: t('អ្នកគ្រប់គ្រង', 'Admins'),
      value: adminCount,
      icon: ShieldCheck,
    },
    {
      label: t('គណនីបានផ្អាក', 'Suspended'),
      value: users.filter((user) => user.status === 'suspended').length,
      icon: UserX,
    },
  ];

  const actionConfig: Record<
    ActionKind,
    {
      label: string;
      title: string;
      confirm: string;
      done: string;
      isDestructive: boolean;
      icon: typeof ShieldCheck;
    }
  > = {
    makeProfessional: {
      label: t('ធ្វើជាអ្នកជំនាញ', 'Make professional'),
      title: t('ធ្វើឱ្យមនុស្សនេះជាអ្នកជំនាញ?', 'Make this person a professional?'),
      confirm: t('ធ្វើជាអ្នកជំនាញ', 'Make professional'),
      done: t('ឥឡូវជាអ្នកជំនាញ។', 'is now a professional.'),
      isDestructive: false,
      icon: Stethoscope,
    },
    makeAdmin: {
      label: t('ធ្វើជាអ្នកគ្រប់គ្រង', 'Make admin'),
      title: t('ផ្តល់សិទ្ធិអ្នកគ្រប់គ្រង?', 'Give admin access?'),
      confirm: t('ធ្វើជាអ្នកគ្រប់គ្រង', 'Make admin'),
      done: t('ឥឡូវជាអ្នកគ្រប់គ្រង។', 'is now an admin.'),
      isDestructive: false,
      icon: ShieldCheck,
    },
    removeProfessional: {
      label: t('ដកសិទ្ធិអ្នកជំនាញ', 'Remove professional role'),
      title: t('ដកសិទ្ធិអ្នកជំនាញ?', 'Remove professional role?'),
      confirm: t('ដកសិទ្ធិ', 'Remove role'),
      done: t('ត្រលប់ជាអ្នកប្រើប្រាស់វិញ។', 'is now a regular user.'),
      isDestructive: true,
      icon: UserMinus,
    },
    removeAdmin: {
      label: t('ដកសិទ្ធិអ្នកគ្រប់គ្រង', 'Remove admin access'),
      title: t('ដកសិទ្ធិអ្នកគ្រប់គ្រង?', 'Remove admin access?'),
      confirm: t('ដកសិទ្ធិ', 'Remove access'),
      done: t('ត្រលប់ជាអ្នកប្រើប្រាស់វិញ។', 'is now a regular user.'),
      isDestructive: true,
      icon: ShieldOff,
    },
    suspend: {
      label: t('ផ្អាកគណនី', 'Suspend account'),
      title: t('ផ្អាកគណនីនេះ?', 'Suspend this account?'),
      confirm: t('ផ្អាកគណនី', 'Suspend account'),
      done: t('គណនីត្រូវបានផ្អាក។', 'account suspended.'),
      isDestructive: true,
      icon: UserX,
    },
    restore: {
      label: t('ស្ដារគណនី', 'Restore account'),
      title: t('ស្ដារគណនីនេះ?', 'Restore this account?'),
      confirm: t('ស្ដារគណនី', 'Restore account'),
      done: t('គណនីត្រូវបានស្ដារ។', 'account restored.'),
      isDestructive: false,
      icon: UserCheck,
    },
  };

  function getActions(user: AdminUser): ActionKind[] {
    const roleActions: ActionKind[] =
      user.role === 'user'
        ? ['makeProfessional', 'makeAdmin']
        : user.role === 'professional'
          ? ['makeAdmin', 'removeProfessional']
          : ['removeAdmin'];

    return [...roleActions, user.status === 'active' ? 'suspend' : 'restore'];
  }

  async function runAction(form: FormData): Promise<string | null> {
    if (!pendingAction) return null;

    const { user, kind } = pendingAction;
    const text = (key: string) => String(form.get(key) ?? '').trim();

    let promotion: ProfessionalPromotion | undefined;
    if (kind === 'makeProfessional') {
      promotion = {
        title: text('title'),
        licenseNumber: text('licenseNumber'),
        issuingBody: text('issuingBody'),
        note: text('note'),
      };
    }

    const result =
      kind === 'makeProfessional'
        ? await setUserRole(user.id, 'professional', promotion)
        : kind === 'makeAdmin'
          ? await setUserRole(user.id, 'admin')
          : kind === 'removeProfessional' || kind === 'removeAdmin'
            ? await setUserRole(user.id, 'user')
            : await setUserStatus(user.id, kind === 'suspend' ? 'suspended' : 'active', text('reason'));

    if (!result.ok) return result.message;

    setNotice(`${user.fullName}: ${actionConfig[kind].done}`);
    setPendingAction(null);
    return null;
  }

  function clearFilters() {
    setQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
  }

  function renderDialogBody(action: PendingAction) {
    const { user, kind } = action;

    const who = (
      <div className="rounded-2xl bg-arom-wash p-4">
        <p className="font-medium text-ink">{user.fullName}</p>
        <p>{user.email}</p>
      </div>
    );

    if (kind === 'makeProfessional') {
      return (
        <>
          {who}
          <p className="mt-4">
            {t(
              'ប្រើសម្រាប់អ្នកជំនាញដែលអ្នកស្គាល់រួចហើយ។ ពួកគេនឹងបំពេញប្រវត្តិរូបសាធារណៈដោយខ្លួនឯង។ សូមកត់ត្រាអាជ្ញាប័ណ្ណ ទោះបីជាអ្នកស្គាល់ពួកគេក៏ដោយ។',
              'For professionals you already know. They fill in their own public profile afterwards. Record their license even if you know them.',
            )}
          </p>
          <label className="mt-4 block font-medium text-ink">
            {t('មុខតំណែង *', 'Professional title *')}
            <input
              name="title"
              required
              maxLength={120}
              placeholder={t('ឧ. អ្នកចិត្តសាស្ត្រ', 'For example, Psychologist')}
              className={fieldClass}
            />
          </label>
          <label className="mt-4 block font-medium text-ink">
            {t('លេខអាជ្ញាប័ណ្ណ *', 'License number *')}
            <input
              name="licenseNumber"
              required
              maxLength={60}
              className={fieldClass}
            />
          </label>
          <label className="mt-4 block font-medium text-ink">
            {t('ស្ថាប័នចេញអាជ្ញាប័ណ្ណ *', 'Issuing body *')}
            <input
              name="issuingBody"
              required
              maxLength={120}
              defaultValue="Ministry of Health, Cambodia"
              className={fieldClass}
            />
          </label>
          <label className="mt-4 block font-medium text-ink">
            {t('កំណត់ចំណាំ (ស្រេចចិត្ត)', 'Note (optional)')}
            <textarea
              name="note"
              rows={2}
              maxLength={500}
              placeholder={t(
                'ឧ. សហការីដែលស្គាល់ពីគ្លីនិក X',
                'For example, known colleague from X clinic',
              )}
              className={fieldClass}
            />
          </label>
        </>
      );
    }

    if (kind === 'makeAdmin') {
      return (
        <>
          {who}
          <p className="mt-4">
            {t(
              'អ្នកគ្រប់គ្រងអាចផ្លាស់ប្តូរតួនាទី ផ្អាកគណនី អនុម័តអ្នកជំនាញ និងគ្រប់គ្រងមាតិកាទាំងអស់។ ផ្តល់សិទ្ធិនេះតែចំពោះមនុស្សក្នុងក្រុមដែលអ្នកទុកចិត្តប៉ុណ្ណោះ។',
              'Admins can change roles, suspend accounts, approve professionals and manage all content. Only give this to trusted team members.',
            )}
          </p>
          {user.role === 'professional' && (
            <p className="mt-3 text-arom-warning">
              {t(
                'ពួកគេនឹងលែងជាអ្នកជំនាញ ហើយប្រវត្តិរូបនឹងត្រូវលាក់ពីបញ្ជី។',
                'They will stop being a professional and their profile will be hidden from the directory.',
              )}
            </p>
          )}
          <label className="mt-4 flex items-start gap-3 font-medium text-ink">
            <input type="checkbox" required className="mt-1 accent-arom" />
            {t(
              'ខ្ញុំយល់ថាមនុស្សនេះនឹងមានសិទ្ធិពេញលេញក្នុងការគ្រប់គ្រង AROM។',
              'I understand this person will have full admin access to AROM.',
            )}
          </label>
        </>
      );
    }

    const messages: Record<
      Exclude<ActionKind, 'makeProfessional' | 'makeAdmin'>,
      string
    > = {
      removeProfessional: t(
        'ប្រវត្តិរូបរបស់ពួកគេនឹងត្រូវលាក់ពីបញ្ជី ហើយមិនអាចទទួលការកក់ថ្មីបានទេ។',
        'Their profile is hidden from the directory and they cannot take new bookings.',
      ),
      removeAdmin: t(
        'ពួកគេនឹងបាត់បង់សិទ្ធិចូលទំព័រគ្រប់គ្រងភ្លាមៗ។',
        'They lose access to the admin area right away.',
      ),
      suspend: t(
        'ពួកគេនៅតែអាចចូល មើល និងលុបទិន្នន័យផ្ទាល់ខ្លួនបាន ប៉ុន្តែមិនអាចកក់ ចូលក្រុម បង្ហោះ ឬផ្សព្វផ្សាយបានទេ រហូតដល់អ្នកស្ដារវាវិញ។ ប្រសិនបើជាអ្នកជំនាញ ប្រវត្តិរូបនឹងត្រូវលាក់។',
        'They can still sign in to see or delete their own data, but cannot book, join groups, post or publish until you restore the account. A professional is hidden from the directory.',
      ),
      restore: t(
        'ពួកគេនឹងអាចចូលគណនីបានម្តងទៀត។',
        'They can sign in again.',
      ),
    };

    return (
      <>
        {who}
        <p className="mt-4">{messages[kind]}</p>
        {kind === 'suspend' && (
          <label className="mt-4 block font-medium text-ink">
            Reason (kept in the audit log) *
            <textarea name="reason" required rows={2} maxLength={500} className={fieldClass} />
          </label>
        )}
      </>
    );
  }

  return (
    <>
      <div>
        <p className="text-sm font-medium text-arom">
          {t('សហគមន៍ ARom', 'Our ARom community')}
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {t('អ្នកប្រើប្រាស់', 'Users')}
        </h1>

        <p className="mt-3 text-sm text-ink-muted">
          {t(
            'មើលព័ត៌មានគណនី ផ្លាស់ប្តូរតួនាទី និងគ្រប់គ្រងស្ថានភាពគណនី។',
            'View account details, change roles and manage account status.',
          )}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statistics.map(({ label, value, icon: Icon }) => (
          <section
            key={label}
            className="rounded-3xl border border-arom-border bg-white p-5 shadow-sm sm:p-6">
            <Icon
              aria-hidden="true"
              size={40}
              className="rounded-xl bg-arom-soft p-2 text-arom"
            />

            <p className="mt-5 text-3xl font-semibold">{value}</p>

            <h2 className="mt-2 text-sm text-ink-muted">{label}</h2>
          </section>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-3xl border border-arom-border bg-white p-4 shadow-sm">
        <div className="relative min-w-48 flex-1">
          <Search
            aria-hidden="true"
            size={18}
            className="absolute left-3 top-3 text-ink-muted"
          />

          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={t('ស្វែងរកអ្នកប្រើប្រាស់', 'Search users')}
            placeholder={t(
              'ស្វែងរកតាមឈ្មោះ ឬអ៊ីមែល...',
              'Search by name or email...',
            )}
            className="w-full rounded-xl border border-arom-border bg-arom-wash py-2.5 pl-10 pr-3 text-sm outline-none focus:border-arom focus:ring-2 focus:ring-arom/15"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
          aria-label={t('តម្រងតួនាទី', 'Filter by role')}
          className="rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm">
          <option value="all">{t('គ្រប់តួនាទី', 'All roles')}</option>
          <option value="user">{roleLabels.user}</option>
          <option value="professional">{roleLabels.professional}</option>
          <option value="admin">{roleLabels.admin}</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as StatusFilter)
          }
          aria-label={t('តម្រងស្ថានភាព', 'Filter by status')}
          className="rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm">
          <option value="all">{t('គ្រប់ស្ថានភាព', 'All statuses')}</option>
          <option value="active">{statusLabels.active}</option>
          <option value="suspended">{statusLabels.suspended}</option>
        </select>
      </div>

      {usersLoad !== 'ready' && (
        <div
          role={usersLoad === 'error' ? 'alert' : 'status'}
          className={`mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 text-sm ${
            usersLoad === 'error'
              ? 'border-arom-danger/25 bg-arom-danger-soft/50 text-arom-danger'
              : 'border-arom-border bg-white text-ink-muted'
          }`}>
          {usersLoad === 'error' ? 'Could not load accounts.' : 'Loading accounts...'}
          {usersLoad === 'error' && (
            <button
              type="button"
              onClick={() => void reloadUsers()}
              className="rounded-full border border-arom-danger/30 px-4 py-1.5 text-xs font-semibold hover:bg-white">
              Try again
            </button>
          )}
        </div>
      )}

      <p className="mt-5 text-xs font-medium text-ink-muted">
        {t('គណនី', 'Accounts')}: {filteredUsers.length} / {users.length}
      </p>

      <ul className="mt-3 space-y-3">
        {filteredUsers.map((user) => {
          const isOpen = openId === user.id;
          const isYou = user.id === currentUserId;
          const isLastAdmin = user.role === 'admin' && adminCount <= 1;
          const panelId = `user-panel-${user.id}`;

          const details = [
            {
              label: t('ថ្ងៃចូលរួម', 'Joined'),
              value: dateFormatter.format(new Date(user.createdAt)),
            },
            {
              label: t('ចូលចុងក្រោយ', 'Last seen'),
              value: user.lastSeenAt ? dateTimeFormatter.format(new Date(user.lastSeenAt)) : 'Never',
            },
            {
              label: t('ភាសា', 'Language'),
              value:
                user.preferredLanguage === 'km'
                  ? t('ខ្មែរ', 'Khmer')
                  : t('អង់គ្លេស', 'English'),
            },
            {
              label: t('ស្ថានភាព', 'Status'),
              value: statusLabels[user.status],
            },
            {
              label: t('ថ្ងៃសកម្ម (៣០ ថ្ងៃ)', 'Days active (30 days)'),
              value: user.daysActive30,
            },
            {
              label: t('ការពិនិត្យអារម្មណ៍', 'Check ins'),
              value: user.checkInCount,
            },
            {
              label: t('ការកក់', 'Bookings'),
              value: user.bookingCount,
            },
          ];

          return (
            <li
              key={user.id}
              className={`overflow-hidden rounded-3xl border bg-white shadow-sm ${
                isOpen ? 'border-arom' : 'border-arom-border'
              }`}>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : user.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center gap-4 p-4 text-left hover:bg-arom-wash/50 sm:p-5">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-arom-soft text-sm font-semibold text-arom">
                  {getInitials(user.fullName)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{user.fullName}</span>
                    {isYou && (
                      <span className="rounded-full bg-arom-accent/15 px-2.5 py-0.5 text-xs font-medium text-arom-deep">
                        {t('អ្នក', 'You')}
                      </span>
                    )}
                    {user.role !== 'user' && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeStyles[user.role]}`}>
                        {roleLabels[user.role]}
                      </span>
                    )}
                    {user.status === 'suspended' && (
                      <span className="rounded-full bg-arom-danger-soft px-2.5 py-0.5 text-xs font-medium text-arom-danger">
                        {statusLabels.suspended}
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block truncate text-sm text-ink-muted">
                    {user.email}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-muted">
                    {t('ចូលចុងក្រោយ', 'Last seen')}{' '}
                    {user.lastSeenAt ? dateTimeFormatter.format(new Date(user.lastSeenAt)) : 'Never'}
                  </span>
                </span>

                <ChevronDown
                  aria-hidden="true"
                  size={20}
                  className={`shrink-0 text-ink-muted transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div
                  id={panelId}
                  className="border-t border-arom-border p-4 sm:p-5">
                  <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {details.map(({ label, value }) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-arom-border bg-arom-wash p-3">
                        <dt className="text-xs text-ink-muted">{label}</dt>
                        <dd className="mt-1 font-semibold">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  <p className="mt-3 text-xs text-ink-muted">
                    {t(
                      'បង្ហាញតែចំនួនប៉ុណ្ណោះ។ អ្នកគ្រប់គ្រងមិនអាចអានកំណត់ហេតុ អារម្មណ៍ ឬកំណត់ចំណាំការពិគ្រោះបានទេ។',
                      'Counts only. Admins cannot read journals, moods or session notes.',
                    )}
                  </p>

                  {isYou ? (
                    <p className="mt-4 rounded-2xl bg-arom-wash p-3 text-sm text-ink-muted">
                      {t(
                        'អ្នកមិនអាចផ្លាស់ប្តូរតួនាទី ឬស្ថានភាពរបស់ខ្លួនឯងបានទេ។',
                        'You cannot change your own role or status.',
                      )}
                    </p>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {getActions(user).map((kind) => {
                        const { label, isDestructive, icon: Icon } =
                          actionConfig[kind];
                        const isBlocked = kind === 'removeAdmin' && isLastAdmin;

                        return (
                          <button
                            key={kind}
                            type="button"
                            disabled={isBlocked}
                            title={
                              isBlocked
                                ? t(
                                    'ត្រូវមានអ្នកគ្រប់គ្រងយ៉ាងហោចណាស់ម្នាក់។',
                                    'AROM needs at least one admin.',
                                  )
                                : undefined
                            }
                            onClick={() => setPendingAction({ user, kind })}
                            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
                              isDestructive
                                ? 'border-arom-danger/20 text-arom-danger hover:bg-arom-danger-soft'
                                : 'border-arom-border text-arom hover:bg-arom-soft'
                            }`}>
                            <Icon aria-hidden="true" size={16} />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {filteredUsers.length === 0 && (
        <div className="rounded-3xl border border-arom-border bg-white p-12 text-center">
          <UsersRound
            aria-hidden="true"
            size={32}
            className="mx-auto text-ink-muted"
          />

          <h2 className="mt-4 font-medium">
            {t('មិនមានលទ្ធផល', 'No matching users')}
          </h2>

          <p className="mt-2 text-sm text-ink-muted">
            {t(
              'សាកល្បងពាក្យស្វែងរក ឬតម្រងផ្សេង។',
              'Try another search or clear your filters.',
            )}
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 text-sm font-medium text-arom underline">
            {t('សម្អាតតម្រង', 'Clear filters')}
          </button>
        </div>
      )}

      <p
        role="status"
        aria-live="polite"
        className="mt-4 min-h-5 text-sm text-arom">
        {notice}
      </p>

      {pendingAction && (
        <ActionDialog
          key={`${pendingAction.user.id}-${pendingAction.kind}`}
          title={actionConfig[pendingAction.kind].title}
          cancelLabel={t('បោះបង់', 'Cancel')}
          confirmLabel={actionConfig[pendingAction.kind].confirm}
          isDestructive={actionConfig[pendingAction.kind].isDestructive}
          onCancel={() => setPendingAction(null)}
          onSubmit={runAction}>
          {renderDialogBody(pendingAction)}
        </ActionDialog>
      )}
    </>
  );
}
