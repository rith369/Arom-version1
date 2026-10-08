import type { NextRequest } from "next/server";
import { getOverview } from "@/lib/controllers/admin-controller";

export async function GET(request: NextRequest) {
  return getOverview(request);
}
