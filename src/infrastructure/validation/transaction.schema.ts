import { z } from "zod";

const MAX_AMOUNT_MINOR = BigInt("1000000000000");

const optionalTrimmedString = (max: number) =>
  z.preprocess((value) => {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }

    return value;
  }, z.string().trim().min(1).max(max).nullable().optional());

export const transactionIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(100);

export const accountIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(100);

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

    type: z
      .string()
      .trim()
      .transform((value) => value.toUpperCase())
      .pipe(
        z.enum([
          "PURCHASE",
          "TRANSFER",
          "WITHDRAWAL",
        ]),
      ),

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
  .passthrough()
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