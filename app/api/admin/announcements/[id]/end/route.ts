import { endAnnouncement } from "@/lib/controllers/announcements-controller";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return endAnnouncement(id);
}
