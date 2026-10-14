import type { NextRequest } from "next/server";
import { updateProBooking } from "@/lib/controllers/pro-controller";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return updateProBooking(request, id);
}
