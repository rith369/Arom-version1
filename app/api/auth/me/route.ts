import { me } from "@/lib/controllers/auth-controller";

export async function GET() {
  return me();
}
