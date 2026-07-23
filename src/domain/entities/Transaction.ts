import { Money } from "../value-objects/Money";

export type TransactionType = "PURCHASE" | "TRANSFER" | "WITHDRAWAL";
export type TransactionStatus =
  | "RECEIVED"
  | "PROCESSING"
  | "SCORED"
  | "FLAGGED"
  | "FAILED";

export type TransactionProps = {
  id?: string;
  transactionId: string;
  accountId: string;
  money: Money;
  type: TransactionType;
  occurredAt: Date;
  latitude: number;
  longitude: number;
  countryCode?: string | null;
  city?: string | null;
  merchantId?: string | null;
  merchantName?: string | null;
  merchantCategoryCode?: string | null;
  destinationAccountId?: string | null;
  status?: TransactionStatus;
  receivedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export class Transaction {
  private constructor(private readonly props: Required<
    Omit<
      TransactionProps,
      | "id"
      | "countryCode"
      | "city"
      | "merchantId"
      | "merchantName"
      | "merchantCategoryCode"
      | "destinationAccountId"
    >
  > & {
    id?: string;
    countryCode: string | null;
    city: string | null;
    merchantId: string | null;
    merchantName: string | null;
    merchantCategoryCode: string | null;
    destinationAccountId: string | null;
  }) {}

  static create(props: TransactionProps): Transaction {
    return new Transaction({
      id: props.id,
      transactionId: props.transactionId,
      accountId: props.accountId,
      money: props.money,
      type: props.type,
      occurredAt: props.occurredAt,
      receivedAt: props.receivedAt ?? new Date(),
      latitude: props.latitude,
      longitude: props.longitude,
      countryCode: props.countryCode?.trim().toUpperCase() || null,
      city: props.city?.trim() || null,
      merchantId: props.merchantId?.trim() || null,
      merchantName: props.merchantName?.trim() || null,
      merchantCategoryCode: props.merchantCategoryCode?.trim() || null,
      destinationAccountId: props.destinationAccountId?.trim() || null,
      status: props.status ?? "RECEIVED",
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get transactionId(): string {
    return this.props.transactionId;
  }

  get accountId(): string {
    return this.props.accountId;
  }

  get money(): Money {
    return this.props.money;
  }

  get type(): TransactionType {
    return this.props.type;
  }

  get occurredAt(): Date {
    return this.props.occurredAt;
  }

  get receivedAt(): Date {
    return this.props.receivedAt;
  }

  get latitude(): number {
    return this.props.latitude;
  }

  get longitude(): number {
    return this.props.longitude;
  }

  get countryCode(): string | null {
    return this.props.countryCode;
  }

  get city(): string | null {
    return this.props.city;
  }

  get merchantId(): string | null {
    return this.props.merchantId;
  }

  get merchantName(): string | null {
    return this.props.merchantName;
  }

  get merchantCategoryCode(): string | null {
    return this.props.merchantCategoryCode;
  }

  get destinationAccountId(): string | null {
    return this.props.destinationAccountId;
  }

  get status(): TransactionStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      transactionId: this.transactionId,
      accountId: this.accountId,
      amountMinor: this.money.amountMinor.toString(),
      currency: this.money.currency,
      type: this.type,
      latitude: this.latitude,
      longitude: this.longitude,
      countryCode: this.countryCode,
      city: this.city,
      merchantId: this.merchantId,
      merchantName: this.merchantName,
      merchantCategoryCode: this.merchantCategoryCode,
      destinationAccountId: this.destinationAccountId,
      status: this.status,
      occurredAt: this.occurredAt.toISOString(),
      receivedAt: this.receivedAt.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
