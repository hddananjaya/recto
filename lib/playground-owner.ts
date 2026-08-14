import { prisma } from "@/lib/prisma";

import { PLAYGROUND_OWNER_EMAIL } from "./playground";

export async function getOrCreatePlaygroundOwnerId(): Promise<string> {
  const user = await prisma.user.upsert({
    where: { email: PLAYGROUND_OWNER_EMAIL },
    create: {
      email: PLAYGROUND_OWNER_EMAIL,
      name: "Playground",
      emailVerified: true,
    },
    update: {},
    select: { id: true },
  });
  return user.id;
}
