import type { NextRequest } from "next/server";
import { withdrawSuggestion } from "@/lib/controllers/sessions-controller";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withdrawSuggestion(id);
}
