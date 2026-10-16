import { z } from "zod";
import type { MoodLevel } from "./mood";

// The journal (BACKEND-HANDOFF.md section 22). Entries are saved in
// `journal_entries`, readable only by their owner: never by professionals,
// never by admins. They never go in browser storage, a URL or a log.
// Types and rules shared by the browser and the API.

// The journal page names moods its own way. Same five levels as mood_level.
export const JOURNAL_MOODS = ["Great", "Good", "Okay", "Not Good", "Very difficult"] as const;
export type JournalMood = (typeof JOURNAL_MOODS)[number];

export const JOURNAL_MOOD_LEVEL: Record<JournalMood, MoodLevel> = {
  Great: "great",
  Good: "good",
  Okay: "okay",
  "Not Good": "low",
  "Very difficult": "very_low",
};

export const MOOD_LEVEL_JOURNAL: Record<MoodLevel, JournalMood> = {
  great: "Great",
  good: "Good",
  okay: "Okay",
  low: "Not Good",
  very_low: "Very difficult",
};

export const MAX_JOURNAL_CONTENT = 20000;
export const MAX_JOURNAL_NOTES = 5000;
export const MAX_JOURNAL_ENTRIES = 200;

export type JournalQuestionAnswer = { id: string; question: string; kmQuestion: string; answer: string };

/** One saved entry, as GET /api/journal returns it. */
export type JournalEntryDto = {
  id: string;
  // Cambodia date of the entry.
  day: string;
  mood: JournalMood;
  emotions: string[];
  content: string;
  questions: JournalQuestionAnswer[];
  additionalNotes: string;
  createdAt: string;
};

export type JournalListResponse = { entries: JournalEntryDto[] };

const questionSchema = z.object({
  id: z.string().max(60),
  question: z.string().max(300),
  kmQuestion: z.string().max(300),
  answer: z.string().trim().max(5000),
});

/** POST /api/journal. `day` is only for moving entries saved on this device before. */
export const newJournalEntrySchema = z.object({
  mood: z.enum(JOURNAL_MOODS),
  emotions: z.array(z.string().trim().min(1).max(40)).max(20),
  content: z.string().trim().min(1).max(MAX_JOURNAL_CONTENT),
  questions: z.array(questionSchema).max(20),
  additionalNotes: z.string().trim().max(MAX_JOURNAL_NOTES),
  inputMethod: z.enum(["text", "voice"]).default("text"),
  day: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});
export type NewJournalEntry = z.input<typeof newJournalEntrySchema>;
