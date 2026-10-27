"use client";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  FileText,
  Heart,
  HeartHandshake,
  Layers,
  LayoutGrid,
  Lightbulb,
  MessageSquare,
  Moon,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  Users,
  Wind,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { EducationalNote } from "../educational-note";
import { LanguageQuickToggle, useLanguage } from "../language-provider";
import { chooseLabel, useMindGuidePick } from "../mindguide-pick";
import { ReportProblemButton } from "../report-problem";
import { toggleSaved } from "../saved/saved-store";
import { useSavedIds } from "../saved/use-saved";
import type { TipItem, TipStep } from "./tips-data";
import { getPlanTryNowItems, toggleTryNowInPlan } from "./tips-plan";

type TipCardDeckViewProps = {
  tip: TipItem;
  onBack: () => void;
  onComplete: () => void;
  onOpenBreathing?: () => void;
  onOpenProfessional?: () => void;
  preview?: boolean;
};

type StepVisualConfig = {
  stepNumber: number;
  icon: typeof SlidersHorizontal;
  colorName: string;
  bgClass: string;
  badgeClass: string;
  ringClass: string;
  tagline: string;
  kmTagline: string;
};

const FALLBACK_CONFIGS: Omit<StepVisualConfig, "stepNumber">[] = [
  {
    icon: SlidersHorizontal,
    colorName: "emerald",
    bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
    badgeClass: "bg-emerald-100 text-emerald-800",
    ringClass: "ring-emerald-500/20",
    tagline: "Action Step",
    kmTagline: "ជំហានអនុវត្ត",
  },
  {
    icon: Heart,
    colorName: "rose",
    bgClass: "bg-rose-50 text-rose-700 border-rose-200/70",
    badgeClass: "bg-rose-100 text-rose-800",
    ringClass: "ring-rose-500/20",
    tagline: "Emotional Care",
    kmTagline: "ការថែទាំអារម្មណ៍",
  },
  {
    icon: RefreshCw,
    colorName: "indigo",
    bgClass: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
    badgeClass: "bg-indigo-100 text-indigo-800",
    ringClass: "ring-indigo-500/20",
    tagline: "Mindset Shift",
    kmTagline: "ការផ្លាស់ប្តូរផ្នត់គំនិត",
  },
  {
    icon: Users,
    colorName: "teal",
    bgClass: "bg-teal-50 text-teal-700 border-teal-200/70",
    badgeClass: "bg-teal-100 text-teal-800",
    ringClass: "ring-teal-500/20",
    tagline: "Connection & Support",
    kmTagline: "ការតភ្ជាប់ និងជំនួយ",
  },
  {
    icon: Activity,
    colorName: "amber",
    bgClass: "bg-amber-50 text-amber-800 border-amber-200/70",
    badgeClass: "bg-amber-100 text-amber-900",
    ringClass: "ring-amber-500/20",
    tagline: "Physical Wellbeing",
    kmTagline: "សុខុមាលភាពរាងកាយ",
  },
  {
    icon: Wind,
    colorName: "cyan",
    bgClass: "bg-cyan-50 text-cyan-800 border-cyan-200/70",
    badgeClass: "bg-cyan-100 text-cyan-900",
    ringClass: "ring-cyan-500/20",
    tagline: "Nervous System Reset",
    kmTagline: "បន្ថយភាពតានតឹងប្រព័ន្ធប្រសាទ",
  },
];

