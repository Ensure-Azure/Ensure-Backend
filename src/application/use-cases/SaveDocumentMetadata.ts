import type { DocumentMetadata } from "@/domain/entities/DocumentMetadata";
import type { DocumentMetadataRepository } from "../ports/DocumentMetadataRepository";

export class SaveDocumentMetadata {
  constructor(
    private readonly repository: DocumentMetadataRepository,
  ) {}

  async execute(
    document: DocumentMetadata,
  ): Promise<DocumentMetadata> {
    return this.repository.save(document);
  }
}