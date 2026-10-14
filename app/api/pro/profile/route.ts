import type { NextRequest } from "next/server";
import { saveProProfile } from "@/lib/controllers/pro-controller";

export async function PATCH(request: NextRequest) {
  return saveProProfile(request);
}
