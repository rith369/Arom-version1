import type { NextRequest } from "next/server";
import { setClientArchived } from "@/lib/controllers/messages-controller";

export async function POST(request: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  return setClientArchived(request, clientId);
}
