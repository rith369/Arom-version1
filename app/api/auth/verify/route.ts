import type { NextRequest } from "next/server";
import { verifyCode } from "@/lib/controllers/auth-controller";

export async function POST(request: NextRequest) {
  return verifyCode(request);
}
