import type { RuleEvaluation } from "@/domain/fraud/types";

export type CreateFraudCaseInput = {
  transactionInternalId: string;
  score: number;
  threshold: number;
  triggeredRules: RuleEvaluation[];
  explanation: string;
};

export interface FraudCaseRepository {
  createOpenCase(
    input: CreateFraudCaseInput,
  ): Promise<{ id: string; created: boolean }>;
}
