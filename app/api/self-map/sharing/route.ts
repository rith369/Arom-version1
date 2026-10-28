import type { NextRequest } from "next/server";
import { setMySelfMapShare } from "@/lib/controllers/self-map-controller";

export async function PUT(request: NextRequest) {
  return setMySelfMapShare(request);
}
