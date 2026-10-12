"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  Clock,
  Plus,
  ShieldCheck,
  UserCheck,
  Wind,
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../language-provider";
import {
  getPlanTryNowItems,
  isTipBookmarked,
  toggleTipBookmark,
  toggleTryNowInPlan,
  type TipItem,
  type TipStep,
} from "./tips-data";

type TipInteractiveViewProps = {
  tip: TipItem;
  onBack: () => void;
  onComplete: () => void;
  onOpenBreathing?: () => void;
  onOpenProfessional?: () => void;
  /** Admin preview: nothing is saved to this browser. */
  preview?: boolean;
};

export function TipInteractiveView({
  tip,
  onBack,
  onComplete,
  onOpenBreathing,
  onOpenProfessional,
  preview = false,
}: TipInteractiveViewProps) {
  const { language } = useLanguage();
  const km = language === "km";
  const [bookmarked, setBookmarked] = useState(() => isTipBookmarked(tip.id));
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [planStepNumbers, setPlanStepNumbers] = useState<number[]>(() => {
    return getPlanTryNowItems().map((i) => i.stepNumber);
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggleBookmark = () => {
    if (preview) return;
    const newState = toggleTipBookmark(tip.id);
    setBookmarked(newState);
  };

  const handleToggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber)
        ? prev.filter((n) => n !== stepNumber)
        : [...prev, stepNumber]
    );
  };

  const handleTogglePlan = (step: TipStep) => {
    if (preview) return;
    const added = toggleTryNowInPlan(step, tip);
    setPlanStepNumbers((prev) =>
      added ? [...prev, step.number] : prev.filter((n) => n !== step.number)
    );
    if (added) {
      setToastMessage(
        km
          ? `បានបន្ថែម "${step.kmTitle}" ទៅផែនការទំព័រដើម`
          : `Added "${step.title.replace(/\.$/, "")}" to your Home Screen Plan`
      );
    } else {
      setToastMessage(
        km
          ? `បានលុបចេញពីផែនការទំព័រដើម`
          : `Removed from your Home Screen Plan`
      );
    }
    window.setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <main className="min-h-screen bg-canvas px-4 pb-28 pt-4 sm:px-8 sm:pt-6 lg:px-12">
      <div className="mx-auto w-full max-w-2xl">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            aria-label={km ? "ត្រឡប់ក្រោយ" : "Back to tips overview"}
            className="flex size-11 items-center justify-center rounded-full text-arom transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-arom"
          >
            <ArrowLeft aria-hidden="true" size={24} />
          </button>

          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-arom-accent">
              {km ? "គន្លឹះរហ័ស (Actionable Tips)" : "Actionable Tips"}
            </span>
            <p className="text-sm font-semibold text-arom">
              {completedSteps.length} / {tip.steps.length} {km ? "បានអនុវត្ត" : "tried"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleBookmark}
            aria-label={bookmarked ? (km ? "លុបចេញពីចំណាំ" : "Remove bookmark") : km ? "រក្សាទុកគន្លឹះ" : "Bookmark tips"}
            className={`flex size-11 items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-arom ${
              bookmarked ? "bg-arom text-white" : "text-arom hover:bg-arom-wash"
            }`}
          >
            <Bookmark aria-hidden="true" size={20} className={bookmarked ? "fill-current" : ""} />
          </button>
        </div>

        {/* Hero Card */}
        <div className="mt-4 rounded-3xl border border-arom-border bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-2 text-xs font-semibold text-arom">
            <span className="rounded-full bg-arom-soft px-3 py-1">
              {km ? tip.kmDifficulty : tip.difficulty}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-ink-muted">
              <Clock aria-hidden="true" size={14} />
              {km ? tip.kmDuration : tip.duration}
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-arom sm:text-3xl">
            {km ? tip.kmTitle : tip.title}
          </h1>

          <p className="mt-1 text-base font-semibold text-arom/90 sm:text-lg">
            {km ? tip.kmSubtitle : tip.subtitle}
          </p>

          <p className="mt-3 text-sm leading-relaxed text-ink sm:text-base">
            {km ? tip.kmIntroduction : tip.introduction}
          </p>
        </div>

        {/* 6 Actionable Tips */}
        <div className="mt-6 space-y-4">
          {tip.steps.map((step) => {
            const isDone = completedSteps.includes(step.number);
            const inPlan = planStepNumbers.includes(step.number);

            return (
              <div
                key={step.number}
                className={`rounded-2xl border transition-all duration-200 p-5 sm:p-6 ${
                  isDone
                    ? "border-arom/40 bg-arom/[0.04]"
                    : "border-arom-border bg-white shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-arom-soft text-sm font-bold text-arom">
                    {step.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold text-arom">
                      {km ? step.kmTitle : step.title}
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink">
                      {km ? step.kmBody : step.body}
                    </p>

                    {/* Try Now Callout Box */}
                    <div className="mt-3.5 rounded-xl border border-arom/20 bg-arom-soft/40 p-3 sm:p-3.5">
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 font-semibold text-arom">
                          {km ? "សាកល្បងឥឡូវនេះ៖" : "Try now:"}
                        </span>
                        <span className="text-sm text-ink-deep">
                          {km ? step.kmTryNow : step.tryNow}
                        </span>
                      </div>

                      {/* Interactive Button for Step 6 Breathing */}
                      {step.hasBreathingAction && onOpenBreathing && (
                        <button
                          type="button"
                          onClick={onOpenBreathing}
                          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-arom px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-arom-deep active:scale-95"
                        >
                          <Wind aria-hidden="true" size={16} />
                          <span>{km ? "ចាប់ផ្តើមការហាត់ដកដង្ហើម (Breathing)" : "Start 4-7-8 Breathing Now"}</span>
                        </button>
                      )}
                    </div>

                    {/* Action Bar: Add to Plan + Mark as tried */}
                    <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-1">
                      {/* Add to Home Plan Button */}
                      <button
                        type="button"
                        onClick={() => handleTogglePlan(step)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                          inPlan
                            ? "bg-arom text-white shadow-sm"
                            : "border border-arom-border bg-white text-arom hover:bg-arom-wash"
                        }`}
                      >
                        {inPlan ? (
                          <Check aria-hidden="true" size={14} strokeWidth={2.5} />
                        ) : (
                          <Plus aria-hidden="true" size={14} strokeWidth={2.5} />
                        )}
                        <span>
                          {inPlan
                            ? km
                              ? "ក្នុងផែនការទំព័រដើម"
                              : "In Home Plan"
                            : km
                            ? "បន្ថែមទៅផែនការទំព័រដើម (Add to Plan)"
                            : "Add to Plan at Home Screen"}
                        </span>
                      </button>

                      {/* Mark as tried Checkbox Tracker */}
                      <button
                        type="button"
                        onClick={() => handleToggleStep(step.number)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          isDone
                            ? "bg-arom-accent/25 text-arom"
                            : "border border-arom-border text-ink-muted hover:bg-arom-wash hover:text-arom"
                        }`}
                      >
                        <Check aria-hidden="true" size={14} strokeWidth={2.5} />
                        <span>
                          {isDone
                            ? km
                              ? "បានសាកល្បងរួចរាល់"
                              : "Completed"
                            : km
                            ? "ចំណាំថានឹងសាកល្បង"
                            : "Mark as tried"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* When to get more support */}
        <div className="mt-8 rounded-3xl border border-arom/30 bg-gradient-to-br from-arom-soft/60 to-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center gap-2.5 text-arom">
            <ShieldCheck aria-hidden="true" size={22} className="shrink-0" />
            <h3 className="text-lg font-bold">
              {km ? tip.supportCallout.kmTitle : tip.supportCallout.title}
            </h3>
          </div>

          <p className="mt-2.5 text-sm leading-relaxed text-ink">
            {km ? tip.supportCallout.kmBody : tip.supportCallout.body}
          </p>

          <div className="mt-4">
            <button
              type="button"
              onClick={onOpenProfessional}
              className="inline-flex items-center gap-2 rounded-xl bg-arom px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-arom-deep active:scale-95"
            >
              <UserCheck aria-hidden="true" size={18} />
              <span>
                {km
                  ? tip.supportCallout.kmActionLabel
                  : tip.supportCallout.actionLabel}
              </span>
            </button>
          </div>
        </div>

        {/* Source Citation */}
        <div className="mt-6 text-center text-xs text-ink-muted">
          <p>{km ? tip.kmSourceCitation : tip.sourceCitation}</p>
        </div>

        {/* Complete Reading Button */}
        <div className="mt-8">
          <button
            type="button"
            onClick={onComplete}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-arom text-base font-semibold text-white shadow-sm transition-all hover:bg-arom-deep active:scale-[0.98]"
          >
            <span>{km ? "បញ្ចប់ការអានគន្លឹះ (Complete Tips)" : "Complete Tips"}</span>
            <ArrowRight aria-hidden="true" size={18} />
          </button>
        </div>
      </div>

      {/* Floating Confirmation Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-arom/30 bg-arom px-4 py-2.5 text-xs font-semibold text-white shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
}
