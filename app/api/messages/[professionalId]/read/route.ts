import type { NextRequest } from "next/server";
import { markThreadRead } from "@/lib/controllers/messages-controller";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ professionalId: string }> }) {
  const { professionalId } = await params;
  return markThreadRead("client", professionalId);
}
