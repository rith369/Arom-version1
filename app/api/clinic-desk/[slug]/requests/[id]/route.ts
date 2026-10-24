import type { NextRequest } from "next/server";
import { answerDeskRequest } from "@/lib/controllers/clinic-controller";

// The database checks that the caller works at this request's clinic desk.
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { id } = await params;
  return answerDeskRequest(request, id);
}
