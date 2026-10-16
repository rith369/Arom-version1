import { listActivePrompts } from "@/lib/controllers/journal-prompts-controller";

export async function GET() {
  return listActivePrompts();
}
