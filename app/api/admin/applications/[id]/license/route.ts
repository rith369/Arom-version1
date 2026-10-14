import type { NextRequest } from "next/server";
import { openLicense } from "@/lib/controllers/professionals-controller";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return openLicense(id);
}
