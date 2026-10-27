import type { NextRequest } from "next/server";
import { getSaved, importSaved, setSaved } from "@/lib/controllers/saved-controller";

export async function GET() {
  return getSaved();
}

export async function PUT(request: NextRequest) {
  return setSaved(request);
}

export async function POST(request: NextRequest) {
  return importSaved(request);
}
