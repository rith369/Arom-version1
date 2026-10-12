'use client';

import { useLanguage } from '../../_components/language-provider';

import type { ContentMeta } from '../_data/content';

const fieldClass =
  'mt-2 w-full rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-arom focus:ring-2 focus:ring-arom/15';

// Basic information for a lesson, tip or practice. Controlled by the
// MindGuide editor page, which owns saving, publishing and checks.
export function ContentMetaFields({
  value,
  onChange,
}: {
  value: ContentMeta;
  onChange: (next: ContentMeta) => void;
}) {
  const { language } = useLanguage();
  const km = language === 'km';

  function set<Key extends keyof ContentMeta>(key: Key, next: ContentMeta[Key]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="text-sm font-medium">
        {km ? 'ចំណងជើងជាភាសាអង់គ្លេស' : 'Title (English)'} *
        <input
          id="cf-meta-title"
          maxLength={160}
          value={value.title}
          onChange={(event) => set('title', event.target.value)}
          className={fieldClass}
        />
      </label>

      <label className="text-sm font-medium">
        {km ? 'ចំណងជើងជាភាសាខ្មែរ' : 'Title (Khmer)'}
        <input
          id="cf-meta-kmTitle"
          maxLength={200}
          value={value.kmTitle}
          onChange={(event) => set('kmTitle', event.target.value)}
          className={`${fieldClass} font-khmer`}
        />
      </label>

      <label className="text-sm font-medium sm:col-span-2">
        {km ? 'ការពិពណ៌នាជាភាសាអង់គ្លេស' : 'Description (English)'} *
        <textarea
          id="cf-meta-description"
          rows={3}
          maxLength={3000}
          value={value.description}
          onChange={(event) => set('description', event.target.value)}
          className={fieldClass}
        />
      </label>

      <label className="text-sm font-medium sm:col-span-2">
        {km ? 'ការពិពណ៌នាជាភាសាខ្មែរ' : 'Description (Khmer)'}
        <textarea
          id="cf-meta-kmDescription"
          rows={3}
          maxLength={3000}
          value={value.kmDescription}
          onChange={(event) => set('kmDescription', event.target.value)}
          className={`${fieldClass} font-khmer`}
        />
      </label>

      <label className="text-sm font-medium">
        {km ? 'ប្រភេទមាតិកា' : 'Category'} *
        <input
          id="cf-meta-category"
          maxLength={80}
          value={value.category}
          onChange={(event) => set('category', event.target.value)}
          placeholder={km ? 'ឧ. Stress ឬ Sleep' : 'For example, Stress or Sleep'}
          className={fieldClass}
        />
      </label>

      <label className="text-sm font-medium">
        {km ? 'រយៈពេល' : 'Duration'} *
        <input
          id="cf-meta-duration"
          maxLength={40}
          value={value.duration}
          onChange={(event) => set('duration', event.target.value)}
          placeholder={km ? 'ឧ. 5 min' : 'For example, 5 min'}
          className={fieldClass}
        />
      </label>

      <label className="text-sm font-medium">
        {km ? 'កម្រិត' : 'Difficulty'}
        <select
          id="cf-meta-difficulty"
          value={value.difficulty}
          onChange={(event) =>
            set(
              'difficulty',
              event.target.value === 'Intermediate' ? 'Intermediate' : 'Beginner',
            )
          }
          className={fieldClass}>
          <option value="Beginner">{km ? 'កម្រិតដំបូង' : 'Beginner'}</option>
          <option value="Intermediate">{km ? 'កម្រិតមធ្យម' : 'Intermediate'}</option>
        </select>
      </label>
    </div>
  );
}
