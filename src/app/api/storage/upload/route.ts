import { randomUUID } from "node:crypto";

import { DocumentMetadata } from "@/domain/entities/DocumentMetadata";
import { saveDocumentMetadata } from "@/main";
import { blobStorageService } from "@/infrastructure/storage/BlobStorageService";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "text/csv",
]);

export async function POST(request: Request) {
  let uploadedBlobName: string | null = null;

  try {
    const formData = await request.formData();

    const file = formData.get("file");
    const accountId = formData.get("accountId");
    const transactionId = formData.get("transactionId");

    if (!(file instanceof File)) {
      return Response.json(
        { message: "A file is required." },
        { status: 400 },
      );
    }

    if (
      typeof accountId !== "string" ||
      accountId.trim().length === 0
    ) {
      return Response.json(
        { message: "accountId is required." },
        { status: 400 },
      );
    }

    if (
      typeof transactionId !== "string" ||
      transactionId.trim().length === 0
    ) {
      return Response.json(
        { message: "transactionId is required." },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return Response.json(
        { message: "The file cannot be empty." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        {
          message: "The file cannot exceed 10 MB.",
        },
        { status: 400 },
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return Response.json(
        {
          message:
            "Unsupported file type. Allowed types: PDF, JPG, PNG and CSV.",
        },
        { status: 400 },
      );
    }

    const documentId = randomUUID();
    const now = new Date();

    const safeFileName = sanitizeFileName(file.name);

    const blobName = [
      accountId,
      transactionId,
      `${documentId}-${safeFileName}`,
    ].join("/");

    const buffer = Buffer.from(
      await file.arrayBuffer(),
    );

    const uploadedBlob =
      await blobStorageService.upload({
        blobName,
        content: buffer,
        contentType: file.type,
      });

    uploadedBlobName = uploadedBlob.blobName;

    const documentMetadata =
      new DocumentMetadata(
        documentId,
        transactionId,
        accountId,
        file.name,
        uploadedBlob.blobName,
        uploadedBlob.blobUrl,
        file.type,
        uploadedBlob.sizeBytes,
        "UPLOADED",
        [
          {
            status: "UPLOADED",
            changedAt: now,
            description:
              "File uploaded to Azure Blob Storage.",
          },
        ],
        now,
        now,
      );

    const savedDocument =
      await saveDocumentMetadata.execute(
        documentMetadata,
      );

    return Response.json(
      {
        uploaded: true,
        document: {
          id: savedDocument.id,
          transactionId:
            savedDocument.transactionId,
          accountId: savedDocument.accountId,
          fileName: savedDocument.fileName,
          blobName: savedDocument.blobName,
          blobUrl: savedDocument.blobUrl,
          mimeType: savedDocument.mimeType,
          sizeBytes: savedDocument.sizeBytes,
          status: savedDocument.status,
          uploadedAt:
            savedDocument.uploadedAt.toISOString(),
        },
        storage: {
          etag: uploadedBlob.etag,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (uploadedBlobName) {
      try {
        await blobStorageService.delete(
          uploadedBlobName,
        );
      } catch (rollbackError) {
        console.error(
          "Could not roll back uploaded blob:",
          rollbackError,
        );
      }
    }

    console.error(
      "Error uploading document:",
      error,
    );

    return Response.json(
      {
        message:
          "Could not upload the document.",
      },
      { status: 500 },
    );
  }
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}