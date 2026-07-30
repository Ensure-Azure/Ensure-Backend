import { ZodError } from "zod";
import {
  createTransaction,
  getTransactionByTransactionId,
  listTransactions,
} from "../../../main";
import {
  createTransactionSchema,
  transactionIdSchema,
  accountIdSchema,
  listTransactionsQuerySchema,
} from "../../../infrastructure/validation/transaction.schema";
import { getRequestOrigin } from "../../../infrastructure/security/requestOrigin";
import { transactionIngestionRateLimiter } from "../../../infrastructure/security/transactionIngestionRateLimiter";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const transactionId = url.searchParams.get("transactionId");
  const accountId = url.searchParams.get("accountId");

  if (!transactionId) {
    const parsedQuery = listTransactionsQuerySchema.safeParse({
      accountId: accountId ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      offset: url.searchParams.get("offset") ?? undefined,
    });

    if (!parsedQuery.success) {
      return Response.json(
        {
          message: "Invalid transaction list query parameters.",
          issues: parsedQuery.error.issues,
        },
        { status: 400 },
      );
    }

    try {
      const result = await listTransactions.execute(
        parsedQuery.data,
      );

      return Response.json({
        transactions: result.transactions.map((transaction) =>
          transaction.toJSON(),
        ),
        pagination: {
          total: result.total,
          limit: parsedQuery.data.limit,
          offset: parsedQuery.data.offset,
          hasMore:
            parsedQuery.data.offset + result.transactions.length <
            result.total,
        },
      });
    } catch (error) {
      console.error("Error listing transactions:", error);

      return Response.json(
        { message: "Could not list transactions." },
        { status: 500 },
      );
    }
  }

  const parsedTransactionId =
    transactionIdSchema.safeParse(
      transactionId,
    );

  const parsedAccountId =
    accountIdSchema.safeParse(
      accountId,
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
    const rateLimit = transactionIngestionRateLimiter.check(
      getRequestOrigin(request),
    );

    if (!rateLimit.allowed) {
      return Response.json(
        {
          message:
            "Too many transaction ingestion requests. Try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimit.retryAfterSeconds.toString(),
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

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
      {
        status: result.created ? 202 : 200,
        headers: {
          "X-RateLimit-Limit": rateLimit.limit.toString(),
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        },
      },
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
