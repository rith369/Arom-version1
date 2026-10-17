import type { NextRequest } from "next/server";
import { listCrashGroups } from "@/lib/controllers/crash-controller";

export async function GET(request: NextRequest) {
  return listCrashGroups(request);
}
