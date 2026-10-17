import { getCurrentAnnouncement } from "@/lib/controllers/announcements-controller";

export async function GET() {
  return getCurrentAnnouncement();
}
