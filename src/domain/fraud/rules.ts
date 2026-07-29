import type { Transaction } from "@/domain/entities/Transaction";
import { calculateDistanceKm } from "./distance";
import type {
  RiskyMerchant,
  RuleEvaluation,
} from "./types";

export function evaluateHighVelocity(input: {
  transaction: Transaction;
  recentTransactions: Transaction[];
  windowMinutes: number;
  maxTransactions: number;
}): RuleEvaluation {
  const count = input.recentTransactions.filter(
    (transaction) =>
      transaction.transactionId !==
      input.transaction.transactionId,
  ).length;

  const triggered = count >= input.maxTransactions;

  return {
    ruleType: "HIGH_VELOCITY",
    triggered,
    points: triggered ? 35 : 0,
    reason: triggered
      ? `${count + 1} transactions in ${input.windowMinutes} minutes.`
      : "Transaction velocity is within the expected window.",
    evidence: {
      observedTransactions: count + 1,
      previousTransactions: count,
      windowMinutes: input.windowMinutes,
      maxTransactions: input.maxTransactions,
    },
  };
}

export function evaluateAtypicalAmount(input: {
  transaction: Transaction;
  historicalTransactions: Transaction[];
  multiplier: number;
  minimumSamples: number;
}): RuleEvaluation {
  const samples = input.historicalTransactions.filter(
    (transaction) =>
      transaction.transactionId !==
      input.transaction.transactionId,
  );

  if (samples.length < input.minimumSamples) {
    return {
      ruleType: "ATYPICAL_AMOUNT",
      triggered: false,
      points: 0,
      reason: "Not enough historical samples for amount comparison.",
      evidence: {
        sampleCount: samples.length,
        minimumSamples: input.minimumSamples,
      },
    };
  }

  const totalMinor = samples.reduce(
    (sum, transaction) =>
      sum + transaction.money.amountMinor,
    BigInt(0),
  );
  const averageMinor =
    totalMinor / BigInt(samples.length);
  const amountMinor =
    input.transaction.money.amountMinor;
  const multiplierObserved =
    Number(amountMinor) / Number(averageMinor);
  const triggered =
    averageMinor > BigInt(0) &&
    multiplierObserved >= input.multiplier;

  return {
    ruleType: "ATYPICAL_AMOUNT",
    triggered,
    points: triggered ? 30 : 0,
    reason: triggered
      ? `Amount is ${multiplierObserved.toFixed(2)}x over the account average.`
      : "Amount is within historical behavior.",
    evidence: {
      amountMinor: amountMinor.toString(),
      averageMinor: averageMinor.toString(),
      currency: input.transaction.money.currency,
      multiplierObserved,
      multiplierThreshold: input.multiplier,
      sampleCount: samples.length,
    },
  };
}

export function evaluateImpossibleLocation(input: {
  transaction: Transaction;
  previousTransaction: Transaction | null;
  maxKmh: number;
}): RuleEvaluation {
  if (!input.previousTransaction) {
    return {
      ruleType: "IMPOSSIBLE_LOCATION",
      triggered: false,
      points: 0,
      reason: "No previous transaction to compare location.",
      evidence: {},
    };
  }

  const minutesElapsed = Math.abs(
    input.transaction.occurredAt.getTime() -
      input.previousTransaction.occurredAt.getTime(),
  ) / 60000;
  const distanceKm = calculateDistanceKm(
    {
      latitude: input.previousTransaction.latitude,
      longitude: input.previousTransaction.longitude,
    },
    {
      latitude: input.transaction.latitude,
      longitude: input.transaction.longitude,
    },
  );
  const requiredKmh =
    minutesElapsed > 0
      ? distanceKm / (minutesElapsed / 60)
      : Number.POSITIVE_INFINITY;
  const triggered = requiredKmh > input.maxKmh;

  return {
    ruleType: "IMPOSSIBLE_LOCATION",
    triggered,
    points: triggered ? 25 : 0,
    reason: triggered
      ? `Required travel speed is ${requiredKmh.toFixed(0)} km/h.`
      : "Location change is geographically plausible.",
    evidence: {
      previousTransactionId:
        input.previousTransaction.transactionId,
      previousLatitude:
        input.previousTransaction.latitude,
      previousLongitude:
        input.previousTransaction.longitude,
      currentLatitude: input.transaction.latitude,
      currentLongitude: input.transaction.longitude,
      minutesElapsed,
      distanceKm,
      requiredKmh,
      maxKmh: input.maxKmh,
    },
  };
}

export function evaluateRiskyMerchant(input: {
  transaction: Transaction;
  riskyMerchant: RiskyMerchant | null;
  defaultPoints: number;
}): RuleEvaluation {
  const triggered = Boolean(input.riskyMerchant);

  return {
    ruleType: "RISKY_MERCHANT",
    triggered,
    points: triggered
      ? input.riskyMerchant?.riskPoints ??
        input.defaultPoints
      : 0,
    reason: triggered
      ? input.riskyMerchant?.reason ??
        "Merchant or category is marked as risky."
      : "Merchant and category are not marked as risky.",
    evidence: {
      merchantId: input.transaction.merchantId,
      merchantName: input.transaction.merchantName,
      merchantCategoryCode:
        input.transaction.merchantCategoryCode,
      matchedMerchantId:
        input.riskyMerchant?.merchantId,
      matchedMerchantName:
        input.riskyMerchant?.merchantName,
      matchedCategoryCode:
        input.riskyMerchant?.categoryCode,
    },
  };
}
