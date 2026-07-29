import { ZodError } from "zod";
import { createTransaction, getTransactionByTransactionId } from "../../../main";
import {
  createTransactionSchema,
  transactionIdSchema,
  accountIdSchema,
} from "../../../infrastructure/validation/transaction.schema";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const parsedTransactionId =
    transactionIdSchema.safeParse(
      url.searchParams.get("transactionId"),
    );

  const parsedAccountId =
    accountIdSchema.safeParse(
      url.searchParams.get("accountId"),
    );

  if (
    !parsedTransactionId.success ||
    !parsedAccountId.success
  ) {
    return Response.json(
      {
        message:
          "Valid transactionId and accountId query parameters are required.",
      },
      { status: 400 },
    );
  }

  const transaction =
    await getTransactionByTransactionId.execute(
      parsedTransactionId.data,
      parsedAccountId.data,
    );

  if (!transaction) {
    return Response.json(
      { message: "Transaction not found." },
      { status: 404 },
    );
  }

  return Response.json({
    transaction: transaction.toJSON(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const dto = createTransactionSchema.parse(body);
    const result = await createTransaction.execute(dto);

    return Response.json(
      {
        accepted: true,
        duplicate: !result.created,
        transactionId: result.transaction.transactionId,
        id: result.transaction.id,
        status: result.transaction.status,
        receivedAt: result.transaction.receivedAt.toISOString(),
      },
      { status: result.created ? 202 : 200 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          message: "Invalid transaction payload.",
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
    
    console.error("Error creating transaction:", error);
    
    return Response.json(
      { message: "Could not create transaction." },
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
