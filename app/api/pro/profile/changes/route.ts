import type { NextRequest } from "next/server";
import { withdrawProfileChange } from "@/lib/controllers/pro-controller";

export async function DELETE(request: NextRequest) {
  return withdrawProfileChange(request);
}
