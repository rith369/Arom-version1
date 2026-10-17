import type { NextRequest } from "next/server";
import { receiveCrashReport } from "@/lib/controllers/crash-controller";

export async function POST(request: NextRequest) {
  return receiveCrashReport(request);
}
