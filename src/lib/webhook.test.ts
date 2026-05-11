import { describe, expect, it } from "vitest";
import { signWebhookPayload, verifyWebhookSignature } from "./webhook";

describe("webhook signatures", () => {
  it("signs and verifies payloads with HMAC SHA-256", () => {
    const payload = JSON.stringify({ event: "user.created" });
    const signed = signWebhookPayload(payload, "whsec_test", 1_767_225_600);
    expect(signed.header).toContain("v1=");
    expect(verifyWebhookSignature(payload, "whsec_test", signed.header, Number.MAX_SAFE_INTEGER)).toBe(true);
    expect(verifyWebhookSignature(`${payload} `, "whsec_test", signed.header, Number.MAX_SAFE_INTEGER)).toBe(false);
  });
});
