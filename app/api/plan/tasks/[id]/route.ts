import type { NextRequest } from "next/server";
import { deletePlanTask, updatePlanTask } from "@/lib/controllers/plan-controller";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return updatePlanTask(id, request);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return deletePlanTask(id);
}
