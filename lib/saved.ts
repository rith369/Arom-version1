import { z } from "zod";

// Saved items and lesson progress (BACKEND-HANDOFF.md section 30). Types and
// rules shared by the browser and the API. Both are private to their owner.

export const SAVED_KINDS = ["lesson", "tip", "practice", "podcast"] as const;
export type SavedKind = (typeof SAVED_KINDS)[number];

/** Saved ids of each kind, oldest saved first. */
export type SavedIds = Record<SavedKind, string[]>;

/** GET, PUT and POST /api/saved */
export type SavedResponse = { saved: SavedIds };

export const MAX_SAVED = 500;

// MindGuide ids such as "learn-about-stress". Same rule as the tables.
const itemIdSchema = z.string().regex(/^[A-Za-z0-9_-]{1,100}$/);

/** PUT /api/saved: saves or removes one item. */
export const savedChangeSchema = z.object({
  kind: z.enum(SAVED_KINDS),
  id: itemIdSchema,
  saved: z.boolean(),
});

/** POST /api/saved: adds items kept in the browser before logging in. */
export const savedImportSchema = z.object({
  items: z.array(z.object({ kind: z.enum(SAVED_KINDS), id: itemIdSchema })).min(1).max(200),
});

export type LessonProgress = {
  completedSections: number;
  totalSections: number;
  isComplete: boolean;
  lastVisitedSection: number;
  quizAnswer?: string;
  reflectionAnswer?: string;
};

/** GET and PUT /api/lesson-progress: progress by lesson id. */
export type LessonProgressResponse = { progress: Record<string, LessonProgress> };

const sectionSchema = z.number().int().min(0).max(100);

export const lessonProgressSchema = z.object({
  completedSections: sectionSchema,
  totalSections: sectionSchema.min(1),
  isComplete: z.boolean(),
  lastVisitedSection: sectionSchema.min(1),
  quizAnswer: z.string().max(200).optional(),
  reflectionAnswer: z.string().max(300).optional(),
});

/**
 * PUT /api/lesson-progress. One item when a section is finished; several when
 * progress kept in the browser moves to the account (`keepExisting` then
 * leaves lessons the account already has alone).
 */
export const lessonProgressSaveSchema = z.object({
  items: z.array(z.object({ lessonId: itemIdSchema, progress: lessonProgressSchema })).min(1).max(100),
  keepExisting: z.boolean().optional(),
});
