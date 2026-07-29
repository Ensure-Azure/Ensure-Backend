import { DocumentMetadata } from "@/domain/entities/DocumentMetadata";

import {
  documentMetadataAccountIdSchema,
  documentMetadataIdSchema,
} from "@/infrastructure/validation/documentMetadata.schema";

import { blobStorageService } from "@/infrastructure/storage/BlobStorageService";

import {
  getDocumentMetadata,
  saveDocumentMetadata,
} from "@/main";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);

    const parsedId =
      documentMetadataIdSchema.safeParse(
        url.searchParams.get("id"),
      );

    const parsedAccountId =
      documentMetadataAccountIdSchema.safeParse(
        url.searchParams.get("accountId"),
      );

    if (
      !parsedId.success ||
      !parsedAccountId.success
    ) {
      return Response.json(
        {
          message:
            "Valid id and accountId query parameters are required.",
        },
        { status: 400 },
      );
    }

    const documentMetadata =
      await getDocumentMetadata.execute(
        parsedId.data,
        parsedAccountId.data,
      );

    if (!documentMetadata) {
      return Response.json(
        {
          message: "Document metadata not found.",
        },
        { status: 404 },
      );
    }

    if (documentMetadata.status === "DELETED") {
      return Response.json(
        {
          deleted: true,
          alreadyDeleted: true,
          blobDeleted: false,
          document: {
            id: documentMetadata.id,
            accountId: documentMetadata.accountId,
            transactionId:
              documentMetadata.transactionId,
            fileName: documentMetadata.fileName,
            status: documentMetadata.status,
            updatedAt:
              documentMetadata.updatedAt.toISOString(),
          },
        },
        { status: 200 },
      );
    }

    console.log("Metadata encontrada:", {
      id: documentMetadata.id,
      accountId: documentMetadata.accountId,
      blobName: documentMetadata.blobName,
      status: documentMetadata.status,
    });

    const blobDeleted =
      await blobStorageService.delete(
        documentMetadata.blobName,
      );

    console.log(
      "Resultado al eliminar Blob:",
      blobDeleted,
    );

    const now = new Date();

    const deletedDocument =
      new DocumentMetadata(
        documentMetadata.id,
        documentMetadata.transactionId,
        documentMetadata.accountId,
        documentMetadata.fileName,
        documentMetadata.blobName,
        documentMetadata.blobUrl,
        documentMetadata.mimeType,
        documentMetadata.sizeBytes,
        "DELETED",
        [
          ...documentMetadata.history,
          {
            status: "DELETED",
            changedAt: now,
            description: blobDeleted
              ? "File deleted from Azure Blob Storage."
              : "Blob was not found. Metadata marked as deleted.",
          },
        ],
        documentMetadata.uploadedAt,
        now,
      );

    console.log(
      "Guardando estado DELETED en Cosmos...",
    );

    const savedDocument =
      await saveDocumentMetadata.execute(
        deletedDocument,
      );

    return Response.json(
      {
        deleted: true,
        alreadyDeleted: false,
        blobDeleted,
        document: {
          id: savedDocument.id,
          accountId: savedDocument.accountId,
          transactionId:
            savedDocument.transactionId,
          fileName: savedDocument.fileName,
          status: savedDocument.status,
          updatedAt:
            savedDocument.updatedAt.toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Error deleting document:",
      error,
    );

    return Response.json(
      {
        message:
          "Could not delete the document.",
      },
      { status: 500 },
    );
  }
}