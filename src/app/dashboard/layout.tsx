import { AppShell } from "@/components/app-shell";
import { requireWorkspaceSession } from "@/lib/auth/require-session";

// Authentication must run for every request. Never prerender protected workspace HTML.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireWorkspaceSession();
  return <AppShell>{children}</AppShell>;
}
