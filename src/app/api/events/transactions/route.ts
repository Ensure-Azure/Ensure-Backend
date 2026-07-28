import { ZodError } from "zod";
import { scoreTransaction } from "../../../../main";
import { TransactionToScoreNotFoundError } from "../../../../application/use-cases/ScoreTransaction";
import { transactionReceivedEventSchema } from "../../../../infrastructure/validation/event.schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const event =
      transactionReceivedEventSchema.parse(body);
    const result = await scoreTransaction.execute({
      transactionId:
        event.transaction.transactionId,
      accountId: event.transaction.accountId,
    });

    return Response.json(
      {
        processed: true,
        ...result,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          message: "Invalid transaction event.",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    if (error instanceof SyntaxError) {
      return Response.json(
        { message: "Request body must be valid JSON." },
        { status: 400 },
      );
    }

    if (
      error instanceof
      TransactionToScoreNotFoundError
    ) {
      return Response.json(
        {
          message:
            "Transaction not found. Ingest the transaction before sending the scoring event.",
        },
        { status: 404 },
      );
    }

    console.error(
      "Error processing transaction event:",
      error,
    );

    return Response.json(
      { message: "Could not process transaction event." },
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
