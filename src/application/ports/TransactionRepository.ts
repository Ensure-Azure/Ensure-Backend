import type { Transaction } from "@/domain/entities/Transaction";

export interface TransactionRepository {
  save(transaction: Transaction): Promise<Transaction>;

  findById(
    transactionId: string,
    accountId: string,
  ): Promise<Transaction | null>;
}