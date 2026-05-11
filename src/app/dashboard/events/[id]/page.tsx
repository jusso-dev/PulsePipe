import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonViewer } from "@/components/json-viewer";
import { ReplayButton } from "@/components/replay-button";
import { DeliveryStatusBadge, EventStatusBadge } from "@/components/status-badge";
import { Panel } from "@/components/ui";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { workspace } = await requireWorkspace();
  const { id } = await params;
  const event = await prisma.event.findFirst({
    where: { id, workspaceId: workspace.id },
    include: {
      deliveryAttempts: {
        include: { destination: true },
        orderBy: { createdAt: "desc" }
      },
      apiKey: { select: { name: true, keyPrefix: true } }
    }
  });
  if (!event) notFound();

  const hasFailures = event.deliveryAttempts.some((attempt) => attempt.status === "failed" || attempt.status === "dead_letter");

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <Link href="/dashboard/events" className="text-sm font-medium text-accent">
            Back to events
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">{event.name}</h1>
          <p className="mt-1 text-sm text-muted">{event.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <EventStatusBadge status={event.status} />
          {hasFailures ? <ReplayButton body={{ eventId: event.id }} label="Replay failures" /> : null}
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <Panel className="p-5">
          <h2 className="text-base font-semibold">Event metadata</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <Row label="External user" value={event.externalUserId ?? "Unknown"} />
            <Row label="Timestamp" value={event.timestamp.toISOString()} />
            <Row label="Received" value={event.receivedAt.toISOString()} />
            <Row label="API key" value={event.apiKey ? `${event.apiKey.name} (${event.apiKey.keyPrefix}...)` : "Deleted key"} />
            <Row label="Processing attempts" value={String(event.processingAttempts)} />
            <Row label="Last error" value={event.lastError ?? "None"} />
          </dl>
        </Panel>
        <div>
          <h2 className="mb-3 text-base font-semibold">Properties</h2>
          <JsonViewer value={event.properties} />
        </div>
      </section>

      <Panel className="overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold">Delivery attempts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-panel text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Attempt</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Error</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {event.deliveryAttempts.map((attempt) => (
                <tr key={attempt.id}>
                  <td className="px-4 py-3 font-medium">{attempt.destination.name}</td>
                  <td className="px-4 py-3">
                    <DeliveryStatusBadge status={attempt.status} />
                  </td>
                  <td className="px-4 py-3 text-muted">{attempt.attemptNumber}</td>
                  <td className="px-4 py-3 text-muted">{attempt.responseCode ?? "-"}</td>
                  <td className="px-4 py-3 text-muted">{attempt.durationMs ? `${attempt.durationMs}ms` : "-"}</td>
                  <td className="max-w-md truncate px-4 py-3 text-muted">{attempt.error ?? attempt.responseBody ?? "-"}</td>
                  <td className="px-4 py-3">
                    {attempt.status === "failed" || attempt.status === "dead_letter" ? <ReplayButton body={{ attemptId: attempt.id }} label="Replay" /> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-line pb-3 last:border-0">
      <dt className="text-xs uppercase text-muted">{label}</dt>
      <dd className="break-all font-medium">{value}</dd>
    </div>
  );
}
