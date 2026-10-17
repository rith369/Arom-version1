"use client";

import Image from "next/image";
import {
  Award,
  Bookmark,
  BookOpen,
  Check,
  ChevronRight,
  Headphones,
  Wind,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { recordActivity } from "../activity-log";
import { useLanguage } from "../language-provider";
import {
  toggleLessonBookmark,
  type Lesson,
} from "./learn-data";
import { useLessonBookmarked } from "./use-lesson-storage";

type LessonCompleteViewProps = {
  lesson: Lesson;
  onTryExercise: () => void;
  onReadAnother: () => void;
  onViewSaved: () => void;
};

export function LessonCompleteView({
  lesson,
  onTryExercise,
  onReadAnother,
  onViewSaved,
}: LessonCompleteViewProps) {
  const { language } = useLanguage();
  const km = language === "km";

  // Counts on the Progress Activities tab (once per lesson per day).
  useEffect(() => {
    recordActivity("lesson", lesson.id);
  }, [lesson.id]);
  const saved = useLessonBookmarked(lesson.id);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveToggle = () => {
    const nextState = toggleLessonBookmark(lesson.id);
    const msg = nextState
      ? km
        ? "បានរក្សាទុកក្នុងមេរៀនរបស់ខ្ញុំ"
        : "Saved to My Learning!"
      : km
        ? "បានលុបចេញពីការរក្សាទុក"
        : "Removed from Saved";
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink pb-24 lg:pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-full border border-arom-border bg-white px-4 py-2 text-xs font-semibold text-arom shadow-lg"
        >
          ✓ {toastMessage}
        </motion.div>
      )}

      <main className="mx-auto max-w-2xl px-4 pt-10 sm:px-8 sm:pt-14">
        {/* Celebration Illustration */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col items-center text-center"
        >
          <div className="relative w-full max-w-[14rem] sm:max-w-[16rem]">
            <Image
              src="/booking/booking-complete.png"
              alt="Lesson complete"
              width={1590}
              height={989}
              priority
              className="h-auto w-full object-contain"
              unoptimized
            />
          </div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-arom-border bg-white px-4 py-1.5 text-xs font-semibold text-arom shadow-sm">
            <Award size={14} />
            <span>+25 XP • {km ? "អ្នករៀនដឹងចិត្ត (Mindful Learner)" : "Mindful Learner"}</span>
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-arom sm:text-3xl">
            {km ? "មេរៀនត្រូវបានបញ្ចប់ (Lesson Complete)" : "Lesson Complete"}
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted sm:text-base">
            {km
              ? `អ្នកបានបញ្ចប់មេរៀន ${lesson.kmTitle || lesson.title} ដោយជោគជ័យ!`
              : `You finished ${lesson.title}`}
          </p>

          <div className="mt-3 flex items-center gap-2 rounded-full bg-white border border-arom-border px-4 py-1.5 text-xs text-ink-muted shadow-sm">
            <Check size={14} className="text-arom" />
            <span>
              {lesson.totalSections} / {lesson.totalSections}{" "}
              {km ? "ផ្នែកត្រូវបានបញ្ចប់" : "sections completed"}
            </span>
          </div>
        </motion.div>

        {/* Next Actions Section */}
        <div className="mt-10 sm:mt-12">
          <h2 className="text-base font-bold text-arom sm:text-lg">
            {km ? "តើអ្នកចង់ធ្វើអ្វីបន្តទៀត?" : "What would you like to do next?"}
          </h2>

          <div className="mt-4 space-y-3">
            {/* Action 1: Try an Exercise */}
            <motion.button
              whileHover={{ y: -2 }}
              type="button"
              onClick={onTryExercise}
              className="group flex w-full items-center justify-between rounded-2xl border border-arom-border bg-white p-4 text-left shadow-[0_8px_24px_rgba(25,87,72,0.05)] transition-all hover:border-arom/40 hover:shadow-card sm:p-5"
            >
              <div className="flex items-center gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-arom-soft text-arom">
                  <Wind size={24} />
                </span>
                <div>
                  <span className="block text-sm font-bold text-arom sm:text-base">
                    {km ? "សាកល្បងធ្វើលំហាត់ដកដង្ហើម (Breathing)" : "Try an Exercise"}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-muted">
                    {km
                      ? "អនុវត្តការដកដង្ហើមបន្ធូរអារម្មណ៍ (Calm Breathing)"
                      : "Practice a breathing or relaxation exercise."}
                  </span>
                </div>
              </div>
              <ChevronRight
                size={20}
                className="text-arom transition-transform duration-150 group-hover:translate-x-1"
              />
            </motion.button>

            {/* Action 2: Read Another Lesson */}
            <motion.button
              whileHover={{ y: -2 }}
              type="button"
              onClick={onReadAnother}
              className="group flex w-full items-center justify-between rounded-2xl border border-arom-border bg-white p-4 text-left shadow-[0_8px_24px_rgba(25,87,72,0.05)] transition-all hover:border-arom/40 hover:shadow-card sm:p-5"
            >
              <div className="flex items-center gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-arom-wash text-arom">
                  <BookOpen size={24} />
                </span>
                <div>
                  <span className="block text-sm font-bold text-arom sm:text-base">
                    {km ? "រៀនមេរៀនផ្សេងទៀត (Read Another)" : "Read Another Lesson"}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-muted">
                    {km ? "បន្តស្វែងយល់ពីប្រធានបទថ្មីៗ" : "Explore more MindGuide topics."}
                  </span>
                </div>
              </div>
              <ChevronRight
                size={20}
                className="text-arom transition-transform duration-150 group-hover:translate-x-1"
              />
            </motion.button>

            {/* Action 3: Save to My Learning */}
            <motion.button
              whileHover={{ y: -2 }}
              type="button"
              onClick={handleSaveToggle}
              className={`group flex w-full items-center justify-between rounded-2xl border p-4 text-left shadow-sm transition-all sm:p-5 ${
                saved
                  ? "border-arom bg-arom-soft/60 text-arom"
                  : "border-arom-border bg-white hover:border-arom/40 hover:bg-arom-wash"
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${
                    saved
                      ? "bg-arom text-white"
                      : "bg-arom-soft text-arom"
                  }`}
                >
                  <Bookmark
                    size={22}
                    className={saved ? "fill-white" : "fill-none"}
                  />
                </span>
                <div>
                  <span className="block text-sm font-bold text-arom sm:text-base">
                    {saved
                      ? km
                        ? "បានរក្សាទុកក្នុងមេរៀនរបស់ខ្ញុំ ✓"
                        : "Saved to My Learning ✓"
                      : km
                        ? "រក្សាទុកក្នុងមេរៀនរបស់ខ្ញុំ (Save)"
                        : "Save to My Learning"}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-muted">
                    {km ? "ត្រឡប់មកអានឡើងវិញនៅពេលក្រោយ" : "Bookmark to review anytime."}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold text-arom">
                {saved ? (km ? "បានរក្សាទុក" : "Saved") : (km ? "រក្សាទុក" : "Save")}
              </span>
            </motion.button>
          </div>
        </div>

        {/* Connected MindGuide Recommendations */}
        <div className="mt-10 rounded-3xl border border-arom-border bg-white p-5 sm:p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-arom">
            {km ? "ការណែនាំបន្ថែមក្នុង MindGuide" : "Connect With Other MindGuide Features"}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-arom-border bg-arom-wash/60 p-3.5 text-xs text-ink">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-arom-soft text-arom">
                <BookOpen size={18} />
              </span>
              <div>
                <p className="font-bold text-arom">{km ? "៥ វិធីគ្រប់គ្រងភាពតានតឹង" : "5 Ways to Manage Stress"}</p>
                <p className="text-[0.72rem] text-ink-muted">{km ? "គន្លឹះអនុវត្តជាក់ស្តែងងាយៗ" : "Quick practical tips"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-arom-border bg-arom-wash/60 p-3.5 text-xs text-ink">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-arom-soft text-arom">
                <Headphones size={18} />
              </span>
              <div>
                <p className="font-bold text-arom">{km ? "ការស្តាប់៖ ចិត្តស្ងប់ (Calm Mindset)" : "Listening: Calm Mindset"}</p>
                <p className="text-[0.72rem] text-ink-muted">{km ? "ផតខាសសំឡេង ១០ នាទី" : "10 min audio podcast"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Back To Home Link */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={onReadAnother}
            className="text-xs font-semibold text-arom hover:underline"
          >
            ← {km ? "ត្រឡប់ទៅទំព័រដើមនៃការរៀន (Learn Home)" : "Back to Learn Home"}
          </button>
        </div>
      </main>
    </div>
  );
}
