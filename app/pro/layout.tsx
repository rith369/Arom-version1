import type { ReactNode } from "react";
import { ProAttentionProvider } from "./_components/pro-attention";
import { ProProvider } from "./_components/pro-provider";
import { ProShell } from "./_components/pro-shell";

// Guarded for professionals and admins by proxy.ts (ROLE_ROUTES in lib/roles.ts).
export default function ProLayout({ children }: { children: ReactNode }) {
  return (
    <ProProvider>
      <ProAttentionProvider>
        <ProShell>{children}</ProShell>
      </ProAttentionProvider>
    </ProProvider>
  );
}
