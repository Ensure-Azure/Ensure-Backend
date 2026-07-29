import {
  BlobServiceClient,
  type ContainerClient,
} from "@azure/storage-blob";

import { getEnv } from "@/config/env";

const env = getEnv();

export const blobServiceClient =
  BlobServiceClient.fromConnectionString(
    env.AZURE_STORAGE_CONNECTION_STRING,
  );

export const documentsContainer: ContainerClient =
  blobServiceClient.getContainerClient(
    env.AZURE_STORAGE_CONTAINER_NAME,
  );