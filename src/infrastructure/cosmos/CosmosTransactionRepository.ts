import type {
  ListTransactionsOptions,
  TransactionList,
  TransactionRepository,
} from "@/application/ports/TransactionRepository";
import type { Transaction } from "@/domain/entities/Transaction";

import { CosmosTransactionMapper } from "../mappers/CosmosTransactionMapper";
import { getTransactionsContainer } from "./client";
import type { TransactionDocument } from "./types/TransactionDocument";

export class CosmosTransactionRepository
  implements TransactionRepository
{
  async list(
    options: ListTransactionsOptions,
  ): Promise<TransactionList> {
    const filters: string[] = [];
    const parameters: Array<{
      name: string;
      value: string | number;
    }> = [];

    if (options.accountId) {
      filters.push("c.accountId = @accountId");
      parameters.push({
        name: "@accountId",
        value: options.accountId,
      });
    }

    if (options.status) {
      filters.push("c.status = @status");
      parameters.push({
        name: "@status",
        value: options.status,
      });
    }

    const where = filters.length
      ? `WHERE ${filters.join(" AND ")}`
      : "";

    const container = getTransactionsContainer();
    const [transactionsResponse, countResponse] =
      await Promise.all([
        container.items
          .query<TransactionDocument>({
            query: `SELECT * FROM c ${where} ORDER BY c.occurredAt DESC OFFSET @offset LIMIT @limit`,
            parameters: [
              ...parameters,
              { name: "@offset", value: options.offset },
              { name: "@limit", value: options.limit },
            ],
          })
          .fetchAll(),
        container.items
          .query<number>({
            query: `SELECT VALUE COUNT(1) FROM c ${where}`,
            parameters,
          })
          .fetchAll(),
      ]);

    return {
      transactions: transactionsResponse.resources.map(
        (transaction) =>
          CosmosTransactionMapper.toDomain(transaction),
      ),
      total: countResponse.resources[0] ?? 0,
    };
  }

  async findById(
    transactionId: string,
    accountId: string,
  ): Promise<Transaction | null> {
    try {
      const response =
        await getTransactionsContainer()
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
      await getTransactionsContainer().items.create<TransactionDocument>(
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

  async findRecentByAccount(): Promise<Transaction[]> {
    throw new Error(
      "Cosmos recent account queries are not wired in this runtime.",
    );
  }

  async updateScoring(): Promise<void> {
    throw new Error(
      "Cosmos scoring updates are not wired in this runtime.",
    );
  }
}
