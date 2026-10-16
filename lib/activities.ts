import { z } from "zod";
import { ALL_LESSONS } from "@/app/_components/learn/learn-data";
import { ALL_PRACTICES } from "@/app/_components/practice/practice-data";

// Activities on the Progress pages (BACKEND-HANDOFF.md section 22): finished
// practices and lessons from `activity_log`, and journal days from
// `journal_entries`. A journal entry is only ever a date here, never its words.
// Types and rules shared by the browser and the API.

export type ActivityKind = "practice" | "lesson" | "journal";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  // The practice or lesson id (ALL_PRACTICES / ALL_LESSONS); null for journal.
  refId: string | null;
  // Cambodia date the activity was done.
  day: string;
};

/** GET /api/progress/activities?range= */
export type ActivitiesResponse = {
  counts: Record<ActivityKind, number>;
  // Newest first, at most 20.
  recent: ActivityItem[];
};

export const MAX_RECENT_ACTIVITIES = 20;

/** POST /api/activities `{ kind, refId }`: a practice or lesson was finished. */
export const logActivitySchema = z
  .object({ kind: z.enum(["practice", "lesson"]), refId: z.string().min(1).max(100) })
  .refine(
    (value) =>
      value.kind === "practice"
        ? ALL_PRACTICES.some((item) => item.id === value.refId)
        : ALL_LESSONS.some((item) => item.id === value.refId),
    { message: "Unknown practice or lesson." },
  );
