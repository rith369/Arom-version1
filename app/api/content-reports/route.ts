import type { NextRequest } from "next/server";
import { submitContentReport } from "@/lib/controllers/reports-controller";

export async function POST(request: NextRequest) {
  return submitContentReport(request);
}
