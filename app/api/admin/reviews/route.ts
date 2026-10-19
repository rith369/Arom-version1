import { listAdminReviews } from "@/lib/controllers/reviews-controller";

export async function GET() {
  return listAdminReviews();
}
