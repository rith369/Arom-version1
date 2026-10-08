import type { NextRequest } from "next/server";
import { reviewApplication } from "@/lib/controllers/role-controller";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return reviewApplication(request, id);
}
