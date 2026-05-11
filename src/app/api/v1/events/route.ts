import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { hashApiKey } from "@/lib/api-keys";
import { prisma } from "@/lib/db";
import { enqueueEnabledDestinations } from "@/lib/delivery";
import { getRequestId, log } from "@/lib/logger";
import { getDeliveryQueue } from "@/lib/queue";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRedis } from "@/lib/redis";
import { eventIngestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : "";
  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing bearer API key.", requestId }, { status: 401 });
  }

  const apiKey = await prisma.apiKey.findFirst({
    where: { keyHash: hashApiKey(token), revokedAt: null },
    include: { workspace: true }
  });
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Invalid API key.", requestId }, { status: 401 });
  }

  const redis = getRedis();
  const limit = await checkRateLimit(redis, `api-key:${apiKey.id}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Rate limit exceeded.", requestId },
      {
        status: 429,
        headers: {
          "x-ratelimit-limit": String(limit.limit),
          "x-ratelimit-remaining": String(limit.remaining),
          "x-ratelimit-reset": limit.resetAt.toISOString()
        }
      }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = eventIngestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten(), requestId }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      workspaceId: apiKey.workspaceId,
      apiKeyId: apiKey.id,
      name: parsed.data.event,
      externalUserId: parsed.data.userId,
      timestamp: parsed.data.timestamp ? new Date(parsed.data.timestamp) : new Date(),
      properties: parsed.data.properties as Prisma.InputJsonValue,
      status: "received"
    }
  });
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() }
  });

  const destinationCount = await enqueueEnabledDestinations(apiKey.workspaceId, event.id, getDeliveryQueue());
  if (destinationCount === 0) {
    await prisma.event.update({ where: { id: event.id }, data: { status: "delivered" } });
  }

  log("info", "event.ingested", { requestId, eventId: event.id, workspaceId: apiKey.workspaceId, destinationCount });
  return NextResponse.json(
    { ok: true, eventId: event.id, requestId },
    {
      headers: {
        "x-request-id": requestId,
        "x-ratelimit-limit": String(limit.limit),
        "x-ratelimit-remaining": String(limit.remaining)
      }
    }
  );
}
