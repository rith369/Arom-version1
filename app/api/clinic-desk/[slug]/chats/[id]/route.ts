import type { NextRequest } from "next/server";
import { getDeskThread, sendDeskMessage } from "@/lib/controllers/clinic-chat-controller";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  return getDeskThread(slug, id);
}

// The database checks that the caller works at this chat's clinic desk.
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { id } = await params;
  return sendDeskMessage(request, id);
}
