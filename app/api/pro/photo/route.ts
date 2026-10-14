import type { NextRequest } from "next/server";
import { uploadProPhoto } from "@/lib/controllers/pro-controller";

export async function POST(request: NextRequest) {
  return uploadProPhoto(request);
}
