import { z } from "zod";

// Your Plan For Today as a personal to do list (BACKEND-HANDOFF.md section 27).
// Types and rules shared by the browser and the API. Tasks are private to
// their owner. Every day starts fresh: "done" means checked on today's
// Cambodia date, so nothing piles up as overdue.

export const PLAN_SOURCES = ["custom", "suggestion", "starter", "learn", "practice", "mindguide", "guide", "tip"] as const;
export type PlanSource = (typeof PLAN_SOURCES)[number];

export const PLAN_REPEATS = ["daily", "weekdays", "once"] as const;
export type PlanRepeat = (typeof PLAN_REPEATS)[number];

export const MAX_PLAN_TASKS = 30;

export type PlanTask = {
  id: string;
  itemKey: string;
  source: PlanSource;
  title: string;
  titleKm: string;
  subtitle: string;
  subtitleKm: string;
  href: string | null;
  icon: string | null;
  repeat: PlanRepeat;
  // 0 Sunday to 6 Saturday, only for repeat "weekdays".
  weekdays: number[];
  // Cambodia date, only for repeat "once".
  onceDay: string | null;
  sortOrder: number;
  doneToday: boolean;
};

/** GET /api/plan */
export type PlanResponse = { day: string; weekday: number; tasks: PlanTask[] };

/** Weekday (0 Sunday) of a Cambodia date "YYYY-MM-DD". */
export const weekdayOf = (day: string) => new Date(`${day}T00:00:00Z`).getUTCDay();

/** Whether a task shows on the given day. */
export function isDueOn(task: Pick<PlanTask, "repeat" | "weekdays" | "onceDay">, day: string) {
  if (task.repeat === "once") return task.onceDay === day;
  if (task.repeat === "weekdays") return task.weekdays.includes(weekdayOf(day));
  return true;
}

// AROM pages only; "//other.site" is refused. Same rule as the table.
const INTERNAL_HREF = /^\/([A-Za-z0-9_?=&#.-][A-Za-z0-9/_?=&#.-]*)?$/;
const ICON = /^[a-z0-9_-]{1,60}$/;

const weekdaysSchema = z.array(z.number().int().min(0).max(6)).min(1).max(7);

const repeatFields = {
  repeat: z.enum(PLAN_REPEATS),
  weekdays: weekdaysSchema.optional(),
};

const repeatRule = (value: { repeat: PlanRepeat; weekdays?: number[] }) =>
  value.repeat !== "weekdays" || Boolean(value.weekdays?.length);

/** POST /api/plan/tasks. Without `itemKey` the server makes a "custom:" key. */
export const newPlanTaskSchema = z
  .object({
    itemKey: z.string().trim().min(1).max(100).optional(),
    source: z.enum(PLAN_SOURCES),
    title: z.string().trim().min(1).max(120),
    titleKm: z.string().trim().max(160).default(""),
    subtitle: z.string().trim().max(200).default(""),
    subtitleKm: z.string().trim().max(260).default(""),
    href: z.string().max(200).regex(INTERNAL_HREF).nullable().default(null),
    icon: z.string().regex(ICON).nullable().default(null),
    ...repeatFields,
  })
  .refine(repeatRule, { message: "Choose at least one day." });
export type NewPlanTask = z.input<typeof newPlanTaskSchema>;

/** PATCH /api/plan/tasks/:id: rename or change how often it repeats. */
export const editPlanTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    titleKm: z.string().trim().max(160).default(""),
    ...repeatFields,
  })
  .refine(repeatRule, { message: "Choose at least one day." });
export type EditPlanTask = z.input<typeof editPlanTaskSchema>;

/** PUT /api/plan/tasks/:id/check */
export const planCheckSchema = z.object({ done: z.boolean() });

/** PUT /api/plan/order: every task id in the new order. */
export const planOrderSchema = z.object({ ids: z.array(z.string().uuid()).max(MAX_PLAN_TASKS) });

