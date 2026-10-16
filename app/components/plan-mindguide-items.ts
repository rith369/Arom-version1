import type { DailyPlanSource } from "../_components/daily-plan-store";

// MindGuide lessons and practices offered in the plan's Add window
// (plan-editor-dialog.tsx). Adding one saves it as a plan task.
export type CuratedPlanItem = {
  id: string;
  source: DailyPlanSource;
  title: string;
  titleKm: string;
  subtitle: string;
  subtitleKm: string;
  description: string;
  descriptionKm: string;
  category: "all" | "practice" | "learn" | "guide" | "tips";
  categoryLabel: string;
  categoryLabelKm: string;
  duration: string;
  durationKm: string;
  estimatedMinutes: number;
  badge: string;
  badgeKm: string;
  icon: string;
  image: string;
  href: string;
};

export const CURATED_ACTIVITIES: CuratedPlanItem[] = [
  {
    id: "interactive-breathing",
    source: "practice",
    title: "Interactive Breathing Exercise",
    titleKm: "ការហាត់ដកដង្ហើម (Breathing Exercise)",
    subtitle: "4 mins • Guided 4-4 pacing for nervous system calm",
    subtitleKm: "៤ នាទី • ការដកដង្ហើមតាមចង្វាក់ ៤-៤ ជួយសម្រួលចិត្ត",
    description: "Follow the rhythmic expanding orb to slow heart rate and ground your mind.",
    descriptionKm: "ដកដង្ហើមតាមចលនារង្វង់ដើម្បីសម្រួលប្រព័ន្ធប្រសាទ និងកាត់បន្ថយភាពតានតឹង។",
    category: "practice",
    categoryLabel: "Practice",
    categoryLabelKm: "ការអនុវត្ត (Practice)",
    duration: "4 mins",
    durationKm: "៤ នាទី",
    estimatedMinutes: 4,
    badge: "Practice",
    badgeKm: "ការអនុវត្ត (Practice)",
    icon: "hugeicons_yoga-03",
    image: "/mindguide/icon-11.svg",
    href: "/practice",
  },
  {
    id: "learn-about-stress",
    source: "learn",
    title: "Learn About Stress",
    titleKm: "ស្វែងយល់ពីភាពតានតឹង (Learn About Stress)",
    subtitle: "6 mins • Clinical coping tools and biological triggers",
    subtitleKm: "៦ នាទី • ស្វែងយល់ពីប្រភព និងវិធីដោះស្រាយភាពតានតឹង",
    description: "Understand acute versus chronic stress, somatic signals, and self-compassion.",
    descriptionKm: "ស្វែងយល់ពីភាពខុសគ្នានៃភាពតានតឹង និងរបៀបថែរក្សាផ្លូវចិត្តដោយមេត្តាធម៌។",
    category: "learn",
    categoryLabel: "Learn",
    categoryLabelKm: "ស្វែងយល់ (Learn)",
    duration: "6 mins",
    durationKm: "៦ នាទី",
    estimatedMinutes: 6,
    badge: "Learn",
    badgeKm: "ស្វែងយល់ (Learn)",
    icon: "ant-design_play-circle-filled",
    image: "/mindguide/icon-10.svg",
    href: "/learn",
  },
  {
    id: "managing-daily-stress",
    source: "guide",
    title: "Managing Daily Stress",
    titleKm: "ការគ្រប់គ្រងភាពតានតឹងប្រចាំថ្ងៃ (Managing Daily Stress)",
    subtitle: "5 mins • Micro-recovery routines for burnout prevention",
    subtitleKm: "៥ នាទី • ជំហានសម្រាកខ្លីៗការពារការអស់កម្លាំងចិត្ត",
    description: "Actionable micro-habits, boundary setting, and cognitive rest methods.",
    descriptionKm: "វិធីសាស្ត្រអនុវត្តជាក់ស្តែងជួយការពារការហត់នឿយផ្លូវចិត្តក្នុងជីវិតប្រចាំថ្ងៃ។",
    category: "guide",
    categoryLabel: "Stress Guide",
    categoryLabelKm: "ការណែនាំ (Guide)",
    duration: "5 mins",
    durationKm: "៥ នាទី",
    estimatedMinutes: 5,
    badge: "Guide",
    badgeKm: "ការណែនាំ (Guide)",
    icon: "boxicons_note-filled",
    image: "/mindguide/icon-7.svg",
    href: "/mindguide/managing-daily-stress",
  },
  {
    id: "mindful-body-scan",
    source: "practice",
    title: "Mindful Body Scan",
    titleKm: "ការពិនិត្យរាងកាយដោយសតិ (Body Scan)",
    subtitle: "8 mins • Release tension held in shoulders, neck, and back",
    subtitleKm: "៨ នាទី • បន្ធូរបន្ថយភាពតានតឹងសាច់ដុំពីក្បាលដល់ចុងជើង",
    description: "Gentle head to toe somatic scanning to release physical holding patterns.",
    descriptionKm: "កត់សម្គាល់អារម្មណ៍រាងកាយពីក្បាលដល់ចុងជើងដោយចិត្តស្ងប់ និងបើកចំហ។",
    category: "practice",
    categoryLabel: "Practice",
    categoryLabelKm: "ការអនុវត្ត (Practice)",
    duration: "8 mins",
    durationKm: "៨ នាទី",
    estimatedMinutes: 8,
    badge: "Practice",
    badgeKm: "ការអនុវត្ត (Practice)",
    icon: "hugeicons_yoga-03",
    image: "/mindguide/strategies.png",
    href: "/practice",
  },
  {
    id: "sensory-grounding",
    source: "practice",
    title: "5-4-3-2-1 Sensory Grounding",
    titleKm: "ការទប់លំនឹងចិត្ត ៥ ជំហាន (Sensory Grounding)",
    subtitle: "5 mins • Anchor your nervous system firmly in the present",
    subtitleKm: "៥ នាទី • ទប់លំនឹងចិត្តតាមរយៈអារម្មណ៍ទាំងប្រាំ",
    description: "Break anxious thought loops using sight, touch, sound, smell, and taste.",
    descriptionKm: "បង្វែរអារម្មណ៍ពីការព្រួយបារម្ភដោយភ្ជាប់ទំនាក់ទំនងជាមួយបរិយាកាសជុំវិញ។",
    category: "practice",
    categoryLabel: "Practice",
    categoryLabelKm: "ការអនុវត្ត (Practice)",
    duration: "5 mins",
    durationKm: "៥ នាទី",
    estimatedMinutes: 5,
    badge: "Practice",
    badgeKm: "ការអនុវត្ត (Practice)",
    icon: "hugeicons_yoga-03",
    image: "/mindguide/icon-10.svg",
    href: "/practice",
  },
  {
    id: "tip-try-now-1",
    source: "tip",
    title: "Cut What You Control",
    titleKm: "បន្ធូរបន្ថយអ្វីដែលអ្នកគ្រប់គ្រងបាន (Cut What You Control)",
    subtitle: "2 mins • Drop or delay one non-essential task this week",
    subtitleKm: "២ នាទី • ពន្យារពេល ឬកាត់បន្ថយការងារមិនចាំបាច់មួយ",
    description: "Identify non-critical obligations to create immediate emotional breathing room.",
    descriptionKm: "ជ្រើសរើសកិច្ចការមិនចាំបាច់មួយដើម្បីពន្យារពេល និងបន្ថយសម្ពាធផ្លូវចិត្ត។",
    category: "tips",
    categoryLabel: "Micro-Tips",
    categoryLabelKm: "គន្លឹះ (Tips)",
    duration: "2 mins",
    durationKm: "២ នាទី",
    estimatedMinutes: 2,
    badge: "Tips",
    badgeKm: "គន្លឹះ (Tips)",
    icon: "boxicons_note-filled",
    image: "/mindguide/icon-7.svg",
    href: "/tips",
  },
  {
    id: "evening-relaxation",
    source: "practice",
    title: "Evening Deep Relaxation",
    titleKm: "ការសម្រាកឱ្យលក់ស្រួលពេលយប់ (Deep Relaxation)",
    subtitle: "10 mins • Slow down racing thoughts and prepare for restorative rest",
    subtitleKm: "១០ នាទី • បន្ធូរអារម្មណ៍សម្រាប់ការគេងលក់ស្រួល",
    description: "Calming bedtime guidance to transition smoothly from busy thoughts into deep sleep.",
    descriptionKm: "រៀបចំចិត្ត និងរាងកាយឱ្យស្ងប់ស្ងាត់ដើម្បីគេងលក់ស្រួលពេញមួយយប់។",
    category: "practice",
    categoryLabel: "Practice",
    categoryLabelKm: "ការអនុវត្ត (Practice)",
    duration: "10 mins",
    durationKm: "១០ នាទី",
    estimatedMinutes: 10,
    badge: "Practice",
    badgeKm: "ការអនុវត្ត (Practice)",
    icon: "hugeicons_yoga-03",
    image: "/mindguide/sleep.png",
    href: "/practice",
  },
];
