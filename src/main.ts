import { CreateTransaction } from "./application/use-cases/CreateTransaction";
import { GetTransactionByTransactionId } from "./application/use-cases/GetTransactionByTransactionId";
import { CosmosTransactionRepository } from "./infrastructure/cosmos/CosmosTransactionRepository";

const transactionRepository =
  new CosmosTransactionRepository();

export const createTransaction =
  new CreateTransaction(transactionRepository);

export const getTransactionByTransactionId =
  new GetTransactionByTransactionId(
    transactionRepository,
  );