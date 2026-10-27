"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { BookOpen, LifeBuoy, Stethoscope, Wind, type LucideIcon } from "lucide-react";
import type { MoodLevel } from "../_components/mood/mood-store";
import { MoodSprout } from "../_components/mood/mood-sprout";

type ResponseAction = { href: string; en: string; km: string; icon: LucideIcon; urgent?: boolean };

const JOURNAL: ResponseAction = { href: "/detection/journal", en: "Write in your journal", km: "សរសេរក្នុងកំណត់ហេតុ", icon: BookOpen };
const BREATHING: ResponseAction = { href: "/mindguide/practice", en: "Breathing practice", km: "លំហាត់ដកដង្ហើម", icon: Wind };
const PROFESSIONAL: ResponseAction = { href: "/professional", en: "Talk to a professional", km: "និយាយជាមួយអ្នកជំនាញ", icon: Stethoscope };
const GET_HELP: ResponseAction = { href: "/profile#get-help-title", en: "Get help now", km: "ជំនួយបន្ទាន់", icon: LifeBuoy, urgent: true };

// A short, kind reply to today's check in. It never judges or diagnoses; on a
// hard day it offers a gentle next step and real help.
const RESPONSES: Record<MoodLevel, { en: string; km: string; actions: ResponseAction[] }> = {
  great: {
    en: "So glad today feels great! Want to write down what made it special?",
    km: "រីករាយណាស់ដែលថ្ងៃនេះអ្នកមានអារម្មណ៍ល្អប្រសើរ! ចង់កត់ត្រាអ្វីដែលធ្វើឱ្យថ្ងៃនេះពិសេសទេ?",
    actions: [JOURNAL],
  },
  good: {
    en: "Glad today feels good. Want to note what helped?",
    km: "សប្បាយចិត្តដែលថ្ងៃនេះអ្នកស្រួលចិត្ត។ ចង់កត់ត្រាអ្វីដែលបានជួយអ្នកទេ?",
    actions: [JOURNAL],
  },
  okay: {
    en: "An okay day still counts. A short breathing break might feel nice.",
    km: "ថ្ងៃធម្មតាក៏មានតម្លៃដែរ។ ការសម្រាកដកដង្ហើមខ្លីៗ អាចធ្វើឱ្យអ្នកស្រួលខ្លួន។",
    actions: [BREATHING],
  },
  low: {
    en: "Thank you for being honest about today. A 3 minute breathing practice might help a little.",
    km: "អរគុណដែលបានប្រាប់ពីអារម្មណ៍ពិតរបស់អ្នកថ្ងៃនេះ។ លំហាត់ដកដង្ហើម ៣ នាទី អាចជួយបានបន្តិច។",
    actions: [BREATHING, PROFESSIONAL],
  },
  very_low: {
    en: "We're sorry today is so hard. You don't have to carry it alone.",
    km: "យើងសោកស្តាយដែលថ្ងៃនេះពិបាកខ្លាំងសម្រាប់អ្នក។ អ្នកមិនចាំបាច់ទ្រាំវាតែម្នាក់ឯងទេ។",
    actions: [GET_HELP, PROFESSIONAL],
  },
};

export function MoodResponse({ mood, km }: { mood: MoodLevel; km: boolean }) {
  const reduce = useReducedMotion();
  const response = RESPONSES[mood];

  return (
    <motion.div
      key={mood}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      className="mt-1 flex items-start gap-3 rounded-2xl bg-[#f0f8f5] p-3"
    >
      {/* The sprout breathes slowly, like a calm breath (about 4 seconds). */}
      <motion.span
        className="flex shrink-0 origin-bottom"
        animate={reduce ? { scale: 1 } : { scale: [1, 1.05, 1] }}
        transition={reduce ? { duration: 0 } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <MoodSprout mood={mood} className="h-14 w-auto" />
      </motion.span>
      <div className="min-w-0">
        <p className="text-sm leading-snug text-[#14221f]">{km ? response.km : response.en}</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {response.actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border bg-white px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6f5b] ${
                action.urgent
                  ? "border-arom-danger/25 text-arom-danger hover:bg-arom-danger-soft"
                  : "border-[#cfe5dd] text-[#1f6f5b] hover:bg-[#e0f3ed]"
              }`}
            >
              <action.icon size={14} aria-hidden="true" />
              {km ? action.km : action.en}
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
