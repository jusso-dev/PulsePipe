import { describe, expect, it } from "vitest";
import { checkRateLimit } from "./rate-limit";

class FakeRedis {
  private counts = new Map<string, number>();
  async incr(key: string) {
    const next = (this.counts.get(key) ?? 0) + 1;
    this.counts.set(key, next);
    return next;
  }
  async expire() {
    return 1;
  }
  async ttl() {
    return 60;
  }
}

describe("rate limiting", () => {
  it("allows requests until the configured limit is exceeded", async () => {
    const redis = new FakeRedis();
    await expect(checkRateLimit(redis as never, "workspace:1", 2, 60)).resolves.toMatchObject({ allowed: true, remaining: 1 });
    await expect(checkRateLimit(redis as never, "workspace:1", 2, 60)).resolves.toMatchObject({ allowed: true, remaining: 0 });
    await expect(checkRateLimit(redis as never, "workspace:1", 2, 60)).resolves.toMatchObject({ allowed: false, remaining: 0 });
  });
});