// Lucide icons for suggestions and typed tasks (plan-task-icon.tsx).
// Any other icon name is a file in public/figma/icons.
export const PLAN_ICON_KEYS = ["water", "sleep", "walk", "phone", "food", "friend", "stretch", "grateful", "sun", "task"] as const;

export type PlanSuggestion = { key: string; en: string; km: string; icon: (typeof PLAN_ICON_KEYS)[number] };

/** Ready made tasks to add with one tap. Saved with item key "suggest:<key>". */
export const PLAN_SUGGESTIONS: PlanSuggestion[] = [
  { key: "water", en: "Drink 8 glasses of water", km: "ផឹកទឹក ៨ កែវ", icon: "water" },
  { key: "sleep", en: "Sleep before 11 pm", km: "ចូលគេងមុនម៉ោង ១១ យប់", icon: "sleep" },
  { key: "walk", en: "Walk for 10 minutes", km: "ដើរលេង ១០ នាទី", icon: "walk" },
  { key: "phone", en: "No phone 30 minutes before bed", km: "មិនប្រើទូរស័ព្ទ ៣០ នាទីមុនចូលគេង", icon: "phone" },
  { key: "breakfast", en: "Eat a good breakfast", km: "ញ៉ាំអាហារពេលព្រឹកឱ្យបានល្អ", icon: "food" },
  { key: "friend", en: "Message a friend", km: "ផ្ញើសារទៅមិត្តភក្តិម្នាក់", icon: "friend" },
  { key: "stretch", en: "Stretch for 5 minutes", km: "លាតសន្ធឹងសាច់ដុំ ៥ នាទី", icon: "stretch" },
  { key: "grateful", en: "Write 3 things I am grateful for", km: "សរសេររឿង ៣ ដែលខ្ញុំដឹងគុណ", icon: "grateful" },
  { key: "sunlight", en: "Get 10 minutes of morning sun", km: "ហាលថ្ងៃពេលព្រឹក ១០ នាទី", icon: "sun" },
];

/**
 * Given once, the first time someone opens their plan (plan_starts). They
 * are ordinary tasks the person can tick, edit or delete.
 */
export const PLAN_STARTERS: (Omit<NewPlanTask, "repeat"> & { itemKey: string })[] = [
  {
    itemKey: "starter:lesson",
    source: "starter",
    title: "MindGuide Lesson",
    titleKm: "មេរៀនចិត្ត (MindGuide Lesson)",
    subtitle: "Understanding Anxiety (5 min)",
    subtitleKm: "ស្វែងយល់ពីការថប់បារម្ភ (Anxiety) • ៥ នាទី",
    href: "/mindguide",
    icon: "ant-design_play-circle-filled",
  },
  {
    itemKey: "starter:meditation",
    source: "starter",
    title: "Guided Meditation",
    titleKm: "ការហាត់សមាធិ (Guided Meditation)",
    subtitle: "Relax and breathe (3 min)",
    subtitleKm: "សម្រាកកាយ និងដកដង្ហើម • ៣ នាទី",
    href: "/practice",
    icon: "hugeicons_yoga-03",
  },
  {
    itemKey: "starter:try-now",
    source: "starter",
    title: "Try now: Cut what you control",
    titleKm: "សាកល្បង (Try now)៖ បន្ធូរបន្ថយអ្វីដែលអ្នកគ្រប់គ្រងបាន",
    subtitle: "Drop or delay one thing this week.",
    subtitleKm: "កាត់បន្ថយ ឬពន្យារពេលការងារមួយក្នុងសប្តាហ៍នេះ",
    href: "/tips",
    icon: "boxicons_note-filled",
  },
  {
    itemKey: "suggest:water",
    source: "suggestion",
    title: "Drink 8 glasses of water",
    titleKm: "ផឹកទឹក ៨ កែវ",
    subtitle: "",
    subtitleKm: "",
    href: null,
    icon: "water",
  },
];
