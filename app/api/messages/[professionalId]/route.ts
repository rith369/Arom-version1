import type { NextRequest } from "next/server";
import { getThread, sendMessage } from "@/lib/controllers/messages-controller";

type Context = { params: Promise<{ professionalId: string }> };

export async function GET(_request: NextRequest, { params }: Context) {
  const { professionalId } = await params;
  return getThread("client", professionalId);
}

export async function POST(request: NextRequest, { params }: Context) {
  const { professionalId } = await params;
  return sendMessage(request, "client", professionalId);
}
