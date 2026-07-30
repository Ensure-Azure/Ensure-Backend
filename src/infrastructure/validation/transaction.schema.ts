import { z } from "zod";

const MAX_AMOUNT_MINOR = BigInt("1000000000000");

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .optional()
    .nullable();

export const transactionIdSchema = z.uuid();

export const accountIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(100);

export const listTransactionsQuerySchema = z.object({
  accountId: accountIdSchema.optional(),
  status: z
    .enum([
      "RECEIVED",
      "PROCESSING",
      "SCORED",
      "FLAGGED",
      "FAILED",
    ])
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createTransactionSchema = z
  .object({
    transactionId: transactionIdSchema,

    accountId: accountIdSchema,

    amountMinor: z.coerce
      .bigint()
      .positive()
      .max(MAX_AMOUNT_MINOR),

    currency: z
      .string()
      .trim()
      .length(3)
      .regex(/^[A-Za-z]{3}$/)
      .transform((value) => value.toUpperCase()),

    type: z.enum([
      "PURCHASE",
      "TRANSFER",
      "WITHDRAWAL",
    ]),

    occurredAt: z.coerce
      .date()
      .refine(
        (value) => value.getTime() <= Date.now(),
        {
          message:
            "occurredAt cannot be in the future.",
        },
      ),

    latitude: z.coerce
      .number()
      .min(-90)
      .max(90),

    longitude: z.coerce
      .number()
      .min(-180)
      .max(180),

    countryCode: z
      .string()
      .trim()
      .length(2)
      .regex(/^[A-Za-z]{2}$/)
      .transform((value) => value.toUpperCase())
      .optional()
      .nullable(),

    city: optionalTrimmedString(100),

    merchantId: optionalTrimmedString(100),

    merchantName: optionalTrimmedString(150),

    merchantCategoryCode:
      optionalTrimmedString(20),

    destinationAccountId:
      optionalTrimmedString(100),
  })
  .strict()
  .superRefine((value, context) => {
    if (
      value.type === "PURCHASE" &&
      !value.merchantId &&
      !value.merchantName
    ) {
      context.addIssue({
        code: "custom",
        path: ["merchantId"],
        message:
          "PURCHASE transactions require merchantId or merchantName.",
      });
    }

    if (
      value.type === "TRANSFER" &&
      !value.destinationAccountId
    ) {
      context.addIssue({
        code: "custom",
        path: ["destinationAccountId"],
        message:
          "TRANSFER transactions require destinationAccountId.",
      });
    }

    if (
      value.amountMinor >
      MAX_AMOUNT_MINOR
    ) {
      context.addIssue({
        code: "custom",
        path: ["amountMinor"],
        message:
          "Amount exceeds the allowed range.",
      });
    }
  });

export type CreateTransactionInput = z.infer<
  typeof createTransactionSchema
>;
