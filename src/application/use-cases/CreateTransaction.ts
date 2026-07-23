import type { CreateTransactionDTO } from "../dto/CreateTransactionDTO";
import type { TransactionRepository } from "../ports/TransactionRepository";
import { Transaction } from "../../domain/entities/Transaction";
import { Money } from "../../domain/value-objects/Money";

export type CreateTransactionResult = {
  transaction: Transaction;
  created: boolean;
};

export class CreateTransaction {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(dto: CreateTransactionDTO): Promise<CreateTransactionResult> {
    const existingTransaction =
      await this.transactionRepository.findByTransactionId(dto.transactionId);

    if (existingTransaction) {
      return {
        transaction: existingTransaction,
        created: false,
      };
    }

    const transaction = Transaction.create({
      transactionId: dto.transactionId,
      accountId: dto.accountId,
      money: Money.create(dto.amountMinor, dto.currency),
      type: dto.type,
      occurredAt: dto.occurredAt,
      latitude: dto.latitude,
      longitude: dto.longitude,
      countryCode: dto.countryCode,
      city: dto.city,
      merchantId: dto.merchantId,
      merchantName: dto.merchantName,
      merchantCategoryCode: dto.merchantCategoryCode,
      destinationAccountId: dto.destinationAccountId,
    });

    return {
      transaction: await this.transactionRepository.create(transaction),
      created: true,
    };
  }
}
