import type { NextRequest } from "next/server";
import { replyToReview } from "@/lib/controllers/reviews-controller";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return replyToReview(request, id);
}
