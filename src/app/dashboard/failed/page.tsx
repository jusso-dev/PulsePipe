import Link from "next/link";
import { ReplayButton } from "@/components/replay-button";
import { DeliveryStatusBadge } from "@/components/status-badge";
import { EmptyState, Panel } from "@/components/ui";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function FailedDeliveriesPage() {
  const { workspace } = await requireWorkspace();
  const attempts = await prisma.deliveryAttempt.findMany({
    where: {
      event: { workspaceId: workspace.id },
      status: { in: ["failed", "dead_letter"] }
    },
    include: { event: true, destination: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-muted">Dead letters and retries</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal">Failed deliveries</h1>
      </header>
      <Panel className="overflow-hidden">
        {attempts.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-panel text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Error</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {attempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/dashboard/events/${attempt.eventId}`}>{attempt.event.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{attempt.destination.name}</td>
                    <td className="px-4 py-3">
                      <DeliveryStatusBadge status={attempt.status} />
                    </td>
                    <td className="max-w-md truncate px-4 py-3 text-muted">{attempt.error ?? attempt.responseBody ?? "No response body"}</td>
                    <td className="px-4 py-3 text-muted">{attempt.createdAt.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <ReplayButton body={{ attemptId: attempt.id }} label="Replay" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState title="No failed deliveries" body="Permanent failures and retryable webhook errors will appear here." />
          </div>
        )}
      </Panel>
    </div>
  );
}
