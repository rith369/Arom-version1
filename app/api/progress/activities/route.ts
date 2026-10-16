import type { NextRequest } from "next/server";
import { getActivities } from "@/lib/controllers/mood-controller";

export async function GET(request: NextRequest) {
  return getActivities(request);
}
