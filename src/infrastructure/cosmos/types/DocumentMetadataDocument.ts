export type DocumentStatus =
  | "UPLOADED"
  | "PROCESSING"
  | "AVAILABLE"
  | "FAILED"
  | "DELETED";

export type DocumentHistoryDocument = {
  status: DocumentStatus;
  changedAt: string;
  description?: string;
};

export type DocumentMetadataDocument = {
  id: string;

  transactionId: string;
  accountId: string;

  file: {
    name: string;
    blobName: string;
    blobUrl: string;
    mimeType: string;
    sizeBytes: number;
  };

  status: DocumentStatus;

  history: DocumentHistoryDocument[];

  uploadedAt: string;
  updatedAt: string;
};