import { listCommunityReports } from "@/lib/controllers/community-admin-controller";

export async function GET() {
  return listCommunityReports();
}
