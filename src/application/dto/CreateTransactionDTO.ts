import type { TransactionType } from "../../domain/entities/Transaction";

export type CreateTransactionDTO = {
  transactionId: string;
  accountId: string;
  amountMinor: bigint;
  currency: string;
  type: TransactionType;
  occurredAt: Date;
  latitude: number;
  longitude: number;
  countryCode?: string | null;
  city?: string | null;
  merchantId?: string | null;
  merchantName?: string | null;
  merchantCategoryCode?: string | null;
  destinationAccountId?: string | null;
};
