import type { NextRequest } from "next/server";
import { markThreadRead } from "@/lib/controllers/messages-controller";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  return markThreadRead("professional", clientId);
}
