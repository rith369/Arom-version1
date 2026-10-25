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

// Before 26 Oct 2026 the journal saved one of these made up texts when the
// person picked a mood and wrote nothing. They are not the person's words, so
// they are shown and summarized as "mood only". New entries save no text.
const MOOD_ONLY_TEXTS = new Set([
  "No notes recorded.",
  "គ្មានកំណត់ត្រា",
  "Today was wonderful! I felt energized, accomplished my goals, and enjoyed some great moments. Feeling grateful and happy.",
  "Had a good, productive day today! Things went smoothly, and I'm feeling peaceful, focused, and content.",
  "Today was steady and calm. Handled my daily tasks at a steady pace and took time to keep myself balanced.",
  "Felt a bit low on energy today. Giving myself permission to slow down, rest, and recharge tonight.",
  "Today was quite challenging and overwhelming. I'm taking deep breaths, letting myself rest, and taking things one step at a time.",
  "ថ្ងៃនេះពិតជាអស្ចារ្យណាស់! ខ្ញុំមានថាមពល បានបំពេញការងារដោយជោគជ័យ និងមានពេលវេលាដ៏មានន័យ។ ខ្ញុំមានអារម្មណ៍ដឹងគុណ និងរីករាយជាខ្លាំង។",
  "ថ្ងៃនេះជាថ្ងៃដ៏ល្អ និងមានផលិតភាព។ អ្វីៗដំណើរការយ៉ាងរលូន ហើយខ្ញុំមានអារម្មណ៍ស្ងប់ និងពេញចិត្តនឹងលទ្ធផល។",
  "ថ្ងៃនេះធម្មតា និងមានសេចក្តីស្ងប់។ ខ្ញុំបានដោះស្រាយកិច្ចការប្រចាំថ្ងៃមួយជំហានម្តងៗ ហើយកំពុងរក្សាតុល្យភាពនៃចិត្ត។",
  "ថ្ងៃនេះមានអារម្មណ៍អស់កម្លាំងបន្តិច។ ខ្ញុំកំពុងឆ្លៀតពេលសម្រាក សម្រាលអារម្មណ៍ និងរំលឹកខ្លួនឯងថាការសម្រាកគឺជារឿងសំខាន់។",
  "ថ្ងៃនេះមានការលំបាក និងតានតឹងច្រើន។ ខ្ញុំកំពុងដកដង្ហើមវែងៗ បន្ថយល្បឿន និងដោះស្រាយម្តងមួយៗដោយការយល់ចិត្តខ្លួនឯង។",
]);

/** The entry's own words, or "" for a mood only entry (including the old made up texts). */
export function journalText(content: string | null | undefined) {
  const text = (content ?? "").trim();
  return MOOD_ONLY_TEXTS.has(text) ? "" : text;
}

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

/** A guided question admins manage in /admin/journal-prompts (section 26). */
export type JournalPrompt = {
  id: string;
  question: string;
  kmQuestion: string;
  placeholder: string;
  kmPlaceholder: string;
  order: number;
  isActive: boolean;
};

/** PUT /api/admin/journal-prompts body `{ prompt }`. Limits match the table. */
export const journalPromptSchema = z.object({
  id: z.string().uuid(),
  question: z.string().trim().min(1).max(300),
  kmQuestion: z.string().trim().min(1).max(300),
  placeholder: z.string().trim().max(400),
  kmPlaceholder: z.string().trim().max(500),
  order: z.number().int().min(1).max(1000),
  isActive: z.boolean(),
});

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
  // Empty for a mood only entry: the app never writes words for the person.
  content: z.string().trim().max(MAX_JOURNAL_CONTENT),
  questions: z.array(questionSchema).max(20),
  additionalNotes: z.string().trim().max(MAX_JOURNAL_NOTES),
  inputMethod: z.enum(["text", "voice"]).default("text"),
  day: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});
export type NewJournalEntry = z.input<typeof newJournalEntrySchema>;
