import type { NextRequest } from "next/server";
import { getProfile, updateProfile } from "@/lib/controllers/profile-controller";

export async function GET() {
  return getProfile();
}

export async function PATCH(request: NextRequest) {
  return updateProfile(request);
}
