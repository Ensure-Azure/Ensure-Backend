import { documentsContainer } from "./client";

import type {
  UploadBlobInput,
  UploadBlobResult,
} from "./blob";

export class BlobStorageService {
  async upload(
    input: UploadBlobInput,
  ): Promise<UploadBlobResult> {
    const blockBlobClient =
      documentsContainer.getBlockBlobClient(
        input.blobName,
      );

    const response =
      await blockBlobClient.uploadData(
        input.content,
        {
          blobHTTPHeaders: {
            blobContentType: input.contentType,
          },
        },
      );

    return {
      blobName: input.blobName,
      blobUrl: blockBlobClient.url,
      sizeBytes: input.content.byteLength,
      etag: response.etag ?? "",
    };
  }

  async delete(blobName: string): Promise<boolean> {
    const blockBlobClient =
      documentsContainer.getBlockBlobClient(
        blobName,
      );

    const response =
      await blockBlobClient.deleteIfExists();

    return response.succeeded;
  }

  async exists(blobName: string): Promise<boolean> {
    const blockBlobClient =
      documentsContainer.getBlockBlobClient(
        blobName,
      );

    return blockBlobClient.exists();
  }

  getBlobUrl(blobName: string): string {
    return documentsContainer.getBlockBlobClient(
      blobName,
    ).url;
  }
}

export const blobStorageService =
  new BlobStorageService();