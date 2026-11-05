import type { NextRequest } from "next/server";
import { deleteAccount } from "@/lib/controllers/account-controller";

export async function POST(request: NextRequest) {
  return deleteAccount(request);
}
