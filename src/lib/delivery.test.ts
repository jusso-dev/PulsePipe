import { describe, expect, it } from "vitest";
import { classifyDeliveryStatus } from "./delivery";

describe("delivery retry classification", () => {
  it("dead-letters failed deliveries on the final retry", () => {
    expect(classifyDeliveryStatus(true, 1)).toBe("succeeded");
    expect(classifyDeliveryStatus(false, 1)).toBe("failed");
    expect(classifyDeliveryStatus(false, 4)).toBe("dead_letter");
  });
});
