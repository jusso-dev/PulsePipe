import { createHash, randomBytes, timingSafeEqual } from "crypto";

const KEY_PREFIX = "pp_live";

export function generateApiKey() {
  const secret = randomBytes(32).toString("base64url");
  const rawKey = `${KEY_PREFIX}_${secret}`;
  return {
    rawKey,
    keyPrefix: rawKey.slice(0, 15),
    keyHash: hashApiKey(rawKey),
    maskedKey: maskApiKey(rawKey)
  };
}

export function hashApiKey(rawKey: string) {
  return createHash("sha256").update(rawKey).digest("hex");
}

export function maskApiKey(rawKey: string) {
  return `${rawKey.slice(0, 12)}...${rawKey.slice(-4)}`;
}

export function isApiKeyHashMatch(rawKey: string, storedHash: string) {
  const incoming = Buffer.from(hashApiKey(rawKey));
  const stored = Buffer.from(storedHash);
  return incoming.length === stored.length && timingSafeEqual(incoming, stored);
}
