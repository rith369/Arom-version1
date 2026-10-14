import type { NextRequest } from "next/server";
import { getThread, sendMessage } from "@/lib/controllers/messages-controller";

type Context = { params: Promise<{ clientId: string }> };

export async function GET(_request: NextRequest, { params }: Context) {
  const { clientId } = await params;
  return getThread("professional", clientId);
}

export async function POST(request: NextRequest, { params }: Context) {
  const { clientId } = await params;
  return sendMessage(request, "professional", clientId);
}
