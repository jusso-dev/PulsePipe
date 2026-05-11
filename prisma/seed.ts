import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";
import { slugify } from "../src/lib/slug";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.DEMO_EMAIL ?? "owner@pulsepipe.dev";
  const password = process.env.DEMO_PASSWORD ?? "pulsepipe";
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Demo Owner",
      passwordHash: hashPassword(password)
    }
  });

  const workspaceName = "Acme Streams";
  const workspace = await prisma.workspace.upsert({
    where: { slug: slugify(workspaceName) },
    update: {},
    create: {
      name: workspaceName,
      slug: slugify(workspaceName)
    }
  });

  await prisma.membership.upsert({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: workspace.id
      }
    },
    update: { role: "owner" },
    create: {
      userId: user.id,
      workspaceId: workspace.id,
      role: "owner"
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