const TIP_STEP_CONFIGS: Record<string, Record<number, StepVisualConfig>> = {
  "how-to-control-stress": {
    1: {
      stepNumber: 1,
      icon: SlidersHorizontal,
      colorName: "emerald",
      bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
      badgeClass: "bg-emerald-100 text-emerald-800",
      ringClass: "ring-emerald-500/20",
      tagline: "Action Boundary",
      kmTagline: "កំណត់ព្រំដែនសកម្មភាព",
    },
    2: {
      stepNumber: 2,
      icon: Heart,
      colorName: "rose",
      bgClass: "bg-rose-50 text-rose-700 border-rose-200/70",
      badgeClass: "bg-rose-100 text-rose-800",
      ringClass: "ring-rose-500/20",
      tagline: "Emotional Energy",
      kmTagline: "ថាមពលអារម្មណ៍",
    },
    3: {
      stepNumber: 3,
      icon: RefreshCw,
      colorName: "indigo",
      bgClass: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
      badgeClass: "bg-indigo-100 text-indigo-800",
      ringClass: "ring-indigo-500/20",
      tagline: "Cognitive Reframing",
      kmTagline: "ការកែសម្រួលគំនិត",
    },
    4: {
      stepNumber: 4,
      icon: Users,
      colorName: "teal",
      bgClass: "bg-teal-50 text-teal-700 border-teal-200/70",
      badgeClass: "bg-teal-100 text-teal-800",
      ringClass: "ring-teal-500/20",
      tagline: "Social Connection",
      kmTagline: "ការភ្ជាប់ទំនាក់ទំនង",
    },
    5: {
      stepNumber: 5,
      icon: Activity,
      colorName: "amber",
      bgClass: "bg-amber-50 text-amber-800 border-amber-200/70",
      badgeClass: "bg-amber-100 text-amber-900",
      ringClass: "ring-amber-500/20",
      tagline: "Physical Care",
      kmTagline: "ការថែទាំរាងកាយ",
    },
    6: {
      stepNumber: 6,
      icon: Wind,
      colorName: "cyan",
      bgClass: "bg-cyan-50 text-cyan-800 border-cyan-200/70",
      badgeClass: "bg-cyan-100 text-cyan-900",
      ringClass: "ring-cyan-500/20",
      tagline: "Nervous System Reset",
      kmTagline: "បន្ថយភាពតានតឹងប្រព័ន្ធប្រសាទ",
    },
  },
  "sleep-hygiene-essentials": {
    1: {
      stepNumber: 1,
      icon: Clock,
      colorName: "amber",
      bgClass: "bg-amber-50 text-amber-800 border-amber-200/70",
      badgeClass: "bg-amber-100 text-amber-900",
      ringClass: "ring-amber-500/20",
      tagline: "Circadian Rhythm",
      kmTagline: "ចង្វាក់ជីវសាស្ត្រដំណេក",
    },
    2: {
      stepNumber: 2,
      icon: FileText,
      colorName: "indigo",
      bgClass: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
      badgeClass: "bg-indigo-100 text-indigo-800",
      ringClass: "ring-indigo-500/20",
      tagline: "Mental Offloading",
      kmTagline: "ការជម្រះគំនិត",
    },
    3: {
      stepNumber: 3,
      icon: Wind,
      colorName: "cyan",
      bgClass: "bg-cyan-50 text-cyan-800 border-cyan-200/70",
      badgeClass: "bg-cyan-100 text-cyan-900",
      ringClass: "ring-cyan-500/20",
      tagline: "Vagal Calming",
      kmTagline: "ការបន្ថយចង្វាក់បេះដូង",
    },
    4: {
      stepNumber: 4,
      icon: Moon,
      colorName: "indigo",
      bgClass: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
      badgeClass: "bg-indigo-100 text-indigo-800",
      ringClass: "ring-indigo-500/20",
      tagline: "Digital Sunset",
      kmTagline: "ការកាត់បន្ថយអេក្រង់",
    },
    5: {
      stepNumber: 5,
      icon: Compass,
      colorName: "teal",
      bgClass: "bg-teal-50 text-teal-700 border-teal-200/70",
      badgeClass: "bg-teal-100 text-teal-800",
      ringClass: "ring-teal-500/20",
      tagline: "Sleep Sanctuary",
      kmTagline: "បរិយាកាសដំណេក",
    },
  },
  "calming-racing-thoughts": {
    1: {
      stepNumber: 1,
      icon: Compass,
      colorName: "emerald",
      bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
      badgeClass: "bg-emerald-100 text-emerald-800",
      ringClass: "ring-emerald-500/20",
      tagline: "Mindful Awareness",
      kmTagline: "សតិដឹងនៃគំនិត",
    },
    2: {
      stepNumber: 2,
      icon: FileText,
      colorName: "indigo",
      bgClass: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
      badgeClass: "bg-indigo-100 text-indigo-800",
      ringClass: "ring-indigo-500/20",
      tagline: "Expressive Unloading",
      kmTagline: "ការបញ្ចេញគំនិត",
    },
    3: {
      stepNumber: 3,
      icon: Activity,
      colorName: "amber",
      bgClass: "bg-amber-50 text-amber-800 border-amber-200/70",
      badgeClass: "bg-amber-100 text-amber-900",
      ringClass: "ring-amber-500/20",
      tagline: "Sensory Grounding",
      kmTagline: "ទប់លំនឹងដោយវិញ្ញាណ",
    },
    4: {
      stepNumber: 4,
      icon: Wind,
      colorName: "cyan",
      bgClass: "bg-cyan-50 text-cyan-800 border-cyan-200/70",
      badgeClass: "bg-cyan-100 text-cyan-900",
      ringClass: "ring-cyan-500/20",
      tagline: "Vagal Reset",
      kmTagline: "ដកដង្ហើមបន្ថយការថប់បារម្ភ",
    },
    5: {
      stepNumber: 5,
      icon: Calendar,
      colorName: "teal",
      bgClass: "bg-teal-50 text-teal-700 border-teal-200/70",
      badgeClass: "bg-teal-100 text-teal-800",
      ringClass: "ring-teal-500/20",
      tagline: "Worry Postponement",
      kmTagline: "ការកំណត់ពេលដោះស្រាយ",
    },
  },
  "setting-gentle-boundaries": {
    1: {
      stepNumber: 1,
      icon: Clock,
      colorName: "emerald",
      bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
      badgeClass: "bg-emerald-100 text-emerald-800",
      ringClass: "ring-emerald-500/20",
      tagline: "Pause Space",
      kmTagline: "ការផ្អាកចិត្ត",
    },
    2: {
      stepNumber: 2,
      icon: MessageSquare,
      colorName: "indigo",
      bgClass: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
      badgeClass: "bg-indigo-100 text-indigo-800",
      ringClass: "ring-indigo-500/20",
      tagline: "Clear Expression",
      kmTagline: "ការបញ្ជាក់ជំហរ",
    },
    3: {
      stepNumber: 3,
      icon: ShieldCheck,
      colorName: "amber",
      bgClass: "bg-amber-50 text-amber-800 border-amber-200/70",
      badgeClass: "bg-amber-100 text-amber-900",
      ringClass: "ring-amber-500/20",
      tagline: "Healthy Boundary",
      kmTagline: "ព្រំដែនផ្លូវចិត្ត",
    },
    4: {
      stepNumber: 4,
      icon: HeartHandshake,
      colorName: "teal",
      bgClass: "bg-teal-50 text-teal-700 border-teal-200/70",
      badgeClass: "bg-teal-100 text-teal-800",
      ringClass: "ring-teal-500/20",
      tagline: "Doable Alternative",
      kmTagline: "ជម្រើសសមស្រប",
    },
    5: {
      stepNumber: 5,
      icon: Moon,
      colorName: "rose",
      bgClass: "bg-rose-50 text-rose-700 border-rose-200/70",
      badgeClass: "bg-rose-100 text-rose-800",
      ringClass: "ring-rose-500/20",
      tagline: "Rest Protection",
      kmTagline: "ការការពារការសម្រាក",
    },
  },
  "mindful-digital-detox": {
    1: {
      stepNumber: 1,
      icon: Compass,
      colorName: "teal",
      bgClass: "bg-teal-50 text-teal-700 border-teal-200/70",
      badgeClass: "bg-teal-100 text-teal-800",
      ringClass: "ring-teal-500/20",
      tagline: "Physical Distance",
      kmTagline: "គម្លាតរាងកាយ",
    },
    2: {
      stepNumber: 2,
      icon: SlidersHorizontal,
      colorName: "amber",
      bgClass: "bg-amber-50 text-amber-800 border-amber-200/70",
      badgeClass: "bg-amber-100 text-amber-900",
      ringClass: "ring-amber-500/20",
      tagline: "Attention Shield",
      kmTagline: "ការការពារការផ្តោតអារម្មណ៍",
    },
    3: {
      stepNumber: 3,
      icon: Wind,
      colorName: "cyan",
      bgClass: "bg-cyan-50 text-cyan-800 border-cyan-200/70",
      badgeClass: "bg-cyan-100 text-cyan-900",
      ringClass: "ring-cyan-500/20",
      tagline: "Mindful Pause",
      kmTagline: "ការផ្អាកស្មារតី",
    },
    4: {
      stepNumber: 4,
      icon: Heart,
      colorName: "emerald",
      bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
      badgeClass: "bg-emerald-100 text-emerald-800",
      ringClass: "ring-emerald-500/20",
      tagline: "Screen-Free Meals",
      kmTagline: "ការញ៉ាំអាហារដោយមានសតិ",
    },
    5: {
      stepNumber: 5,
      icon: Moon,
      colorName: "indigo",
      bgClass: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
      badgeClass: "bg-indigo-100 text-indigo-800",
      ringClass: "ring-indigo-500/20",
      tagline: "Evening Unwind",
      kmTagline: "ការសម្រាកពេលយប់",
    },
  },
  "im-overthinking-right-now": {
    1: {
      stepNumber: 1,
      icon: Clock,
      colorName: "amber",
      bgClass: "bg-amber-50 text-amber-800 border-amber-200/70",
      badgeClass: "bg-amber-100 text-amber-900",
      ringClass: "ring-amber-500/20",
      tagline: "Conscious Pause",
      kmTagline: "ការផ្អាកស្មារតី",
    },
    2: {
      stepNumber: 2,
      icon: Compass,
      colorName: "indigo",
      bgClass: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
      badgeClass: "bg-indigo-100 text-indigo-800",
      ringClass: "ring-indigo-500/20",
      tagline: "Fact vs Fear",
      kmTagline: "ការពិត និងការភ័យខ្លាច",
    },
    3: {
      stepNumber: 3,
      icon: Activity,
      colorName: "emerald",
      bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
      badgeClass: "bg-emerald-100 text-emerald-800",
      ringClass: "ring-emerald-500/20",
      tagline: "Present Grounding",
      kmTagline: "ការតាំងចិត្តនឹងបច្ចុប្បន្ន",
    },
  },
};

