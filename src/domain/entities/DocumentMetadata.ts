export type DocumentStatus =
  | "UPLOADED"
  | "PROCESSING"
  | "AVAILABLE"
  | "FAILED"
  | "DELETED";

export type DocumentHistory = {
  status: DocumentStatus;
  changedAt: Date;
  description?: string;
};

export class DocumentMetadata {
  constructor(
    public readonly id: string,
    public readonly transactionId: string,
    public readonly accountId: string,

    public readonly fileName: string,
    public readonly blobName: string,
    public readonly blobUrl: string,
    public readonly mimeType: string,
    public readonly sizeBytes: number,

    public readonly status: DocumentStatus,
    public readonly history: DocumentHistory[],

    public readonly uploadedAt: Date,
    public readonly updatedAt: Date,
  ) {}
}