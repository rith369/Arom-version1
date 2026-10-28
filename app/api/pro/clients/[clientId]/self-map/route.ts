import type { NextRequest } from "next/server";
import { getProClientSelfMap } from "@/lib/controllers/self-map-controller";

type Context = { params: Promise<{ clientId: string }> };

export async function GET(_request: NextRequest, { params }: Context) {
  const { clientId } = await params;
  return getProClientSelfMap(clientId);
}
