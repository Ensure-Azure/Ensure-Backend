import type { TransactionRepository } from "../../application/ports/TransactionRepository";
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
}