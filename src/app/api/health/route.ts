import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDeliveryQueue } from "@/lib/queue";
import { getRedis } from "@/lib/redis";

async function check(label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    return { label, status: "ok" };
  } catch (error) {
    return {
      label,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export async function GET() {
  const [database, redis, queue] = await Promise.all([
    check("database", () => prisma.$queryRaw`SELECT 1`),
    check("redis", () => getRedis().ping()),
    check("queue", () => getDeliveryQueue().getJobCounts())
  ]);
  const dependencies = { database, redis, queue };
  const healthy = [database, redis, queue].every((item) => item.status === "ok");
  return NextResponse.json(
    {
      app: "ok",
      status: healthy ? "ok" : "degraded",
      dependencies
    },
    { status: healthy ? 200 : 503 }
  );
}
