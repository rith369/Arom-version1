import { z } from "zod";
import { WELLBEING_TOPICS, type WellbeingTopic } from "./wellbeing-topics";

// The written summary of the journal week (BACKEND-HANDOFF.md section 22).
// Off until the person turns it on. Written on the server by Google Gemini
// from their own entries of the last 7 days, saved in journal_ai_summaries,
// readable only by them. Types shared by the browser and the API.

/** A summary needs at least this many entries in the last 7 days. */
export const MIN_SUMMARY_ENTRIES = 3;
/** Summaries a person can get a Cambodia day (claim_journal_summary_run). */
export const MAX_SUMMARY_RUNS = 5;

export type JournalSummary =
  | {
      kind: "summary";
      paragraph: string;
      theme: string;
      highlights: string[];
      tip: string;
      /** 1 or 2 topics from the fixed list, for the suggestions card. Older summaries have none. */
      topics?: WellbeingTopic[];
    }
  // An entry mentioned suicide, self harm, harming others or abuse: the app
  // shows gentle words and the helplines instead of a summary.
  | { kind: "support" };

export const journalSummarySchema: z.ZodType<JournalSummary> = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("summary"),
    paragraph: z.string().min(1).max(800),
    theme: z.string().max(80),
    highlights: z.array(z.string().min(1).max(240)).max(3),
    tip: z.string().max(200),
    topics: z.array(z.enum(WELLBEING_TOPICS)).max(2).optional(),
  }),
  z.object({ kind: z.literal("support") }),
]);

export const summaryLanguageSchema = z.enum(["en", "km"]);

/** GET, POST and PUT /api/journal/summary answer. */
export type JournalSummaryResponse = {
  enabled: boolean;
  /** Entries in the last 7 Cambodia days. */
  entryCount: number;
  summary: JournalSummary | null;
  /** True when the summary was written from the current entries, in this language. */
  fresh: boolean;
  generatedAt: string | null;
  runsLeft: number;
};

export const summaryToggleSchema = z.object({ enabled: z.boolean(), language: summaryLanguageSchema.default("en") });
export const summaryRequestSchema = z.object({ language: summaryLanguageSchema });
