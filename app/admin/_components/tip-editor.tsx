'use client';

import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

import { useLanguage } from '../../_components/language-provider';

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

// Tip steps, source and support box. Controlled by the MindGuide editor page,
// which owns saving, publishing and checks.
export function TipFields({
  value,
  onChange,
}: {
  value: AdminTipDetails;
  onChange: (next: AdminTipDetails) => void;
}) {
  const { language } = useLanguage();
  const km = language === 'km';
  const draft = value;

  function setDraft(update: (current: AdminTipDetails) => AdminTipDetails) {
    const next = update(value);
    onChange({
      ...next,
      steps: next.steps.map((step, index) => ({ ...step, number: index + 1 })),
    });
  }

  function updateStep(id: string, changes: Partial<AdminTipStep>) {
    setDraft((current) => ({
      ...current,
      steps: current.steps.map((step) =>
        step.id === id ? { ...step, ...changes } : step,
      ),
    }));
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
    <div>
        <div id="cf-items" tabIndex={-1} className="space-y-5">
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
                        id={`cf-step-${step.id}-${field.key}`}
                        rows={3}
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
                        id={`cf-step-${step.id}-${field.key}`}
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
                              }}
                className={fieldClass}
              />
            </label>
          </div>
        </section>

        <section className="mt-7 border-t border-arom-border pt-5">
          <h3 id="cf-callout" tabIndex={-1} className="text-lg font-semibold">
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

    </div>
  );
}
