import { DashboardNav } from "@/components/dashboard-nav";
import { requireWorkspace } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, workspace } = await requireWorkspace();
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <DashboardNav workspaceName={workspace.name} userEmail={user.email} />
      <main className="min-w-0 px-5 py-6 sm:px-8 lg:px-10">{children}</main>
    </div>
  );
}
