import { listDeskChats } from "@/lib/controllers/clinic-chat-controller";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return listDeskChats(slug);
}
