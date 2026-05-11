export const env = {
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "pulsepipe_session",
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 120),
  rateLimitWindowSeconds: Number(process.env.RATE_LIMIT_WINDOW_SECONDS ?? 60),
  webhookTimeoutMs: Number(process.env.WEBHOOK_TIMEOUT_MS ?? 8000),
  allowLocalWebhooks: process.env.ALLOW_LOCAL_WEBHOOKS === "true",
  demoWebhookUrl: process.env.DEMO_WEBHOOK_URL
};
