import type { NextRequest } from "next/server";
import { listAllPrompts, savePrompt } from "@/lib/controllers/journal-prompts-controller";

export async function GET() {
  return listAllPrompts();
}

export async function PUT(request: NextRequest) {
  return savePrompt(request);
}
