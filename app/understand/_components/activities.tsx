"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  COPING_CREDIT,
  COPING_INTRO,
  COPING_OPTIONS,
  COPING_PROMPT,
  COPING_QUESTIONS,
  LIVING_OPTIONS,
  MAX_VALUES,
  MIN_VALUES,
  PERSONALITY_CREDIT,
  PERSONALITY_INTRO,
  PERSONALITY_OPTIONS,
  PERSONALITY_PROMPT,
  PERSONALITY_QUESTIONS,
  VALUE_CARDS,
  valueCard,
  type ValuesAnswers,
} from "@/lib/self-map";
import { focusRing, primaryButton } from "./styles";

// The activities of the self map. Answers stay in memory until they are
// sent, and are never kept in browser storage or logged.

function SaveError({ km }: { km: boolean }) {
  return (
    <p role="alert" className="text-sm text-arom-danger">
      {km ? "មិនអាចរក្សាទុកចម្លើយរបស់អ្នកបានទេ។ សូមព្យាយាមម្តងទៀត។" : "Your answers could not be saved. Please try again."}
    </p>
  );
}

function ProgressBar({ km, step, total }: { km: boolean; step: number; total: number }) {
  return (
    <div
      className="mt-2 h-1.5 overflow-hidden rounded-full bg-arom-soft"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={step}
      aria-label={km ? "វឌ្ឍនភាព" : "Progress"}
    >
      <div className="h-full rounded-full bg-arom transition-all duration-300" style={{ width: `${(step / total) * 100}%` }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// My values: choose 3 to 5 cards, then how much each was lived
// ---------------------------------------------------------------------------

export function ValuesActivity({
  km,
  stage,
  onStage,
  saving,
  saveError,
  onSubmit,
}: {
  km: boolean;
  stage: "pick" | "rate";
  onStage: (stage: "pick" | "rate") => void;
  saving: boolean;
  saveError: boolean;
  onSubmit: (answers: ValuesAnswers) => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [living, setLiving] = useState<Record<string, number>>({});
  const full = picked.length >= MAX_VALUES;
  const allRated = picked.every((id) => living[id] !== undefined);

  const toggle = (id: string) =>
    setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : full ? current : [...current, id]));

  if (stage === "pick") {
    return (
      <div className="mt-3 animate-in fade-in duration-200">
        <div className="flex items-center justify-between text-xs font-medium text-ink-muted">
          <span>{km ? "តម្លៃរបស់ខ្ញុំ" : "My values"}</span>
          <span>{km ? "ជំហាន ១ នៃ ២" : "Step 1 of 2"}</span>
        </div>
        <ProgressBar km={km} step={1} total={2} />

        <h2 className="mt-5 text-lg font-semibold leading-7 text-ink sm:text-xl">
          {km ? `តើអ្វីសំខាន់បំផុតសម្រាប់អ្នក? ជ្រើសរើស ${MIN_VALUES} ដល់ ${MAX_VALUES}។` : `What matters most to you? Choose ${MIN_VALUES} to ${MAX_VALUES}.`}
        </h2>
        <p className="mt-1 text-sm leading-6 text-ink-muted">
          {km
            ? "ជ្រើសរើសតាមលំដាប់ ចាប់ពីសំខាន់បំផុត។ គ្មានចម្លើយត្រូវ ឬខុសទេ។"
            : "Choose them in order, the most important first. There are no right or wrong answers."}
        </p>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {VALUE_CARDS.map((card) => {
            const order = picked.indexOf(card.id);
            const active = order >= 0;
            return (
              <button
                key={card.id}
                type="button"
                aria-pressed={active}
                disabled={!active && full}
                onClick={() => toggle(card.id)}
                className={`flex min-h-16 w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors disabled:opacity-50 ${focusRing} ${
                  active ? "border-arom bg-arom-wash" : "border-arom-border bg-white hover:border-arom hover:bg-arom-wash"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                    active ? "border-arom bg-arom text-white" : "border-arom-border text-transparent"
                  }`}
                >
                  {active ? order + 1 : <Check size={12} />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">{km ? card.name.km : card.name.en}</span>
                  <span className="block text-xs leading-5 text-ink-muted">{km ? card.description.km : card.description.en}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="sticky bottom-24 mt-5 rounded-2xl bg-[#f7faf9]/95 py-2 backdrop-blur sm:bottom-28 lg:bottom-4">
          <p className="mb-2 text-center text-xs font-medium text-ink-muted" aria-live="polite">
            {km ? `បានជ្រើសរើស ${picked.length} នៃ ${MAX_VALUES}` : `${picked.length} of ${MAX_VALUES} chosen`}
          </p>
          <button type="button" disabled={picked.length < MIN_VALUES} onClick={() => onStage("rate")} className={primaryButton}>
            {km ? "បន្ទាប់" : "Next"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 animate-in fade-in duration-200">
      <div className="flex items-center justify-between text-xs font-medium text-ink-muted">
        <span>{km ? "តម្លៃរបស់ខ្ញុំ" : "My values"}</span>
        <span>{km ? "ជំហាន ២ នៃ ២" : "Step 2 of 2"}</span>
      </div>
      <ProgressBar km={km} step={2} total={2} />

      <h2 className="mt-5 text-lg font-semibold leading-7 text-ink sm:text-xl">
        {km ? "ក្នុងរយៈពេល ២ សប្តាហ៍ចុងក្រោយ តើអ្នកបានរស់នៅតាមតម្លៃនីមួយៗច្រើនប៉ុណ្ណា?" : "In the last 2 weeks, how much did you live by each one?"}
      </h2>
      <p className="mt-1 text-sm leading-6 text-ink-muted">
        {km
          ? "ជីវិតរវល់ ហើយគ្មាននរណារស់នៅតាមតម្លៃរបស់ខ្លួនពេញលេញគ្រប់ពេលនោះទេ។ សូមឆ្លើយដោយស្មោះត្រង់។"
          : "Life gets busy, and nobody lives by their values fully all the time. Answer honestly."}
      </p>

      <div className="mt-4 space-y-3">
        {picked.map((id) => {
          const card = valueCard(id);
          if (!card) return null;
          const name = km ? card.name.km : card.name.en;
          return (
            <div key={id} className="rounded-3xl border border-arom-border bg-white p-4 shadow-card">
              <p className="text-sm font-semibold text-ink">{name}</p>
              <div role="radiogroup" aria-label={name} className="mt-3 flex flex-wrap gap-2">
                {LIVING_OPTIONS.map((option, value) => {
                  const active = living[id] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setLiving((current) => ({ ...current, [id]: value }))}
                      className={`min-h-10 rounded-full border px-3.5 text-xs font-semibold transition-colors ${focusRing} ${
                        active ? "border-arom bg-arom text-white" : "border-arom-border bg-white text-ink hover:border-arom hover:bg-arom-wash"
                      }`}
                    >
                      {km ? option.km : option.en}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 space-y-2">
        {saveError && <SaveError km={km} />}
        <button
          type="button"
          disabled={!allRated || saving}
          onClick={() => onSubmit({ picks: picked.map((id) => ({ id, living: living[id] })) })}
          className={primaryButton}
        >
          {saving ? (km ? "កំពុងរក្សាទុក..." : "Saving...") : km ? "មើលតម្លៃរបស់ខ្ញុំ" : "See my values"}
        </button>
      </div>
    </div>
  );
}


// ---------------------------------------------------------------------------
// How I handle stress (Brief COPE) and My personality (Mini IPIP): one
// question per screen
// ---------------------------------------------------------------------------

export type QuestionPart = "coping" | "personality";

type Text = { en: string; km: string };

const QUESTION_SETS: Record<QuestionPart, { name: Text; intro: Text; prompt: Text; options: Text[]; questions: Text[]; minutes: Text; credit: Text }> = {
  coping: {
    name: { en: "How I handle stress", km: "របៀបដែលខ្ញុំទប់ទល់នឹងភាពតានតឹង" },
    intro: COPING_INTRO,
    prompt: COPING_PROMPT,
    options: COPING_OPTIONS,
    questions: COPING_QUESTIONS.map((question) => question.text),
    minutes: { en: "About 4 minutes", km: "ប្រហែល ៤ នាទី" },
    credit: COPING_CREDIT,
  },
  personality: {
    name: { en: "My personality", km: "បុគ្គលិកលក្ខណៈរបស់ខ្ញុំ" },
    intro: PERSONALITY_INTRO,
    prompt: PERSONALITY_PROMPT,
    options: PERSONALITY_OPTIONS,
    questions: PERSONALITY_QUESTIONS.map((question) => question.text),
    minutes: { en: "About 3 minutes", km: "ប្រហែល ៣ នាទី" },
    credit: PERSONALITY_CREDIT,
  },
};

export function QuestionsActivity({
  km,
  part,
  index,
  onIndex,
  saving,
  saveError,
  onSubmit,
}: {
  km: boolean;
  part: QuestionPart;
  // -1 is the introduction, then one index per question.
  index: number;
  onIndex: (index: number) => void;
  saving: boolean;
  saveError: boolean;
  onSubmit: (answers: number[]) => void;
}) {
  const set = QUESTION_SETS[part];
  const total = set.questions.length;
  const [answers, setAnswers] = useState<(number | undefined)[]>(() => Array.from({ length: total }));
  const tx = (text: Text) => (km ? text.km : text.en);
  const name = tx(set.name);

  if (index < 0) {
    return (
      <div className="mt-3 animate-in fade-in duration-200">
        <div className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
          <h2 className="text-lg font-semibold text-ink">{name}</h2>
          <p className="mt-2 text-sm leading-6 text-ink">{tx(set.intro)}</p>
          <p className="mt-3 text-xs text-ink-muted">{km ? `សំណួរ ${total} · ${set.minutes.km}` : `${total} questions · ${set.minutes.en}`}</p>
        </div>
        <button type="button" onClick={() => onIndex(0)} className={`${primaryButton} mt-5`}>
          {km ? "ចាប់ផ្តើម" : "Start"}
        </button>
        <p className="mt-3 text-[0.7rem] leading-5 text-ink-muted">{tx(set.credit)}</p>
      </div>
    );
  }

  const isLast = index === total - 1;
  const complete = answers.every((answer) => answer !== undefined);
  const text = tx(set.questions[index]);

  return (
    <div className="mt-3 animate-in fade-in duration-200">
      <div className="flex items-center justify-between text-xs font-medium text-ink-muted">
        <span>{name}</span>
        <span>{km ? `សំណួរ ${index + 1} នៃ ${total}` : `Question ${index + 1} of ${total}`}</span>
      </div>
      <ProgressBar km={km} step={index + 1} total={total} />

      <div className="mt-6 rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
        <p className="text-sm text-ink-muted">{tx(set.prompt)}</p>
        <h2 className="mt-2 text-lg font-semibold leading-7 text-ink sm:text-xl">{text}</h2>
        <div role="radiogroup" aria-label={text} className="mt-5 grid gap-2.5">
          {set.options.map((option, value) => {
            const active = answers[index] === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  setAnswers((current) => current.map((answer, item) => (item === index ? value : answer)));
                  if (!isLast) onIndex(index + 1);
                }}
                className={`flex min-h-12 w-full items-center rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${focusRing} ${
                  active ? "border-arom bg-arom text-white" : "border-arom-border bg-white text-ink hover:border-arom hover:bg-arom-wash"
                }`}
              >
                {tx(option)}
              </button>
            );
          })}
        </div>
      </div>

      {isLast && (
        <div className="mt-5 space-y-2">
          {saveError && <SaveError km={km} />}
          <button
            type="button"
            disabled={!complete || saving}
            onClick={() => onSubmit(answers.map((answer) => answer ?? 0))}
            className={primaryButton}
          >
            {saving ? (km ? "កំពុងរក្សាទុក..." : "Saving...") : km ? "មើលលទ្ធផលរបស់ខ្ញុំ" : "See my result"}
          </button>
        </div>
      )}
    </div>
  );
}
