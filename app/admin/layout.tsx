import type { ReactNode } from "react";
import { AdminProvider } from "./_components/admin-provider";
import { AdminShell } from "./_components/admin-shell";
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminProvider><AdminShell>{children}</AdminShell></AdminProvider>;
}
