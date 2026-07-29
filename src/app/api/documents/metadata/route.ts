import { randomUUID } from "node:crypto";

import { ZodError } from "zod";

import {
  getDocumentMetadata,
  saveDocumentMetadata,
} from "@/main";

import { DocumentMetadata } from "@/domain/entities/DocumentMetadata";

import {
  createDocumentMetadataSchema,
  documentMetadataAccountIdSchema,
  documentMetadataIdSchema,
} from "@/infrastructure/validation/documentMetadata.schema";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const parsedId =
    documentMetadataIdSchema.safeParse(
      url.searchParams.get("id"),
    );

  const parsedAccountId =
    documentMetadataAccountIdSchema.safeParse(
      url.searchParams.get("accountId"),
    );

  if (!parsedId.success || !parsedAccountId.success) {
    return Response.json(
      {
        message:
          "Valid id and accountId query parameters are required.",
      },
      { status: 400 },
    );
  }

  try {
    const document =
      await getDocumentMetadata.execute(
        parsedId.data,
        parsedAccountId.data,
      );

    if (!document) {
      return Response.json(
        { message: "Document metadata not found." },
        { status: 404 },
      );
    }

    return Response.json({
      document: {
        id: document.id,
        transactionId: document.transactionId,
        accountId: document.accountId,
        fileName: document.fileName,
        blobName: document.blobName,
        blobUrl: document.blobUrl,
        mimeType: document.mimeType,
        sizeBytes: document.sizeBytes,
        status: document.status,
        history: document.history,
        uploadedAt: document.uploadedAt,
        updatedAt: document.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Error getting document metadata:",
      error,
    );

    return Response.json(
      {
        message:
          "Could not get document metadata.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const dto =
      createDocumentMetadataSchema.parse(body);

    const documentMetadata =
      new DocumentMetadata(
        dto.id || randomUUID(),
        dto.transactionId,
        dto.accountId,
        dto.fileName,
        dto.blobName,
        dto.blobUrl,
        dto.mimeType,
        dto.sizeBytes,
        dto.status,
        dto.history,
        dto.uploadedAt,
        dto.updatedAt,
      );

    const savedDocument =
      await saveDocumentMetadata.execute(
        documentMetadata,
      );

    return Response.json(
      {
        created: true,
        document: {
          id: savedDocument.id,
          transactionId:
            savedDocument.transactionId,
          accountId: savedDocument.accountId,
          status: savedDocument.status,
          blobUrl: savedDocument.blobUrl,
          uploadedAt:
            savedDocument.uploadedAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          message:
            "Invalid document metadata payload.",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    if (error instanceof SyntaxError) {
      return Response.json(
        {
          message:
            "Request body must be valid JSON.",
        },
        { status: 400 },
      );
    }

    console.error(
      "Error creating document metadata:",
      error,
    );

    return Response.json(
      {
        message:
          "Could not create document metadata.",
      },
      { status: 500 },
    );
  }
}

async function parseJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new SyntaxError("Invalid JSON body.");
  }
}