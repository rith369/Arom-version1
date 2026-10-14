import type { NextRequest } from "next/server";
import { getSharedByClient, updateProClient } from "@/lib/controllers/pro-controller";

type Context = { params: Promise<{ clientId: string }> };

export async function GET(_request: NextRequest, { params }: Context) {
  const { clientId } = await params;
  return getSharedByClient(clientId);
}

export async function POST(request: NextRequest, { params }: Context) {
  const { clientId } = await params;
  return updateProClient(request, clientId);
}
