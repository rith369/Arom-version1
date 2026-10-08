import type { NextRequest } from "next/server";
import { login } from "@/lib/controllers/auth-controller";

export async function POST(request: NextRequest) {
  return login(request);
}
