import type { Transaction } from "@/domain/entities/Transaction";

export type ListTransactionsOptions = {
  accountId?: string;
  status?: Transaction["status"];
  limit: number;
  offset: number;
};

export type TransactionList = {
  transactions: Transaction[];
  total: number;
};

export interface TransactionRepository {
  save(transaction: Transaction): Promise<Transaction>;

  findById(
    transactionId: string,
    accountId: string,
  ): Promise<Transaction | null>;

  list(
    options: ListTransactionsOptions,
  ): Promise<TransactionList>;

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
