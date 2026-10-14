import type { NextRequest } from "next/server";
import { updateMyAppointment } from "@/lib/controllers/appointments-controller";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return updateMyAppointment(request, id);
}
