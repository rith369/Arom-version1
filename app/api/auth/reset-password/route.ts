import type { NextRequest } from "next/server";
import { resetPassword } from "@/lib/controllers/auth-controller";

export async function POST(request: NextRequest) {
  return resetPassword(request);
}
