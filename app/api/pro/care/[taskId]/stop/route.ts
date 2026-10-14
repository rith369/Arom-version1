import type { NextRequest } from "next/server";
import { stopCareTask } from "@/lib/controllers/care-controller";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  return stopCareTask(taskId);
}
