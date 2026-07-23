import type { TransactionRepository } from "../ports/TransactionRepository";
import type { Transaction } from "../../domain/entities/Transaction";

export class GetTransactionByTransactionId {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(transactionId: string): Promise<Transaction | null> {
    return this.transactionRepository.findByTransactionId(transactionId);
  }
}
