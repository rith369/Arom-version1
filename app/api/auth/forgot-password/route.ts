import type { NextRequest } from "next/server";
import { forgotPassword } from "@/lib/controllers/auth-controller";

export async function POST(request: NextRequest) {
  return forgotPassword(request);
}
