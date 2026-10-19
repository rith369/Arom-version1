import type { NextRequest } from "next/server";
import { deleteMyReview, listMyReviews, saveMyReview } from "@/lib/controllers/reviews-controller";

export async function GET() {
  return listMyReviews();
}

export async function PUT(request: NextRequest) {
  return saveMyReview(request);
}

export async function DELETE(request: NextRequest) {
  return deleteMyReview(request);
}
