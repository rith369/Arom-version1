import { listUsers } from "@/lib/controllers/role-controller";

export async function GET() {
  return listUsers();
}
