import type { NextRequest } from "next/server";
import { getMoodRange } from "@/lib/controllers/mood-controller";

export async function GET(request: NextRequest) {
  return getMoodRange(request);
}
