import { listContentReports } from "@/lib/controllers/reports-controller";

export async function GET() {
  return listContentReports();
}
