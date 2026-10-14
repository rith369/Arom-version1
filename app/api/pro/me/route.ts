import { getProData } from "@/lib/controllers/pro-controller";

export async function GET() {
  return getProData();
}
