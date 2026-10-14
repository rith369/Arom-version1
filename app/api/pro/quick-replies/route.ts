import type { NextRequest } from "next/server";
import { getQuickReplies, saveQuickReplies } from "@/lib/controllers/sessions-controller";

export async function GET() {
  return getQuickReplies();
}

export async function PUT(request: NextRequest) {
  return saveQuickReplies(request);
}
