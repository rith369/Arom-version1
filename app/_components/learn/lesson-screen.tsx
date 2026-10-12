"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Heart,
  HelpCircle,
  Info,
  Lightbulb,
  MessageCircle,
  Wind,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useLanguage } from "../language-provider";
import { ReportProblemButton } from "../report-problem";
import {
  saveLessonProgress,
  type Lesson,
  type LessonSection,
} from "./learn-data";

type LessonScreenProps = {
  lesson: Lesson;
  initialSection?: number;
  onExit: () => void;
  onComplete: () => void;
  onOpenExercise?: () => void;
  onOpenProfessional?: () => void;
  /** Admin preview: nothing is saved to this browser. */
  preview?: boolean;
};

export function LessonScreen({
  lesson,
  initialSection = 1,
  onExit,
  onComplete,
  onOpenExercise,
  onOpenProfessional,
  preview = false,
}: LessonScreenProps) {
  const { language } = useLanguage();
  const km = language === "km";

  const [currentSectionIndex, setCurrentSectionIndex] = useState(
    Math.max(0, Math.min(initialSection - 1, lesson.sections.length - 1)),
  );
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [selectedReflection, setSelectedReflection] = useState<string | null>(null);
  const [showReferences, setShowReferences] = useState<boolean>(false);

  const currentSection: LessonSection =
    lesson.sections[currentSectionIndex] || lesson.sections[0];
  const sectionNumber = currentSectionIndex + 1;
  const totalSections = lesson.totalSections;

  const handleNext = () => {
    // Save progress
    if (!preview) saveLessonProgress(lesson.id, {
      completedSections: Math.max(sectionNumber, currentSectionIndex + 1),
      totalSections,
      isComplete: sectionNumber >= totalSections,
      lastVisitedSection: sectionNumber,
      quizAnswer: selectedQuizOption ?? undefined,
      reflectionAnswer: selectedReflection ?? undefined,
    });

    if (sectionNumber >= totalSections) {
      onComplete();
    } else {
      setCurrentSectionIndex((prev) => prev + 1);
      if (!preview) window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
      if (!preview) window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between">
      {/* Top Header with Step Progress */}
      <header className="sticky top-0 z-30 border-b border-arom-border bg-white/95 px-4 py-3 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={onExit}
            aria-label={km ? "ចេញពីមេរៀន" : "Exit lesson"}
            className="flex size-9 items-center justify-center rounded-full border border-arom-border bg-white text-ink-muted shadow-sm transition-colors hover:bg-arom-wash hover:text-arom"
          >
            <X size={18} />
          </button>

          <div className="flex flex-1 flex-col items-center">
            <span className="text-xs font-semibold tracking-wider text-arom">
              {sectionNumber} / {totalSections}
            </span>
            <div className="mt-1.5 h-1.5 w-36 sm:w-56 overflow-hidden rounded-full bg-arom-soft">
              <div
                className="h-full rounded-full bg-arom transition-all duration-300"
                style={{ width: `${(sectionNumber / totalSections) * 100}%` }}
              />
            </div>
          </div>

          <span className="text-[0.75rem] font-semibold text-arom">
            {lesson.category}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto flex-1 w-full max-w-2xl px-4 py-6 sm:px-8 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.article
            key={currentSection.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Section Tag & Title */}
            <div>
              <span className="inline-flex items-center rounded-full bg-arom-soft px-3 py-1 text-xs font-semibold text-arom">
                {km ? `ផ្នែកទី ${sectionNumber}` : `Section ${sectionNumber}`}
              </span>
              <h1 className="mt-2.5 text-2xl font-bold tracking-tight text-arom sm:text-3xl">
                {km && currentSection.kmTitle
                  ? currentSection.kmTitle
                  : currentSection.title}
              </h1>
            </div>

            {/* Paragraphs */}
            <div className="space-y-4 text-[0.95rem] leading-relaxed text-ink sm:text-base sm:leading-7">
              {(km && currentSection.kmParagraphs
                ? currentSection.kmParagraphs
                : currentSection.paragraphs
              ).map((p, idx) => (
                <p key={idx} className="whitespace-pre-line">
                  {p}
                </p>
              ))}
            </div>

            {/* Emergency Alert Box (e.g. Chest pain warning [6]) */}
            {currentSection.alertBox && (
              <div className="flex items-start gap-3.5 rounded-2xl border border-arom-danger/30 bg-arom-danger-soft p-4 text-arom-danger shadow-sm">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-arom-danger" />
                <div className="text-xs leading-relaxed sm:text-sm font-medium">
                  <p className="font-bold text-arom-danger">
                    {km ? "ការព្រមានផ្នែកសុខភាពបន្ទាន់ [6]" : "Important Health Warning [6]"}
                  </p>
                  <p className="mt-0.5">
                    {km && currentSection.alertBox.kmText
                      ? currentSection.alertBox.kmText
                      : currentSection.alertBox.text}
                  </p>
                </div>
              </div>
            )}

            {/* Interactive Element: Quiz */}
            {currentSection.quiz && (
              <div className="rounded-3xl border border-arom-border bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-arom">
                  <HelpCircle size={15} />
                  <span>{km ? "សំណួររហ័ស" : "Quick Question"}</span>
                </div>
                <h3 className="mt-2 text-base font-bold text-ink sm:text-lg">
                  {km && currentSection.quiz.kmQuestion
                    ? currentSection.quiz.kmQuestion
                    : currentSection.quiz.question}
                </h3>

                <div className="mt-4 space-y-2.5">
                  {currentSection.quiz.options.map((opt) => {
                    const isSelected = selectedQuizOption === opt.id;
                    const isCorrect = opt.isCorrect;
                    let optionStyle =
                      "border-arom-border bg-white text-ink hover:border-arom/40 hover:bg-arom-wash";

                    if (quizSubmitted) {
                      if (isCorrect) {
                        optionStyle =
                          "border-arom bg-arom-soft text-arom font-bold";
                      } else if (isSelected && !isCorrect) {
                        optionStyle =
                          "border-arom-danger/60 bg-arom-danger-soft text-arom-danger";
                      }
                    } else if (isSelected) {
                      optionStyle =
                        "border-arom bg-arom-soft text-arom font-semibold";
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSelectedQuizOption(opt.id);
                          setQuizSubmitted(true);
                        }}
                        className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left text-sm transition-all sm:p-4 ${optionStyle}`}
                      >
                        <span>{km && opt.kmText ? opt.kmText : opt.text}</span>
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-current">
                          {isSelected && <span className="size-2 rounded-full bg-current" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Feedback */}
                {quizSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-2xl border border-arom/25 bg-arom-wash p-4 text-xs leading-relaxed text-ink sm:text-sm"
                  >
                    <div className="flex items-center gap-2 font-bold text-arom">
                      <CheckCircle2 size={16} />
                      <span>{km ? "ចម្លើយពន្យល់" : "Feedback"}</span>
                    </div>
                    <p className="mt-1 text-ink">
                      {km && currentSection.quiz.kmExplanation
                        ? currentSection.quiz.kmExplanation
                        : currentSection.quiz.explanation}
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Interactive Element: Reflection */}
            {currentSection.reflection && (
              <div className="rounded-3xl border border-arom-border bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-arom">
                  <MessageCircle size={15} />
                  <span>{km ? "ការឆ្លុះបញ្ចាំង" : "Reflection"}</span>
                </div>
                <h3 className="mt-2 text-base font-bold text-ink sm:text-lg">
                  {km && currentSection.reflection.kmQuestion
                    ? currentSection.reflection.kmQuestion
                    : currentSection.reflection.question}
                </h3>

                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {(km && currentSection.reflection.kmOptions
                    ? currentSection.reflection.kmOptions
                    : currentSection.reflection.options
                  ).map((opt, idx) => {
                    const isSelected = selectedReflection === opt;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedReflection(opt)}
                        className={`flex h-12 items-center justify-center rounded-2xl border px-3 text-xs font-semibold transition-all sm:text-sm ${
                          isSelected
                            ? "border-arom bg-arom text-white shadow-sm"
                            : "border-arom-border bg-white text-ink-muted hover:bg-arom-wash hover:text-arom"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {selectedReflection && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-2xl border border-arom/20 bg-arom-wash p-4 text-xs leading-relaxed text-ink sm:text-sm"
                  >
                    <p className="font-semibold text-arom">
                      {km ? "ចំណុចស្ងប់ចិត្ត៖" : "Gentle Note:"}
                    </p>
                    <p className="mt-1 text-ink">
                      {km && currentSection.reflection.kmFeedbackMessage
                        ? currentSection.reflection.kmFeedbackMessage
                        : currentSection.reflection.feedbackMessage}
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Interactive Action Shortcuts (Section 5) */}
            {currentSection.actions && (
              <div className="space-y-2.5 pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-arom">
                  {km ? "សកម្មភាពណែនាំ" : "Recommended Quick Actions"}
                </p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {onOpenExercise && (
                    <button
                      type="button"
                      onClick={onOpenExercise}
                      className="flex items-center gap-3 rounded-2xl border border-arom/30 bg-arom-soft p-3.5 text-left text-xs text-arom transition-all hover:bg-arom hover:text-white sm:text-sm shadow-sm"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-arom shadow-sm">
                        <Wind size={18} />
                      </span>
                      <span>
                        <span className="block font-bold">
                          {km ? "ហាត់ដកដង្ហើមស្ងប់ចិត្ត ១ នាទី (Breathing)" : "1-Minute Calming Breath"}
                        </span>
                        <span className="text-[0.72rem] opacity-80">
                          {km ? "ធ្វើលំហាត់ដកដង្ហើមឥឡូវនេះ" : "Practice calm breathing now"}
                        </span>
                      </span>
                    </button>
                  )}

                  {onOpenProfessional && (
                    <button
                      type="button"
                      onClick={onOpenProfessional}
                      className="flex items-center gap-3 rounded-2xl border border-arom-border bg-white p-3.5 text-left text-xs text-ink transition-all hover:bg-arom-wash hover:border-arom sm:text-sm shadow-sm"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-arom-soft text-arom">
                        <Heart size={18} />
                      </span>
                      <span>
                        <span className="block font-bold text-arom">
                          {km ? "ស្វែងរកអ្នកជំនាញ (Match Me)" : "Match Me With A Professional"}
                        </span>
                        <span className="text-[0.72rem] text-ink-muted">
                          {km ? "ការស្វែងរកជំនួយជាការឆ្លាតវៃ [5]" : "Getting backup is smart [5]"}
                        </span>
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Key Points Highlight Card */}
            {currentSection.keyPoints && currentSection.keyPoints.length > 0 && (
              <div className="rounded-2xl border border-arom/20 bg-arom-wash p-4 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-arom">
                  <Lightbulb size={15} />
                  <span>{km ? "ចំណុចគន្លឹះសំខាន់ៗ" : "Key Points"}</span>
                </div>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink sm:text-sm">
                  {(km && currentSection.kmKeyPoints
                    ? currentSection.kmKeyPoints
                    : currentSection.keyPoints
                  ).map((kp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-arom" />
                      <span>{kp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* References preview accordion */}
            <div className="border-t border-arom-border pt-4 text-xs text-ink-muted">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowReferences(!showReferences)}
                  className="inline-flex items-center gap-1.5 font-semibold text-arom hover:text-arom-deep"
                >
                  <Info size={13} />
                  <span>{km ? "មើលឯកសារយោង [1] ដល់ [6] (References)" : "View Citations & References [1] to [6]"}</span>
                </button>
                {!preview && (
                  <ReportProblemButton
                    target={{ type: "lesson", sourceId: lesson.id, partId: String(currentSection.id) }}
                    itemTitle={km && lesson.kmTitle ? lesson.kmTitle : lesson.title}
                    partLabel={`${km ? "ផ្នែកទី" : "Section"} ${sectionNumber}`}
                  />
                )}
              </div>
              {showReferences && (
                <ul className="mt-2.5 space-y-1 rounded-xl border border-arom-border bg-white p-3 text-[0.75rem] text-ink shadow-sm">
                  {lesson.references.map((ref) => (
                    <li key={ref.id}>
                      <span className="font-bold text-arom">{ref.citation}</span>{" "}
                      {ref.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.article>
        </AnimatePresence>
      </main>

      {/* Bottom Sticky Navigation */}
      <footer className="sticky bottom-0 z-30 border-t border-arom-border bg-white/95 px-4 py-3.5 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentSectionIndex === 0}
            className={`flex h-12 items-center gap-2 rounded-2xl px-5 text-sm font-semibold transition-colors ${
              currentSectionIndex === 0
                ? "cursor-not-allowed opacity-30 text-ink-muted"
                : "border border-arom-border bg-white text-ink hover:bg-arom-wash"
            }`}
          >
            <ArrowLeft size={16} />
            <span>{km ? "ថយក្រោយ" : "Previous"}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex h-12 items-center gap-2 rounded-2xl bg-arom px-6 text-sm font-bold text-white shadow-[0_8px_24px_rgba(31,111,91,0.2)] transition-all hover:bg-arom-deep hover:-translate-y-0.5"
          >
            <span>
              {sectionNumber >= totalSections
                ? km
                  ? "បញ្ចប់មេរៀន"
                  : "Finish Lesson"
                : km
                  ? "បន្ទាប់"
                  : "Next"}
            </span>
            <ArrowRight size={16} />
          </button>
        </div>
      </footer>
    </div>
  );
}
