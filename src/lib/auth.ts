import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { env } from "./env";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(env.sessionCookieName)?.value;
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true }
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function getActiveWorkspace(userId: string) {
  const membership = await prisma.membership.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { workspace: true }
  });

  return membership?.workspace ?? null;
}

export async function requireWorkspace() {
  const user = await requireUser();
  const workspace = await getActiveWorkspace(user.id);
  if (!workspace) redirect("/onboarding");
  return { user, workspace };
}

export function canWrite(role: string) {
  return ["owner", "admin", "developer"].includes(role);
}

export async function requireWorkspaceRole(userId: string, workspaceId: string, writable = false) {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: { userId, workspaceId }
    }
  });
  if (!membership) return null;
  if (writable && !canWrite(membership.role)) return null;
  return membership;
}
