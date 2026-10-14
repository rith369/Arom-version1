import type { NextRequest } from "next/server";
import { openVoice } from "@/lib/controllers/messages-controller";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ messageId: string }> }) {
  const { messageId } = await params;
  return openVoice(messageId);
}
