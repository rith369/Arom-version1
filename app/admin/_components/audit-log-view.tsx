'use client';

import { useState } from 'react';
import { Search, ClipboardList } from 'lucide-react';

import { useLanguage } from '../../_components/language-provider';

import { initialAuditEntries, type AuditModule } from '../_data/audit-log';

function clinicDate(value: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value));

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function AuditLogView() {
  const { language } = useLanguage();
  const km = language === 'km';

  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState<AuditModule | 'all'>('all');
  const [date, setDate] = useState('');

  const moduleLabels: Record<AuditModule, string> = {
    users: km ? 'អ្នកប្រើប្រាស់' : 'Users',
    professionals: km ? 'អ្នកជំនាញ' : 'Professionals',
    content: km ? 'មាតិកា' : 'Content',
    podcasts: km ? 'ផតខាស' : 'Podcasts',
    bookings: km ? 'ការកក់' : 'Bookings',
    community: km ? 'សហគមន៍' : 'Community',
    journal: km ? 'សំណួរកំណត់ហេតុ' : 'Journal prompts',
    settings: km ? 'ការកំណត់' : 'Settings',
  };

  const search = query.trim().toLocaleLowerCase();

  const visibleEntries = initialAuditEntries
    .filter((entry) => {
      const matchesModule =
        moduleFilter === 'all' || entry.module === moduleFilter;

      const matchesDate = !date || clinicDate(entry.createdAt) === date;

      const matchesSearch =
        `${entry.actorName} ${entry.action} ${entry.kmAction} ${entry.targetLabel}`
          .toLocaleLowerCase()
          .includes(search);

      return matchesModule && matchesDate && matchesSearch;
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const formatter = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Phnom_Penh',
  });

  function clearFilters() {
    setQuery('');
    setModuleFilter('all');
    setDate('');
  }

  return (
    <>
      <p className="text-sm font-medium text-arom">
        {km ? 'ប្រវត្តិសកម្មភាព' : 'Administration history'}
      </p>

      <h1 className="mt-2 text-3xl font-semibold">
        {km ? 'កំណត់ហេតុសកម្មភាព' : 'Audit log'}
      </h1>

      <p className="mt-3 text-sm text-ink-muted">
        {km
          ? 'មើលប្រវត្តិសកម្មភាពរបស់អ្នកគ្រប់គ្រង។'
          : 'Review who changed what and when.'}
      </p>

      <p className="mt-5 rounded-xl bg-arom-wash p-4 text-xs leading-5 text-arom">
        {km
          ? 'នេះជាប្រវត្តិសាកល្បង។ សកម្មភាពនៅទំព័រផ្សេងមិនទាន់បន្ថែមកំណត់ហេតុដោយស្វ័យប្រវត្តិ។'
          : 'These are fictional entries. Actions on other admin pages are not automatically logged yet.'}
      </p>

      <section className="mt-6 overflow-hidden rounded-3xl border border-arom-border bg-white shadow-sm">
        <div className="flex flex-wrap gap-3 border-b border-arom-border p-5">
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
              aria-label={km ? 'ស្វែងរកកំណត់ហេតុ' : 'Search audit log'}
              placeholder={
                km
                  ? 'ស្វែងរកសកម្មភាព...'
                  : 'Search actions, admins, or records...'
              }
              className="w-full rounded-xl border border-arom-border bg-arom-wash py-2.5 pl-10 pr-3 text-sm outline-none focus:border-arom focus:ring-2 focus:ring-arom/15"
            />
          </div>

          <select
            value={moduleFilter}
            onChange={(event) =>
              setModuleFilter(event.target.value as AuditModule | 'all')
            }
            aria-label={km ? 'តម្រងផ្នែក' : 'Filter by module'}
            className="rounded-xl border border-arom-border px-3 py-2.5 text-sm">
            <option value="all">{km ? 'គ្រប់ផ្នែក' : 'All modules'}</option>

            {Object.entries(moduleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            aria-label={km ? 'តម្រងកាលបរិច្ឆេទ' : 'Filter by date'}
            className="rounded-xl border border-arom-border px-3 py-2.5 text-sm"
          />

          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-arom underline">
            {km ? 'សម្អាតតម្រង' : 'Clear filters'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <caption className="sr-only">
              {km ? 'ប្រវត្តិសកម្មភាពអ្នកគ្រប់គ្រង' : 'Admin action history'}
            </caption>

            <thead className="bg-arom-wash text-xs text-ink-muted">
              <tr>
                {(km
                  ? [
                      'ពេលវេលា',
                      'អ្នកគ្រប់គ្រង',
                      'ផ្នែក',
                      'សកម្មភាព',
                      'កំណត់ត្រា',
                    ]
                  : ['Time', 'Admin', 'Module', 'Action', 'Record']
                ).map((heading) => (
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
              {visibleEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-arom-wash/50">
                  <td className="px-5 py-5 text-ink-muted">
                    <time dateTime={entry.createdAt}>
                      {formatter.format(new Date(entry.createdAt))}
                    </time>
                  </td>

                  <td className="px-5 py-5 font-medium">{entry.actorName}</td>

                  <td className="px-5 py-5">
                    <span className="rounded-full bg-arom-wash px-3 py-1 text-xs text-arom">
                      {moduleLabels[entry.module]}
                    </span>
                  </td>

                  <td className="px-5 py-5">
                    {km ? entry.kmAction : entry.action}
                  </td>

                  <td className="px-5 py-5 text-ink-muted">
                    {entry.targetLabel}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!visibleEntries.length && (
          <div className="p-12 text-center">
            <ClipboardList
              size={32}
              aria-hidden="true"
              className="mx-auto text-ink-muted"
            />
            <p className="mt-4 font-medium">
              {km ? 'មិនមានលទ្ធផល' : 'No matching activity'}
            </p>
          </div>
        )}

        <p className="border-t border-arom-border px-5 py-4 text-xs text-ink-muted">
          {km ? 'លទ្ធផល' : 'Showing'} {visibleEntries.length} /{' '}
          {initialAuditEntries.length}
          {' · '}
          {km ? 'ពេលវេលាភ្នំពេញ' : 'Phnom Penh time'}
        </p>
      </section>
    </>
  );
}
