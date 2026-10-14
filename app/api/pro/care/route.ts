import type { NextRequest } from "next/server";
import { getProCare, giveCareTask } from "@/lib/controllers/care-controller";

export async function GET() {
  return getProCare();
}

export async function POST(request: NextRequest) {
  return giveCareTask(request);
}
