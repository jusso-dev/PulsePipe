import Redis from "ioredis";
import { env } from "./env";

const globalForRedis = globalThis as unknown as { redis?: Redis };

export function getRedis() {
  if (!globalForRedis.redis) {
    globalForRedis.redis = new Redis(env.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false
    });
  }

  return globalForRedis.redis;
}
