import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { isE2eTestMode } from "@/lib/e2e-test-mode";

if (isE2eTestMode() && process.env.NODE_ENV === "production") {
  throw new Error("E2E_TEST_MODE must not be enabled in production");
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.AUTH_SECRET,
  baseURL: process.env.AUTH_URL,
  emailAndPassword: isE2eTestMode()
    ? {
        enabled: true,
        requireEmailVerification: false,
      }
    : undefined,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
