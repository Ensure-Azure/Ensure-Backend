import { z } from "zod";

const documentStatusSchema = z.enum([
  "UPLOADED",
  "PROCESSING",
  "AVAILABLE",
  "FAILED",
  "DELETED",
]);

export const documentMetadataIdSchema = z
  .string()
  .min(1, "id is required.");

export const documentMetadataAccountIdSchema = z
  .string()
  .min(1, "accountId is required.");

export const createDocumentMetadataSchema = z.object({
  id: z.string().min(1).optional(),
  transactionId: z.string().min(1),
  accountId: z.string().min(1),

  fileName: z.string().min(1),
  blobName: z.string().min(1),
  blobUrl: z.string().url(),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),

  status: documentStatusSchema.default("UPLOADED"),

  history: z.array(
    z.object({
      status: documentStatusSchema,
      changedAt: z.coerce.date(),
      description: z.string().optional(),
    }),
  ),

  uploadedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type CreateDocumentMetadataDto =
  z.infer<typeof createDocumentMetadataSchema>;