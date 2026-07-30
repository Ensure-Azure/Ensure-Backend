import type { FraudCaseRepository } from "../ports/FraudCaseRepository";
import {
  FraudSettingsConfigurationError,
  type FraudSettings,
  type FraudSettingsRepository,
} from "../ports/FraudSettingsRepository";
import type { TransactionRepository } from "../ports/TransactionRepository";
import { buildFraudExplanation } from "@/domain/fraud/explanation";
import {
  evaluateAtypicalAmount,
  evaluateHighVelocity,
  evaluateImpossibleLocation,
  evaluateRiskyMerchant,
} from "@/domain/fraud/rules";

export class TransactionToScoreNotFoundError extends Error {
  constructor() {
    super("Transaction to score was not found.");
  }
}

export type ScoreTransactionResult = {
  transactionId: string;
  score: number;
  threshold: number;
  status: "SCORED" | "FLAGGED";
  caseId: string | null;
};

export class ScoreTransaction {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly fraudSettingsRepository: FraudSettingsRepository,
    private readonly fraudCaseRepository: FraudCaseRepository,
  ) {}

  async execute(input: {
    transactionId: string;
    accountId: string;
  }): Promise<ScoreTransactionResult> {
    const transaction =
      await this.transactionRepository.findById(
        input.transactionId,
        input.accountId,
      );

    if (!transaction || !transaction.id) {
      throw new TransactionToScoreNotFoundError();
    }

    let settings: FraudSettings;

    try {
      settings = await this.fraudSettingsRepository.getSettings();
    } catch (error) {
      if (error instanceof FraudSettingsConfigurationError) {
        await this.transactionRepository.updateScoring(
          transaction.transactionId,
          "FAILED",
        );
      }

      throw error;
    }
    const historicalSince = new Date(
      transaction.occurredAt.getTime() -
        30 * 24 * 60 * 60 * 1000,
    );
    const velocitySince = new Date(
      transaction.occurredAt.getTime() -
        settings.velocityWindowMinutes * 60 * 1000,
    );

    const [history, recent, riskyMerchant] =
      await Promise.all([
        this.transactionRepository.findRecentByAccount(
          transaction.accountId,
          historicalSince,
          100,
        ),
        this.transactionRepository.findRecentByAccount(
          transaction.accountId,
          velocitySince,
          50,
        ),
        this.fraudSettingsRepository.findRiskyMerchant({
          merchantId: transaction.merchantId,
          merchantName: transaction.merchantName,
          merchantCategoryCode:
            transaction.merchantCategoryCode,
        }),
      ]);

    const previousTransaction =
      history.find(
        (candidate) =>
          candidate.transactionId !==
            transaction.transactionId &&
          candidate.occurredAt.getTime() <=
            transaction.occurredAt.getTime(),
      ) ?? null;

    const evaluations = [
      evaluateHighVelocity({
        transaction,
        recentTransactions: recent,
        windowMinutes:
          settings.velocityWindowMinutes,
        maxTransactions:
          settings.velocityMaxTransactions,
      }),
      evaluateAtypicalAmount({
        transaction,
        historicalTransactions: history,
        multiplier:
          settings.atypicalAmountMultiplier,
        minimumSamples:
          settings.atypicalAmountMinimumSamples,
      }),
      evaluateImpossibleLocation({
        transaction,
        previousTransaction,
        maxKmh: settings.impossibleTravelMaxKmh,
      }),
      evaluateRiskyMerchant({
        transaction,
        riskyMerchant,
        defaultPoints:
          settings.riskyMerchantDefaultPoints,
      }),
    ];

    const triggeredRules = evaluations.filter(
      (evaluation) => evaluation.triggered,
    );
    const score = triggeredRules.reduce(
      (sum, evaluation) => sum + evaluation.points,
      0,
    );
    const status =
      score >= settings.scoreThreshold
        ? "FLAGGED"
        : "SCORED";

    await this.transactionRepository.updateScoring(
      transaction.transactionId,
      status,
    );

    let caseId: string | null = null;

    if (status === "FLAGGED") {
      const explanation = buildFraudExplanation({
        score,
        threshold: settings.scoreThreshold,
        triggeredRules,
      });
      const fraudCase =
        await this.fraudCaseRepository.createOpenCase({
          transactionInternalId: transaction.id,
          score,
          threshold: settings.scoreThreshold,
          triggeredRules,
          explanation,
        });

      caseId = fraudCase.id;
    }

    return {
      transactionId: transaction.transactionId,
      score,
      threshold: settings.scoreThreshold,
      status,
      caseId,
    };
  }
}
