import {
  documentMetadataAccountIdSchema,
  documentMetadataIdSchema,
} from "@/infrastructure/validation/documentMetadata.schema";

import { blobStorageService } from "@/infrastructure/storage/BlobStorageService";
import { getDocumentMetadata } from "@/main";

export const runtime = "nodejs";

export async function GET(request: Request) {
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
          message:
            "Document metadata not found.",
        },
        { status: 404 },
      );
    }

    const downloadedBlob =
      await blobStorageService.download(
        documentMetadata.blobName,
      );

    if (!downloadedBlob) {
      return Response.json(
        {
          message:
            "The file was not found in Blob Storage.",
        },
        { status: 404 },
      );
    }

    const encodedFileName =
      encodeURIComponent(
        documentMetadata.fileName,
      );

    return new Response(
      new Uint8Array(downloadedBlob.content),
      {
        status: 200,
        headers: {
          "Content-Type":
            downloadedBlob.contentType,

          "Content-Length":
            downloadedBlob.sizeBytes.toString(),

          "Content-Disposition":
            `attachment; filename*=UTF-8''${encodedFileName}`,

          "Cache-Control":
            "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Error downloading document:",
      error,
    );

    return Response.json(
      {
        message:
          "Could not download the document.",
      },
      { status: 500 },
    );
  }
}