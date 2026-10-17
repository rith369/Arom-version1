import type { NextRequest } from "next/server";
import { changeContent, listContent } from "@/lib/controllers/content-controller";

export async function GET() {
  return listContent();
}

export async function POST(request: NextRequest) {
  return changeContent(request);
}
