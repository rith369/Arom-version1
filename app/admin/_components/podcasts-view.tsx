'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

import {
  Plus,
  Search,
  Pencil,
  Archive,
  RotateCcw,
  X,
  Trash2,
  Headphones,
} from 'lucide-react';

import { useAdmin } from './admin-provider';
import { useLanguage } from '../../_components/language-provider';

import type { AdminPodcast, PodcastStatus } from '../_data/podcasts';

const fieldClass =
  'mt-2 w-full rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm outline-none focus:border-arom focus:ring-2 focus:ring-arom/15';

function validTimestamp(value: string) {
  // Accept MM:SS or HH:MM:SS.
  return /^(?:\d{1,2}:)?\d{1,2}:[0-5]\d$/.test(value);
}

function PodcastForm({
  record,
  onClose,
  onSave,
}: {
  record: AdminPodcast | null;
  onClose: () => void;
  onSave: (record: AdminPodcast) => void;
}) {
  const { professionals } = useAdmin();
  const { language } = useLanguage();
  const km = language === 'km';

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [chapters, setChapters] = useState(
    record?.chapters.map((chapter) => ({ ...chapter })) ?? [],
  );
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  function updateChapter(
    id: string,
    field: 'timestamp' | 'title' | 'kmTitle',
    value: string,
  ) {
    setChapters((current) =>
      current.map((chapter) =>
        chapter.id === id ? { ...chapter, [field]: value } : chapter,
      ),
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? '').trim();

    const title = text('title');
    const description = text('description');
    const professionalId = text('professionalId');
    const topic = text('topic');
    const duration = text('duration');
    const audioUrl = text('audioUrl');
    const publishedDate = text('publishedDate');
    const rawStatus = text('status');

    const status: PodcastStatus =
      rawStatus === 'published'
        ? 'published'
        : rawStatus === 'archived'
          ? 'archived'
          : 'draft';

    if (
      !title ||
      !description ||
      !topic ||
      !duration ||
      !professionals.some((item) => item.id === professionalId)
    ) {
      setError(
        km
          ? 'សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់។'
          : 'Complete all required fields and choose a professional.',
      );
      return;
    }

    if (audioUrl) {
      try {
        if (new URL(audioUrl).protocol !== 'https:') {
          throw new Error('Invalid protocol');
        }
      } catch {
        setError(
          km
            ? 'សូមប្រើតំណសំឡេង HTTPS ដែលត្រឹមត្រូវ។'
            : 'Enter a valid HTTPS audio URL.',
        );
        return;
      }
    }

    if (status === 'published' && (!audioUrl || !publishedDate)) {
      setError(
        km
          ? 'សូមបញ្ចូលតំណសំឡេង និងថ្ងៃផ្សព្វផ្សាយ។'
          : 'Published episodes need an audio URL and publication date.',
      );
      return;
    }

    const cleanedChapters = chapters.map((chapter) => ({
      ...chapter,
      timestamp: chapter.timestamp.trim(),
      title: chapter.title.trim(),
      kmTitle: chapter.kmTitle.trim(),
    }));

    if (
      cleanedChapters.some(
        (chapter) => !chapter.title || !validTimestamp(chapter.timestamp),
      )
    ) {
      setError(
        km
          ? 'សូមបំពេញចំណងជើងជំពូក និងពេលវេលាឱ្យត្រឹមត្រូវ។'
          : 'Each chapter needs a title and a timestamp such as 01:30.',
      );
      return;
    }

    onSave({
      id: record?.id ?? crypto.randomUUID(),
      professionalId,
      title,
      kmTitle: text('kmTitle'),
      description,
      kmDescription: text('kmDescription'),
      topic,
      duration,
      audioUrl,
      publishedDate,
      status,
      chapters: cleanedChapters,
    });
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      aria-labelledby="podcast-form-title"
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-3xl border border-arom-border bg-white p-0 text-ink shadow-card backdrop:bg-ink/35">
      <form onSubmit={submit}>
        <header className="flex items-center justify-between gap-4 border-b border-arom-border p-6">
          <h2 id="podcast-form-title" className="text-xl font-semibold">
            {record
              ? km
                ? 'កែសម្រួលផតខាស'
                : 'Edit podcast'
              : km
                ? 'បន្ថែមផតខាស'
                : 'Add podcast'}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label={km ? 'បិទ' : 'Close'}
            className="rounded-full p-2 hover:bg-arom-wash">
            <X size={20} />
          </button>
        </header>

        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <label className="text-sm font-medium sm:col-span-2">
            {km ? 'អ្នកជំនាញ' : 'Professional'} *
            <select
              name="professionalId"
              required
              defaultValue={record?.professionalId ?? ''}
              className={fieldClass}>
              <option value="">
                {km ? 'ជ្រើសរើសអ្នកជំនាញ' : 'Choose a professional'}
              </option>
              {professionals.map((professional) => (
                <option key={professional.id} value={professional.id}>
                  {km && professional.kmName
                    ? professional.kmName
                    : professional.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium">
            {km ? 'ចំណងជើងជាភាសាអង់គ្លេស' : 'Title (English)'} *
            <input
              name="title"
              required
              maxLength={160}
              defaultValue={record?.title ?? ''}
              className={fieldClass}
            />
          </label>

          <label className="text-sm font-medium">
            {km ? 'ចំណងជើងជាភាសាខ្មែរ' : 'Title (Khmer)'}
            <input
              name="kmTitle"
              maxLength={200}
              defaultValue={record?.kmTitle ?? ''}
              className={fieldClass}
            />
          </label>

          <label className="text-sm font-medium sm:col-span-2">
            {km ? 'ការពិពណ៌នាជាភាសាអង់គ្លេស' : 'Description (English)'} *
            <textarea
              name="description"
              required
              rows={3}
              maxLength={3000}
              defaultValue={record?.description ?? ''}
              className={fieldClass}
            />
          </label>

          <label className="text-sm font-medium sm:col-span-2">
            {km ? 'ការពិពណ៌នាជាភាសាខ្មែរ' : 'Description (Khmer)'}
            <textarea
              name="kmDescription"
              rows={3}
              maxLength={3000}
              defaultValue={record?.kmDescription ?? ''}
              className={fieldClass}
            />
          </label>

          <label className="text-sm font-medium">
            {km ? 'ប្រធានបទ' : 'Topic'} *
            <input
              name="topic"
              required
              maxLength={80}
              defaultValue={record?.topic ?? ''}
              className={fieldClass}
            />
          </label>

          <label className="text-sm font-medium">
            {km ? 'រយៈពេល' : 'Duration'} *
            <input
              name="duration"
              required
              maxLength={40}
              placeholder="e.g. 12 min"
              defaultValue={record?.duration ?? ''}
              className={fieldClass}
            />
          </label>

          <label className="text-sm font-medium sm:col-span-2">
            {km ? 'តំណសំឡេង HTTPS' : 'Audio URL (HTTPS)'}
            <input
              name="audioUrl"
              type="url"
              placeholder="https://example.com/episode.mp3"
              defaultValue={record?.audioUrl ?? ''}
              className={fieldClass}
            />
          </label>

          <label className="text-sm font-medium">
            {km ? 'ថ្ងៃផ្សព្វផ្សាយ' : 'Publication date'}
            <input
              name="publishedDate"
              type="date"
              defaultValue={record?.publishedDate ?? ''}
              className={fieldClass}
            />
          </label>

          <label className="text-sm font-medium">
            {km ? 'ស្ថានភាព' : 'Status'}
            <select
              name="status"
              defaultValue={record?.status ?? 'draft'}
              className={fieldClass}>
              <option value="draft">{km ? 'សេចក្តីព្រាង' : 'Draft'}</option>
              <option value="published">
                {km ? 'បានផ្សព្វផ្សាយ' : 'Published'}
              </option>
              <option value="archived">
                {km ? 'បានទុកក្នុងបណ្ណសារ' : 'Archived'}
              </option>
            </select>
          </label>

          <section className="sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">
                {km ? 'ជំពូក' : 'Chapters'}
              </h3>

              <button
                type="button"
                onClick={() =>
                  setChapters((current) => [
                    ...current,
                    {
                      id: crypto.randomUUID(),
                      timestamp: '',
                      title: '',
                      kmTitle: '',
                    },
                  ])
                }
                className="flex items-center gap-1 text-sm text-arom">
                <Plus size={16} />
                {km ? 'បន្ថែមជំពូក' : 'Add chapter'}
              </button>
            </div>

            {chapters.map((chapter, index) => (
              <fieldset
                key={chapter.id}
                className="mt-4 rounded-xl border border-arom-border p-4">
                <legend className="px-1 text-xs text-ink-muted">
                  {km ? 'ជំពូក' : 'Chapter'} {index + 1}
                </legend>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs">
                    {km ? 'ពេលវេលា' : 'Timestamp'} *
                    <input
                      required
                      value={chapter.timestamp}
                      placeholder="01:30"
                      onChange={(event) =>
                        updateChapter(
                          chapter.id,
                          'timestamp',
                          event.target.value,
                        )
                      }
                      className={fieldClass}
                    />
                  </label>

                  <label className="text-xs">
                    {km ? 'ចំណងជើងជាភាសាអង់គ្លេស' : 'Title (English)'} *
                    <input
                      required
                      maxLength={160}
                      value={chapter.title}
                      onChange={(event) =>
                        updateChapter(chapter.id, 'title', event.target.value)
                      }
                      className={fieldClass}
                    />
                  </label>

                  <label className="text-xs sm:col-span-2">
                    {km ? 'ចំណងជើងជាភាសាខ្មែរ' : 'Title (Khmer)'}
                    <input
                      maxLength={200}
                      value={chapter.kmTitle}
                      onChange={(event) =>
                        updateChapter(chapter.id, 'kmTitle', event.target.value)
                      }
                      className={fieldClass}
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setChapters((current) =>
                      current.filter((item) => item.id !== chapter.id),
                    )
                  }
                  className="mt-3 flex items-center gap-1 text-xs text-arom-danger">
                  <Trash2 size={14} />
                  {km ? 'លុបជំពូក' : 'Remove chapter'}
                </button>
              </fieldset>
            ))}
          </section>

          {error && (
            <p role="alert" className="text-sm text-arom-danger sm:col-span-2">
              {error}
            </p>
          )}
        </div>

        <footer className="flex justify-end gap-3 border-t border-arom-border p-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-arom-border px-5 py-2.5 text-sm">
            {km ? 'បោះបង់' : 'Cancel'}
          </button>

          <button
            type="submit"
            className="rounded-full bg-arom px-5 py-2.5 text-sm text-white hover:bg-arom-deep">
            {km ? 'រក្សាទុក' : 'Save episode'}
          </button>
        </footer>
      </form>
    </dialog>
  );
}

export function PodcastsView() {
  const { podcasts, professionals, savePodcast, setPodcastStatus } = useAdmin();

  const { language } = useLanguage();
  const km = language === 'km';

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<PodcastStatus | 'all'>('all');
  const [editor, setEditor] = useState<{ record: AdminPodcast | null } | null>(
    null,
  );
  const [notice, setNotice] = useState('');

  const labels: Record<PodcastStatus, string> = {
    draft: km ? 'សេចក្តីព្រាង' : 'Draft',
    published: km ? 'បានផ្សព្វផ្សាយ' : 'Published',
    archived: km ? 'បានទុកក្នុងបណ្ណសារ' : 'Archived',
  };

  function professionalName(id: string) {
    const professional = professionals.find((item) => item.id === id);

    if (!professional) return km ? 'មិនមានអ្នកជំនាញ' : 'Unassigned';

    return km && professional.kmName ? professional.kmName : professional.name;
  }

  const search = query.trim().toLocaleLowerCase();

  const visible = podcasts.filter(
    (item) =>
      (status === 'all' || item.status === status) &&
      `${item.title} ${item.kmTitle} ${item.topic} ${professionalName(item.professionalId)}`
        .toLocaleLowerCase()
        .includes(search),
  );

  function clearFilters() {
    setQuery('');
    setStatus('all');
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-medium text-arom">
            {km ? 'ស្តាប់ និងស្វែងយល់' : 'Listen and learn'}
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            {km ? 'ផតខាស' : 'Podcasts'}
          </h1>
          <p className="mt-3 text-sm text-ink-muted">
            {km
              ? 'គ្រប់គ្រងភាគ អ្នកជំនាញ និងជំពូក។'
              : 'Manage episodes, professionals, and chapter information.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditor({ record: null })}
          className="flex items-center gap-2 rounded-full bg-arom px-5 py-3 text-sm text-white hover:bg-arom-deep">
          <Plus size={18} />
          {km ? 'បន្ថែមផតខាស' : 'Add podcast'}
        </button>
      </div>

      <section className="mt-8 overflow-hidden rounded-3xl border border-arom-border bg-white shadow-sm">
        <div className="flex flex-wrap gap-3 border-b border-arom-border p-5">
          <div className="relative min-w-48 flex-1">
            <Search
              size={18}
              aria-hidden="true"
              className="absolute left-3 top-3 text-ink-muted"
            />
            <input
              type="search"
              aria-label={km ? 'ស្វែងរកផតខាស' : 'Search podcasts'}
              placeholder={
                km ? 'ស្វែងរកផតខាស...' : 'Search episodes or professionals...'
              }
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={`${fieldClass} mt-0 bg-arom-wash pl-10`}
            />
          </div>

          <select
            value={status}
            aria-label={km ? 'តម្រងស្ថានភាព' : 'Filter by status'}
            onChange={(event) =>
              setStatus(event.target.value as PodcastStatus | 'all')
            }
            className="rounded-xl border border-arom-border px-3 py-2.5 text-sm">
            <option value="all">{km ? 'គ្រប់ស្ថានភាព' : 'All statuses'}</option>
            {Object.entries(labels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <caption className="sr-only">
              {km ? 'បញ្ជីផតខាស' : 'Podcast episodes'}
            </caption>
            <thead className="bg-arom-wash text-xs text-ink-muted">
              <tr>
                {(km
                  ? ['ភាគ', 'អ្នកជំនាញ', 'រយៈពេល', 'ស្ថានភាព', 'សកម្មភាព']
                  : ['Episode', 'Professional', 'Duration', 'Status', 'Actions']
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
              {visible.map((item) => (
                <tr key={item.id} className="hover:bg-arom-wash/50">
                  <td className="max-w-sm px-5 py-5">
                    <p className="font-medium">
                      {km && item.kmTitle ? item.kmTitle : item.title}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {item.topic} · {item.chapters.length}{' '}
                      {km ? 'ជំពូក' : 'chapters'}
                    </p>
                  </td>

                  <td className="px-5 py-5 text-ink-muted">
                    {professionalName(item.professionalId)}
                  </td>

                  <td className="px-5 py-5 text-ink-muted">{item.duration}</td>

                  <td className="px-5 py-5">
                    <span
                      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${
                        item.status === 'published'
                          ? 'bg-arom-soft text-arom'
                          : item.status === 'draft'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                      {labels[item.status]}
                    </span>
                  </td>

                  <td className="px-5 py-5">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        aria-label={`${km ? 'កែសម្រួល' : 'Edit'}: ${item.title}`}
                        onClick={() => setEditor({ record: item })}
                        className="rounded-lg border border-arom-border p-2 text-arom hover:bg-arom-soft">
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        aria-label={`${
                          item.status === 'archived'
                            ? km
                              ? 'ស្ដារជាសេចក្តីព្រាង'
                              : 'Restore as draft'
                            : km
                              ? 'ទុកក្នុងបណ្ណសារ'
                              : 'Archive'
                        }: ${item.title}`}
                        onClick={() => {
                          setPodcastStatus(
                            item.id,
                            item.status === 'archived' ? 'draft' : 'archived',
                          );
                          setNotice(
                            km
                              ? 'បានធ្វើបច្ចុប្បន្នភាពស្ថានភាព។'
                              : `${item.title}: status updated.`,
                          );
                        }}
                        className="rounded-lg border border-arom-border p-2 text-ink-muted hover:bg-arom-soft">
                        {item.status === 'archived' ? (
                          <RotateCcw size={16} />
                        ) : (
                          <Archive size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!visible.length && (
          <div className="p-12 text-center">
            <Headphones size={32} className="mx-auto text-ink-muted" />
            <p className="mt-4 font-medium">
              {km ? 'មិនមានលទ្ធផល' : 'No matching podcasts'}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 text-sm text-arom underline">
              {km ? 'សម្អាតតម្រង' : 'Clear filters'}
            </button>
          </div>
        )}

        <p className="border-t border-arom-border px-5 py-4 text-xs text-ink-muted">
          {km ? 'លទ្ធផល' : 'Showing'} {visible.length} / {podcasts.length}
        </p>
      </section>

      <p
        role="status"
        aria-live="polite"
        className="mt-4 min-h-5 text-sm text-arom">
        {notice}
      </p>

      {editor && (
        <PodcastForm
          record={editor.record}
          onClose={() => setEditor(null)}
          onSave={(record) => {
            savePodcast(record);
            setEditor(null);
            clearFilters();
            setNotice(
              km ? 'បានរក្សាទុកផតខាស។' : `${record.title}: episode saved.`,
            );
          }}
        />
      )}
    </>
  );
}
