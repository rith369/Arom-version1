import { listProReviews } from "@/lib/controllers/reviews-controller";

export async function GET() {
  return listProReviews();
}
