import type { NextRequest } from "next/server";
import { listAdminGroups, saveAdminGroup } from "@/lib/controllers/community-admin-controller";

export async function GET() {
  return listAdminGroups();
}

export async function POST(request: NextRequest) {
  return saveAdminGroup(request);
}
