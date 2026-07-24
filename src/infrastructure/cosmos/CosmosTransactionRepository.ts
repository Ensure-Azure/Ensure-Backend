import type { TransactionRepository } from "@/application/ports/TransactionRepository";
import type { Transaction } from "@/domain/entities/Transaction";

import { CosmosTransactionMapper } from "../mappers/CosmosTransactionMapper";
import { transactionsContainer } from "./client";
import type { TransactionDocument } from "./types/TransactionDocument";

export class CosmosTransactionRepository
  implements TransactionRepository
{
  async findById(
    transactionId: string,
    accountId: string,
  ): Promise<Transaction | null> {
    try {
      const response = await transactionsContainer
        .item(transactionId, accountId)
        .read<TransactionDocument>();

      if (!response.resource) {
        return null;
      }

      return CosmosTransactionMapper.toDomain(
        response.resource,
      );
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 404
      ) {
        return null;
      }

      throw error;
    }
  }

  async save(
    transaction: Transaction,
  ): Promise<Transaction> {
    const document =
      CosmosTransactionMapper.toPersistence(transaction);

    const response =
      await transactionsContainer.items.create<TransactionDocument>(
        document,
      );

    if (!response.resource) {
      throw new Error(
        "Cosmos DB no devolvió la transacción creada.",
      );
    }

    return CosmosTransactionMapper.toDomain(
      response.resource,
    );
  }
}