'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

import { Plus, Trash2, ArrowUp, ArrowDown, X } from 'lucide-react';

import { useAdmin } from './admin-provider';
import { useLanguage } from '../../_components/language-provider';

import type { AdminContent } from '../_data/content';
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

function emptyDetails(sourceId: string): AdminPracticeDetails {
  return {
    sourceId,
    instructions: [],
    breathing: {
      enabled: false,
      inhaleSeconds: 4,
      holdSeconds: 0,
      exhaleSeconds: 4,
      cycles: 5,
    },
  };
}

export function PracticeEditor({
  record,
  onClose,
}: {
  record: AdminContent;
  onClose: () => void;
}) {
  const { practiceDetails, savePracticeDetails } = useAdmin();
  const { language } = useLanguage();

  const km = language === 'km';
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [draft, setDraft] = useState<AdminPracticeDetails>(() => {
    const existing = practiceDetails.find(
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
    setError('');
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
    setError('');
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
    setError('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !draft.instructions.length ||
      draft.instructions.some((item) => !item.title.trim() || !item.body.trim())
    ) {
      setError(
        km
          ? 'សូមបន្ថែមការណែនាំ ហើយបំពេញចំណងជើង និងអត្ថបទជាភាសាអង់គ្លេស។'
          : 'Add at least one instruction with an English title and body.',
      );
      return;
    }

    if (draft.breathing.enabled) {
      const { inhaleSeconds, holdSeconds, exhaleSeconds, cycles } =
        draft.breathing;

      const valid =
        Number.isInteger(inhaleSeconds) &&
        inhaleSeconds >= 1 &&
        inhaleSeconds <= 30 &&
        Number.isInteger(holdSeconds) &&
        holdSeconds >= 0 &&
        holdSeconds <= 30 &&
        Number.isInteger(exhaleSeconds) &&
        exhaleSeconds >= 1 &&
        exhaleSeconds <= 30 &&
        Number.isInteger(cycles) &&
        cycles >= 1 &&
        cycles <= 100;

      if (!valid) {
        setError(
          km
            ? 'សូមបញ្ចូលតម្លៃហាត់ដកដង្ហើមជាចំនួនគត់ក្នុងដែនកំណត់។'
            : 'Enter whole numbers within the breathing settings limits.',
        );
        return;
      }
    }

    savePracticeDetails({
      ...draft,
      instructions: draft.instructions.map((item) => ({
        ...item,
        title: item.title.trim(),
        kmTitle: item.kmTitle.trim(),
        body: item.body.trim(),
        kmBody: item.kmBody.trim(),
      })),
    });

    onClose();
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
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      aria-labelledby="practice-editor-title"
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-3xl border border-arom-border bg-white p-6 text-ink shadow-card backdrop:bg-ink/35">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 id="practice-editor-title" className="text-xl font-semibold">
            {km ? 'កែសម្រួលការអនុវត្ត' : 'Practice editor'}
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
                        required={field.required}
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
                        required={field.required}
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
          <h3 className="text-lg font-semibold">
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
                setError('');
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
                      required
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
                  : '—'}
              </p>
            </>
          )}
        </section>

        <p className="mt-5 rounded-xl bg-arom-wash p-3 text-xs leading-5 text-ink-muted">
          {km
            ? 'ការកំណត់ទាំងនេះសម្រាប់ទិន្នន័យសាកល្បង។ មិនទាន់ភ្ជាប់ទៅការអនុវត្តសាធារណៈ។'
            : 'These settings are for the admin demo. They do not change the public exercise or its listed duration yet.'}
        </p>

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
            {km ? 'រក្សាទុកការអនុវត្ត' : 'Save practice'}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
