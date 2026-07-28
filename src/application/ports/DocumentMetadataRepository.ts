import type {DocumentMetadata} from "@/domain/entities/DocumentMetadata";

export interface DocumentMetadataRepository {
  save(
    document: DocumentMetadata,
  ): Promise<DocumentMetadata>;

  findById(
    id: string,
    accountId: string,
  ): Promise<DocumentMetadata | null>;
}   