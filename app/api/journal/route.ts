import type { NextRequest } from "next/server";
import { createJournalEntry, listJournal } from "@/lib/controllers/mood-controller";

export async function GET() {
  return listJournal();
}

export async function POST(request: NextRequest) {
  return createJournalEntry(request);
}
