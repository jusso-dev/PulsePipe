import { Panel } from "@/components/ui";
import { requireWorkspace } from "@/lib/auth";

export default async function SettingsPage() {
  const { workspace } = await requireWorkspace();
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-muted">Tenant controls</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal">Settings</h1>
      </header>
      <Panel className="p-5">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase text-muted">Workspace</dt>
            <dd className="mt-1 font-medium">{workspace.name}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted">Slug</dt>
            <dd className="mt-1 font-medium">{workspace.slug}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted">Workspace ID</dt>
            <dd className="mt-1 break-all font-mono text-xs">{workspace.id}</dd>
          </div>
        </dl>
      </Panel>
    </div>
  );
}
