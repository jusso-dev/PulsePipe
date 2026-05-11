import type Redis from "ioredis";
import { env } from "./env";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
};

export async function checkRateLimit(
  redis: Redis,
  key: string,
  limit = env.rateLimitMax,
  windowSeconds = env.rateLimitWindowSeconds
): Promise<RateLimitResult> {
  const redisKey = `rate:${key}:${Math.floor(Date.now() / (windowSeconds * 1000))}`;
  const count = await redis.incr(redisKey);
  if (count === 1) {
    await redis.expire(redisKey, windowSeconds);
  }

  const ttl = await redis.ttl(redisKey);
  return {
    allowed: count <= limit,
    remaining: Math.max(limit - count, 0),
    resetAt: new Date(Date.now() + Math.max(ttl, 0) * 1000),
    limit
  };
}
