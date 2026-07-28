import {
  DocumentMetadata,
  type DocumentStatus,
} from "@/domain/entities/DocumentMetadata";

import type { DocumentMetadataDocument } from "../cosmos/types/DocumentMetadataDocument";

export class CosmosDocumentMetadataMapper {
  static toPersistence(
    documentMetadata: DocumentMetadata,
  ): DocumentMetadataDocument {
    return {
      id: documentMetadata.id,
      transactionId: documentMetadata.transactionId,
      accountId: documentMetadata.accountId,

      file: {
        name: documentMetadata.fileName,
        blobName: documentMetadata.blobName,
        blobUrl: documentMetadata.blobUrl,
        mimeType: documentMetadata.mimeType,
        sizeBytes: documentMetadata.sizeBytes,
      },

      status: documentMetadata.status,

      history: documentMetadata.history.map(
        (historyItem) => ({
          status: historyItem.status,
          changedAt:
            historyItem.changedAt.toISOString(),
          description:
            historyItem.description ?? undefined,
        }),
      ),

      uploadedAt:
        documentMetadata.uploadedAt.toISOString(),

      updatedAt:
        documentMetadata.updatedAt.toISOString(),
    };
  }

  static toDomain(
    document: DocumentMetadataDocument,
  ): DocumentMetadata {
    return new DocumentMetadata(
      document.id,
      document.transactionId,
      document.accountId,

      document.file.name,
      document.file.blobName,
      document.file.blobUrl,
      document.file.mimeType,
      document.file.sizeBytes,

      document.status as DocumentStatus,

      document.history.map((historyItem) => ({
        status: historyItem.status as DocumentStatus,
        changedAt: new Date(historyItem.changedAt),
        description: historyItem.description,
      })),

      new Date(document.uploadedAt),
      new Date(document.updatedAt),
    );
  }
}