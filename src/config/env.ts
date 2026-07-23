import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export function getEnv() {
  return envSchema.parse(process.env);
}
