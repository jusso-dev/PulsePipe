import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { workspaceSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json().catch(() => null);
  const parsed = workspaceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const baseSlug = slugify(parsed.data.name);
  const workspace = await prisma.workspace.create({
    data: {
      name: parsed.data.name,
      slug: `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`,
      memberships: {
        create: {
          userId: user.id,
          role: "owner"
        }
      }
    }
  });

  return NextResponse.json({ ok: true, workspace });
}
