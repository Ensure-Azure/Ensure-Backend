import { CreateTransaction } from "./application/use-cases/CreateTransaction";
import { GetTransactionByTransactionId } from "./application/use-cases/GetTransactionByTransactionId";
import { PrismaTransactionRepository } from "./infrastructure/persistence/PrismaTransactionRepository";

const transactionRepository = new PrismaTransactionRepository();

export const createTransaction = new CreateTransaction(transactionRepository);
export const getTransactionByTransactionId = new GetTransactionByTransactionId(
  transactionRepository,
);
