import type { NextRequest } from "next/server";
import { openAttachment } from "@/lib/controllers/messages-controller";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ messageId: string }> }) {
  const { messageId } = await params;
  return openAttachment(messageId);
}
