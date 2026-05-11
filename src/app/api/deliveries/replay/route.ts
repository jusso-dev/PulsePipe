import { NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDeliveryQueue } from "@/lib/queue";

export async function POST(request: Request) {
  const { workspace } = await requireWorkspace();
  const body = await request.json().catch(() => ({}));
  const queue = getDeliveryQueue();

  if (body.attemptId) {
    const attempt = await prisma.deliveryAttempt.findFirst({
      where: {
        id: String(body.attemptId),
        event: { workspaceId: workspace.id },
        status: { in: ["failed", "dead_letter"] }
      }
    });
    if (!attempt) return NextResponse.json({ ok: false, error: "Replayable attempt not found." }, { status: 404 });
    await queue.add("replay", {
      eventId: attempt.eventId,
      destinationId: attempt.destinationId,
      replayOfAttemptId: attempt.id
    });
    return NextResponse.json({ ok: true, replayed: 1 });
  }

  if (body.eventId) {
    const attempts = await prisma.deliveryAttempt.findMany({
      where: {
        eventId: String(body.eventId),
        event: { workspaceId: workspace.id },
        status: { in: ["failed", "dead_letter"] }
      },
      distinct: ["destinationId"]
    });
    await Promise.all(attempts.map((attempt) => queue.add("replay", { eventId: attempt.eventId, destinationId: attempt.destinationId })));
    return NextResponse.json({ ok: true, replayed: attempts.length });
  }

  if (body.destinationId) {
    const attempts = await prisma.deliveryAttempt.findMany({
      where: {
        destinationId: String(body.destinationId),
        destination: { workspaceId: workspace.id },
        status: { in: ["failed", "dead_letter"] }
      },
      distinct: ["eventId"]
    });
    await Promise.all(attempts.map((attempt) => queue.add("replay", { eventId: attempt.eventId, destinationId: attempt.destinationId })));
    return NextResponse.json({ ok: true, replayed: attempts.length });
  }

  return NextResponse.json({ ok: false, error: "Specify attemptId, eventId, or destinationId." }, { status: 400 });
}
