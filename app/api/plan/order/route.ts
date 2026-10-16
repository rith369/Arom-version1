import type { NextRequest } from "next/server";
import { reorderPlan } from "@/lib/controllers/plan-controller";

export async function PUT(request: NextRequest) {
  return reorderPlan(request);
}
