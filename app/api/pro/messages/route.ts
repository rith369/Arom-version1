import type { NextRequest } from "next/server";
import { listConversations, setReplyTime } from "@/lib/controllers/messages-controller";

export async function GET() {
  return listConversations("professional");
}

export async function PATCH(request: NextRequest) {
  return setReplyTime(request);
}
