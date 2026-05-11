import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/webhook";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-pulsepipe-signature");
  const eventId = request.headers.get("x-pulsepipe-event-id");

  return NextResponse.json({
    ok: true,
    receivedAt: new Date().toISOString(),
    eventId,
    signaturePresent: Boolean(signature),
    // The demo sink intentionally does not know the destination secret. This line
    // keeps the verification helper imported in a realistic receiver example.
    verificationHelper: typeof verifyWebhookSignature === "function",
    bytes: Buffer.byteLength(body)
  });
}
