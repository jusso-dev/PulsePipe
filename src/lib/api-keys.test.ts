import { describe, expect, it } from "vitest";
import { generateApiKey, hashApiKey, isApiKeyHashMatch, maskApiKey } from "./api-keys";

describe("api keys", () => {
  it("generates a raw key and stores only a deterministic hash", () => {
    const key = generateApiKey();
    expect(key.rawKey).toMatch(/^pp_live_/);
    expect(key.keyHash).toBe(hashApiKey(key.rawKey));
    expect(key.keyHash).not.toContain(key.rawKey);
    expect(isApiKeyHashMatch(key.rawKey, key.keyHash)).toBe(true);
  });

  it("masks keys for display", () => {
    expect(maskApiKey("pp_live_abcdefghijklmnopqrstuvwxyz")).toBe("pp_live_abcd...wxyz");
  });
});
