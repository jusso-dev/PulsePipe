import { describe, expect, it } from "vitest";
import { eventIngestSchema } from "./validation";

describe("event validation", () => {
  it("accepts a valid event payload", () => {
    const parsed = eventIngestSchema.safeParse({
      event: "user.created",
      userId: "abc_123",
      timestamp: "2026-01-01T00:00:00.000Z",
      properties: { plan: "pro" }
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects empty and unsafe event names", () => {
    expect(eventIngestSchema.safeParse({ event: "", properties: {} }).success).toBe(false);
    expect(eventIngestSchema.safeParse({ event: "user created", properties: {} }).success).toBe(false);
  });
});
