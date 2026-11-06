import type { NextRequest } from "next/server";
import { confirmEmailLink } from "@/lib/controllers/auth-controller";

export async function POST(request: NextRequest) {
  return confirmEmailLink(request);
}
