"use client";

import Image from "next/image";
import {
  Award,
  BookOpen,
  Check,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { recordActivity } from "../activity-log";
import { useLanguage } from "../language-provider";
import { type PracticeItem } from "./practice-data";

type PracticeCompleteViewProps = {
  practice: PracticeItem;
  onPracticeAgain: () => void;
  onGoToLearn: () => void;
  onBackToPractices: () => void;
};

export function PracticeCompleteView({
  practice,
  onPracticeAgain,
  onGoToLearn,
  onBackToPractices,
}: PracticeCompleteViewProps) {
  const { language } = useLanguage();
  const km = language === "km";

  // Counts on the Progress Activities tab (once per practice per day).
  useEffect(() => {
    recordActivity("practice", practice.id);
  }, [practice.id]);

  return (
    <div className="min-h-screen bg-canvas text-ink pb-24 lg:pb-12">
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
              alt="Practice complete"
              width={1590}
              height={989}
              priority
              className="h-auto w-full object-contain"
              unoptimized
            />
          </div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-arom-border bg-white px-4 py-1.5 text-xs font-semibold text-arom shadow-sm">
            <Award size={14} />
            <span>+20 XP • {km ? "ការអនុវត្តដោយសតិ (Mindful Practice)" : "Mindful Practice"}</span>
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-arom sm:text-3xl">
            {km ? "ការអនុវត្តត្រូវបានបញ្ចប់ (Practice Complete)" : "Practice Complete"}
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted sm:text-base">
            {km
              ? `អ្នកបានបញ្ចប់ ${practice.kmTitle || practice.title}`
              : `You finished ${practice.title}`}
          </p>

          <div className="mt-3 flex items-center gap-2 rounded-full bg-white border border-arom-border px-4 py-1.5 text-xs text-ink-muted shadow-sm">
            <Check size={14} className="text-arom" />
            <span>
              {km ? "បានបញ្ចប់វគ្គដកដង្ហើមដោយជោគជ័យ" : "Breathing session completed successfully"}
            </span>
          </div>
        </motion.div>

        {/* Next Actions Section */}
        <div className="mt-10 sm:mt-12">
          <h2 className="text-base font-bold text-arom sm:text-lg">
            {km ? "តើអ្នកចង់ធ្វើអ្វីបន្តទៀត?" : "What would you like to do next?"}
          </h2>

          <div className="mt-4 space-y-3">
            {/* Action 1: Practice Again */}
            <motion.button
              whileHover={{ y: -2 }}
              type="button"
              onClick={onPracticeAgain}
              className="group flex w-full items-center justify-between rounded-2xl border border-arom-border bg-white p-4 text-left shadow-[0_8px_24px_rgba(25,87,72,0.05)] transition-all hover:border-arom/40 hover:shadow-card sm:p-5"
            >
              <div className="flex items-center gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-arom-soft text-arom">
                  <RotateCcw size={22} />
                </span>
                <div>
                  <span className="block text-sm font-bold text-arom sm:text-base">
                    {km ? "អនុវត្តម្តងទៀត (Practice Again)" : "Practice Again"}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-muted">
                    {km
                      ? "បន្តការដកដង្ហើមស្ងប់ចិត្តមួយជុំទៀត"
                      : "Start another 4-minute calming breath round."}
                  </span>
                </div>
              </div>
              <ChevronRight
                size={20}
                className="text-arom transition-transform duration-150 group-hover:translate-x-1"
              />
            </motion.button>

            {/* Action 2: Read Related Lesson */}
            <motion.button
              whileHover={{ y: -2 }}
              type="button"
              onClick={onGoToLearn}
              className="group flex w-full items-center justify-between rounded-2xl border border-arom-border bg-white p-4 text-left shadow-[0_8px_24px_rgba(25,87,72,0.05)] transition-all hover:border-arom/40 hover:shadow-card sm:p-5"
            >
              <div className="flex items-center gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-arom-wash text-arom">
                  <BookOpen size={22} />
                </span>
                <div>
                  <span className="block text-sm font-bold text-arom sm:text-base">
                    {km ? "អានមេរៀនពាក់ព័ន្ធ៖ រៀនអំពីភាពតានតឹង (Learn About Stress)" : "Read Related Lesson: Learn About Stress"}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-muted">
                    {km
                      ? "ស្វែងយល់ពីមូលហេតុ និងសញ្ញានៃភាពតានតឹង"
                      : "Understand how stress works and why breath resets help."}
                  </span>
                </div>
              </div>
              <ChevronRight
                size={20}
                className="text-arom transition-transform duration-150 group-hover:translate-x-1"
              />
            </motion.button>
          </div>
        </div>

        {/* Bottom Back To Practices Link */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={onBackToPractices}
            className="text-xs font-semibold text-arom hover:underline"
          >
            ← {km ? "ត្រឡប់ទៅបញ្ជីការអនុវត្ត" : "Back to All Practices"}
          </button>
        </div>
      </main>
    </div>
  );
}
