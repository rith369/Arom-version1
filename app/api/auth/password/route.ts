import type { NextRequest } from "next/server";
import { changePassword } from "@/lib/controllers/auth-controller";

export async function POST(request: NextRequest) {
  return changePassword(request);
}
