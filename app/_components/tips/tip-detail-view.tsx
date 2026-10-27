"use client";

import Image from "next/image";
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Clock,
  Play,
  ShieldCheck,
} from "lucide-react";
import { LanguageQuickToggle, useLanguage } from "../language-provider";
import { EducationalNote } from "../educational-note";
import { chooseLabel, useMindGuidePick } from "../mindguide-pick";
import { ReportProblemButton } from "../report-problem";
import { toggleSaved } from "../saved/saved-store";
import { useSavedIds } from "../saved/use-saved";
import type { TipItem } from "./tips-data";

type TipDetailViewProps = {
  tip: TipItem;
  onBack: () => void;
  onStartTips: () => void;
  /** Admin preview: nothing is saved to this browser. */
  preview?: boolean;
};

export function TipDetailView({
  tip,
  onBack,
  onStartTips,
  preview = false,
}: TipDetailViewProps) {
  const { language } = useLanguage();
  const km = language === "km";
  const pick = useMindGuidePick();
  const bookmarked = useSavedIds("tip").includes(tip.id);

  const handleToggleBookmark = () => {
    if (preview) return;
    toggleSaved("tip", tip.id);
  };

  return (
    <main className="min-h-screen bg-canvas px-4 pb-28 pt-4 sm:px-8 sm:pt-6 lg:px-12">
      <div className="mx-auto w-full max-w-2xl">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            aria-label={km ? "ត្រឡប់ក្រោយ" : "Back to Tips"}
            className="flex size-11 items-center justify-center rounded-full text-arom transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-arom"
          >
            <ArrowLeft aria-hidden="true" size={24} />
          </button>

          <div className="flex items-center gap-2">
            <LanguageQuickToggle />

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
        </div>

        {/* Hero Card */}
        <div className="mt-4 overflow-hidden rounded-3xl border border-arom-border bg-white shadow-sm">
          <div className="relative aspect-[16/7] w-full bg-arom-soft">
            <Image
              src={tip.heroImage || "/mindguide/managing-stress-hero.svg"}
              alt=""
              fill
              priority
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
              <span className="rounded-full bg-arom/90 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                {km ? tip.kmCategory : tip.category}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-black/40 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <Clock aria-hidden="true" size={13} />
                {km ? tip.kmDuration : tip.duration}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold tracking-tight text-arom sm:text-3xl">
              {km ? tip.kmTitle : tip.title}
            </h1>

            <p className="mt-1 text-base font-semibold text-arom/85 sm:text-lg">
              {km ? tip.kmSubtitle : tip.subtitle}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-ink sm:text-base">
              {km ? tip.kmIntroduction : tip.introduction}
            </p>

            {/* Checklist of 6 Tips */}
            <div className="mt-6 rounded-2xl bg-[#f4f9f7] p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-arom">
                {km
                  ? `គន្លឹះទាំង ${["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"][tip.steps.length] || tip.steps.length} នៅក្នុងការណែនាំនេះ`
                  : `${tip.steps.length} Practical Steps Included`}
              </h2>
              <div className="mt-3 space-y-2.5">
                {tip.steps.map((step) => (
                  <div key={step.number} className="flex items-start gap-3 text-sm text-ink">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-arom text-xs font-bold text-white">
                      {step.number}
                    </span>
                    <div>
                      <span className="font-semibold text-arom">
                        {km ? step.kmTitle : step.title}
                      </span>
                      <span className="block text-xs text-ink-muted">
                        {km ? step.kmTryNow : step.tryNow}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Callout */}
            <div className="mt-6 rounded-2xl border border-arom/20 bg-arom-soft/30 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-arom">
                <ShieldCheck aria-hidden="true" size={16} />
                <span>{km ? "ការគាំទ្រវិជ្ជាជីវៈ (Professional Support)" : "Professional Support"}</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-ink">
                {km ? tip.supportCallout.kmBody : tip.supportCallout.body}
              </p>
            </div>

            {/* Citation */}
            <div className="mt-6 text-center text-xs text-ink-muted">
              <p>{km ? tip.kmSourceCitation : tip.sourceCitation}</p>
            </div>

            <EducationalNote className="mt-4" />

            {/* Primary Action Button */}
            <div className="mt-8 space-y-3">
              {pick && (
                <button
                  type="button"
                  onClick={() => pick.choose("tip", tip.id)}
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-arom text-base font-semibold text-white shadow-sm transition-all hover:bg-arom-deep active:scale-[0.98]"
                >
                  <CheckCircle2 aria-hidden="true" size={18} />
                  <span>{chooseLabel(pick.clientName, km)}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onStartTips}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-arom text-base font-semibold text-white shadow-sm transition-all hover:bg-arom-deep active:scale-[0.98]"
              >
                <Play aria-hidden="true" size={18} className="fill-current" />
                <span>{km ? "ចាប់ផ្តើមអានគន្លឹះ (Start Reading)" : "Start Reading Tips"}</span>
              </button>
            </div>

            {!preview && (
              <div className="mt-6 flex justify-center">
                <ReportProblemButton
                  target={{ type: "tip", sourceId: tip.id }}
                  itemTitle={km ? tip.kmTitle : tip.title}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
