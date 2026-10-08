import type { NextRequest } from "next/server";
import { setUserRole } from "@/lib/controllers/role-controller";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return setUserRole(request, id);
}
