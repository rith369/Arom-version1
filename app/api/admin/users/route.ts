import type { NextRequest } from "next/server";
import { listUsers } from "@/lib/controllers/role-controller";

export async function GET(request: NextRequest) {
  return listUsers(request);
}
