import type { TransactionStatus } from "@/domain/entities/Transaction";

export type TransactionDocument = {
  id: string;
  transactionId: string;
  accountId: string;
  type: string;

  amountMinor: string;
  currency: string;

  occurredAt: string;
  receivedAt: string;

  location: {
    latitude: number;
    longitude: number;
    countryCode?: string;
    city?: string;
  };

  merchant?: {
    merchantId?: string;
    name?: string;
    categoryCode?: string;
  };

  destinationAccountId?: string;

  status: TransactionStatus;
};
