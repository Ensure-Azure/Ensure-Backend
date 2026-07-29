export type UploadBlobInput = {
  blobName: string;
  content: Buffer;
  contentType: string;
};

export type UploadBlobResult = {
  blobName: string;
  blobUrl: string;
  sizeBytes: number;
  etag:string;
};

export type DownloadBlobResult = {
  content: Buffer;
  contentType: string;
  sizeBytes: number;
};