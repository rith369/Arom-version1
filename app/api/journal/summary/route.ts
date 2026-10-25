import type { NextRequest } from "next/server";
import {
  createJournalSummary,
  getJournalSummary,
  setJournalSummaryEnabled,
} from "@/lib/controllers/journal-summary-controller";

// Gemini can take a few seconds to write the summary.
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  return getJournalSummary(request);
}

export async function POST(request: NextRequest) {
  return createJournalSummary(request);
}

export async function PUT(request: NextRequest) {
  return setJournalSummaryEnabled(request);
}
