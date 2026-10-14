import type { NextRequest } from "next/server";
import { acceptSuggestion } from "@/lib/controllers/sessions-controller";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return acceptSuggestion(request, id);
}
