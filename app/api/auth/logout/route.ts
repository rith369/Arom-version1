import type { NextRequest } from "next/server";
import { logout } from "@/lib/controllers/auth-controller";

export async function POST(request: NextRequest) {
  return logout(request);
}
