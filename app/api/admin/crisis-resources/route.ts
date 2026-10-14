import type { NextRequest } from "next/server";
import { listAllHelplines, saveHelplines } from "@/lib/controllers/crisis-controller";

export async function GET() {
  return listAllHelplines();
}

export async function PUT(request: NextRequest) {
  return saveHelplines(request);
}
