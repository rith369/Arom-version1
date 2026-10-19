import type { NextRequest } from "next/server";
import { setReviewHidden } from "@/lib/controllers/reviews-controller";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return setReviewHidden(request, id);
}
