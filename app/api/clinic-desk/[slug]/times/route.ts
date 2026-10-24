import type { NextRequest } from "next/server";
import { setDeskTimeFull } from "@/lib/controllers/clinic-controller";

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return setDeskTimeFull(request, slug);
}
