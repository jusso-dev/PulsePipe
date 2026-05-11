import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { assertSafeWebhookUrl } from "@/lib/url-safety";
import { destinationSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const { workspace } = await requireWorkspace();
  const body = await request.json().catch(() => null);
  const parsed = destinationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  let safeUrl: string;
  try {
    safeUrl = await assertSafeWebhookUrl(parsed.data.url);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Webhook URL is not allowed." },
      { status: 400 }
    );
  }

  const destination = await prisma.destination.create({
    data: {
      workspaceId: workspace.id,
      name: parsed.data.name,
      url: safeUrl,
      enabled: parsed.data.enabled,
      signingSecret: `whsec_${randomBytes(32).toString("base64url")}`
    }
  });

  return NextResponse.json({ ok: true, destination });
}
