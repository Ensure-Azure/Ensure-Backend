import type { TransactionRepository } from "../../application/ports/TransactionRepository";
import type { Transaction } from "../../domain/entities/Transaction";
import { prisma } from "../database/prisma";
import { PrismaTransactionMapper } from "../mappers/PrismaTransactionMapper";

export class PrismaTransactionRepository implements TransactionRepository {
  async create(transaction: Transaction): Promise<Transaction> {
    const createdTransaction = await prisma.transactions.create({
      data: PrismaTransactionMapper.toPrisma(transaction),
    });

    return PrismaTransactionMapper.toDomain(createdTransaction);
  }

  async findByTransactionId(transactionId: string): Promise<Transaction | null> {
    const transaction = await prisma.transactions.findUnique({
      where: {
        transaction_id: transactionId,
      },
    });

    return transaction ? PrismaTransactionMapper.toDomain(transaction) : null;
  }
}
