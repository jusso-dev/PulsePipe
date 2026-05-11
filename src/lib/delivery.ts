import type { DeliveryStatus } from "@prisma/client";
import { prisma } from "./db";
import { env } from "./env";
import { signWebhookPayload } from "./webhook";

export async function enqueueEnabledDestinations(
  workspaceId: string,
  eventId: string,
  queue: { add: (name: string, payload: { eventId: string; destinationId: string }) => Promise<unknown> }
) {
  const destinations = await prisma.destination.findMany({
    where: { workspaceId, enabled: true },
    select: { id: true }
  });

  await Promise.all(
    destinations.map(async (destination) => {
      await prisma.deliveryAttempt.create({
        data: {
          eventId,
          destinationId: destination.id,
          status: "queued",
          attemptNumber: 1
        }
      });
      await queue.add("deliver", { eventId, destinationId: destination.id });
    })
  );

  return destinations.length;
}

export async function updateEventDeliveryStatus(eventId: string) {
  const attempts = await prisma.deliveryAttempt.findMany({
    where: { eventId },
    select: { destinationId: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" }
  });

  if (attempts.length === 0) {
    await prisma.event.update({ where: { id: eventId }, data: { status: "delivered" } });
    return;
  }

  const latestByDestination = new Map<string, DeliveryStatus>();
  for (const attempt of attempts) {
    if (!latestByDestination.has(attempt.destinationId)) {
      latestByDestination.set(attempt.destinationId, attempt.status);
    }
  }

  const statuses = [...latestByDestination.values()];
  const allSucceeded = statuses.every((status) => status === "succeeded");
  const anySucceeded = statuses.some((status) => status === "succeeded");
  const anyPermanentFailure = statuses.some((status) => status === "dead_letter");
  const anyFailed = statuses.some((status) => status === "failed" || status === "dead_letter");

  await prisma.event.update({
    where: { id: eventId },
    data: {
      status: allSucceeded ? "delivered" : anySucceeded && anyFailed ? "partially_failed" : anyPermanentFailure ? "failed" : "processing",
      lastError: anyFailed ? "One or more webhook deliveries failed." : null
    }
  });
}

export function classifyDeliveryStatus(ok: boolean, attemptNumber: number): DeliveryStatus {
  if (ok) return "succeeded";
  return attemptNumber >= 4 ? "dead_letter" : "failed";
}

export async function deliverWebhook(eventId: string, destinationId: string, attemptNumber: number) {
  const started = Date.now();
  const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });
  const destination = await prisma.destination.findUniqueOrThrow({ where: { id: destinationId } });
  const payload = JSON.stringify({
    id: event.id,
    event: event.name,
    userId: event.externalUserId,
    timestamp: event.timestamp.toISOString(),
    properties: event.properties,
    receivedAt: event.receivedAt.toISOString()
  });
  const signature = signWebhookPayload(payload, destination.signingSecret);

  await prisma.event.update({
    where: { id: eventId },
    data: {
      status: "processing",
      processingAttempts: { increment: 1 }
    }
  });

  let response: Response;
  try {
    response = await fetch(destination.url, {
      method: "POST",
      body: payload,
      headers: {
        "content-type": "application/json",
        "x-pulsepipe-event-id": event.id,
        "x-pulsepipe-signature": signature.header
      },
      signal: AbortSignal.timeout(env.webhookTimeoutMs)
    });
  } catch (error) {
    const permanent = attemptNumber >= 4;
    await prisma.deliveryAttempt.create({
      data: {
        eventId,
        destinationId,
        status: permanent ? "dead_letter" : "failed",
        error: error instanceof Error ? error.message : "Unknown delivery error",
        attemptNumber,
        durationMs: Date.now() - started
      }
    });
    await updateEventDeliveryStatus(eventId);
    throw error;
  }

  const responseText = (await response.text()).slice(0, 2000);
  const status = classifyDeliveryStatus(response.ok, attemptNumber);

  await prisma.deliveryAttempt.create({
    data: {
      eventId,
      destinationId,
      status,
      responseCode: response.status,
      responseBody: responseText,
      error: response.ok ? null : `Webhook returned ${response.status}`,
      attemptNumber,
      durationMs: Date.now() - started
    }
  });
  await updateEventDeliveryStatus(eventId);

  if (!response.ok) {
    throw new Error(`Webhook returned ${response.status}`);
  }
}
