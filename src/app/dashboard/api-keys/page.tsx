import { ApiKeyCreator } from "@/components/api-key-manager";
import { RevokeApiKeyButton } from "@/components/revoke-api-key-button";
import { Badge, EmptyState, Panel } from "@/components/ui";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ApiKeysPage() {
  const { workspace } = await requireWorkspace();
  const keys = await prisma.apiKey.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-muted">Credentials</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal">API keys</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Keys are hashed at rest. The raw value appears once, then only the prefix and usage metadata remain.
        </p>
      </header>
      <Panel className="p-5">
        <h2 className="mb-4 text-base font-semibold">Create key</h2>
        <ApiKeyCreator />
      </Panel>
      <Panel className="overflow-hidden">
        {keys.length ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-panel text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Masked key</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Last used</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {keys.map((key) => (
                <tr key={key.id} className="hover:bg-panel/70">
                  <td className="px-4 py-3 font-medium">{key.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{key.keyPrefix}...</td>
                  <td className="px-4 py-3 text-muted">{key.createdAt.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted">{key.lastUsedAt?.toLocaleString() ?? "Never"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={key.revokedAt ? "neutral" : "success"}>{key.revokedAt ? "Revoked" : "Active"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">{key.revokedAt ? null : <RevokeApiKeyButton apiKeyId={key.id} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-5">
            <EmptyState title="No API keys" body="Create a key to authenticate public event ingestion and generate a demo curl command." />
          </div>
        )}
      </Panel>
    </div>
  );
}
