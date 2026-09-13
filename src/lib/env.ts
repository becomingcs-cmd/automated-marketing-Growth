import "server-only";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().optional(),
  DEMO_MODE: z.enum(["true", "false"]).default("false"),
  SAFE_MODE: z.enum(["true", "false"]).default("true"),
  SESSION_SECRET: z.string().min(32).optional(),
});

export function readEnv() {
  const env = schema.parse(process.env);
  if (env.NODE_ENV === "production" && env.DEMO_MODE === "true") {
    throw new Error("DEMO_MODE must be false in production");
  }
  return env;
}
