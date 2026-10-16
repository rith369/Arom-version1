'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

import { Plus, Search, Pencil, Pause, Play, X } from 'lucide-react';

import { useAdmin, type ActionResult } from './admin-provider';
import { useLanguage } from '../../_components/language-provider';

import type { AdminJournalPrompt } from '../_data/journal-prompts';

const fieldClass =
  'mt-2 w-full rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm outline-none focus:border-arom focus:ring-2 focus:ring-arom/15';

function PromptForm({
  record,
  onClose,
  onSave,
}: {
  record: AdminJournalPrompt | null;
  onClose: () => void;
  onSave: (record: AdminJournalPrompt) => Promise<ActionResult>;
}) {
  const { journalPrompts } = useAdmin();
  const { language } = useLanguage();
  const km = language === 'km';

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const nextOrder =
    Math.max(0, ...journalPrompts.map((prompt) => prompt.order)) + 1;

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();

    return () => dialog?.close();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const form = new FormData(event.currentTarget);

    const text = (key: string) => String(form.get(key) ?? '').trim();

    const question = text('question');
    const kmQuestion = text('kmQuestion');
    const order = Number(text('order'));

    if (!question || !kmQuestion || !Number.isInteger(order) || order < 1) {
      setError(
        km
          ? 'សូមបំពេញសំណួរទាំងពីរភាសា និងលំដាប់ត្រឹមត្រូវ។'
          : 'Enter both translations and a positive whole-number order.',
      );
      return;
    }

    const duplicateOrder = journalPrompts.some(
      (prompt) => prompt.id !== record?.id && prompt.order === order,
    );

    if (duplicateOrder) {
      setError(
        km
          ? 'លំដាប់នេះត្រូវបានប្រើរួចហើយ។ សូមជ្រើសរើសលេខផ្សេង។'
          : 'That display order is already used. Choose another number.',
      );
      return;
    }

    setError('');
    setSaving(true);
    const result = await onSave({
      id: record?.id ?? crypto.randomUUID(),
      question,
      kmQuestion,
      placeholder: text('placeholder'),
      kmPlaceholder: text('kmPlaceholder'),
      order,
      isActive: form.get('isActive') === 'on',
    });
    setSaving(false);
    if (!result.ok) setError(result.message);
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      aria-labelledby="prompt-form-title"
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-3xl border border-arom-border bg-white p-6 text-ink shadow-card backdrop:bg-ink/35">
      <header className="flex items-center justify-between gap-4">
        <h2 id="prompt-form-title" className="text-xl font-semibold">
          {record
            ? km
              ? 'កែសម្រួលសំណួរ'
              : 'Edit journal prompt'
            : km
              ? 'បន្ថែមសំណួរ'
              : 'Add journal prompt'}
        </h2>

        <button
          type="button"
          onClick={onClose}
          aria-label={km ? 'បិទ' : 'Close'}
          className="rounded-full p-2 hover:bg-arom-wash">
          <X size={20} />
        </button>
      </header>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <label className="block text-sm">
          {km ? 'សំណួរជាភាសាអង់គ្លេស' : 'Question (English)'} *
          <textarea
            name="question"
            required
            rows={2}
            maxLength={300}
            defaultValue={record?.question ?? ''}
            className={fieldClass}
          />
        </label>

        <label className="block text-sm">
          {km ? 'សំណួរជាភាសាខ្មែរ' : 'Question (Khmer)'} *
          <textarea
            name="kmQuestion"
            required
            rows={2}
            maxLength={300}
            defaultValue={record?.kmQuestion ?? ''}
            className={fieldClass}
          />
        </label>

        <label className="block text-sm">
          {km ? 'អត្ថបទណែនាំជាភាសាអង់គ្លេស' : 'Placeholder (English)'}
          <textarea
            name="placeholder"
            rows={2}
            maxLength={400}
            defaultValue={record?.placeholder ?? ''}
            className={fieldClass}
          />
        </label>

        <label className="block text-sm">
          {km ? 'អត្ថបទណែនាំជាភាសាខ្មែរ' : 'Placeholder (Khmer)'}
          <textarea
            name="kmPlaceholder"
            rows={2}
            maxLength={500}
            defaultValue={record?.kmPlaceholder ?? ''}
            className={fieldClass}
          />
        </label>

        <label className="block text-sm">
          {km ? 'លំដាប់បង្ហាញ' : 'Display order'} *
          <input
            name="order"
            type="number"
            required
            min={1}
            step={1}
            defaultValue={record?.order ?? nextOrder}
            className={fieldClass}
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={record?.isActive ?? true}
            className="accent-arom"
          />
          {km ? 'សំណួរសកម្ម' : 'Active prompt'}
        </label>

        {error && (
          <p role="alert" className="text-sm text-arom-danger">
            {error}
          </p>
        )}

        <footer className="flex justify-end gap-3 border-t border-arom-border pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-arom-border px-5 py-2.5 text-sm">
            {km ? 'បោះបង់' : 'Cancel'}
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-arom px-5 py-2.5 text-sm text-white hover:bg-arom-deep disabled:opacity-60">
            {saving ? 'Saving...' : km ? 'រក្សាទុក' : 'Save prompt'}
          </button>
        </footer>
      </form>
    </dialog>
  );
}

