import type { NextRequest } from "next/server";
import { createPlanTask } from "@/lib/controllers/plan-controller";

export async function POST(request: NextRequest) {
  return createPlanTask(request);
}
