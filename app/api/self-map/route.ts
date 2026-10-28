import type { NextRequest } from "next/server";
import { deleteMySelfMap, getMySelfMap, saveMySelfMap } from "@/lib/controllers/self-map-controller";

export async function GET() {
  return getMySelfMap();
}

export async function PUT(request: NextRequest) {
  return saveMySelfMap(request);
}

export async function DELETE(request: NextRequest) {
  return deleteMySelfMap(request);
}
