import { Panel } from "@/components/ui";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function UsagePage() {
  const { workspace } = await requireWorkspace();
  const byDay = await prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
    SELECT date_trunc('day', "receivedAt") AS day, count(*)::bigint AS count
    FROM "Event"
    WHERE "workspaceId" = ${workspace.id}
    GROUP BY 1
    ORDER BY 1 DESC
    LIMIT 14
  `;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-muted">Ingestion volume</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal">Usage</h1>
      </header>
      <Panel className="p-5">
        <div className="space-y-3">
          {byDay.map((row) => {
            const count = Number(row.count);
            return (
              <div key={row.day.toISOString()} className="grid gap-2 sm:grid-cols-[8rem_1fr_4rem] sm:items-center">
                <span className="text-sm text-muted">{row.day.toLocaleDateString()}</span>
                <div className="h-3 overflow-hidden rounded-full bg-panel">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(count, 100)}%` }} />
                </div>
                <span className="text-right text-sm font-medium">{count}</span>
              </div>
            );
          })}
          {!byDay.length ? <p className="text-sm text-muted">No usage data yet.</p> : null}
        </div>
      </Panel>
    </div>
  );
}
