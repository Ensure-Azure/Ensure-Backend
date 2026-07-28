import { CreateTransaction } from "./application/use-cases/CreateTransaction";
import { GetTransactionByTransactionId } from "./application/use-cases/GetTransactionByTransactionId";
import { GetDocumentMetadata } from "./application/use-cases/GetDocumentMetadata";
import { SaveDocumentMetadata } from "./application/use-cases/SaveDocumentMetadata";

import { CosmosDocumentMetadataRepository } from "./infrastructure/cosmos/CosmosDocumentMetadataRepository";
import { PrismaTransactionRepository } from "./infrastructure/persistence/PrismaTransactionRepository";

const transactionRepository =
  new PrismaTransactionRepository();

const documentMetadataRepository =
  new CosmosDocumentMetadataRepository();

export const createTransaction =
  new CreateTransaction(transactionRepository);

export const getTransactionByTransactionId =
  new GetTransactionByTransactionId(
    transactionRepository,
  );

export const saveDocumentMetadata =
  new SaveDocumentMetadata(
    documentMetadataRepository,
  );

export const getDocumentMetadata =
  new GetDocumentMetadata(
    documentMetadataRepository,
  );