import type { Transaction } from "@/domain/entities/Transaction";

export type TransactionReceivedEvent = {
  eventType: "transaction.received";
  eventId: string;
  occurredAt: string;
  transaction: ReturnType<Transaction["toJSON"]>;
};

export interface TransactionEventPublisher {
  publishTransactionReceived(
    transaction: Transaction,
  ): Promise<void>;
}
