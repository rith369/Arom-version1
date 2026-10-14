import { listProfessionals } from "@/lib/controllers/professionals-controller";

export async function GET() {
  return listProfessionals();
}
