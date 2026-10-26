import type { NextRequest } from "next/server";
import { deleteMyAce, getMyAce, saveMyAce } from "@/lib/controllers/ace-controller";

export async function GET() {
  return getMyAce();
}

export async function PUT(request: NextRequest) {
  return saveMyAce(request);
}

export async function DELETE(request: NextRequest) {
  return deleteMyAce(request);
}
