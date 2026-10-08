import type { NextRequest } from "next/server";
import { listApplications } from "@/lib/controllers/role-controller";

export async function GET(request: NextRequest) {
  return listApplications(request);
}
