import { z } from "zod";
import { accountIdSchema, transactionIdSchema } from "./transaction.schema";

export const transactionReceivedEventSchema = z
  .object({
    eventType: z.literal("transaction.received"),
    eventId: z.uuid(),
    occurredAt: z.coerce.date(),
    transaction: z.object({
      transactionId: transactionIdSchema,
      accountId: accountIdSchema,
    }),
  })
  .strict();
