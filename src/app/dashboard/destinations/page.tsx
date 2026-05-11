import { DemoDestinationButton } from "@/components/demo-destination-button";
import { DestinationForm } from "@/components/destination-form";
import { ReplayButton } from "@/components/replay-button";
import { Badge, EmptyState, Panel } from "@/components/ui";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DestinationsPage() {
  const { workspace } = await requireWorkspace();
  const destinations = await prisma.destination.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          deliveryAttempts: {
            where: { status: { in: ["failed", "dead_letter"] } }
          }
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-muted">Webhook fanout</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal">Destinations</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Delivery targets are workspace-scoped and receive signed event payloads from the BullMQ worker.
        </p>
      </header>
      <Panel className="p-5">
        <DemoDestinationButton />
      </Panel>
      <Panel className="p-5">
        <h2 className="mb-4 text-base font-semibold">Add destination</h2>
        <DestinationForm />
      </Panel>
      <Panel className="overflow-hidden">
        {destinations.length ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-panel text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Signing secret</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Failures</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {destinations.map((destination) => (
                <tr key={destination.id} className="hover:bg-panel/70">
                  <td className="px-4 py-3 font-medium">{destination.name}</td>
                  <td className="max-w-lg truncate px-4 py-3 text-muted">{destination.url}</td>
                  <td className="px-4 py-3 font-mono text-xs">{destination.signingSecret.slice(0, 12)}...</td>
                  <td className="px-4 py-3">
                    <Badge tone={destination.enabled ? "success" : "neutral"}>{destination.enabled ? "Enabled" : "Disabled"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">{destination._count.deliveryAttempts}</td>
                  <td className="px-4 py-3 text-right">
                    {destination._count.deliveryAttempts > 0 ? <ReplayButton body={{ destinationId: destination.id }} label="Replay failures" /> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-5">
            <EmptyState title="No destinations configured" body="Create the demo sink or add your own webhook URL to start delivery fanout." />
          </div>
        )}
      </Panel>
    </div>
  );
}
