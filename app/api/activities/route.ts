import type { NextRequest } from "next/server";
import { logActivity } from "@/lib/controllers/mood-controller";

export async function POST(request: NextRequest) {
  return logActivity(request);
}
