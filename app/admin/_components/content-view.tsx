'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BookOpen, Pencil, Search } from 'lucide-react';

import { useAdmin } from './admin-provider';
import { PublishStateChip, usePublishStateLabels } from './content-status';
import { useLanguage } from '../../_components/language-provider';

import {
  getPublishState,
  getWorkingBody,
  type ContentType,
  type PublishState,
} from '../_data/content';

type StatusFilter = PublishState | 'all';

// One content type at a time. The MindGuide page owns the header and tabs.
export function ContentView({ activeType }: { activeType: ContentType }) {
  const { contentRecords } = useAdmin();
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const stateLabels = usePublishStateLabels();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const typeLabels: Record<ContentType, string> = {
    lesson: t('មេរៀន', 'Lessons'),
    tip: t('គន្លឹះ', 'Tips'),
    practice: t('ការអនុវត្ត', 'Practices'),
  };

  const dateFormatter = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Phnom_Penh',
  });

  const searchText = query.trim().toLocaleLowerCase();

  const rows = contentRecords
    .filter((record) => record.type === activeType)
    .map((record) => {
      const body = getWorkingBody(record);
      const lastVersion = record.versions.at(-1);
      const lastChange = record.draft
        ? { at: record.draft.updatedAt, by: record.draft.updatedBy }
        : lastVersion
          ? { at: lastVersion.publishedAt, by: lastVersion.publishedBy }
          : null;

      return { record, meta: body.meta, state: getPublishState(record), lastChange };
    })
    .filter(
      ({ meta, state }) =>
        (statusFilter === 'all' || state === statusFilter) &&
        `${meta.title} ${meta.kmTitle} ${meta.category}`
          .toLocaleLowerCase()
          .includes(searchText),
    );

  const totalOfType = contentRecords.filter((record) => record.type === activeType).length;

  function clearFilters() {
    setQuery('');
    setStatusFilter('all');
  }

  return (
    <>
      <div className="space-y-1">
        <p className="text-sm text-ink-muted">
          {t(
            'ការកែប្រែត្រូវបានរក្សាទុកជាសេចក្តីព្រាង ហើយអ្នកប្រើឃើញតែបន្ទាប់ពីផ្សព្វផ្សាយ។',
            'Edits are saved as drafts. Users only see them after you publish.',
          )}
        </p>
        <p className="text-sm text-ink-muted">
          New items are written by the team with AI and arrive here as drafts to check, fix and publish.
        </p>
      </div>

      <section className="mt-4 overflow-hidden rounded-3xl border border-arom-border bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-arom-border p-5">
          <div className="relative min-w-48 flex-1">
            <Search size={18} aria-hidden="true" className="absolute left-3 top-3 text-ink-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label={t('ស្វែងរកមាតិកា', 'Search content')}
              placeholder={t('ស្វែងរកតាមចំណងជើង ឬប្រភេទ...', 'Search by title or category...')}
              className="w-full rounded-xl border border-arom-border bg-arom-wash py-2.5 pl-10 pr-3 text-sm outline-none focus:border-arom focus:ring-2 focus:ring-arom/15"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            aria-label={t('តម្រងស្ថានភាព', 'Filter by status')}
            className="rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm">
            <option value="all">{t('គ្រប់ស្ថានភាព', 'All statuses')}</option>
            {(Object.keys(stateLabels) as PublishState[]).map((state) => (
              <option key={state} value={state}>
                {stateLabels[state]}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <caption className="sr-only">{typeLabels[activeType]}</caption>
            <thead className="bg-arom-wash text-xs text-ink-muted">
              <tr>
                {[
                  t('ចំណងជើង', 'Title'),
                  t('ប្រភេទ', 'Category'),
                  t('រយៈពេល', 'Duration'),
                  t('ស្ថានភាព', 'Status'),
                  t('កែចុងក្រោយ', 'Last change'),
                  t('សកម្មភាព', 'Actions'),
                ].map((heading) => (
                  <th key={heading} scope="col" className="px-5 py-4 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-arom-border">
              {rows.map(({ record, meta, state, lastChange }) => {
                const displayTitle =
                  (km && meta.kmTitle) || meta.title || t('គ្មានចំណងជើង', 'Untitled');
                const description =
                  (km && meta.kmDescription) || meta.description;

                return (
                  <tr key={record.id} className="hover:bg-arom-wash/50">
                    <td className="max-w-sm px-5 py-5">
                      <p className="font-medium">{displayTitle}</p>
                      {description && (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-muted">
                          {description}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-5">
                      {meta.category && (
                        <span className="rounded-lg bg-arom-wash px-2 py-1 text-xs text-arom">
                          {meta.category}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-5 text-ink-muted">{meta.duration}</td>
                    <td className="px-5 py-5">
                      <PublishStateChip state={state} />
                      {record.liveVersion && (
                        <p className="mt-1.5 text-xs text-ink-muted">
                          {t('កំណែទី', 'Version')} {record.liveVersion}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-5 text-xs text-ink-muted">
                      {lastChange && (
                        <>
                          <p>{dateFormatter.format(new Date(lastChange.at))}</p>
                          <p className="mt-0.5">{lastChange.by}</p>
                        </>
                      )}
                    </td>
                    <td className="px-5 py-5">
                      <Link
                        href={`/admin/mindguide/${record.type}/${record.sourceId}`}
                        aria-label={`${t('កែសម្រួល', 'Edit')}: ${displayTitle}`}
                        className="inline-flex items-center gap-2 rounded-full border border-arom-border px-4 py-2 text-xs font-medium text-arom hover:bg-arom-soft">
                        <Pencil size={14} aria-hidden="true" />
                        {t('កែសម្រួល', 'Edit')}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="p-12 text-center">
            <BookOpen size={32} aria-hidden="true" className="mx-auto text-ink-muted" />
            <h2 className="mt-4 font-medium">{t('មិនមានលទ្ធផល', 'No matching content')}</h2>
            <p className="mt-2 text-sm text-ink-muted">
              {t('សាកល្បងពាក្យស្វែងរក ឬតម្រងផ្សេង។', 'Try another search or clear your filters.')}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 text-sm font-medium text-arom underline">
              {t('សម្អាតតម្រង', 'Clear filters')}
            </button>
          </div>
        )}

        <p className="border-t border-arom-border px-5 py-4 text-xs text-ink-muted">
          {t('លទ្ធផល', 'Showing')} {rows.length} / {totalOfType}
        </p>
      </section>
    </>
  );
}
