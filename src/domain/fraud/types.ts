export type RuleType =
  | "HIGH_VELOCITY"
  | "ATYPICAL_AMOUNT"
  | "IMPOSSIBLE_LOCATION"
  | "RISKY_MERCHANT";

export type RuleEvaluation = {
  ruleType: RuleType;
  triggered: boolean;
  points: number;
  reason: string;
  evidence: Record<string, unknown>;
};

export type RiskyMerchant = {
  merchantId: string | null;
  merchantName: string | null;
  categoryCode: string | null;
  riskPoints: number;
  reason: string;
};
