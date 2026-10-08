'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

import { Plus, Trash2, ArrowUp, ArrowDown, X } from 'lucide-react';

import { useAdmin } from './admin-provider';
import { useLanguage } from '../../_components/language-provider';

import type { AdminContent } from '../_data/content';
import type {
  LessonSection,
  ReferenceItem,
} from '../../_components/learn/learn-data';

const fieldClass =
  'mt-2 w-full rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm outline-none focus:border-arom focus:ring-2 focus:ring-arom/15';

const smallButton =
  'rounded-lg border border-arom-border p-2 text-arom hover:bg-arom-wash';

function splitLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function hasText(value: string | undefined) {
  return Boolean(value?.trim());
}

export function LessonEditor({
  record,
  onClose,
}: {
  record: AdminContent;
  onClose: () => void;
}) {
  const { lessonDetails, saveLessonDetails } = useAdmin();
  const { language } = useLanguage();

  const km = language === 'km';
  const dialogRef = useRef<HTMLDialogElement>(null);

  const existing = lessonDetails.find(
    (item) => item.sourceId === record.sourceId,
  );

  const [sections, setSections] = useState<LessonSection[]>(() =>
    structuredClone(existing?.sections ?? []),
  );

  const [references, setReferences] = useState<ReferenceItem[]>(() =>
    structuredClone(existing?.references ?? []),
  );

  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();

    return () => dialog?.close();
  }, []);

  function updateSection(id: number, changes: Partial<LessonSection>) {
    setSections((current) =>
      current.map((section) =>
        section.id === id ? { ...section, ...changes } : section,
      ),
    );
  }

  function addSection(type: 'reading' | 'quiz') {
    setSections((current) => [
      ...current,
      {
        id: Math.max(0, ...current.map((section) => section.id)) + 1,
        sectionNumber: current.length + 1,
        title: '',
        kmTitle: '',
        type,
        paragraphs: [],
        kmParagraphs: [],
        ...(type === 'quiz'
          ? {
              quiz: {
                question: '',
                kmQuestion: '',
                explanation: '',
                kmExplanation: '',
                options: [
                  {
                    id: crypto.randomUUID(),
                    text: '',
                    kmText: '',
                    isCorrect: true,
                  },
                  {
                    id: crypto.randomUUID(),
                    text: '',
                    kmText: '',
                    isCorrect: false,
                  },
                ],
              },
            }
          : {}),
      },
    ]);
  }

  function moveSection(index: number, direction: -1 | 1) {
    setSections((current) => {
      const destination = index + direction;

      if (destination < 0 || destination >= current.length) {
        return current;
      }

      const next = [...current];

      [next[index], next[destination]] = [next[destination], next[index]];

      return next;
    });
  }

  function updateQuiz(
    section: LessonSection,
    changes: Partial<NonNullable<LessonSection['quiz']>>,
  ) {
    if (!section.quiz) return;

    updateSection(section.id, {
      quiz: { ...section.quiz, ...changes },
    });
  }

  function updateReference(id: number, changes: Partial<ReferenceItem>) {
    setReferences((current) =>
      current.map((reference) =>
        reference.id === id ? { ...reference, ...changes } : reference,
      ),
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!sections.length) {
      setError(
        km
          ? 'សូមបន្ថែមយ៉ាងហោចណាស់មួយផ្នែក។'
          : 'Add at least one lesson section.',
      );
      return;
    }

    for (const section of sections) {
      if (!hasText(section.title)) {
        setError(
          km ? 'សូមបំពេញចំណងជើងគ្រប់ផ្នែក។' : 'Every section needs a title.',
        );
        return;
      }

      if (
        section.type !== 'quiz' &&
        !section.paragraphs.some((paragraph) => paragraph.trim())
      ) {
        setError(
          km
            ? 'សូមបំពេញអត្ថបទក្នុងផ្នែកមេរៀន។'
            : 'Each non-quiz section needs at least one paragraph.',
        );
        return;
      }

      if (section.type === 'quiz') {
        const quiz = section.quiz;

        if (
          !quiz ||
          !hasText(quiz.question) ||
          !hasText(quiz.explanation) ||
          quiz.options.length < 2 ||
          quiz.options.some((option) => !hasText(option.text)) ||
          quiz.options.filter((option) => option.isCorrect).length !== 1
        ) {
          setError(
            km
              ? 'សំណួរត្រូវមានចម្លើយយ៉ាងហោចណាស់ពីរ ចម្លើយត្រឹមត្រូវមួយ និងការពន្យល់។'
              : 'Each quiz needs a question, explanation, at least two answers, and exactly one correct answer.',
          );
          return;
        }
      }
    }

    for (const reference of references) {
      if (
        !hasText(reference.citation) ||
        !hasText(reference.source) ||
        !hasText(reference.title)
      ) {
        setError(
          km
            ? 'សូមបំពេញព័ត៌មានឯកសារយោង។'
            : 'Each reference needs a citation label, source, and title.',
        );
        return;
      }

      if (reference.url?.trim()) {
        try {
          const protocol = new URL(reference.url.trim()).protocol;

          if (protocol !== 'https:' && protocol !== 'http:') {
            throw new Error('Unsupported URL');
          }
        } catch {
          setError(
            km
              ? 'សូមពិនិត្យតំណឯកសារយោង។'
              : 'References must use valid HTTP or HTTPS URLs.',
          );
          return;
        }
      }
    }

    saveLessonDetails({
      sourceId: record.sourceId,
      sections: sections.map((section, index) => ({
        ...section,
        sectionNumber: index + 1,
        title: section.title.trim(),
        kmTitle: section.kmTitle?.trim() ?? '',
      })),
      references: references.map((reference) => ({
        ...reference,
        citation: reference.citation.trim(),
        source: reference.source.trim(),
        title: reference.title.trim(),
        url: reference.url?.trim() || undefined,
      })),
    });

    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      aria-labelledby="lesson-editor-title"
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-3xl border border-arom-border bg-white p-6 text-ink shadow-card backdrop:bg-ink/35">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 id="lesson-editor-title" className="text-xl font-semibold">
            {km ? 'កែសម្រួលមេរៀន' : 'Lesson editor'}
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            {km && record.kmTitle ? record.kmTitle : record.title}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={km ? 'បិទ' : 'Close'}
          className={smallButton}>
          <X size={20} />
        </button>
      </header>

      <form onSubmit={submit} className="mt-6">
        <p className="rounded-xl bg-arom-wash p-3 text-xs leading-5 text-ink-muted">
          {km
            ? 'បញ្ចូលអត្ថបទមួយកថាខណ្ឌក្នុងមួយបន្ទាត់។'
            : 'Enter one paragraph per line. Changes stay in the admin demo.'}
        </p>

        <div className="mt-5 space-y-5">
          {sections.map((section, index) => (
            <section
              key={section.id}
              className="rounded-2xl border border-arom-border p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-medium">
                  {km ? 'ផ្នែក' : 'Section'} {index + 1}
                  {' · '}
                  {section.type}
                </h3>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveSection(index, -1)}
                    aria-label={`Move section ${index + 1} up`}
                    className={`${smallButton} disabled:opacity-30`}>
                    <ArrowUp size={16} />
                  </button>

                  <button
                    type="button"
                    disabled={index === sections.length - 1}
                    onClick={() => moveSection(index, 1)}
                    aria-label={`Move section ${index + 1} down`}
                    className={`${smallButton} disabled:opacity-30`}>
                    <ArrowDown size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSections((current) =>
                        current.filter((item) => item.id !== section.id),
                      )
                    }
                    aria-label={`Remove section ${index + 1}`}
                    className={`${smallButton} text-arom-danger`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm">
                  {km ? 'ចំណងជើងជាភាសាអង់គ្លេស' : 'Title (English)'} *
                  <input
                    required
                    maxLength={200}
                    value={section.title}
                    onChange={(event) =>
                      updateSection(section.id, {
                        title: event.target.value,
                      })
                    }
                    className={fieldClass}
                  />
                </label>

                <label className="text-sm">
                  {km ? 'ចំណងជើងជាភាសាខ្មែរ' : 'Title (Khmer)'}
                  <input
                    maxLength={250}
                    value={section.kmTitle ?? ''}
                    onChange={(event) =>
                      updateSection(section.id, {
                        kmTitle: event.target.value,
                      })
                    }
                    className={fieldClass}
                  />
                </label>

                <label className="text-sm">
                  {km ? 'អត្ថបទជាភាសាអង់គ្លេស' : 'Paragraphs (English)'}
                  <textarea
                    key={`paragraphs-en-${section.id}`}
                    rows={5}
                    defaultValue={section.paragraphs.join('\n')}
                    onChange={(event) =>
                      updateSection(section.id, {
                        paragraphs: splitLines(event.target.value),
                      })
                    }
                    className={fieldClass}
                  />
                </label>

                <label className="text-sm">
                  {km ? 'អត្ថបទជាភាសាខ្មែរ' : 'Paragraphs (Khmer)'}
                  <textarea
                    key={`paragraphs-km-${section.id}`}
                    rows={5}
                    defaultValue={(section.kmParagraphs ?? []).join('\n')}
                    onChange={(event) =>
                      updateSection(section.id, {
                        kmParagraphs: splitLines(event.target.value),
                      })
                    }
                    className={fieldClass}
                  />
                </label>

                <label className="text-sm">
                  {km ? 'ចំណុចសំខាន់ជាភាសាអង់គ្លេស' : 'Key points (English)'}
                  <textarea
                    rows={3}
                    defaultValue={(section.keyPoints ?? []).join('\n')}
                    onChange={(event) =>
                      updateSection(section.id, {
                        keyPoints: splitLines(event.target.value),
                      })
                    }
                    className={fieldClass}
                  />
                </label>

                <label className="text-sm">
                  {km ? 'ចំណុចសំខាន់ជាភាសាខ្មែរ' : 'Key points (Khmer)'}
                  <textarea
                    rows={3}
                    defaultValue={(section.kmKeyPoints ?? []).join('\n')}
                    onChange={(event) =>
                      updateSection(section.id, {
                        kmKeyPoints: splitLines(event.target.value),
                      })
                    }
                    className={fieldClass}
                  />
                </label>
              </div>

              {section.type === 'quiz' && section.quiz && (
                <div className="mt-5 rounded-xl bg-arom-wash p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm">
                      {km ? 'សំណួរជាភាសាអង់គ្លេស' : 'Question (English)'} *
                      <input
                        required
                        value={section.quiz.question}
                        onChange={(event) =>
                          updateQuiz(section, {
                            question: event.target.value,
                          })
                        }
                        className={fieldClass}
                      />
                    </label>

                    <label className="text-sm">
                      {km ? 'សំណួរជាភាសាខ្មែរ' : 'Question (Khmer)'}
                      <input
                        value={section.quiz.kmQuestion ?? ''}
                        onChange={(event) =>
                          updateQuiz(section, {
                            kmQuestion: event.target.value,
                          })
                        }
                        className={fieldClass}
                      />
                    </label>
                  </div>

                  <fieldset className="mt-5 space-y-3">
                    <legend className="text-sm font-medium">
                      {km ? 'ជម្រើសចម្លើយ' : 'Answer options'}
                    </legend>

                    {section.quiz.options.map((option, optionIndex) => (
                      <div
                        key={option.id}
                        className="rounded-xl border border-arom-border bg-white p-3">
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="radio"
                            name={`correct-${section.id}`}
                            checked={option.isCorrect}
                            onChange={() =>
                              updateQuiz(section, {
                                options: section.quiz!.options.map((item) => ({
                                  ...item,
                                  isCorrect: item.id === option.id,
                                })),
                              })
                            }
                            className="accent-arom"
                          />
                          {km ? 'ចម្លើយត្រឹមត្រូវ' : 'Correct answer'} (
                          {optionIndex + 1})
                        </label>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <label className="text-xs">
                            English *
                            <input
                              required
                              value={option.text}
                              onChange={(event) =>
                                updateQuiz(section, {
                                  options: section.quiz!.options.map((item) =>
                                    item.id === option.id
                                      ? { ...item, text: event.target.value }
                                      : item,
                                  ),
                                })
                              }
                              className={fieldClass}
                            />
                          </label>

                          <label className="text-xs">
                            ខ្មែរ
                            <input
                              value={option.kmText ?? ''}
                              onChange={(event) =>
                                updateQuiz(section, {
                                  options: section.quiz!.options.map((item) =>
                                    item.id === option.id
                                      ? { ...item, kmText: event.target.value }
                                      : item,
                                  ),
                                })
                              }
                              className={fieldClass}
                            />
                          </label>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuiz(section, {
                              options: section.quiz!.options.filter(
                                (item) => item.id !== option.id,
                              ),
                            })
                          }
                          className="mt-3 text-xs text-arom-danger">
                          {km ? 'លុបជម្រើស' : 'Remove option'}
                        </button>
                      </div>
                    ))}
                  </fieldset>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuiz(section, {
                        options: [
                          ...section.quiz!.options,
                          {
                            id: crypto.randomUUID(),
                            text: '',
                            kmText: '',
                            isCorrect: false,
                          },
                        ],
                      })
                    }
                    className="mt-3 text-sm text-arom">
                    {km ? 'បន្ថែមជម្រើស' : 'Add answer option'}
                  </button>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm">
                      {km ? 'ការពន្យល់ជាភាសាអង់គ្លេស' : 'Explanation (English)'}{' '}
                      *
                      <textarea
                        required
                        rows={3}
                        value={section.quiz.explanation}
                        onChange={(event) =>
                          updateQuiz(section, {
                            explanation: event.target.value,
                          })
                        }
                        className={fieldClass}
                      />
                    </label>

                    <label className="text-sm">
                      {km ? 'ការពន្យល់ជាភាសាខ្មែរ' : 'Explanation (Khmer)'}
                      <textarea
                        rows={3}
                        value={section.quiz.kmExplanation ?? ''}
                        onChange={(event) =>
                          updateQuiz(section, {
                            kmExplanation: event.target.value,
                          })
                        }
                        className={fieldClass}
                      />
                    </label>
                  </div>
                </div>
              )}

              {(section.reflection ||
                section.alertBox ||
                section.actions?.length) && (
                <p className="mt-4 text-xs text-ink-muted">
                  {km
                    ? 'ការកំណត់ឆ្លុះបញ្ចាំង សារព្រមាន និងតំណសកម្មភាពដែលមានស្រាប់ត្រូវបានរក្សាទុក។'
                    : 'Existing reflection settings, alerts, and action links are preserved. Their editors will be added separately.'}
                </p>
              )}
            </section>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => addSection('reading')}
            className="flex items-center gap-2 rounded-full border border-arom-border px-4 py-2 text-sm text-arom">
            <Plus size={16} />
            {km ? 'បន្ថែមផ្នែកអាន' : 'Add reading section'}
          </button>

          <button
            type="button"
            onClick={() => addSection('quiz')}
            className="flex items-center gap-2 rounded-full border border-arom-border px-4 py-2 text-sm text-arom">
            <Plus size={16} />
            {km ? 'បន្ថែមសំណួរ' : 'Add quiz section'}
          </button>
        </div>

        <section className="mt-7 border-t border-arom-border pt-5">
          <h3 className="text-lg font-semibold">
            {km ? 'ឯកសារយោង' : 'References'}
          </h3>

          {references.map((reference) => (
            <div
              key={reference.id}
              className="mt-4 rounded-xl border border-arom-border p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  {km ? 'ស្លាកយោង' : 'Citation label'} *
                  <input
                    required
                    placeholder="[1]"
                    value={reference.citation}
                    onChange={(event) =>
                      updateReference(reference.id, {
                        citation: event.target.value,
                      })
                    }
                    className={fieldClass}
                  />
                </label>

                <label className="text-sm">
                  {km ? 'ប្រភព' : 'Source'} *
                  <input
                    required
                    value={reference.source}
                    onChange={(event) =>
                      updateReference(reference.id, {
                        source: event.target.value,
                      })
                    }
                    className={fieldClass}
                  />
                </label>

                <label className="text-sm sm:col-span-2">
                  {km ? 'ចំណងជើង' : 'Title'} *
                  <input
                    required
                    value={reference.title}
                    onChange={(event) =>
                      updateReference(reference.id, {
                        title: event.target.value,
                      })
                    }
                    className={fieldClass}
                  />
                </label>

                <label className="text-sm">
                  {km ? 'ឆ្នាំ' : 'Year'}
                  <input
                    value={reference.year ?? ''}
                    onChange={(event) =>
                      updateReference(reference.id, {
                        year: event.target.value,
                      })
                    }
                    className={fieldClass}
                  />
                </label>

                <label className="text-sm">
                  {km ? 'តំណ' : 'URL'}
                  <input
                    type="url"
                    value={reference.url ?? ''}
                    onChange={(event) =>
                      updateReference(reference.id, {
                        url: event.target.value,
                      })
                    }
                    className={fieldClass}
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() =>
                  setReferences((current) =>
                    current.filter((item) => item.id !== reference.id),
                  )
                }
                className="mt-3 text-xs text-arom-danger">
                {km ? 'លុបឯកសារយោង' : 'Remove reference'}
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setReferences((current) => [
                ...current,
                {
                  id: Math.max(0, ...current.map((item) => item.id)) + 1,
                  citation: '',
                  source: '',
                  title: '',
                },
              ])
            }
            className="mt-4 text-sm text-arom">
            {km ? 'បន្ថែមឯកសារយោង' : 'Add reference'}
          </button>
        </section>

        {error && (
          <p role="alert" className="mt-5 text-sm text-arom-danger">
            {error}
          </p>
        )}

        <footer className="mt-6 flex justify-end gap-3 border-t border-arom-border pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-arom-border px-5 py-2.5 text-sm">
            {km ? 'បោះបង់' : 'Cancel'}
          </button>

          <button
            type="submit"
            className="rounded-full bg-arom px-5 py-2.5 text-sm text-white hover:bg-arom-deep">
            {km ? 'រក្សាទុកមេរៀន' : 'Save lesson'}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
