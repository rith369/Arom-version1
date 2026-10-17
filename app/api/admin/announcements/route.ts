import type { NextRequest } from "next/server";
import { listAnnouncements, publishAnnouncement } from "@/lib/controllers/announcements-controller";

export async function GET() {
  return listAnnouncements();
}

export async function POST(request: NextRequest) {
  return publishAnnouncement(request);
}
