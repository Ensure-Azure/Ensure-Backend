import type { TransactionEventPublisher } from "@/application/ports/TransactionEventPublisher";
import type { Transaction } from "@/domain/entities/Transaction";

export class NoopTransactionEventPublisher
  implements TransactionEventPublisher
{
  async publishTransactionReceived(
    transaction: Transaction,
  ): Promise<void> {
    void transaction;
    return;
  }
}
