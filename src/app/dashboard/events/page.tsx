import Link from "next/link";
import { EventStatusBadge } from "@/components/status-badge";
import { Button, EmptyState, Field, Input, Panel, Select } from "@/components/ui";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const item = params[key];
  return Array.isArray(item) ? item[0] : item;
}

export default async function EventsPage({ searchParams }: { searchParams: SearchParams }) {
  const { workspace } = await requireWorkspace();
  const params = await searchParams;
  const name = value(params, "event");
  const status = value(params, "status");
  const userId = value(params, "userId");
  const from = value(params, "from");
  const to = value(params, "to");
  const deliveryStatus = value(params, "deliveryStatus");

  const events = await prisma.event.findMany({
    where: {
      workspaceId: workspace.id,
      ...(name ? { name: { contains: name, mode: "insensitive" } } : {}),
      ...(status ? { status: status as never } : {}),
      ...(userId ? { externalUserId: { contains: userId, mode: "insensitive" } } : {}),
      ...(from || to
        ? {
            receivedAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {})
            }
          }
        : {}),
      ...(deliveryStatus
        ? {
            deliveryAttempts: {
              some: { status: deliveryStatus as never }
            }
          }
        : {})
    },
    orderBy: { receivedAt: "desc" },
    take: 100
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-muted">Event search</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal">Events</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Search by event name, external user, event status, delivery status, and received date range.
        </p>
      </header>

      <Panel className="p-4">
        <form className="grid gap-3 lg:grid-cols-7 lg:items-end">
          <Field label="Event">
            <Input name="event" placeholder="user.created" defaultValue={name} />
          </Field>
          <Field label="User">
            <Input name="userId" placeholder="abc_123" defaultValue={userId} />
          </Field>
          <Field label="Event status">
            <Select name="status" defaultValue={status ?? ""}>
              <option value="">Any</option>
              <option value="received">Received</option>
              <option value="processing">Processing</option>
              <option value="delivered">Delivered</option>
              <option value="partially_failed">Partially failed</option>
              <option value="failed">Failed</option>
            </Select>
          </Field>
          <Field label="Delivery">
            <Select name="deliveryStatus" defaultValue={deliveryStatus ?? ""}>
              <option value="">Any</option>
              <option value="succeeded">Succeeded</option>
              <option value="failed">Failed</option>
              <option value="dead_letter">Dead letter</option>
            </Select>
          </Field>
          <Field label="From">
            <Input name="from" type="date" defaultValue={from} />
          </Field>
          <Field label="To">
            <Input name="to" type="date" defaultValue={to} />
          </Field>
          <Button type="submit">Filter</Button>
        </form>
      </Panel>

      <Panel className="overflow-hidden">
        {events.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-panel text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">External user</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-panel/70">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/dashboard/events/${event.id}`}>{event.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{event.externalUserId ?? "Unknown"}</td>
                    <td className="px-4 py-3">
                      <EventStatusBadge status={event.status} />
                    </td>
                    <td className="px-4 py-3 text-muted">{event.timestamp.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted">{event.receivedAt.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState title="No matching events" body="Adjust filters or send a new event to the ingestion endpoint." />
          </div>
        )}
      </Panel>
    </div>
  );
}
