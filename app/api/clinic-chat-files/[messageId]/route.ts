import { openClinicChatFile } from "@/lib/controllers/clinic-chat-controller";

export async function GET(_request: Request, { params }: { params: Promise<{ messageId: string }> }) {
  const { messageId } = await params;
  return openClinicChatFile(messageId);
}
