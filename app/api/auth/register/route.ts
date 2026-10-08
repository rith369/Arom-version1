import type { NextRequest } from "next/server";
import { register } from "@/lib/controllers/auth-controller";

export async function POST(request: NextRequest) {
  return register(request);
}
