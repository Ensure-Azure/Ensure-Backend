import type {
  ListTransactionsOptions,
  TransactionList,
  TransactionRepository,
} from "../ports/TransactionRepository";

export class ListTransactions {
  constructor(
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(
    options: ListTransactionsOptions,
  ): Promise<TransactionList> {
    return this.transactionRepository.list(options);
  }
}