const TIP_STEP_HINTS: Record<string, Record<number, { hint: string; kmHint: string }>> = {
  "how-to-control-stress": {
    1: {
      hint: "Give yourself permission to pause an unimportant chore or say a polite 'no' to one non-essential demand.",
      kmHint: "អនុញ្ញាតឱ្យខ្លួនឯងសម្រាកពីការងារមិនសំខាន់មួយ ឬបដិសេធសំណើដែលមិនចាំបាច់។",
    },
    2: {
      hint: "Protect this small window without guilt. Genuine rest restores emotional reserves and clears mental fog.",
      kmHint: "ការពារពេលវេលានេះដោយមិនមានអារម្មណ៍ខុសឆ្គង។ ការសម្រាកពិតប្រាកដជួយស្តារថាមពលផ្លូវចិត្ត។",
    },
    3: {
      hint: "Notice exaggerated thoughts like 'I cannot handle this', and soften them into 'This is challenging, but I will take it step by step.'",
      kmHint: "កត់សម្គាល់គំនិតតានតឹង ហើយប្តូរវាទៅជា 'រឿងនេះពិបាក ប៉ុន្តែខ្ញុំអាចដោះស្រាយម្តងមួយជំហានបាន'។",
    },
    4: {
      hint: "You do not need to explain everything. Reaching out with a short message breaks the feeling of isolation.",
      kmHint: "អ្នកមិនចាំបាច់ពន្យល់គ្រប់រឿងទេ។ គ្រាន់តែផ្ញើសារខ្លីមួយជួយកាត់បន្ថយអារម្មណ៍ឯកោ។",
    },
    5: {
      hint: "Gentle physical movement burns off excess stress hormones and signals your muscles to unclamp.",
      kmHint: "ចលនារាងកាយស្រាលៗជួយកាត់បន្ថយអ័រម៉ូនស្ត្រេស និងជួយឱ្យសាច់ដុំដែលតឹងណែនបានធូរស្រាល។",
    },
    6: {
      hint: "Inhale for 4 seconds, hold gently for 7, and exhale slowly for 8 to reset your parasympathetic nervous system.",
      kmHint: "ដកដង្ហើមចូល ៤ វិនាទី ទប់ ៧ វិនាទី និងដកចេញយឺតៗ ៨ វិនាទី ដើម្បីឱ្យប្រព័ន្ធប្រសាទស្ងប់។",
    },
  },
  "sleep-hygiene-essentials": {
    1: {
      hint: "Your biological clock resets with morning sunlight. Waking up at the same hour daily anchors evening sleep pressure.",
      kmHint: "នាឡិកាជីវសាស្ត្រកំណត់ឡើងវិញជាមួយពន្លឺព្រឹកព្រលឹម។ ការក្រោកទៀងទាត់ជួយឱ្យងងុយគេងទាន់ពេលពេលយប់។",
    },
    2: {
      hint: "Externalizing unaddressed worries tells your brain they are safely recorded, allowing working memory to rest.",
      kmHint: "ការកត់ត្រាការព្រួយបារម្ភទុក ប្រាប់ខួរក្បាលថាពួកវាមានសុវត្ថិភាព ជួយឱ្យចិត្តស្ងប់លែងបារម្ភ។",
    },
    3: {
      hint: "Slow extended exhales physically cue your heart rate to drop and suppress evening cortisol.",
      kmHint: "ការដកដង្ហើមចេញយឺតៗជួយបន្ថយចង្វាក់បេះដូង និងកាត់បន្ថយអ័រម៉ូនស្ត្រេសពេលយប់។",
    },
    4: {
      hint: "Blue light blocks natural melatonin release. Switching screens off lets your natural sleep cycle begin.",
      kmHint: "ពន្លឺអេក្រង់ទប់ស្កាត់អ័រម៉ូនមេឡាតូនីន។ ការបិទអេក្រង់ជួយឱ្យអ្នកគេងលក់ដោយធម្មជាតិ។",
    },
    5: {
      hint: "Your core temperature must drop 1 to 2 degrees to trigger deep sleep. Cool airflow promotes sound rest.",
      kmHint: "សីតុណ្ហភាពរាងកាយត្រូវការចុះត្រជាក់បន្តិចដើម្បីគេងលក់ស្កប់។ ខ្យល់ត្រជាក់ជួយឱ្យសម្រាកបានល្អ។",
    },
  },
  "calming-racing-thoughts": {
    1: {
      hint: "Saying 'I notice my mind is spinning' creates healthy psychological distance. Thoughts are passing mental events, not facts.",
      kmHint: "ការប្រាប់ខ្លួនឯងថា 'ខ្ញុំកំពុងកត់សម្គាល់គំនិត' ជួយបង្កើតគម្លាតផ្លូវចិត្ត។ គំនិតមិនមែនជាការពិតទាំងអស់ទេ។",
    },
    2: {
      hint: "Writing freely without self-censoring empties your working memory and breaks repetitive cognitive loops.",
      kmHint: "ការសរសេរដោយមិនបាច់កែតម្រូវ ជួយសម្អាតខួរក្បាល និងកាត់ផ្តាច់វដ្តគំនិតដែលវិលវល់។",
    },
    3: {
      hint: "Focusing on 3 physical textures activates sensory circuits, pulling attention away from imagined catastrophes.",
      kmHint: "ការប៉ះវត្ថុ ៣ យ៉ាងជួយទាញចិត្តត្រឡប់មកកាន់បច្ចុប្បន្នកាល ឆ្ងាយពីការព្រួយបារម្ភ។",
    },
    4: {
      hint: "Slow rhythmic 4-7-8 breathing switches off the sympathetic adrenaline response and restores emotional calm.",
      kmHint: "ការដកដង្ហើមចង្វាក់ ៤, ៧, ៨ បិទប្រព័ន្ធរោទិ៍អាសន្ន និងជួយឱ្យអារម្មណ៍ស្ងប់ឡើងវិញ។",
    },
    5: {
      hint: "Postponing worry to a dedicated 15-minute window gives your mind permission to stop ruminating now.",
      kmHint: "ការកំណត់ពេលជួយឱ្យខួរក្បាលសម្រាក៖ 'ខ្ញុំនឹងដោះស្រាយរឿងនេះនៅម៉ោង ៤ រសៀល'។",
    },
  },
  "setting-gentle-boundaries": {
    1: {
      hint: "Saying 'Let me check my calendar' breaks the automatic urge to overcommit, giving you space to reflect.",
      kmHint: "ការឆ្លើយថា 'ខ្ញុំសុំពិនិត្យកាលវិភាគសិន' ជួយកាត់ផ្តាច់ទម្លាប់យល់ព្រមភ្លាមៗ និងផ្តល់ពេលឱ្យអ្នកគិត។",
    },
    2: {
      hint: "Clear boundaries do not require lengthy defenses. Stating what you can or cannot do is respectful to both sides.",
      kmHint: "ការកំណត់ព្រំដែនមិនត្រូវការការបកស្រាយវែងឆ្ងាយទេ។ ការបញ្ជាក់ពីអ្វីដែលអ្នកអាចធ្វើបាន គឺបង្ហាញការគោរពទាំងសងខាង។",
    },
    3: {
      hint: "Discomfort is the price of admission for self-respect. Notice any guilt without letting it dictate your decision.",
      kmHint: "ភាពទើសទាល់ជាអារម្មណ៍ធម្មតានៅពេលអ្នកចាប់ផ្តើមការពារខ្លួន។ កត់សម្គាល់អារម្មណ៍នោះ ប៉ុន្តែកុំបណ្តោយឱ្យវាបញ្ជាអ្នក។",
    },
    4: {
      hint: "Offering a realistic counter window shows care while protecting your energy from becoming drained.",
      kmHint: "ការផ្តល់ពេលវេលាជាក់លាក់ដែលអ្នកអាចជួយបាន បង្ហាញពីការយកចិត្តទុកដាក់ និងជួយការពារថាមពលផ្ទាល់ខ្លួន។",
    },
    5: {
      hint: "Unprotected rest turns into unpaid overtime. Treat your recovery appointments with the same respect as work meetings.",
      kmHint: "ការសម្រាកដែលគ្មានការការពារនឹងត្រូវគេដណ្តើមយក។ សូមចាត់ទុកពេលវេលាសម្រាករបស់អ្នកថាមានតម្លៃស្មើនឹងការងារសំខាន់។",
    },
  },
  "mindful-digital-detox": {
    1: {
      hint: "Physical distance breaks subconscious phone pickup loops. Adding just a few steps makes every check intentional.",
      kmHint: "គម្លាតរាងកាយជួយកាត់ផ្តាច់ទម្លាប់លូកចាប់ទូរស័ព្ទ។ ការដើរបីជំហានទៅយកទូរស័ព្ទ ជួយឱ្យអ្នកមានស្មារតីដឹងខ្លួន។",
    },
    2: {
      hint: "Red notification bubbles trigger alertness in the amygdala. Silencing non-urgent apps returns control to your focus.",
      kmHint: "សញ្ញាលេខក្រហមដាស់ប្រព័ន្ធប្រសាទឱ្យប្រុងប្រយ័ត្ន។ ការបិទវាជួយឱ្យអ្នកគ្រប់គ្រងការផ្តោតអារម្មណ៍ឡើងវិញ។",
    },
    3: {
      hint: "Urges to scroll peak like ocean waves and decline within a few minutes if you pause and breathe through them.",
      kmHint: "ចំណង់ចង់មើលទូរស័ព្ទឡើងខ្ពស់មួយភ្លែត ហើយនឹងចុះថយវិញយ៉ាងលឿន ប្រសិនបើអ្នកផ្អាកចិត្ត ហើយដកដង្ហើមស្ងប់។",
    },
    4: {
      hint: "Focusing on the flavors and textures of your meal reduces stress hormones and helps your digestive system rest.",
      kmHint: "ការយកចិត្តទុកដាក់លើរសជាតិអាហារជួយកាត់បន្ថយអ័រម៉ូនស្ត្រេស និងជួយឱ្យប្រព័ន្ធរំលាយអាហារដំណើរការបានល្អ។",
    },
    5: {
      hint: "Blue light suppresses melatonin for up to two hours. Disconnecting before bed allows deep restorative sleep cycles.",
      kmHint: "ពន្លឺពណ៌ខៀវពន្យារអ័រម៉ូនដំណេកដល់ទៅពីរម៉ោង។ ការបិទអេក្រង់ជួយឱ្យរាងកាយគេងលក់ស្កប់ស្កល់។",
    },
  },
  "im-overthinking-right-now": {
    1: {
      hint: "Relax your jaw and drop your shoulders. Physical softening sends direct safety signals to your nervous system.",
      kmHint: "បន្ធូរថ្គាម និងទម្លាក់ស្មាឱ្យស្រួល។ ការបន្ធូរសាច់ដុំជួយប្រាប់ប្រព័ន្ធប្រសាទថាអ្នកមានសុវត្ថិភាព។",
    },
    2: {
      hint: "Having a thought does not make it a fact. Notice what is real versus what your anxiety is predicting.",
      kmHint: "គំនិតមិនមែនសុទ្ធតែជាការពិតទាំងអស់ទេ។ កត់សម្គាល់អ្វីដែលជាក់ស្តែង ធៀបនឹងអ្វីដែលចិត្តកំពុងព្រួយបារម្ភ។",
    },
    3: {
      hint: "Focusing on immediate sensory details pulls mental bandwidth out of hypothetical future scenarios.",
      kmHint: "ការផ្តោតលើអ្វីដែលនៅជុំវិញខ្លួនជួយទាញចិត្តចេញពីការស្រមើស្រមៃអវិជ្ជមានក្នុងអនាគត។",
    },
  },
};

