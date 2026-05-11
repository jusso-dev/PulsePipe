import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

async function createWorkspace(formData: FormData) {
  "use server";

  const user = await requireUser();
  const name = String(formData.get("name") ?? "Default Workspace");
  await prisma.workspace.create({
    data: {
      name,
      slug: `${slugify(name)}-${crypto.randomUUID().slice(0, 6)}`,
      memberships: {
        create: {
          userId: user.id,
          role: "owner"
        }
      }
    }
  });
  redirect("/dashboard");
}

export default async function OnboardingPage() {
  await requireUser();
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <form action={createWorkspace} className="w-full max-w-md rounded-lg border border-line bg-paper p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Create a workspace</h1>
        <p className="mt-1 text-sm text-muted">Workspaces isolate API keys, destinations, events, and replay controls.</p>
        <input name="name" className="focus-ring mt-5 h-10 w-full rounded-md border border-line px-3 text-sm" placeholder="Acme Streams" required />
        <button className="focus-ring mt-4 h-10 w-full rounded-md bg-ink px-3 text-sm font-medium text-paper">Create workspace</button>
      </form>
    </main>
  );
}
