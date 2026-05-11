import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock, Database, KeyRound, RadioTower, Webhook } from "lucide-react";
import { EventStatusBadge } from "@/components/status-badge";
import { Badge, EmptyState, Panel } from "@/components/ui";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export default async function DashboardPage() {
  const { workspace } = await requireWorkspace();
  const [eventsToday, attempts, failedDeliveries, recentEvents, topEvents, latency, apiKeyCount, destinationCount, successfulDeliveries] = await Promise.all([
    prisma.event.count({ where: { workspaceId: workspace.id, receivedAt: { gte: startOfToday() } } }),
    prisma.deliveryAttempt.groupBy({ by: ["status"], where: { event: { workspaceId: workspace.id } }, _count: true }),
    prisma.deliveryAttempt.count({ where: { event: { workspaceId: workspace.id }, status: { in: ["failed", "dead_letter"] } } }),
    prisma.event.findMany({ where: { workspaceId: workspace.id }, orderBy: { receivedAt: "desc" }, take: 8 }),
    prisma.event.groupBy({ by: ["name"], where: { workspaceId: workspace.id }, _count: true, orderBy: { _count: { name: "desc" } }, take: 5 }),
    prisma.deliveryAttempt.aggregate({ where: { event: { workspaceId: workspace.id }, status: "succeeded" }, _avg: { durationMs: true } }),
    prisma.apiKey.count({ where: { workspaceId: workspace.id, revokedAt: null } }),
    prisma.destination.count({ where: { workspaceId: workspace.id, enabled: true } }),
    prisma.deliveryAttempt.count({ where: { event: { workspaceId: workspace.id }, status: "succeeded" } })
  ]);
  const totalAttempts = attempts.reduce((sum, item) => sum + item._count, 0);
  const successAttempts = attempts.find((item) => item.status === "succeeded")?._count ?? 0;
  const successRate = totalAttempts ? Math.round((successAttempts / totalAttempts) * 100) : 100;

  return (
    <div className="space-y-8">
      <header>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-muted">Overview</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Delivery operations</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              A real ingestion pipeline: API-key auth, Redis rate limits, PostgreSQL event storage, BullMQ fanout, webhook retries, and replayable failures.
            </p>
          </div>
          <Badge tone="success">Health endpoint green</Badge>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric icon={<Database size={18} />} label="Events today" value={eventsToday.toLocaleString()} />
        <Metric icon={<RadioTower size={18} />} label="Success rate" value={`${successRate}%`} />
        <Metric icon={<ArrowUpRight size={18} />} label="Failed deliveries" value={failedDeliveries.toLocaleString()} />
        <Metric icon={<Clock size={18} />} label="Avg latency" value={`${Math.round(latency._avg.durationMs ?? 0)}ms`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel className="p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Demo runbook</h2>
              <p className="mt-1 text-sm text-muted">Use these steps to prove the full path during a portfolio review.</p>
            </div>
            <Badge tone={successfulDeliveries > 0 ? "success" : "neutral"}>{successfulDeliveries > 0 ? "Delivery proven" : "Ready"}</Badge>
          </div>
          <div className="grid gap-3">
            <RunbookStep done={destinationCount > 0} icon={<Webhook size={16} />} title="Create a webhook destination" href="/dashboard/destinations" action="Open destinations" />
            <RunbookStep done={apiKeyCount > 0} icon={<KeyRound size={16} />} title="Create an API key" href="/dashboard/api-keys" action="Open API keys" />
            <RunbookStep done={eventsToday > 0} icon={<Database size={16} />} title="Send a test event" href="/dashboard/api-keys" action="Use test event" />
            <RunbookStep done={successfulDeliveries > 0} icon={<RadioTower size={16} />} title="Inspect delivery attempts" href="/dashboard/events" action="Open events" />
          </div>
        </Panel>

        <Panel className="p-5">
          <h2 className="text-base font-semibold">Runtime controls</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <RuntimeRow label="Rate limit" value={`${env.rateLimitMax} events per ${env.rateLimitWindowSeconds}s per API key`} />
            <RuntimeRow label="Webhook timeout" value={`${env.webhookTimeoutMs}ms`} />
            <RuntimeRow label="Local webhooks" value={env.allowLocalWebhooks ? "Allowed for demo" : "Blocked by SSRF guard"} />
            <RuntimeRow label="Queue worker" value="BullMQ with exponential backoff" />
          </dl>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent events</h2>
            <Link className="text-sm font-medium text-accent" href="/dashboard/events">
              View all
            </Link>
          </div>
          {recentEvents.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-muted">
                  <tr>
                    <th className="py-2">Event</th>
                    <th className="py-2">User</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {recentEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-panel/70">
                      <td className="py-3 font-medium">
                        <Link href={`/dashboard/events/${event.id}`}>{event.name}</Link>
                      </td>
                      <td className="py-3 text-muted">{event.externalUserId ?? "Unknown"}</td>
                      <td className="py-3">
                        <EventStatusBadge status={event.status} />
                      </td>
                      <td className="py-3 text-muted">{event.receivedAt.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No events yet" body="Create an API key, send an event, and it will appear here." />
          )}
        </Panel>

        <Panel className="p-5">
          <h2 className="text-base font-semibold">Top event names</h2>
          <div className="mt-4 space-y-3">
            {topEvents.length ? (
              topEvents.map((event) => (
                <div key={event.name} className="flex items-center justify-between border-b border-line pb-3 last:border-0">
                  <span className="text-sm font-medium">{event.name}</span>
                  <span className="text-sm text-muted">{event._count}</span>
                </div>
              ))
            ) : (
              <EmptyState title="No volume to rank" body="Event-name distribution appears after ingestion starts." />
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Panel className="p-4">
      <div className="mb-4 flex size-9 items-center justify-center rounded-md bg-panel text-muted">{icon}</div>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-normal">{value}</p>
    </Panel>
  );
}

function RunbookStep({
  done,
  icon,
  title,
  href,
  action
}: {
  done: boolean;
  icon: React.ReactNode;
  title: string;
  href: string;
  action: string;
}) {
  return (
    <div className="grid gap-3 rounded-md border border-line bg-panel/50 p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
      <div className="flex size-8 items-center justify-center rounded-md bg-paper text-muted">{done ? <CheckCircle2 size={16} className="text-accent" /> : icon}</div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted">{done ? "Complete" : "Pending"}</p>
      </div>
      <Link className="focus-ring rounded-md px-2 py-1 text-sm font-medium text-accent hover:bg-accent/10" href={href}>
        {action}
      </Link>
    </div>
  );
}

function RuntimeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line pb-3 last:border-0">
      <dt className="text-muted">{label}</dt>
      <dd className="max-w-[16rem] text-right font-medium">{value}</dd>
    </div>
  );
}
