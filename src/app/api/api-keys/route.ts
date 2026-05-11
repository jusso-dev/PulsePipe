import { NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/auth";
import { generateApiKey } from "@/lib/api-keys";
import { prisma } from "@/lib/db";
import { apiKeySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const { workspace } = await requireWorkspace();
  const body = await request.json().catch(() => null);
  const parsed = apiKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const generated = generateApiKey();
  const apiKey = await prisma.apiKey.create({
    data: {
      workspaceId: workspace.id,
      name: parsed.data.name,
      keyPrefix: generated.keyPrefix,
      keyHash: generated.keyHash
    },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true
    }
  });

  return NextResponse.json({
    ok: true,
    apiKey: {
      ...apiKey,
      rawKey: generated.rawKey,
      maskedKey: generated.maskedKey
    }
  });
}

export async function DELETE(request: Request) {
  const { workspace } = await requireWorkspace();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing API key id." }, { status: 400 });

  await prisma.apiKey.updateMany({
    where: { id, workspaceId: workspace.id },
    data: { revokedAt: new Date() }
  });
  return NextResponse.json({ ok: true });
}
