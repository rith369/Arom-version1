import type { NextRequest } from "next/server";
import { setMySharing } from "@/lib/controllers/care-controller";

export async function PUT(request: NextRequest) {
  return setMySharing(request);
}
