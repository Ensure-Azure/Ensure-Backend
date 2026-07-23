type MoneyProps = {
  amountMinor: bigint;
  currency: string;
};
//test
export class Money {
  private constructor(private readonly props: MoneyProps) {}

  static create(amountMinor: bigint, currency: string): Money {
    if (amountMinor <= BigInt(0)) {
      throw new Error("Money amount minor must be greater than zero.");
    }

    const normalizedCurrency = currency.trim().toUpperCase();

    if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
      throw new Error("Money currency must be a valid ISO 4217 code.");
    }

    return new Money({
      amountMinor,
      currency: normalizedCurrency,
    });
  }

  get amountMinor(): bigint {
    return this.props.amountMinor;
  }

  get currency(): string {
    return this.props.currency;
  }

  toJSON() {
    return {
      amountMinor: this.amountMinor.toString(),
      currency: this.currency,
    };
  }
}
