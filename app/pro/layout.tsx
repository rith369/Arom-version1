import type { ReactNode } from "react";
import { ProProvider } from "./_components/pro-provider";
import { ProShell } from "./_components/pro-shell";

// Guarded for professionals and admins by proxy.ts (ROLE_ROUTES in lib/roles.ts).
export default function ProLayout({ children }: { children: ReactNode }) {
  return (
    <ProProvider>
      <ProShell>{children}</ProShell>
    </ProProvider>
  );
}
