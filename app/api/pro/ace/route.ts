import type { NextRequest } from "next/server";
import { getProAskAce, setProAskAce } from "@/lib/controllers/ace-controller";

export async function GET() {
  return getProAskAce();
}

export async function PUT(request: NextRequest) {
  return setProAskAce(request);
}
