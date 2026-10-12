'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

import { Plus, Trash2, ArrowUp, ArrowDown, X } from 'lucide-react';

import { useAdmin } from './admin-provider';
import { useLanguage } from '../../_components/language-provider';

import type { AdminContent } from '../_data/content';
import type { AdminTipDetails, AdminTipStep } from '../_data/tip-details';

const fieldClass =
  'mt-2 w-full rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm outline-none focus:border-arom focus:ring-2 focus:ring-arom/15';

const iconButtonClass =
  'rounded-lg border border-arom-border p-2 text-arom hover:bg-arom-wash disabled:opacity-30';

type StepTextField =
  | 'title'
  | 'kmTitle'
  | 'body'
  | 'kmBody'
  | 'tryNow'
  | 'kmTryNow';

type CalloutField = keyof AdminTipDetails['supportCallout'];

function emptyDetails(sourceId: string): AdminTipDetails {
  return {
    sourceId,
    sourceCitation: '',
    kmSourceCitation: '',
    steps: [],
    supportCallout: {
      title: '',
      kmTitle: '',
      body: '',
      kmBody: '',
      actionLabel: '',
      kmActionLabel: '',
    },
  };
}

export function TipEditor({
  record,
  onClose,
}: {
  record: AdminContent;
  onClose: () => void;
}) {
  const { tipDetails, saveTipDetails } = useAdmin();
  const { language } = useLanguage();

  const km = language === 'km';
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [draft, setDraft] = useState<AdminTipDetails>(() => {
    const existing = tipDetails.find(
      (item) => item.sourceId === record.sourceId,
    );

    return structuredClone(existing ?? emptyDetails(record.sourceId));
  });

  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();

    return () => dialog?.close();
  }, []);

  function updateStep(id: string, changes: Partial<AdminTipStep>) {
    setDraft((current) => ({
      ...current,
      steps: current.steps.map((step) =>
        step.id === id ? { ...step, ...changes } : step,
      ),
    }));
    setError('');
  }

  function addStep() {
    setDraft((current) => ({
      ...current,
      steps: [
        ...current.steps,
        {
          id: crypto.randomUUID(),
          number: current.steps.length + 1,
          title: '',
          kmTitle: '',
          body: '',
          kmBody: '',
          tryNow: '',
          kmTryNow: '',
          hasBreathingAction: false,
        },
      ],
    }));
    setError('');
  }

  function removeStep(id: string) {
    setDraft((current) => ({
      ...current,
      steps: current.steps.filter((step) => step.id !== id),
    }));
  }

  function moveStep(index: number, direction: -1 | 1) {
    setDraft((current) => {
      const destination = index + direction;

      if (destination < 0 || destination >= current.steps.length) {
        return current;
      }

      const steps = [...current.steps];

      [steps[index], steps[destination]] = [steps[destination], steps[index]];

      return { ...current, steps };
    });
  }

  function updateCallout(key: CalloutField, value: string) {
    setDraft((current) => ({
      ...current,
      supportCallout: {
        ...current.supportCallout,
        [key]: value,
      },
    }));
    setError('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.steps.length) {
      setError(
        km ? 'សូមបន្ថែមយ៉ាងហោចណាស់មួយជំហាន។' : 'Add at least one tip step.',
      );
      return;
    }

    if (
      draft.steps.some(
        (step) =>
          !step.title.trim() || !step.body.trim() || !step.tryNow.trim(),
      )
    ) {
      setError(
        km
          ? 'សូមបំពេញចំណងជើង អត្ថបទ និងការអនុវត្តជាភាសាអង់គ្លេសសម្រាប់គ្រប់ជំហាន។'
          : 'Each step needs an English title, instructions, and Try now activity.',
      );
      return;
    }

    const callout = draft.supportCallout;
    const hasCallout = Object.values(callout).some((value) => value.trim());

    if (
      hasCallout &&
      (!callout.title.trim() ||
        !callout.body.trim() ||
        !callout.actionLabel.trim())
    ) {
      setError(
        km
          ? 'សូមបំពេញចំណងជើង អត្ថបទ និងអត្ថបទប៊ូតុងជាភាសាអង់គ្លេសសម្រាប់ប្រអប់ជំនួយ។'
          : 'Complete the English support title, message, and button label, or leave the whole callout empty.',
      );
      return;
    }

    saveTipDetails({
      ...draft,
      sourceCitation: draft.sourceCitation.trim(),
      kmSourceCitation: draft.kmSourceCitation.trim(),
      steps: draft.steps.map((step, index) => ({
        ...step,
        number: index + 1,
        title: step.title.trim(),
        kmTitle: step.kmTitle.trim(),
        body: step.body.trim(),
        kmBody: step.kmBody.trim(),
        tryNow: step.tryNow.trim(),
        kmTryNow: step.kmTryNow.trim(),
      })),
      supportCallout: {
        title: callout.title.trim(),
        kmTitle: callout.kmTitle.trim(),
        body: callout.body.trim(),
        kmBody: callout.kmBody.trim(),
        actionLabel: callout.actionLabel.trim(),
        kmActionLabel: callout.kmActionLabel.trim(),
      },
    });

    onClose();
  }

  const stepFields: {
    key: StepTextField;
    label: string;
    multiline: boolean;
    required: boolean;
  }[] = [
    {
      key: 'title',
      label: km ? 'ចំណងជើងជាភាសាអង់គ្លេស' : 'Title (English)',
      multiline: false,
      required: true,
    },
    {
      key: 'kmTitle',
      label: km ? 'ចំណងជើងជាភាសាខ្មែរ' : 'Title (Khmer)',
      multiline: false,
      required: false,
    },
    {
      key: 'body',
      label: km ? 'ការណែនាំជាភាសាអង់គ្លេស' : 'Instructions (English)',
      multiline: true,
      required: true,
    },
    {
      key: 'kmBody',
      label: km ? 'ការណែនាំជាភាសាខ្មែរ' : 'Instructions (Khmer)',
      multiline: true,
      required: false,
    },
    {
      key: 'tryNow',
      label: km ? 'អនុវត្តឥឡូវជាភាសាអង់គ្លេស' : 'Try now (English)',
      multiline: true,
      required: true,
    },
    {
      key: 'kmTryNow',
      label: km ? 'អនុវត្តឥឡូវជាភាសាខ្មែរ' : 'Try now (Khmer)',
      multiline: true,
      required: false,
    },
  ];

  const calloutFields: {
    key: CalloutField;
    label: string;
    multiline: boolean;
  }[] = [
    {
      key: 'title',
      label: km ? 'ចំណងជើងជាភាសាអង់គ្លេស' : 'Title (English)',
      multiline: false,
    },
    {
      key: 'kmTitle',
      label: km ? 'ចំណងជើងជាភាសាខ្មែរ' : 'Title (Khmer)',
      multiline: false,
    },
    {
      key: 'body',
      label: km ? 'សារជាភាសាអង់គ្លេស' : 'Message (English)',
      multiline: true,
    },
    {
      key: 'kmBody',
      label: km ? 'សារជាភាសាខ្មែរ' : 'Message (Khmer)',
      multiline: true,
    },
    {
      key: 'actionLabel',
      label: km ? 'អត្ថបទប៊ូតុងជាភាសាអង់គ្លេស' : 'Button label (English)',
      multiline: false,
    },
    {
      key: 'kmActionLabel',
      label: km ? 'អត្ថបទប៊ូតុងជាភាសាខ្មែរ' : 'Button label (Khmer)',
      multiline: false,
    },
  ];

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      aria-labelledby="tip-editor-title"
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-3xl border border-arom-border bg-white p-6 text-ink shadow-card backdrop:bg-ink/35">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 id="tip-editor-title" className="text-xl font-semibold">
            {km ? 'កែសម្រួលគន្លឹះ' : 'Tip editor'}
          </h2>

          <p className="mt-2 text-sm text-ink-muted">
            {km && record.kmTitle ? record.kmTitle : record.title}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={km ? 'បិទ' : 'Close'}
          className={iconButtonClass}>
          <X size={20} />
        </button>
      </header>

      <form onSubmit={submit} className="mt-6">
        <div className="space-y-5">
          {draft.steps.map((step, index) => (
            <section
              key={step.id}
              className="rounded-2xl border border-arom-border p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-medium">
                  {km ? 'ជំហាន' : 'Step'} {index + 1}
                </h3>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveStep(index, -1)}
                    aria-label={`${km ? 'រំកិលឡើង' : 'Move up'}: ${index + 1}`}
                    className={iconButtonClass}>
                    <ArrowUp size={16} />
                  </button>

                  <button
                    type="button"
                    disabled={index === draft.steps.length - 1}
                    onClick={() => moveStep(index, 1)}
                    aria-label={`${km ? 'រំកិលចុះ' : 'Move down'}: ${index + 1}`}
                    className={iconButtonClass}>
                    <ArrowDown size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeStep(step.id)}
                    aria-label={`${km ? 'លុបជំហាន' : 'Remove step'}: ${index + 1}`}
                    className={`${iconButtonClass} text-arom-danger`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {stepFields.map((field) => (
                  <label key={field.key} className="text-sm">
                    {field.label} {field.required ? '*' : ''}
                    {field.multiline ? (
                      <textarea
                        rows={3}
                        required={field.required}
                        maxLength={3000}
                        value={step[field.key]}
                        onChange={(event) =>
                          updateStep(step.id, {
                            [field.key]: event.target.value,
                          })
                        }
                        className={fieldClass}
                      />
                    ) : (
                      <input
                        required={field.required}
                        maxLength={200}
                        value={step[field.key]}
                        onChange={(event) =>
                          updateStep(step.id, {
                            [field.key]: event.target.value,
                          })
                        }
                        className={fieldClass}
                      />
                    )}
                  </label>
                ))}
              </div>

              <label className="mt-4 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={step.hasBreathingAction ?? false}
                  onChange={(event) =>
                    updateStep(step.id, {
                      hasBreathingAction: event.target.checked,
                    })
                  }
                  className="accent-arom"
                />
                {km
                  ? 'បង្ហាញសកម្មភាពហាត់ដកដង្ហើម'
                  : 'Include breathing exercise action'}
              </label>
            </section>
          ))}
        </div>

        <button
          type="button"
          onClick={addStep}
          className="mt-4 flex items-center gap-2 rounded-full border border-arom-border px-4 py-2 text-sm text-arom">
          <Plus size={16} />
          {km ? 'បន្ថែមជំហាន' : 'Add step'}
        </button>

        <section className="mt-7 border-t border-arom-border pt-5">
          <h3 className="text-lg font-semibold">
            {km ? 'ប្រភពយោង' : 'Source citation'}
          </h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              English
              <textarea
                rows={3}
                maxLength={2000}
                value={draft.sourceCitation}
                onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    sourceCitation: event.target.value,
                  }));
                  setError('');
                }}
                className={fieldClass}
              />
            </label>

            <label className="text-sm">
              ខ្មែរ
              <textarea
                rows={3}
                maxLength={2000}
                value={draft.kmSourceCitation}
                onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    kmSourceCitation: event.target.value,
                  }));
                  setError('');
                }}
                className={fieldClass}
              />
            </label>
          </div>
        </section>

        <section className="mt-7 border-t border-arom-border pt-5">
          <h3 className="text-lg font-semibold">
            {km ? 'ប្រអប់ជំនួយ' : 'Support callout'}
          </h3>

          <p className="mt-2 text-xs text-ink-muted">
            {km
              ? 'អាចទុកទទេបាន។ បើប្រើ សូមបំពេញព័ត៌មានជាភាសាអង់គ្លេស។'
              : 'Optional. If used, complete the English title, message, and button label.'}
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {calloutFields.map((field) => (
              <label key={field.key} className="text-sm">
                {field.label}

                {field.multiline ? (
                  <textarea
                    rows={3}
                    maxLength={3000}
                    value={draft.supportCallout[field.key]}
                    onChange={(event) =>
                      updateCallout(field.key, event.target.value)
                    }
                    className={fieldClass}
                  />
                ) : (
                  <input
                    maxLength={200}
                    value={draft.supportCallout[field.key]}
                    onChange={(event) =>
                      updateCallout(field.key, event.target.value)
                    }
                    className={fieldClass}
                  />
                )}
              </label>
            ))}
          </div>
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
            {km ? 'រក្សាទុកគន្លឹះ' : 'Save tip'}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
