import type { NextRequest } from "next/server";
import { listAuditLog } from "@/lib/controllers/audit-controller";

export async function GET(request: NextRequest) {
  return listAuditLog(request);
}
