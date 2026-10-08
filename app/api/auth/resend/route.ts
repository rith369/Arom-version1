import type { NextRequest } from "next/server";
import { resendConfirmation } from "@/lib/controllers/auth-controller";

export async function POST(request: NextRequest) {
  return resendConfirmation(request);
}
