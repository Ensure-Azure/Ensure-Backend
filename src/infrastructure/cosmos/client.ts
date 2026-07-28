import { CosmosClient } from "@azure/cosmos";

import { getEnv } from "@/config/env";

let cachedClient: CosmosClient | null = null;

export function getCosmosClient(): CosmosClient {
  if (cachedClient) {
    return cachedClient;
  }

  const env = getEnv();

  cachedClient = new CosmosClient({
    endpoint: env.COSMOS_ENDPOINT,
    key: env.COSMOS_KEY,
  });

  return cachedClient;
}

export function getCosmosDatabase() {
  const env = getEnv();

  return getCosmosClient().database(
    env.COSMOS_DATABASE_ID,
  );
}

export function getTransactionsContainer() {
  const env = getEnv();

  return getCosmosDatabase().container(
    env.COSMOS_CONTAINER_ID,
  );
}

export function getDocumentMetadataContainer() {
  const env = getEnv();

  return getCosmosDatabase().container(
    env.COSMOS_DOCUMENTS_CONTAINER_ID,
  );
}
