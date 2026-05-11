import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "");
  const password = String(body?.password ?? "");

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user && email === (process.env.DEMO_EMAIL ?? "owner@pulsepipe.dev") && password === (process.env.DEMO_PASSWORD ?? "pulsepipe")) {
    user = await prisma.user.create({
      data: {
        email,
        name: "Demo Owner",
        passwordHash: hashPassword(password)
      }
    });
  }

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(env.sessionCookieName, user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return NextResponse.json({ ok: true });
}
