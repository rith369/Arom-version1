import type { NextRequest } from "next/server";
import { resolveContentReports } from "@/lib/controllers/reports-controller";

export async function POST(request: NextRequest) {
  return resolveContentReports(request);
}
