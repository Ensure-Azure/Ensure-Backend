import type { Transaction } from "@/domain/entities/Transaction";

export interface TransactionRepository {
  save(transaction: Transaction): Promise<Transaction>;

  findById(
    transactionId: string,
    accountId: string,
  ): Promise<Transaction | null>;

  findRecentByAccount(
    accountId: string,
    since: Date,
    limit?: number,
  ): Promise<Transaction[]>;

  updateScoring(
    transactionId: string,
    status: "SCORED" | "FLAGGED" | "FAILED",
  ): Promise<void>;
}
