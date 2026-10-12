'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Search, UsersRound, UserCheck, UserX, X } from 'lucide-react';

import { useAdmin } from './admin-provider';
import { useLanguage } from '../../_components/language-provider';

import type { AdminUser, UserStatus } from '../_data/users';

type StatusFilter = UserStatus | 'all';

type PendingAction = {
  user: AdminUser;
  nextStatus: UserStatus;
};

function ConfirmationDialog({
  title,
  children,
  cancelLabel,
  confirmLabel,
  isDestructive,
  onCancel,
  onConfirm,
}: {
  title: string;
  children: ReactNode;
  cancelLabel: string;
  confirmLabel: string;
  isDestructive: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    dialog?.showModal();

    return () => {
      dialog?.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onCancel={onCancel}
      aria-labelledby="user-action-title"
      aria-describedby="user-action-description"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-arom-border bg-white p-6 text-ink shadow-card backdrop:bg-ink/35">
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

      <div
        id="user-action-description"
        className="mt-4 text-sm leading-6 text-ink-muted">
        {children}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          autoFocus
          onClick={onCancel}
          className="rounded-full border border-arom-border px-5 py-2.5 text-sm">
          {cancelLabel}
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className={`rounded-full px-5 py-2.5 text-sm text-white ${
            isDestructive
              ? 'bg-arom-danger hover:opacity-90'
              : 'bg-arom hover:bg-arom-deep'
          }`}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

export function UsersView() {
  const { users, setUserStatus } = useAdmin();
  const { language } = useLanguage();

  const km = language === 'km';

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  const [notice, setNotice] = useState('');

  const labels = {
    active: km ? 'សកម្ម' : 'Active',
    suspended: km ? 'បានផ្អាក' : 'Suspended',
  };

  const activeCount = users.filter((user) => user.status === 'active').length;

  const suspendedCount = users.filter(
    (user) => user.status === 'suspended',
  ).length;

  const searchText = query.trim().toLocaleLowerCase();

  const filteredUsers = users.filter((user) => {
    const matchesStatus =
      statusFilter === 'all' || user.status === statusFilter;

    const matchesSearch = `${user.fullName} ${user.email}`
      .toLocaleLowerCase()
      .includes(searchText);

    return matchesStatus && matchesSearch;
  });

  const dateFormatter = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', {
    dateStyle: 'medium',
    timeZone: 'Asia/Phnom_Penh',
  });

  const statistics = [
    {
      label: km ? 'អ្នកប្រើប្រាស់សរុប' : 'Total users',
      value: users.length,
      icon: UsersRound,
    },
    {
      label: km ? 'គណនីសកម្ម' : 'Active accounts',
      value: activeCount,
      icon: UserCheck,
    },
    {
      label: km ? 'គណនីបានផ្អាក' : 'Suspended accounts',
      value: suspendedCount,
      icon: UserX,
    },
  ];

  function confirmStatusChange() {
    if (!pendingAction) return;

    const { user, nextStatus } = pendingAction;

    setUserStatus(user.id, nextStatus);

    setNotice(
      km
        ? `បានធ្វើបច្ចុប្បន្នភាពស្ថានភាពគណនី ${user.fullName}។`
        : `${user.fullName}: account ${
            nextStatus === 'active' ? 'restored' : 'suspended'
          }.`,
    );

    setPendingAction(null);
  }

  function clearFilters() {
    setQuery('');
    setStatusFilter('all');
  }

  return (
    <>
      <div>
        <p className="text-sm font-medium text-arom">
          {km ? 'សហគមន៍ ARom' : 'Our ARom community'}
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {km ? 'អ្នកប្រើប្រាស់' : 'Users'}
        </h1>

        <p className="mt-3 text-sm text-ink-muted">
          {km
            ? 'មើលព័ត៌មានគណនី និងគ្រប់គ្រងស្ថានភាពអ្នកប្រើប្រាស់។'
            : 'View account information and manage account status.'}
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {statistics.map(({ label, value, icon: Icon }) => (
          <section
            key={label}
            className="rounded-3xl border border-arom-border bg-white p-6 shadow-sm">
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

      <section className="mt-6 overflow-hidden rounded-3xl border border-arom-border bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-arom-border p-5">
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
              aria-label={km ? 'ស្វែងរកអ្នកប្រើប្រាស់' : 'Search users'}
              placeholder={
                km ? 'ស្វែងរកតាមឈ្មោះ ឬអ៊ីមែល...' : 'Search by name or email...'
              }
              className="w-full rounded-xl border border-arom-border bg-arom-wash py-2.5 pl-10 pr-3 text-sm outline-none focus:border-arom focus:ring-2 focus:ring-arom/15"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            aria-label={km ? 'តម្រងស្ថានភាព' : 'Filter by status'}
            className="rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm">
            <option value="all">{km ? 'គ្រប់ស្ថានភាព' : 'All statuses'}</option>
            <option value="active">{labels.active}</option>
            <option value="suspended">{labels.suspended}</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <caption className="sr-only">
              {km ? 'បញ្ជីគណនីអ្នកប្រើប្រាស់' : 'User accounts'}
            </caption>

            <thead className="bg-arom-wash text-xs text-ink-muted">
              <tr>
                {[
                  km ? 'អ្នកប្រើប្រាស់' : 'User',
                  km ? 'ភាសា' : 'Language',
                  km ? 'ថ្ងៃចូលរួម' : 'Joined',
                  km ? 'ស្ថានភាព' : 'Status',
                  km ? 'សកម្មភាព' : 'Actions',
                ].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-5 py-4 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-arom-border">
              {filteredUsers.map((user) => {
                const isSuspended = user.status === 'suspended';

                const actionLabel = isSuspended
                  ? km
                    ? 'ស្ដារគណនី'
                    : 'Restore'
                  : km
                    ? 'ផ្អាកគណនី'
                    : 'Suspend';

                return (
                  <tr key={user.id} className="hover:bg-arom-wash/50">
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-arom-soft text-sm font-medium text-arom">
                          {getInitials(user.fullName)}
                        </span>

                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="mt-1 text-xs text-ink-muted">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-5 text-ink-muted">
                      {user.preferredLanguage === 'km'
                        ? km
                          ? 'ខ្មែរ'
                          : 'Khmer'
                        : km
                          ? 'អង់គ្លេស'
                          : 'English'}
                    </td>

                    <td className="px-5 py-5 text-ink-muted">
                      <time dateTime={user.createdAt}>
                        {dateFormatter.format(new Date(user.createdAt))}
                      </time>
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${
                          isSuspended
                            ? 'bg-arom-danger-soft text-arom-danger'
                            : 'bg-arom-soft text-arom'
                        }`}>
                        {labels[user.status]}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <button
                        type="button"
                        aria-label={`${actionLabel}: ${user.fullName}`}
                        onClick={() =>
                          setPendingAction({
                            user,
                            nextStatus: isSuspended ? 'active' : 'suspended',
                          })
                        }
                        className={`rounded-full border px-4 py-2 text-xs font-medium ${
                          isSuspended
                            ? 'border-arom-border text-arom hover:bg-arom-soft'
                            : 'border-arom-danger/20 text-arom-danger hover:bg-arom-danger-soft'
                        }`}>
                        {actionLabel}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <UsersRound
              aria-hidden="true"
              size={32}
              className="mx-auto text-ink-muted"
            />

            <h2 className="mt-4 font-medium">
              {km ? 'មិនមានលទ្ធផល' : 'No matching users'}
            </h2>

            <p className="mt-2 text-sm text-ink-muted">
              {km
                ? 'សាកល្បងពាក្យស្វែងរក ឬតម្រងផ្សេង។'
                : 'Try another search or clear your filters.'}
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 text-sm font-medium text-arom underline">
              {km ? 'សម្អាតតម្រង' : 'Clear filters'}
            </button>
          </div>
        )}

        <p className="border-t border-arom-border px-5 py-4 text-xs text-ink-muted">
          {km ? 'លទ្ធផល' : 'Showing'} {filteredUsers.length} / {users.length}
        </p>
      </section>

      <p
        role="status"
        aria-live="polite"
        className="mt-4 min-h-5 text-sm text-arom">
        {notice}
      </p>

      {pendingAction && (
        <ConfirmationDialog
          title={
            pendingAction.nextStatus === 'suspended'
              ? km
                ? 'ផ្អាកគណនីនេះ?'
                : 'Suspend this account?'
              : km
                ? 'ស្ដារគណនីនេះ?'
                : 'Restore this account?'
          }
          cancelLabel={km ? 'បោះបង់' : 'Cancel'}
          confirmLabel={
            pendingAction.nextStatus === 'suspended'
              ? km
                ? 'ផ្អាកគណនី'
                : 'Suspend account'
              : km
                ? 'ស្ដារគណនី'
                : 'Restore account'
          }
          isDestructive={pendingAction.nextStatus === 'suspended'}
          onCancel={() => setPendingAction(null)}
          onConfirm={confirmStatusChange}>
          <p className="font-medium text-ink">{pendingAction.user.fullName}</p>
          <p>{pendingAction.user.email}</p>
          <p className="mt-3">
            {km
              ? 'សកម្មភាពនេះផ្លាស់ប្តូរតែទិន្នន័យសាកល្បងប៉ុណ្ណោះ។'
              : 'This changes the demo account status only.'}
          </p>
        </ConfirmationDialog>
      )}
    </>
  );
}
