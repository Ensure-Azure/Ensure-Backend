import type { CreateTransactionDTO } from "../dto/CreateTransactionDTO";
import type { TransactionRepository } from "../ports/TransactionRepository";
import { Transaction } from "../../domain/entities/Transaction";
import { Money } from "../../domain/value-objects/Money";

export type CreateTransactionResult = {
  transaction: Transaction;
  created: boolean;
};

export class CreateTransaction {
  constructor(
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(
    dto: CreateTransactionDTO,
  ): Promise<CreateTransactionResult> {
    const existingTransaction =
      await this.transactionRepository.findById(
        dto.transactionId,
        dto.accountId,
      );

    if (existingTransaction) {
      return {
        transaction: existingTransaction,
        created: false,
      };
    }

    const transaction = Transaction.create({
      transactionId: dto.transactionId,
      accountId: dto.accountId,
      money: Money.create(
        dto.amountMinor,
        dto.currency,
      ),
      type: dto.type,
      occurredAt: dto.occurredAt,
      latitude: dto.latitude,
      longitude: dto.longitude,
      countryCode: dto.countryCode,
      city: dto.city,
      merchantId: dto.merchantId,
      merchantName: dto.merchantName,
      merchantCategoryCode:
        dto.merchantCategoryCode,
      destinationAccountId:
        dto.destinationAccountId,
    });

    const savedTransaction =
      await this.transactionRepository.save(
        transaction,
      );

    return {
      transaction: savedTransaction,
      created: true,
    };
  }
}