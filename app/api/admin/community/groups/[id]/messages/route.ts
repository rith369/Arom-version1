import type { NextRequest } from "next/server";
import { readGroupChatAsAdmin } from "@/lib/controllers/admin-controller";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return readGroupChatAsAdmin(request, id);
}