export function JournalPromptsView() {
  const { journalPrompts, journalPromptsLoad, saveJournalPrompt } = useAdmin();

  const { language } = useLanguage();
  const km = language === 'km';

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [editor, setEditor] = useState<{
    record: AdminJournalPrompt | null;
  } | null>(null);

  const [notice, setNotice] = useState('');

  const search = query.trim().toLocaleLowerCase();

  const visible = journalPrompts
    .filter((prompt) => {
      const matchesStatus =
        filter === 'all' ||
        (filter === 'active' ? prompt.isActive : !prompt.isActive);

      const matchesSearch = `${prompt.question} ${prompt.kmQuestion}`
        .toLocaleLowerCase()
        .includes(search);

      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => a.order - b.order);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-medium text-arom">
            {km ? 'ការឆ្លុះបញ្ចាំងប្រចាំថ្ងៃ' : 'Daily reflection'}
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            {km ? 'សំណួរកំណត់ហេតុ' : 'Journal prompts'}
          </h1>

          <p className="mt-3 text-sm text-ink-muted">
            {km
              ? 'គ្រប់គ្រងសំណួរ ភាសា និងលំដាប់បង្ហាញ។'
              : 'Manage reflection questions, translations, and display order.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditor({ record: null })}
          className="flex items-center gap-2 rounded-full bg-arom px-5 py-3 text-sm text-white hover:bg-arom-deep">
          <Plus size={18} aria-hidden="true" />
          {km ? 'បន្ថែមសំណួរ' : 'Add prompt'}
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
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label={km ? 'ស្វែងរកសំណួរ' : 'Search prompts'}
              placeholder={km ? 'ស្វែងរកសំណួរ...' : 'Search questions...'}
              className={`${fieldClass} mt-0 bg-arom-wash pl-10`}
            />
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as 'all' | 'active' | 'inactive')
            }
            aria-label={km ? 'តម្រងស្ថានភាព' : 'Filter by status'}
            className="rounded-xl border border-arom-border px-3 py-2.5 text-sm">
            <option value="all">{km ? 'គ្រប់ស្ថានភាព' : 'All statuses'}</option>
            <option value="active">{km ? 'សកម្ម' : 'Active'}</option>
            <option value="inactive">{km ? 'មិនសកម្ម' : 'Inactive'}</option>
          </select>
        </div>

        <div className="divide-y divide-arom-border">
          {visible.map((prompt) => (
            <article
              key={prompt.id}
              className="flex flex-wrap items-start justify-between gap-4 p-5">
              <div className="flex min-w-0 flex-1 gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-arom-wash text-sm font-medium text-arom">
                  {prompt.order}
                </span>

                <div className="min-w-0">
                  <h2 className="font-medium">
                    {km ? prompt.kmQuestion : prompt.question}
                  </h2>

                  <p className="mt-2 text-sm text-ink-muted">
                    {km ? prompt.kmPlaceholder : prompt.placeholder}
                  </p>

                  <span
                    className={`mt-3 inline-block rounded-full px-3 py-1 text-xs ${
                      prompt.isActive
                        ? 'bg-arom-soft text-arom'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                    {prompt.isActive
                      ? km
                        ? 'សកម្ម'
                        : 'Active'
                      : km
                        ? 'មិនសកម្ម'
                        : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditor({ record: prompt })}
                  aria-label={`${km ? 'កែសម្រួល' : 'Edit'}: ${prompt.question}`}
                  className="rounded-lg border border-arom-border p-2 text-arom hover:bg-arom-soft">
                  <Pencil size={17} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const result = await saveJournalPrompt({
                      ...prompt,
                      isActive: !prompt.isActive,
                    });
                    if (!result.ok) {
                      setNotice(result.message);
                      return;
                    }
                    setNotice(
                      km
                        ? 'បានធ្វើបច្ចុប្បន្នភាពស្ថានភាពសំណួរ។'
                        : `${prompt.question}: ${
                            prompt.isActive ? 'deactivated' : 'activated'
                          }.`,
                    );
                  }}
                  aria-label={`${
                    prompt.isActive
                      ? km
                        ? 'បិទសំណួរ'
                        : 'Deactivate'
                      : km
                        ? 'បើកសំណួរ'
                        : 'Activate'
                  }: ${prompt.question}`}
                  className="rounded-lg border border-arom-border p-2 text-ink-muted hover:bg-arom-soft">
                  {prompt.isActive ? (
                    <Pause size={17} aria-hidden="true" />
                  ) : (
                    <Play size={17} aria-hidden="true" />
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>

        {journalPromptsLoad !== 'ready' && (
          <p
            role={journalPromptsLoad === 'error' ? 'alert' : 'status'}
            className="p-10 text-center text-sm text-ink-muted">
            {journalPromptsLoad === 'error'
              ? 'Could not load journal prompts. Refresh the page to try again.'
              : 'Loading journal prompts...'}
          </p>
        )}

        {journalPromptsLoad === 'ready' && !visible.length && (
          <div className="p-10 text-center">
            <p className="text-sm text-ink-muted">
              {km ? 'មិនមានលទ្ធផល' : 'No matching prompts'}
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setFilter('all');
              }}
              className="mt-3 text-sm text-arom underline">
              {km ? 'សម្អាតតម្រង' : 'Clear filters'}
            </button>
          </div>
        )}

        <p className="border-t border-arom-border px-5 py-4 text-xs text-ink-muted">
          {km ? 'លទ្ធផល' : 'Showing'} {visible.length} / {journalPrompts.length}
        </p>
      </section>

      <p
        role="status"
        aria-live="polite"
        className="mt-4 min-h-5 text-sm text-arom">
        {notice}
      </p>

      {editor && (
        <PromptForm
          record={editor.record}
          onClose={() => setEditor(null)}
          onSave={async (record) => {
            const result = await saveJournalPrompt(record);
            if (!result.ok) return result;
            setEditor(null);
            setQuery('');
            setFilter('all');
            setNotice(km ? 'បានរក្សាទុកសំណួរ។' : 'Journal prompt saved.');
            return result;
          }}
        />
      )}
    </>
  );
}
