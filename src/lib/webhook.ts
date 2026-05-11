import { createHmac, timingSafeEqual } from "crypto";

export function signWebhookPayload(payload: string, secret: string, timestamp = Math.floor(Date.now() / 1000)) {
  const signedPayload = `${timestamp}.${payload}`;
  const signature = createHmac("sha256", secret).update(signedPayload).digest("hex");
  return {
    timestamp,
    signature,
    header: `t=${timestamp},v1=${signature}`
  };
}

export function verifyWebhookSignature(payload: string, secret: string, header: string, toleranceSeconds = 300) {
  const parts = Object.fromEntries(
    header.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    })
  );
  const timestamp = Number(parts.t);
  const signature = parts.v1;
  if (!timestamp || !signature) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) return false;

  const expected = signWebhookPayload(payload, secret, timestamp).signature;
  const expectedBuffer = Buffer.from(expected);
  const incomingBuffer = Buffer.from(signature);
  return expectedBuffer.length === incomingBuffer.length && timingSafeEqual(expectedBuffer, incomingBuffer);
}
