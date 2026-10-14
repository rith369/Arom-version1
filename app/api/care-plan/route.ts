import { getMyCarePlan } from "@/lib/controllers/care-controller";

export async function GET() {
  return getMyCarePlan();
}
