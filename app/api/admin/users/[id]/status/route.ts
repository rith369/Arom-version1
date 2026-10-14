import type { NextRequest } from "next/server";
import { setAccountStatus } from "@/lib/controllers/professionals-controller";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return setAccountStatus(request, id);
}
