import { randomUUID } from "node:crypto";

import { blobStorageService } from "@/infrastructure/storage/BlobStorageService";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!(file instanceof File)) {
            return Response.json(
                { message: "A file is required." },
                { status: 400 },
            );
        }

        const buffer = Buffer.from(
            await file.arrayBuffer(),
        );

        const blobName = `${randomUUID()}-${file.name}`;

        const result =
            await blobStorageService.upload({
                blobName,
                content: buffer,
                contentType: file.type,
            });

        return Response.json(
            {
                uploaded: true,
                ...result,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("Error uploading file:", error);

        return Response.json(
            {
                message: "Could not upload the file.",
            },
            { status: 500 },
        );
    }
}