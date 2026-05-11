import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const { workspace } = await requireWorkspace();
  const origin = new URL(request.url).origin;
  const demoUrl = env.demoWebhookUrl ?? `${origin}/api/demo/webhook`;

  const destination = await prisma.destination.create({
    data: {
      workspaceId: workspace.id,
      name: "PulsePipe demo sink",
      url: demoUrl,
      enabled: true,
      signingSecret: `whsec_${randomBytes(32).toString("base64url")}`
    }
  });

  return NextResponse.json({ ok: true, destination });
}
