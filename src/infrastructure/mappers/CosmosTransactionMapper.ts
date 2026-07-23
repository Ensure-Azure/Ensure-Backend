import {
  Transaction,
  type TransactionStatus,
} from "@/domain/entities/Transaction";
import { Money } from "@/domain/value-objects/Money";

import type { TransactionDocument } from "../cosmos/types/TransactionDocument";

export class CosmosTransactionMapper {
  static toPersistence(
    transaction: Transaction,
  ): TransactionDocument {
    return {
      id: transaction.transactionId,
      transactionId: transaction.transactionId,
      accountId: transaction.accountId,
      type: transaction.type,

      amountMinor: transaction.money.amountMinor.toString(),
      currency: transaction.money.currency,

      occurredAt: transaction.occurredAt.toISOString(),
      receivedAt: transaction.receivedAt.toISOString(),

      location: {
        latitude: transaction.latitude,
        longitude: transaction.longitude,
        countryCode: transaction.countryCode ?? undefined,
        city: transaction.city ?? undefined,
      },
      merchant:
        transaction.merchantId ||
        transaction.merchantName ||
        transaction.merchantCategoryCode
          ? {
              merchantId:
                transaction.merchantId ?? undefined,
              name: transaction.merchantName ?? undefined,
              categoryCode:
                transaction.merchantCategoryCode ??
                undefined,
            }
          : undefined,
      destinationAccountId:
        transaction.destinationAccountId ?? undefined,

      status: transaction.status,
    };
  }

  static toDomain(
    document: TransactionDocument,
  ): Transaction {
    return Transaction.create({
      id: document.id,
      transactionId: document.transactionId,
      accountId: document.accountId,
      type: document.type as
        | "PURCHASE"
        | "TRANSFER"
        | "WITHDRAWAL",

      money: Money.create(
        BigInt(document.amountMinor),
        document.currency,
      ),

      occurredAt: new Date(document.occurredAt),
      receivedAt: new Date(document.receivedAt),

      latitude: document.location.latitude,
      longitude: document.location.longitude,
      countryCode: document.location.countryCode,
      city: document.location.city,
      merchantId: document.merchant?.merchantId,
      merchantName: document.merchant?.name,
      merchantCategoryCode:
        document.merchant?.categoryCode,
      destinationAccountId:
        document.destinationAccountId,
      status: document.status as TransactionStatus,
    });
  }
}
