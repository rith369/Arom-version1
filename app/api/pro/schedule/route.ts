import type { NextRequest } from "next/server";
import { saveProSchedule } from "@/lib/controllers/pro-controller";

export async function PUT(request: NextRequest) {
  return saveProSchedule(request);
}
