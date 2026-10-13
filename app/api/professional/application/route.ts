import type { NextRequest } from "next/server";
import { getOwnApplication, submitApplication } from "@/lib/controllers/application-controller";

export async function GET() {
  return getOwnApplication();
}

export async function POST(request: NextRequest) {
  return submitApplication(request);
}
