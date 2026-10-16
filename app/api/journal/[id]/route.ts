import { deleteJournalEntry } from "@/lib/controllers/mood-controller";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return deleteJournalEntry(id);
}
