import type { NextRequest } from "next/server";
import { setGroupClosed } from "@/lib/controllers/community-admin-controller";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return setGroupClosed(request, id, false);
}
