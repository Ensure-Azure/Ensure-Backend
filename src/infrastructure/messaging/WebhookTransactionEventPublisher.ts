import type {
  TransactionEventPublisher,
  TransactionReceivedEvent,
} from "@/application/ports/TransactionEventPublisher";
import type { Transaction } from "@/domain/entities/Transaction";

export class WebhookTransactionEventPublisher
  implements TransactionEventPublisher
{
  constructor(private readonly webhookUrl: string) {}

  async publishTransactionReceived(
    transaction: Transaction,
  ): Promise<void> {
    const event: TransactionReceivedEvent = {
      eventType: "transaction.received",
      eventId: crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
      transaction: transaction.toJSON(),
    };

    const response = await fetch(this.webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(
        `Transaction event publish failed with status ${response.status}.`,
      );
    }
  }
}
