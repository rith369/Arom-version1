import type { NextRequest } from "next/server";
import { submitCommunityReport } from "@/lib/controllers/community-admin-controller";

export async function POST(request: NextRequest) {
  return submitCommunityReport(request);
}
