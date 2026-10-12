'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Archive,
  RotateCcw,
  BookOpen,
  Lightbulb,
  HeartHandshake,
} from 'lucide-react';

import { useAdmin } from './admin-provider';
import { ContentForm } from './content-form';
import { useLanguage } from '../../_components/language-provider';

import type {
  AdminContent,
  ContentStatus,
  ContentType,
} from '../_data/content';
import { LessonEditor } from './lesson-editor';
import { TipEditor } from './tip-editor';
import { PracticeEditor } from './practice-editor';

type StatusFilter = ContentStatus | 'all';

export function ContentView() {
  const { content, saveContent, setContentStatus } = useAdmin();
  const { language } = useLanguage();

  const km = language === 'km';

  const [activeType, setActiveType] = useState<ContentType>('lesson');

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [editor, setEditor] = useState<{ record: AdminContent | null } | null>(
    null,
  );

  const [notice, setNotice] = useState('');

  const typeLabels: Record<ContentType, string> = {
    lesson: km ? 'មេរៀន' : 'Lessons',
    tip: km ? 'គន្លឹះ' : 'Tips',
    practice: km ? 'ការអនុវត្ត' : 'Practices',
  };

  const statusLabels: Record<ContentStatus, string> = {
    draft: km ? 'សេចក្តីព្រាង' : 'Draft',
    published: km ? 'បានផ្សព្វផ្សាយ' : 'Published',
    archived: km ? 'បានទុកក្នុងបណ្ណសារ' : 'Archived',
  };

  const typeOptions = [
    { type: 'lesson', icon: BookOpen },
    { type: 'tip', icon: Lightbulb },
    { type: 'practice', icon: HeartHandshake },
  ] as const;

  const searchText = query.trim().toLocaleLowerCase();

  const typeContent = content.filter((item) => item.type === activeType);

  const filteredContent = typeContent.filter((item) => {
    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;

    const matchesSearch = `${item.title} ${item.kmTitle} ${item.category}`
      .toLocaleLowerCase()
      .includes(searchText);

    return matchesStatus && matchesSearch;
  });
  const [tipEditor, setTipEditor] = useState<AdminContent | null>(null);
  const [practiceEditor, setPracticeEditor] = useState<AdminContent | null>(
    null,
  );

  function clearFilters() {
    setQuery('');
    setStatusFilter('all');
  }

  function changeType(type: ContentType) {
    setActiveType(type);
    clearFilters();
    setNotice('');
  }

  function handleSave(record: AdminContent) {
    saveContent(record);
    setEditor(null);

    // Show the saved record even if its status changed.
    clearFilters();

    setNotice(km ? 'បានរក្សាទុកមាតិកា។' : `${record.title}: content saved.`);
  }

  function toggleArchive(record: AdminContent) {
    const nextStatus: ContentStatus =
      record.status === 'archived' ? 'draft' : 'archived';

    setContentStatus(record.id, nextStatus);

    setNotice(
      km
        ? 'បានធ្វើបច្ចុប្បន្នភាពស្ថានភាពមាតិកា។'
        : `${record.title}: ${
            nextStatus === 'draft' ? 'restored as draft' : 'archived'
          }.`,
    );
  }
  const [lessonEditor, setLessonEditor] = useState<AdminContent | null>(null);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-medium text-arom">
            {km ? 'មាតិកាថែទាំចិត្ត' : 'MindGuide library'}
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {km ? 'គ្រប់គ្រងមាតិកា' : 'Content'}
          </h1>

          <p className="mt-3 text-sm text-ink-muted">
            {km
              ? 'គ្រប់គ្រងមេរៀន គន្លឹះ និងការអនុវត្ត។'
              : 'Manage lessons, practical tips, and guided practices.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditor({ record: null })}
          className="flex items-center gap-2 rounded-full bg-arom px-5 py-3 text-sm font-medium text-white hover:bg-arom-deep">
          <Plus size={18} aria-hidden="true" />
          {km ? 'បន្ថែមមាតិកា' : 'Add content'}
        </button>
      </div>

      <div
        role="group"
        aria-label={km ? 'ប្រភេទមាតិកា' : 'Content type'}
        className="mt-8 flex flex-wrap gap-2">
        {typeOptions.map(({ type, icon: Icon }) => {
          const selected = activeType === type;

          const count = content.filter((item) => item.type === type).length;

          return (
            <button
              key={type}
              type="button"
              aria-pressed={selected}
              onClick={() => changeType(type)}
              className={`flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium ${
                selected
                  ? 'border-arom bg-arom text-white'
                  : 'border-arom-border bg-white text-ink-muted hover:bg-arom-wash'
              }`}>
              <Icon size={18} aria-hidden="true" />
              {typeLabels[type]}

              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  selected ? 'bg-white/15' : 'bg-arom-wash text-arom'
                }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <section className="mt-6 overflow-hidden rounded-3xl border border-arom-border bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-arom-border p-5">
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
              aria-label={km ? 'ស្វែងរកមាតិកា' : 'Search content'}
              placeholder={
                km
                  ? 'ស្វែងរកតាមចំណងជើង ឬប្រភេទ...'
                  : 'Search by title or category...'
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

            <option value="draft">{statusLabels.draft}</option>
            <option value="published">{statusLabels.published}</option>
            <option value="archived">{statusLabels.archived}</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <caption className="sr-only">{typeLabels[activeType]}</caption>

            <thead className="bg-arom-wash text-xs text-ink-muted">
              <tr>
                {[
                  km ? 'ចំណងជើង' : 'Title',
                  km ? 'ប្រភេទ' : 'Category',
                  km ? 'រយៈពេល' : 'Duration',
                  km ? 'កម្រិត' : 'Difficulty',
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
              {filteredContent.map((item) => {
                const displayTitle =
                  km && item.kmTitle ? item.kmTitle : item.title;

                const description =
                  km && item.kmDescription
                    ? item.kmDescription
                    : item.description;

                const isArchived = item.status === 'archived';

                return (
                  <tr key={item.id} className="hover:bg-arom-wash/50">
                    <td className="max-w-sm px-5 py-5">
                      <p className="font-medium">{displayTitle}</p>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-muted">
                        {description}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <span className="rounded-lg bg-arom-wash px-2 py-1 text-xs text-arom">
                        {item.category}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-5 text-ink-muted">
                      {item.duration}
                    </td>

                    <td className="px-5 py-5 text-ink-muted">
                      {item.difficulty === 'Beginner'
                        ? km
                          ? 'កម្រិតដំបូង'
                          : 'Beginner'
                        : km
                          ? 'កម្រិតមធ្យម'
                          : 'Intermediate'}
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${
                          item.status === 'published'
                            ? 'bg-arom-soft text-arom'
                            : item.status === 'draft'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-gray-100 text-gray-600'
                        }`}>
                        {statusLabels[item.status]}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          aria-label={`${
                            km ? 'កែសម្រួល' : 'Edit'
                          }: ${displayTitle}`}
                          onClick={() => setEditor({ record: item })}
                          className="rounded-lg border border-arom-border p-2 text-arom hover:bg-arom-soft">
                          <Pencil size={16} aria-hidden="true" />
                        </button>

                        <button
                          type="button"
                          aria-label={`${
                            isArchived
                              ? km
                                ? 'ស្ដារជាសេចក្តីព្រាង'
                                : 'Restore as draft'
                              : km
                                ? 'ទុកក្នុងបណ្ណសារ'
                                : 'Archive'
                          }: ${displayTitle}`}
                          onClick={() => toggleArchive(item)}
                          className="rounded-lg border border-arom-border p-2 text-ink-muted hover:bg-arom-soft">
                          {isArchived ? (
                            <RotateCcw size={16} aria-hidden="true" />
                          ) : (
                            <Archive size={16} aria-hidden="true" />
                          )}
                        </button>
                        {item.type === 'lesson' && (
                          <button
                            type="button"
                            onClick={() => setLessonEditor(item)}
                            aria-label={`${km ? 'كែសម្រួលផ្នែកមេរៀន' : 'Edit lesson sections'}: ${displayTitle}`}
                            className="rounded-lg border border-arom-border p-2 text-arom hover:bg-arom-soft">
                            <BookOpen size={16} aria-hidden="true" />
                          </button>
                        )}
                        {item.type === 'tip' && (
                          <button
                            type="button"
                            onClick={() => setTipEditor(item)}
                            aria-label={`${km ? 'កែសម្រួលជំហាន' : 'Edit tip steps'}: ${displayTitle}`}
                            className="rounded-lg border border-arom-border p-2 text-arom hover:bg-arom-soft">
                            <Lightbulb size={16} aria-hidden="true" />
                          </button>
                        )}
                        {item.type === 'practice' && (
                          <button
                            type="button"
                            onClick={() => setPracticeEditor(item)}
                            aria-label={`${km ? 'កែសម្រួលការណែនាំ' : 'Edit practice instructions'}: ${displayTitle}`}
                            className="rounded-lg border border-arom-border p-2 text-arom hover:bg-arom-soft">
                            <HeartHandshake size={16} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredContent.length === 0 && (
          <div className="p-12 text-center">
            <BookOpen
              size={32}
              aria-hidden="true"
              className="mx-auto text-ink-muted"
            />

            <h2 className="mt-4 font-medium">
              {km ? 'មិនមានលទ្ធផល' : 'No matching content'}
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
          {km ? 'លទ្ធផល' : 'Showing'} {filteredContent.length} /{' '}
          {typeContent.length}
        </p>
      </section>

      <p
        role="status"
        aria-live="polite"
        className="mt-4 min-h-5 text-sm text-arom">
        {notice}
      </p>

      {editor && (
        <ContentForm
          record={editor.record}
          defaultType={activeType}
          onSave={handleSave}
          onClose={() => setEditor(null)}
        />
      )}
      {lessonEditor && (
        <LessonEditor
          key={lessonEditor.id}
          record={lessonEditor}
          onClose={() => setLessonEditor(null)}
        />
      )}
      {tipEditor && (
        <TipEditor
          key={tipEditor.id}
          record={tipEditor}
          onClose={() => setTipEditor(null)}
        />
      )}
      {practiceEditor && (
        <PracticeEditor
          key={practiceEditor.id}
          record={practiceEditor}
          onClose={() => setPracticeEditor(null)}
        />
      )}
    </>
  );
}
