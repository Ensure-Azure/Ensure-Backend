import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required."),

  COSMOS_ENDPOINT: z
    .string()
    .url("COSMOS_ENDPOINT must be a valid URL."),

  COSMOS_KEY: z
    .string()
    .min(1, "COSMOS_KEY is required."),

  COSMOS_DATABASE_ID: z
    .string()
    .min(1, "COSMOS_DATABASE_ID is required."),

  COSMOS_CONTAINER_ID: z
    .string()
    .min(1, "COSMOS_CONTAINER_ID is required."),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error(
      "Variables de entorno inválidas:",
      result.error.flatten().fieldErrors,
    );

    throw new Error(
      "La configuración de variables de entorno es inválida.",
    );
  }

  cachedEnv = result.data;

  return cachedEnv;
}