function getStepVisualConfig(tipId: string, stepNumber: number): StepVisualConfig {
  const custom = TIP_STEP_CONFIGS[tipId]?.[stepNumber];
  if (custom) return custom;
  const fallback = FALLBACK_CONFIGS[(stepNumber - 1) % FALLBACK_CONFIGS.length] || FALLBACK_CONFIGS[0];
  return { ...fallback, stepNumber };
}

function getStepHint(tipId: string, stepNumber: number): { hint: string; kmHint: string } | undefined {
  return TIP_STEP_HINTS[tipId]?.[stepNumber];
}

const KHMER_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
function toKhmerNum(n: number): string {
  return String(n)
    .split("")
    .map((d) => KHMER_DIGITS[Number(d)] ?? d)
    .join("");
}

export function TipCardDeckView({
  tip,
  onBack,
  onComplete,
  onOpenBreathing,
  onOpenProfessional,
  preview = false,
}: TipCardDeckViewProps) {
  const { language } = useLanguage();
  const km = language === "km";
  const pick = useMindGuidePick();
  const shouldReduceMotion = useReducedMotion();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [viewMode, setViewMode] = useState<"deck" | "grid">("deck");
  const [showSummary, setShowSummary] = useState(false);

  const bookmarked = useSavedIds("tip").includes(tip.id);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [planStepNumbers, setPlanStepNumbers] = useState<number[]>(() => {
    return getPlanTryNowItems().map((i) => i.stepNumber);
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalSteps = tip.steps.length;
  const currentStep: TipStep | undefined = tip.steps[currentIndex];

  const handleToggleBookmark = () => {
    if (preview) return;
    toggleSaved("tip", tip.id);
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
          ? "បានលុបចេញពីផែនការទំព័រដើម"
          : "Removed from your Home Screen Plan"
      );
    }
    window.setTimeout(() => setToastMessage(null), 2800);
  };

  const goToNextCard = () => {
    if (currentIndex < totalSteps - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const goToPrevCard = () => {
    if (showSummary) {
      setShowSummary(false);
      return;
    }
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const jumpToStep = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setShowSummary(false);
    setViewMode("deck");
  };

  // Keyboard navigation for card deck
  useEffect(() => {
    if (viewMode !== "deck") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (currentIndex < totalSteps - 1) {
          setDirection(1);
          setCurrentIndex((prev) => prev + 1);
        } else {
          setShowSummary(true);
        }
      } else if (e.key === "ArrowLeft") {
        if (showSummary) {
          setShowSummary(false);
          return;
        }
        if (currentIndex > 0) {
          setDirection(-1);
          setCurrentIndex((prev) => prev - 1);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, viewMode, showSummary, totalSteps]);

  const activeVisual = currentStep
    ? getStepVisualConfig(tip.id, currentStep.number)
    : null;
  const activeHint = currentStep
    ? getStepHint(tip.id, currentStep.number)
    : undefined;

  return (
    <main className="min-h-screen bg-canvas px-4 pb-28 pt-4 sm:px-6 sm:pt-6 lg:px-10">
      <div className="mx-auto w-full max-w-xl">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            aria-label={km ? "ត្រឡប់ទៅទំព័រមុន" : "Back to tip overview"}
            className="flex size-11 items-center justify-center rounded-full text-arom transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-arom"
          >
            <ArrowLeft aria-hidden="true" size={22} />
          </button>

          {/* Center Title and Status */}
          <div className="text-center">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-arom-accent">
              {km ? "កាតគន្លឹះរហ័ស (Visual Cards)" : "Visual Card Deck"}
            </span>
            <p className="text-xs font-semibold text-arom">
              {showSummary
                ? km
                  ? "សង្ខេបលទ្ធផល"
                  : "Summary Review"
                : km
                ? `កាតទី ${toKhmerNum(currentIndex + 1)} នៃ ${toKhmerNum(totalSteps)}`
                : `Card ${currentIndex + 1} of ${totalSteps}`}
            </p>
          </div>

          {/* Right Action Icons (Language Toggle + Grid/Deck Toggle + Bookmark) */}
          <div className="flex items-center gap-1.5">
            <LanguageQuickToggle />

            <button
              type="button"
              onClick={() => {
                setShowSummary(false);
                setViewMode((prev) => (prev === "deck" ? "grid" : "deck"));
              }}
              aria-label={
                viewMode === "deck"
                  ? km
                    ? "មើលកាតទាំងអស់"
                    : "View all cards grid"
                  : km
                  ? "មើលកាតម្តងមួយ"
                  : "View card deck"
              }
              title={
                viewMode === "deck"
                  ? km
                    ? "មើលកាតទាំងអស់ (Grid)"
                    : "Switch to Grid View"
                  : km
                  ? "មើលកាតម្តងមួយ (Deck)"
                  : "Switch to Story Deck"
              }
              className="flex size-10 items-center justify-center rounded-full border border-arom-border bg-white text-arom transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-arom"
            >
              {viewMode === "deck" ? (
                <LayoutGrid aria-hidden="true" size={18} />
              ) : (
                <Layers aria-hidden="true" size={18} />
              )}
            </button>

            <button
              type="button"
              onClick={handleToggleBookmark}
              aria-label={
                bookmarked
                  ? km
                    ? "លុបចេញពីចំណាំ"
                    : "Remove bookmark"
                  : km
                  ? "រក្សាទុកគន្លឹះ"
                  : "Bookmark tips"
              }
              className={`flex size-10 items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-arom ${
                bookmarked
                  ? "bg-arom text-white shadow-sm"
                  : "border border-arom-border bg-white text-arom hover:bg-arom-wash"
              }`}
            >
              <Bookmark
                aria-hidden="true"
                size={18}
                className={bookmarked ? "fill-current" : ""}
              />
            </button>
          </div>
        </header>

        {/* Story Style Segmented Progress Bar */}
        <div className="mt-4 flex items-center gap-1.5 px-0.5">
          {tip.steps.map((step, idx) => {
            const isCurrent = idx === currentIndex && !showSummary;
            const isVisited = idx <= currentIndex || showSummary;
            const isDone = completedSteps.includes(step.number);

            return (
              <button
                key={step.number}
                type="button"
                onClick={() => jumpToStep(idx)}
                aria-label={
                  km
                    ? `ទៅកាតទី ${toKhmerNum(idx + 1)}: ${step.kmTitle}`
                    : `Go to card ${idx + 1}: ${step.title}`
                }
                className="group relative h-2 flex-1 rounded-full bg-arom/15 overflow-hidden transition-all duration-200"
              >
                <div
                  className={`h-full w-full rounded-full transition-all duration-300 ${
                    isCurrent
                      ? "bg-arom"
                      : isVisited
                      ? isDone
                        ? "bg-emerald-600"
                        : "bg-arom/65"
                      : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* View Mode: Story Deck or Grid */}
        {viewMode === "grid" ? (
          /* ============================================================== */
          /* Grid View Mode: All 6 Visual Cards displayed in responsive grid */
          /* ============================================================== */
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-arom">
                {km
                  ? `កាតគន្លឹះទាំងអស់ (All ${toKhmerNum(totalSteps)} Cards)`
                  : `All ${totalSteps} Practical Cards`}
              </h2>
              <span className="text-xs font-semibold text-ink-muted">
                {completedSteps.length} / {totalSteps} {km ? "បានអនុវត្ត" : "tried"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {tip.steps.map((step, idx) => {
                const config = getStepVisualConfig(tip.id, step.number);
                const IconComponent = config.icon;
                const isDone = completedSteps.includes(step.number);
                const inPlan = planStepNumbers.includes(step.number);

                return (
                  <div
                    key={step.number}
                    className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 hover:shadow-md ${
                      isDone
                        ? "border-arom/40 bg-arom/[0.03]"
                        : "border-arom-border bg-white shadow-sm"
                    }`}
                  >
                    <div>
                      {/* Top badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${config.badgeClass}`}
                        >
                          <IconComponent aria-hidden="true" size={13} />
                          <span>
                            {km
                              ? `គន្លឹះ ${toKhmerNum(step.number)}`
                              : `Card ${step.number}`}
                          </span>
                        </span>

                        {isDone && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 aria-hidden="true" size={14} />
                            <span>{km ? "រួចរាល់" : "Tried"}</span>
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="mt-2.5 text-sm font-bold text-arom">
                        {km ? step.kmTitle : step.title}
                      </h3>

                      {/* Brief Body */}
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink">
                        {km ? step.kmBody : step.body}
                      </p>

                      {/* Try Now micro badge */}
                      <div className="mt-2.5 rounded-xl border border-arom/15 bg-arom-soft/30 p-2.5 text-[11px] text-ink-deep">
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-arom">
                          <Lightbulb aria-hidden="true" size={11} />
                          <span>{km ? "សកម្មភាពអនុវត្ត" : "Micro-Action"}</span>
                        </div>
                        <p className="mt-1 font-semibold text-arom line-clamp-2 leading-snug">
                          {km ? step.kmTryNow : step.tryNow}
                        </p>
                      </div>
                    </div>

                    {/* Bottom actions */}
                    <div className="mt-3 flex items-center justify-between border-t border-arom-border/60 pt-2.5">
                      <button
                        type="button"
                        onClick={() => jumpToStep(idx)}
                        className="text-xs font-semibold text-arom hover:underline"
                      >
                        {km ? "បើកអាន (Open Card)" : "Open Card"}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleTogglePlan(step)}
                          aria-label={
                            inPlan
                              ? km
                                ? "លុបចេញពីផែនការ"
                                : "Remove from plan"
                              : km
                              ? "បន្ថែមទៅផែនការ"
                              : "Add to plan"
                          }
                          className={`rounded-lg p-1.5 transition-colors ${
                            inPlan
                              ? "bg-arom text-white"
                              : "border border-arom-border text-arom hover:bg-arom-wash"
                          }`}
                        >
                          {inPlan ? <Check size={13} /> : <Plus size={13} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStep(step.number)}
                          aria-label={
                            isDone
                              ? km
                                ? "សម្គាល់ថាមិនទាន់សាកល្បង"
                                : "Unmark tried"
                              : km
                              ? "សម្គាល់ថាបានសាកល្បង"
                              : "Mark tried"
                          }
                          className={`rounded-lg p-1.5 transition-colors ${
                            isDone
                              ? "bg-emerald-600 text-white"
                              : "border border-arom-border text-ink-muted hover:bg-arom-wash"
                          }`}
                        >
                          <Check size={13} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Complete Button from Grid */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setShowSummary(true)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-arom text-sm font-semibold text-white shadow-sm transition-all hover:bg-arom-deep active:scale-[0.98]"
              >
                <span>{km ? "ពិនិត្យលទ្ធផលសង្ខេប (Review Summary)" : "Review Summary & Finish"}</span>
                <ArrowRight aria-hidden="true" size={16} />
              </button>
            </div>
          </div>
        ) : showSummary ? (
          /* ============================================================== */
          /* Celebration & Completion Summary Card                           */
          /* ============================================================== */
          <motion.div
            initial={{
              opacity: 0,
              transform: shouldReduceMotion ? "scale(1)" : "scale(0.96)",
            }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="mt-6 rounded-3xl border border-arom-border bg-white p-6 shadow-sm sm:p-8"
          >
            {/* Header Icon */}
            <div className="flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50">
                <CheckCircle2 aria-hidden="true" size={34} />
              </div>
            </div>

            <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-arom sm:text-3xl">
              {km
                ? `អ្នកបានស្វែងយល់គន្លឹះទាំង ${toKhmerNum(totalSteps)} រួចរាល់!`
                : `You Explored All ${totalSteps} Tips!`}
            </h2>

            <p className="mt-2 text-center text-sm text-ink-muted">
              {km
                ? `អ្នកបានចំណាំថានឹងអនុវត្ត ${toKhmerNum(completedSteps.length)} នៃ ${toKhmerNum(totalSteps)} គន្លឹះនៃ «${tip.kmTitle || tip.title}»។`
                : `You marked ${completedSteps.length} of ${totalSteps} practical tips as tried for "${tip.title}".`}
            </p>

            {/* Quick Summary Chips */}
            <div className="mt-6 rounded-2xl bg-[#f4f9f7] p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-arom">
                {km
                  ? `សង្ខេបគន្លឹះទាំង ${toKhmerNum(totalSteps)} (${totalSteps} Key Takeaways)`
                  : `${totalSteps} Key Takeaways`}
              </span>
              <div className="mt-3 space-y-2">
                {tip.steps.map((step) => {
                  const isDone = completedSteps.includes(step.number);
                  return (
                    <div
                      key={step.number}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="flex items-center gap-2 text-ink">
                        <span className="flex size-5 items-center justify-center rounded-full bg-arom text-[10px] font-bold text-white">
                          {step.number}
                        </span>
                        <span className="font-semibold text-arom">
                          {km ? step.kmTitle : step.title}
                        </span>
                      </span>
                      {isDone ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                          <Check size={12} strokeWidth={2.5} />
                          <span>{km ? "បានសាកល្បង" : "Tried"}</span>
                        </span>
                      ) : (
                        <span className="text-ink-muted">
                          {km ? "អាចសាកល្បងពេលក្រោយ" : "For later"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Support Callout */}
            <div className="mt-6 rounded-2xl border border-arom/20 bg-arom-soft/30 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-arom">
                <ShieldCheck aria-hidden="true" size={16} />
                <span>
                  {km
                    ? "ការគាំទ្រវិជ្ជាជីវៈ (Professional Support)"
                    : "Professional Support"}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-ink">
                {km ? tip.supportCallout.kmBody : tip.supportCallout.body}
              </p>
              {onOpenProfessional && !pick && (
                <button
                  type="button"
                  onClick={onOpenProfessional}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-arom px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-arom-deep active:scale-95"
                >
                  <UserCheck aria-hidden="true" size={14} />
                  <span>
                    {km
                      ? tip.supportCallout.kmActionLabel
                      : tip.supportCallout.actionLabel}
                  </span>
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              {pick && (
                <button
                  type="button"
                  onClick={() => pick.choose("tip", tip.id)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-arom text-sm font-semibold text-white shadow-sm transition-all hover:bg-arom-deep active:scale-[0.98]"
                >
                  <CheckCircle2 aria-hidden="true" size={16} />
                  <span>{chooseLabel(pick.clientName, km)}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onComplete}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-arom text-sm font-semibold text-white shadow-sm transition-all hover:bg-arom-deep active:scale-[0.98]"
              >
                <span>{km ? "បញ្ចប់ការអាន (Complete Tips)" : "Complete Tips"}</span>
                <ArrowRight aria-hidden="true" size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSummary(false);
                  setCurrentIndex(0);
                }}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-arom-border bg-white text-xs font-semibold text-arom transition-colors hover:bg-arom-wash"
              >
                <RotateCcw aria-hidden="true" size={14} />
                <span>{km ? "អានឡើងវិញ (Read Again)" : "Read Again From Card 1"}</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* ============================================================== */
          /* Story Deck View Mode: Single Focused Visual Card               */
          /* ============================================================== */
          <div className="mt-5">
            <AnimatePresence mode="wait" custom={direction}>
              {currentStep && activeVisual && (
                <motion.article
                  key={currentStep.number}
                  custom={direction}
                  initial={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          transform:
                            direction > 0
                              ? "translateX(24px) scale(0.98)"
                              : "translateX(-24px) scale(0.98)",
                        }
                  }
                  animate={{
                    opacity: 1,
                    transform: "translateX(0px) scale(1)",
                  }}
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          transform:
                            direction > 0
                              ? "translateX(-24px) scale(0.98)"
                              : "translateX(24px) scale(0.98)",
                        }
                  }
                  transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                  className="overflow-hidden rounded-3xl border border-arom-border bg-white shadow-sm"
                >
                  {/* Top Color Accent Strip */}
                  <div
                    className={`h-2 w-full ${
                      activeVisual.colorName === "emerald"
                        ? "bg-emerald-500"
                        : activeVisual.colorName === "rose"
                        ? "bg-rose-500"
                        : activeVisual.colorName === "indigo"
                        ? "bg-indigo-500"
                        : activeVisual.colorName === "teal"
                        ? "bg-teal-500"
                        : activeVisual.colorName === "amber"
                        ? "bg-amber-500"
                        : "bg-cyan-500"
                    }`}
                  />

                  <div className="p-5 sm:p-7">
                    {/* Unified Step Pill & Reading Duration */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-2 rounded-full border border-arom-border/60 bg-arom-soft/40 px-3 py-1 text-xs font-semibold text-arom">
                        <span className="flex size-5 items-center justify-center rounded-full bg-arom text-[11px] font-bold text-white shadow-2xs">
                          {currentStep.number}
                        </span>
                        <span className="text-arom/50">•</span>
                        <span>{km ? activeVisual.kmTagline : activeVisual.tagline}</span>
                      </div>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1 text-xs font-medium text-ink-muted">
                        <Clock aria-hidden="true" size={13} />
                        <span>~30s</span>
                      </span>
                    </div>

                    {/* Step Emblem / Icon Hero Area */}
                    <div className="mt-5 flex items-start gap-4">
                      <div
                        className={`flex size-14 shrink-0 items-center justify-center rounded-2xl border ${activeVisual.bgClass} shadow-xs ring-4 ${activeVisual.ringClass}`}
                      >
                        <activeVisual.icon aria-hidden="true" size={28} />
                      </div>

                      <div className="min-w-0 flex-1 pt-0.5">
                        <h2 className="text-xl font-bold tracking-tight text-arom sm:text-2xl leading-snug">
                          {km ? currentStep.kmTitle : currentStep.title}
                        </h2>
                      </div>
                    </div>

                    {/* Concise Body Text */}
                    <p className="mt-3.5 text-sm leading-relaxed text-ink/90 sm:text-[15px]">
                      {km ? currentStep.kmBody : currentStep.body}
                    </p>

                    {/* Interactive Micro-Action Capsule */}
                    <div
                      className={`mt-5 overflow-hidden rounded-2xl border transition-all duration-200 ${activeVisual.bgClass}`}
                    >
                      <div className="p-4 sm:p-5">
                        {/* Capsule Header */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-bold text-arom shadow-2xs backdrop-blur-xs">
                            <Lightbulb aria-hidden="true" size={13} className="text-arom" />
                            <span className="uppercase tracking-wider">
                              {km ? "សកម្មភាពអនុវត្តជាក់ស្តែង" : "Today's Micro-Action"}
                            </span>
                          </div>

                          <span className="text-[11px] font-semibold text-arom/80">
                            {km ? "១ ទៅ ២ នាទី" : "1, 2 min"}
                          </span>
                        </div>

                        {/* Primary Action Statement */}
                        <div className="mt-3">
                          <p className="text-base font-bold tracking-tight text-arom sm:text-lg">
                            {km ? `«${currentStep.kmTryNow}»` : `"${currentStep.tryNow}"`}
                          </p>
                          {activeHint && (
                            <p className="mt-1.5 text-xs leading-relaxed text-ink/80 sm:text-sm">
                              {km ? activeHint.kmHint : activeHint.hint}
                            </p>
                          )}
                        </div>

                        {/* Interactive Button for Step 6 Breathing */}
                        {currentStep.hasBreathingAction && onOpenBreathing && (
                          <div className="mt-4 pt-3.5 border-t border-cyan-200/60">
                            <button
                              type="button"
                              onClick={onOpenBreathing}
                              className="inline-flex items-center gap-2 rounded-xl bg-arom px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-arom-deep active:scale-95 cursor-pointer"
                            >
                              <Wind aria-hidden="true" size={15} />
                              <span>
                                {km
                                  ? "ចាប់ផ្តើមការហាត់ដកដង្ហើម ៤, ៧, ៨ ឥឡូវនេះ"
                                  : "Start 4-7-8 Breathing Now (2 min)"}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Interactive Actions on this Card */}
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 border-t border-arom-border/60 pt-4">
                      {/* Add to Home Plan Button */}
                      {!pick && (
                        <button
                          type="button"
                          onClick={() => handleTogglePlan(currentStep)}
                          className={`flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold transition-all cursor-pointer ${
                            planStepNumbers.includes(currentStep.number)
                              ? "bg-arom text-white shadow-sm"
                              : "border border-arom-border bg-white text-arom hover:bg-arom-wash active:scale-[0.98]"
                          }`}
                        >
                          {planStepNumbers.includes(currentStep.number) ? (
                            <Check
                              aria-hidden="true"
                              size={15}
                              strokeWidth={2.5}
                            />
                          ) : (
                            <Plus aria-hidden="true" size={15} strokeWidth={2.5} />
                          )}
                          <span>
                            {planStepNumbers.includes(currentStep.number)
                              ? km
                                ? "ក្នុងផែនការទំព័រដើម"
                                : "In Home Plan"
                              : km
                              ? "បន្ថែមទៅផែនការ (Add to Plan)"
                              : "Add to Home Plan"}
                          </span>
                        </button>
                      )}

                      {/* Mark as tried Checkbox Tracker */}
                      <button
                        type="button"
                        onClick={() => handleToggleStep(currentStep.number)}
                        className={`flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold transition-all cursor-pointer ${
                          completedSteps.includes(currentStep.number)
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "border border-arom-border bg-white text-ink-muted hover:bg-arom-wash hover:text-arom active:scale-[0.98]"
                        } ${pick ? "w-full" : ""}`}
                      >
                        <Check aria-hidden="true" size={15} strokeWidth={2.5} />
                        <span>
                          {completedSteps.includes(currentStep.number)
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
                </motion.article>
              )}
            </AnimatePresence>

            {/* Card Deck Bottom Navigation Controls */}
            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goToPrevCard}
                disabled={currentIndex === 0}
                className={`flex h-12 items-center gap-1.5 rounded-2xl px-4 text-xs font-semibold transition-colors ${
                  currentIndex === 0
                    ? "cursor-not-allowed text-ink-muted/40"
                    : "border border-arom-border bg-white text-arom hover:bg-arom-wash active:scale-95"
                }`}
              >
                <ChevronLeft aria-hidden="true" size={18} />
                <span>{km ? "មុន" : "Previous"}</span>
              </button>

              {/* Progress counter text */}
              <div className="text-center text-xs font-semibold text-ink-muted">
                {currentIndex + 1} / {totalSteps}
              </div>

              <button
                type="button"
                onClick={goToNextCard}
                className="flex h-12 items-center gap-1.5 rounded-2xl bg-arom px-5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-arom-deep active:scale-95"
              >
                <span>
                  {currentIndex === totalSteps - 1
                    ? km
                      ? "ពិនិត្យលទ្ធផល (Review)"
                      : "Review & Finish"
                    : km
                    ? "គន្លឹះបន្ទាប់"
                    : "Next Tip"}
                </span>
                <ChevronRight aria-hidden="true" size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Source Citation & Educational Note */}
        <div className="mt-8 text-center text-xs text-ink-muted">
          <p>{km ? tip.kmSourceCitation : tip.sourceCitation}</p>
        </div>

        <EducationalNote className="mt-4" />

        {!preview && (
          <div className="mt-6 flex justify-center">
            <ReportProblemButton
              target={{ type: "tip", sourceId: tip.id }}
              itemTitle={km ? tip.kmTitle : tip.title}
            />
          </div>
        )}
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
