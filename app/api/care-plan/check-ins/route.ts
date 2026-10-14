import type { NextRequest } from "next/server";
import { setMyCheckIn } from "@/lib/controllers/care-controller";

export async function POST(request: NextRequest) {
  return setMyCheckIn(request);
}
