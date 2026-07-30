import type { DocumentMetadataRepository } from "@/application/ports/DocumentMetadataRepository";
import type { DocumentMetadata } from "@/domain/entities/DocumentMetadata";

import { CosmosDocumentMetadataMapper } from "../mappers/CosmosDocumentMetadataMapper";
import { getDocumentMetadataContainer } from "./client";
import type { DocumentMetadataDocument } from "./types/DocumentMetadataDocument";

export class CosmosDocumentMetadataRepository
  implements DocumentMetadataRepository
{
  async findById(
    id: string,
    accountId: string,
  ): Promise<DocumentMetadata | null> {
    try {
      const response =
        await getDocumentMetadataContainer()
          .item(id, accountId)
          .read<DocumentMetadataDocument>();

      if (!response.resource) {
        return null;
      }

      return CosmosDocumentMetadataMapper.toDomain(
        response.resource,
      );
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 404
      ) {
        return null;
      }

      throw error;
    }
  }

  async save(
    documentMetadata: DocumentMetadata,
  ): Promise<DocumentMetadata> {
    const document =
      CosmosDocumentMetadataMapper.toPersistence(
        documentMetadata,
      );

    const response =
      await getDocumentMetadataContainer().items.create<DocumentMetadataDocument>(
        document,
      );

    if (!response.resource) {
      throw new Error(
        "Cosmos DB did not return the metadata for the created document.",
      );
    }

    return CosmosDocumentMetadataMapper.toDomain(
      response.resource,
    );
  }
}
