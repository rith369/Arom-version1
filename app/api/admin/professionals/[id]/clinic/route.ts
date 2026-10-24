import type { NextRequest } from "next/server";
import { setProfessionalClinic } from "@/lib/controllers/clinic-controller";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return setProfessionalClinic(request, id);
}
