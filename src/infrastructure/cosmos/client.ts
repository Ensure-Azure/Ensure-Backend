import { CosmosClient } from "@azure/cosmos";

import { getEnv } from "@/config/env";

const env = getEnv();

export const cosmosClient = new CosmosClient({
  endpoint: env.COSMOS_ENDPOINT,
  key: env.COSMOS_KEY,
});

export const cosmosDatabase = cosmosClient.database(
  env.COSMOS_DATABASE_ID,
);

export const transactionsContainer =
  cosmosDatabase.container(
    env.COSMOS_CONTAINER_ID,
  );