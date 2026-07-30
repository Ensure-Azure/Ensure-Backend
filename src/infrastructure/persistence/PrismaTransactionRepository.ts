import type {
  ListTransactionsOptions,
  TransactionList,
  TransactionRepository,
} from "../../application/ports/TransactionRepository";
import type { Transaction } from "../../domain/entities/Transaction";
import { prisma } from "../database/prisma";
import { PrismaTransactionMapper } from "../mappers/PrismaTransactionMapper";

export class PrismaTransactionRepository
  implements TransactionRepository
{
  async save(
    transaction: Transaction,
  ): Promise<Transaction> {
    const createdTransaction =
      await prisma.transactions.create({
        data: PrismaTransactionMapper.toPrisma(
          transaction,
        ),
      });

    return PrismaTransactionMapper.toDomain(
      createdTransaction,
    );
  }

  async findById(
    transactionId: string,
    accountId: string,
  ): Promise<Transaction | null> {
    const transaction =
      await prisma.transactions.findFirst({
        where: {
          transaction_id: transactionId,
          account_id: accountId,
        },
      });

    return transaction
      ? PrismaTransactionMapper.toDomain(transaction)
      : null;
  }

  async list(
    options: ListTransactionsOptions,
  ): Promise<TransactionList> {
    const where = {
      ...(options.accountId
        ? { account_id: options.accountId }
        : {}),
      ...(options.status ? { status: options.status } : {}),
    };

    const [transactions, total] = await prisma.$transaction([
      prisma.transactions.findMany({
        where,
        orderBy: [
          { occurred_at: "desc" },
          { id: "desc" },
        ],
        skip: options.offset,
        take: options.limit,
      }),
      prisma.transactions.count({ where }),
    ]);

    return {
      transactions: transactions.map((transaction) =>
        PrismaTransactionMapper.toDomain(transaction),
      ),
      total,
    };
  }

  async findRecentByAccount(
    accountId: string,
    since: Date,
    limit = 100,
  ): Promise<Transaction[]> {
    const transactions =
      await prisma.transactions.findMany({
        where: {
          account_id: accountId,
          occurred_at: {
            gte: since,
          },
        },
        orderBy: {
          occurred_at: "desc",
        },
        take: limit,
      });

    return transactions.map((transaction) =>
      PrismaTransactionMapper.toDomain(transaction),
    );
  }

  async updateScoring(
    transactionId: string,
    status: "SCORED" | "FLAGGED" | "FAILED",
  ): Promise<void> {
    await prisma.transactions.update({
      where: {
        transaction_id: transactionId,
      },
      data: {
        status,
        updated_at: new Date(),
      },
    });
  }
}
