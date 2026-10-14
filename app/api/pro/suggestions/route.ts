import type { NextRequest } from "next/server";
import { suggestSession } from "@/lib/controllers/sessions-controller";

export async function POST(request: NextRequest) {
  return suggestSession(request);
}
