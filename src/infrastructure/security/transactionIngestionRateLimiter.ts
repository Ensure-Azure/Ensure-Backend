import { FixedWindowRateLimiter } from "./FixedWindowRateLimiter";

export const TRANSACTION_INGESTION_RATE_LIMIT = 60;
export const TRANSACTION_INGESTION_WINDOW_MS = 60_000;

export const transactionIngestionRateLimiter =
  new FixedWindowRateLimiter(
    TRANSACTION_INGESTION_RATE_LIMIT,
    TRANSACTION_INGESTION_WINDOW_MS,
  );
