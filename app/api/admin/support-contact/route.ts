import type { NextRequest } from "next/server";
import { getSupportContact, saveSupportContact } from "@/lib/controllers/crisis-controller";

export async function GET() {
  return getSupportContact();
}

export async function PUT(request: NextRequest) {
  return saveSupportContact(request);
}
