import type { NextRequest } from "next/server";
import { getProClientAce } from "@/lib/controllers/ace-controller";

type Context = { params: Promise<{ clientId: string }> };

export async function GET(_request: NextRequest, { params }: Context) {
  const { clientId } = await params;
  return getProClientAce(clientId);
}
