import { exportAccount } from "@/lib/controllers/account-controller";

export async function GET() {
  return exportAccount();
}
