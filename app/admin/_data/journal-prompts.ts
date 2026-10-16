// Journal prompts come from the database (GET /api/admin/journal-prompts).
// The shape is shared with the API and the journal page in lib/journal.ts.
export type { JournalPrompt as AdminJournalPrompt } from '@/lib/journal';
