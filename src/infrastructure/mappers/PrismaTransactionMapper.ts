import type {
  transactions as PrismaTransaction,
  transaction_status as PrismaTransactionStatus,
  transaction_type as PrismaTransactionType,
} from "@prisma/client";
import { Transaction } from "../../domain/entities/Transaction";
import { Money } from "../../domain/value-objects/Money";

export class PrismaTransactionMapper {
  static toDomain(raw: PrismaTransaction): Transaction {
    return Transaction.create({
      id: raw.id,
      transactionId: raw.transaction_id,
      accountId: raw.account_id,
      money: Money.create(raw.amount_minor, raw.currency),
      type: raw.type,
      occurredAt: raw.occurred_at,
      receivedAt: raw.received_at,
      latitude: Number(raw.latitude),
      longitude: Number(raw.longitude),
      countryCode: raw.country_code,
      city: raw.city,
      merchantId: raw.merchant_id,
      merchantName: raw.merchant_name,
      merchantCategoryCode: raw.merchant_category_code,
      destinationAccountId: raw.destination_account_id,
      status: raw.status,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });
  }

  static toPrisma(transaction: Transaction) {
    return {
      transaction_id: transaction.transactionId,
      account_id: transaction.accountId,
      amount_minor: transaction.money.amountMinor,
      currency: transaction.money.currency,
      type: transaction.type as PrismaTransactionType,
      occurred_at: transaction.occurredAt,
      latitude: transaction.latitude,
      longitude: transaction.longitude,
      country_code: transaction.countryCode,
      city: transaction.city,
      merchant_id: transaction.merchantId,
      merchant_name: transaction.merchantName,
      merchant_category_code: transaction.merchantCategoryCode,
      destination_account_id: transaction.destinationAccountId,
      status: transaction.status as PrismaTransactionStatus,
    };
  }
}
