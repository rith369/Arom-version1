import type { NextRequest } from "next/server";
import { saveMood } from "@/lib/controllers/mood-controller";

export async function POST(request: NextRequest) {
  return saveMood(request);
}
