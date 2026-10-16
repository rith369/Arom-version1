import { getPlan } from "@/lib/controllers/plan-controller";

export async function GET() {
  return getPlan();
}
