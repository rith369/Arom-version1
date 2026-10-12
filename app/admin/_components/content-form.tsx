'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

import { X } from 'lucide-react';

import { useLanguage } from '../../_components/language-provider';

import type { AdminContent, ContentType } from '../_data/content';

type ContentFormProps = {
  record: AdminContent | null;
  defaultType: ContentType;
  onSave: (record: AdminContent) => void;
  onClose: () => void;
};

const fieldClass =
  'mt-2 w-full rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-arom focus:ring-2 focus:ring-arom/15';

export function ContentForm({
  record,
  defaultType,
  onSave,
  onClose,
}: ContentFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { language } = useLanguage();
  const km = language === 'km';

  const [error, setError] = useState('');

  // Existing content keeps its original type.
  const type = record?.type ?? defaultType;

  const typeLabels: Record<ContentType, string> = {
    lesson: km ? 'មេរៀន' : 'Lesson',
    tip: km ? 'គន្លឹះ' : 'Tip',
    practice: km ? 'ការអនុវត្ត' : 'Practice',
  };

  useEffect(() => {
    const dialog = dialogRef.current;

    dialog?.showModal();

    return () => {
      dialog?.close();
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const text = (key: string) => String(form.get(key) ?? '').trim();

    const title = text('title');
    const description = text('description');
    const category = text('category');
    const duration = text('duration');

    if (!title || !description || !category || !duration) {
      setError(
        km ? 'សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់។' : 'Complete all required fields.',
      );
      return;
    }

    const difficulty = text('difficulty');
    const status = text('status');

    const sourceId = record?.sourceId ?? crypto.randomUUID();

    onSave({
      id: record?.id ?? `${type}:${sourceId}`,
      sourceId,
      type,
      title,
      kmTitle: text('kmTitle'),
      description,
      kmDescription: text('kmDescription'),
      category,
      duration,
      difficulty: difficulty === 'Intermediate' ? 'Intermediate' : 'Beginner',
      image: record?.image ?? '',
      status:
        status === 'published'
          ? 'published'
          : status === 'archived'
            ? 'archived'
            : 'draft',
    });
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      aria-labelledby="content-form-title"
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-3xl border border-arom-border bg-white p-0 text-ink shadow-card backdrop:bg-ink/35">
      <form onSubmit={handleSubmit}>
        <header className="flex items-center justify-between gap-4 border-b border-arom-border p-6">
          <div>
            <h2 id="content-form-title" className="text-xl font-semibold">
              {record
                ? km
                  ? 'កែសម្រួលមាតិកា'
                  : 'Edit content'
                : km
                  ? 'បន្ថែមមាតិកា'
                  : 'Add content'}
            </h2>

            <p className="mt-1 text-sm text-ink-muted">{typeLabels[type]}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={km ? 'បិទ' : 'Close'}
            className="rounded-full p-2 hover:bg-arom-wash">
            <X size={20} />
          </button>
        </header>

        <div className="grid gap-5 p-6 sm:grid-cols-2">
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
              rows={4}
              maxLength={3000}
              defaultValue={record?.description ?? ''}
              className={fieldClass}
            />
          </label>

          <label className="text-sm font-medium sm:col-span-2">
            {km ? 'ការពិពណ៌នាជាភាសាខ្មែរ' : 'Description (Khmer)'}
            <textarea
              name="kmDescription"
              rows={4}
              maxLength={3000}
              defaultValue={record?.kmDescription ?? ''}
              className={fieldClass}
            />
          </label>

          <label className="text-sm font-medium">
            {km ? 'ប្រភេទមាតិកា' : 'Category'} *
            <input
              name="category"
              required
              maxLength={80}
              defaultValue={record?.category ?? ''}
              placeholder={km ? 'ឧ. Stress ឬ Sleep' : 'e.g. Stress or Sleep'}
              className={fieldClass}
            />
          </label>

          <label className="text-sm font-medium">
            {km ? 'រយៈពេល' : 'Duration'} *
            <input
              name="duration"
              required
              maxLength={40}
              defaultValue={record?.duration ?? ''}
              placeholder={km ? 'ឧ. 5 min' : 'e.g. 5 min'}
              className={fieldClass}
            />
          </label>

          <label className="text-sm font-medium">
            {km ? 'កម្រិត' : 'Difficulty'}
            <select
              name="difficulty"
              defaultValue={record?.difficulty ?? 'Beginner'}
              className={fieldClass}>
              <option value="Beginner">
                {km ? 'កម្រិតដំបូង' : 'Beginner'}
              </option>
              <option value="Intermediate">
                {km ? 'កម្រិតមធ្យម' : 'Intermediate'}
              </option>
            </select>
          </label>

          <label className="text-sm font-medium">
            {km ? 'ស្ថានភាពផ្សព្វផ្សាយ' : 'Publication status'}
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

          <p className="rounded-xl bg-arom-wash p-3 text-xs leading-5 text-ink-muted sm:col-span-2">
            {km
              ? 'ទម្រង់នេះកែសម្រួលព័ត៌មានមូលដ្ឋានប៉ុណ្ណោះ។ ផ្នែកមេរៀន សំណួរ និងជំហានអនុវត្តនឹងមានទម្រង់កែសម្រួលបន្ថែម។'
              : 'This form manages basic information. Lesson sections, quizzes, tip steps, and practice instructions will have separate editors.'}
          </p>

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
            {km ? 'រក្សាទុក' : 'Save content'}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
