import type { NextRequest } from "next/server";
import { receiveCspReport } from "@/lib/controllers/crash-controller";

export async function POST(request: NextRequest) {
  return receiveCspReport(request);
}
