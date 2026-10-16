import type { NextRequest } from "next/server";
import { setPlanTaskDone } from "@/lib/controllers/plan-controller";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return setPlanTaskDone(id, request);
}
