import { listConversations } from "@/lib/controllers/messages-controller";

export async function GET() {
  return listConversations("client");
}
