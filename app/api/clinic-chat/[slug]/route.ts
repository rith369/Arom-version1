import type { NextRequest } from "next/server";
import { getMyClinicThread, sendMyClinicMessage } from "@/lib/controllers/clinic-chat-controller";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return getMyClinicThread(slug);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return sendMyClinicMessage(request, slug);
}
