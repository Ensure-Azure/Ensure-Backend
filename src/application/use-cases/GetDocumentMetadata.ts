import type { DocumentMetadata } from "@/domain/entities/DocumentMetadata";
import type { DocumentMetadataRepository } from "../ports/DocumentMetadataRepository";

export class GetDocumentMetadata {
  constructor(
    private readonly repository: DocumentMetadataRepository,
  ) {}

  async execute(
    id: string,
    accountId: string,
  ): Promise<DocumentMetadata | null> {
    return this.repository.findById(
      id,
      accountId,
    );
  }
}