import { markMyClinicChatRead } from "@/lib/controllers/clinic-chat-controller";

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return markMyClinicChatRead(slug);
}
