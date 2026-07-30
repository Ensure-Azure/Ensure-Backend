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

  COSMOS_DOCUMENTS_CONTAINER_ID: z
    .string()
    .min(
      1,
      "COSMOS_DOCUMENTS_CONTAINER_ID is required.",
    ),

  TRANSACTION_EVENT_WEBHOOK_URL: z
    .string()
    .url(
      "TRANSACTION_EVENT_WEBHOOK_URL must be a valid URL.",
    )
    .optional(),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  AZURE_STORAGE_CONNECTION_STRING: z
    .string().min(1, "AZURE_STORAGE_CONNECTION_STRING is required."),

  AZURE_STORAGE_CONTAINER_NAME: z
    .string().min(1, "AZURE_STORAGE_CONTAINER_NAME is required."),
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
      "invalid environment variables",
      result.error.flatten().fieldErrors,
    );

    throw new Error(
      "The environment variable configuration is invalid.",
    );
  }

  cachedEnv = result.data;

  return cachedEnv;
}
