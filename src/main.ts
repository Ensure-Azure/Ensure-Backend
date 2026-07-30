import { CreateTransaction } from "./application/use-cases/CreateTransaction";
import { GetTransactionByTransactionId } from "./application/use-cases/GetTransactionByTransactionId";
import { GetDocumentMetadata } from "./application/use-cases/GetDocumentMetadata";
import { ListTransactions } from "./application/use-cases/ListTransactions";
import { SaveDocumentMetadata } from "./application/use-cases/SaveDocumentMetadata";
import { ScoreTransaction } from "./application/use-cases/ScoreTransaction";

import { CosmosDocumentMetadataRepository } from "./infrastructure/cosmos/CosmosDocumentMetadataRepository";
import { NoopTransactionEventPublisher } from "./infrastructure/messaging/NoopTransactionEventPublisher";
import { WebhookTransactionEventPublisher } from "./infrastructure/messaging/WebhookTransactionEventPublisher";
import { PrismaFraudCaseRepository } from "./infrastructure/persistence/PrismaFraudCaseRepository";
import { PrismaFraudSettingsRepository } from "./infrastructure/persistence/PrismaFraudSettingsRepository";
import { PrismaTransactionRepository } from "./infrastructure/persistence/PrismaTransactionRepository";

const transactionRepository =
  new PrismaTransactionRepository();

const transactionEventPublisher =
  process.env.TRANSACTION_EVENT_WEBHOOK_URL
    ? new WebhookTransactionEventPublisher(
        process.env.TRANSACTION_EVENT_WEBHOOK_URL,
      )
    : new NoopTransactionEventPublisher();

const fraudSettingsRepository =
  new PrismaFraudSettingsRepository();

const fraudCaseRepository =
  new PrismaFraudCaseRepository();

const documentMetadataRepository =
  new CosmosDocumentMetadataRepository();

export const createTransaction =
  new CreateTransaction(
    transactionRepository,
    transactionEventPublisher,
  );

export const getTransactionByTransactionId =
  new GetTransactionByTransactionId(
    transactionRepository,
  );

export const listTransactions = new ListTransactions(
  transactionRepository,
);

export const scoreTransaction =
  new ScoreTransaction(
    transactionRepository,
    fraudSettingsRepository,
    fraudCaseRepository,
  );

export const saveDocumentMetadata =
  new SaveDocumentMetadata(
    documentMetadataRepository,
  );

export const getDocumentMetadata =
  new GetDocumentMetadata(
    documentMetadataRepository,
  );
