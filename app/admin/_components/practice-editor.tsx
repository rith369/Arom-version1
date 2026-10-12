'use client';

import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

import { useLanguage } from '../../_components/language-provider';

import type {
  AdminPracticeDetails,
  PracticeInstruction,
} from '../_data/practice-details';

const fieldClass =
  'mt-2 w-full rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm outline-none focus:border-arom focus:ring-2 focus:ring-arom/15';

const iconButtonClass =
  'rounded-lg border border-arom-border p-2 text-arom hover:bg-arom-wash disabled:opacity-30';

type InstructionField = 'title' | 'kmTitle' | 'body' | 'kmBody';

type BreathingNumberField =
  | 'inhaleSeconds'
  | 'holdSeconds'
  | 'exhaleSeconds'
  | 'cycles';

// Practice instructions and breathing settings. Controlled by the MindGuide
// editor page, which owns saving, publishing and checks.
export function PracticeFields({
  value,
  onChange,
}: {
  value: AdminPracticeDetails;
  onChange: (next: AdminPracticeDetails) => void;
}) {
  const { language } = useLanguage();
  const km = language === 'km';
  const draft = value;

  function setDraft(
    update: (current: AdminPracticeDetails) => AdminPracticeDetails,
  ) {
    onChange(update(value));
  }

  function updateInstruction(
    id: string,
    changes: Partial<PracticeInstruction>,
  ) {
    setDraft((current) => ({
      ...current,
      instructions: current.instructions.map((item) =>
        item.id === id ? { ...item, ...changes } : item,
      ),
    }));
  }

  function addInstruction() {
    setDraft((current) => ({
      ...current,
      instructions: [
        ...current.instructions,
        {
          id: crypto.randomUUID(),
          title: '',
          kmTitle: '',
          body: '',
          kmBody: '',
        },
      ],
    }));
  }

  function moveInstruction(index: number, direction: -1 | 1) {
    setDraft((current) => {
      const destination = index + direction;

      if (destination < 0 || destination >= current.instructions.length) {
        return current;
      }

      const instructions = [...current.instructions];

      [instructions[index], instructions[destination]] = [
        instructions[destination],
        instructions[index],
      ];

      return { ...current, instructions };
    });
  }

  function updateBreathing(field: BreathingNumberField, value: number) {
    setDraft((current) => ({
      ...current,
      breathing: {
        ...current.breathing,
        [field]: value,
      },
    }));
  }

  const instructionFields: {
    key: InstructionField;
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
  ];

  const breathingFields: {
    key: BreathingNumberField;
    label: string;
    min: number;
    max: number;
  }[] = [
    {
      key: 'inhaleSeconds',
      label: km ? 'ដកដង្ហើមចូល (វិនាទី)' : 'Inhale (seconds)',
      min: 1,
      max: 30,
    },
    {
      key: 'holdSeconds',
      label: km ? 'ទប់ដង្ហើម (វិនាទី)' : 'Hold (seconds)',
      min: 0,
      max: 30,
    },
    {
      key: 'exhaleSeconds',
      label: km ? 'ដកដង្ហើមចេញ (វិនាទី)' : 'Exhale (seconds)',
      min: 1,
      max: 30,
    },
    {
      key: 'cycles',
      label: km ? 'ចំនួនវដ្ត' : 'Cycles',
      min: 1,
      max: 100,
    },
  ];

  const totalSeconds =
    (draft.breathing.inhaleSeconds +
      draft.breathing.holdSeconds +
      draft.breathing.exhaleSeconds) *
    draft.breathing.cycles;

  return (
    <div>
        <div id="cf-items" tabIndex={-1} className="space-y-5">
          {draft.instructions.map((instruction, index) => (
            <section
              key={instruction.id}
              className="rounded-2xl border border-arom-border p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-medium">
                  {km ? 'ជំហាន' : 'Instruction'} {index + 1}
                </h3>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveInstruction(index, -1)}
                    aria-label={`${km ? 'រំកិលឡើង' : 'Move up'}: ${index + 1}`}
                    className={iconButtonClass}>
                    <ArrowUp size={16} />
                  </button>

                  <button
                    type="button"
                    disabled={index === draft.instructions.length - 1}
                    onClick={() => moveInstruction(index, 1)}
                    aria-label={`${km ? 'រំកិលចុះ' : 'Move down'}: ${index + 1}`}
                    className={iconButtonClass}>
                    <ArrowDown size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        instructions: current.instructions.filter(
                          (item) => item.id !== instruction.id,
                        ),
                      }))
                    }
                    aria-label={`${km ? 'លុបជំហាន' : 'Remove instruction'}: ${index + 1}`}
                    className={`${iconButtonClass} text-arom-danger`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {instructionFields.map((field) => (
                  <label key={field.key} className="text-sm">
                    {field.label} {field.required ? '*' : ''}
                    {field.multiline ? (
                      <textarea
                        id={`cf-instruction-${instruction.id}-${field.key}`}
                        rows={4}
                        maxLength={3000}
                        value={instruction[field.key]}
                        onChange={(event) =>
                          updateInstruction(instruction.id, {
                            [field.key]: event.target.value,
                          })
                        }
                        className={fieldClass}
                      />
                    ) : (
                      <input
                        id={`cf-instruction-${instruction.id}-${field.key}`}
                        maxLength={200}
                        value={instruction[field.key]}
                        onChange={(event) =>
                          updateInstruction(instruction.id, {
                            [field.key]: event.target.value,
                          })
                        }
                        className={fieldClass}
                      />
                    )}
                  </label>
                ))}
              </div>
            </section>
          ))}
        </div>

        {!draft.instructions.length && (
          <p className="rounded-xl bg-arom-wash p-4 text-sm text-ink-muted">
            {km
              ? 'បន្ថែមជំហានណែនាំដំបូងសម្រាប់ការអនុវត្តនេះ។'
              : 'Add the first instruction for this practice.'}
          </p>
        )}

        <button
          type="button"
          onClick={addInstruction}
          className="mt-4 flex items-center gap-2 rounded-full border border-arom-border px-4 py-2 text-sm text-arom">
          <Plus size={16} />
          {km ? 'បន្ថែមជំហាន' : 'Add instruction'}
        </button>

        <section className="mt-7 border-t border-arom-border pt-5">
          <h3 id="cf-breathing" tabIndex={-1} className="text-lg font-semibold">
            {km ? 'ការកំណត់ដកដង្ហើម' : 'Breathing settings'}
          </h3>

          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.breathing.enabled}
              onChange={(event) => {
                setDraft((current) => ({
                  ...current,
                  breathing: {
                    ...current.breathing,
                    enabled: event.target.checked,
                  },
                }));
                          }}
              className="accent-arom"
            />
            {km ? 'ប្រើវដ្តហាត់ដកដង្ហើម' : 'Enable breathing cycles'}
          </label>

          {draft.breathing.enabled && (
            <>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {breathingFields.map((field) => (
                  <label key={field.key} className="text-sm">
                    {field.label} *
                    <input
                      type="number"
                      min={field.min}
                      max={field.max}
                      step={1}
                      value={
                        Number.isNaN(draft.breathing[field.key])
                          ? ''
                          : draft.breathing[field.key]
                      }
                      onChange={(event) =>
                        updateBreathing(field.key, event.target.valueAsNumber)
                      }
                      className={fieldClass}
                    />
                  </label>
                ))}
              </div>

              <p className="mt-4 text-sm text-arom">
                {km ? 'រយៈពេលវដ្តសរុប' : 'Total cycle time'}:{' '}
                {Number.isFinite(totalSeconds)
                  ? `${totalSeconds} ${km ? 'វិនាទី' : 'seconds'}`
                  : km ? 'មិនទាន់កំណត់' : 'Not set'}
              </p>
            </>
          )}
        </section>

    </div>
  );
}
