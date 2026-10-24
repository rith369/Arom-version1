import { markDeskChatRead } from "@/lib/controllers/clinic-chat-controller";

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { id } = await params;
  return markDeskChatRead(id);
}
