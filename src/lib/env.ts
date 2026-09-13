import "server-only";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().optional(),
  DEMO_MODE: z.enum(["true", "false"]).default("false"),
  SAFE_MODE: z.enum(["true", "false"]).default("true"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1).optional(),
});

export function readEnv() {
  const env = schema.parse(process.env);
  if (env.NODE_ENV === "production" && env.DEMO_MODE === "true") {
    throw new Error("DEMO_MODE must be false in production");
  }
  const hasPublishableKey = Boolean(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const hasSecretKey = Boolean(env.CLERK_SECRET_KEY);
  if (hasPublishableKey !== hasSecretKey) {
    throw new Error("Clerk configuration is incomplete: both publishable and secret keys are required");
  }
  return env;
}

export function isClerkConfigured(): boolean {
  const env = readEnv();
  return Boolean(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && env.CLERK_SECRET_KEY);
}
