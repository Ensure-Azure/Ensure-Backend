import type {
  CreateFraudCaseInput,
  FraudCaseRepository,
} from "@/application/ports/FraudCaseRepository";
import { Prisma, type rule_type } from "@prisma/client";
import { prisma } from "../database/prisma";

export class PrismaFraudCaseRepository
  implements FraudCaseRepository
{
  async createOpenCase(
    input: CreateFraudCaseInput,
  ): Promise<{ id: string; created: boolean }> {
    const existingCase =
      await prisma.fraud_cases.findUnique({
        where: {
          transaction_id: input.transactionInternalId,
        },
      });

    if (existingCase) {
      return {
        id: existingCase.id,
        created: false,
      };
    }

    const createdCase = await prisma.fraud_cases.create({
      data: {
        transaction_id: input.transactionInternalId,
        score: input.score,
        threshold: input.threshold,
        explanation: input.explanation,
        rule_executions: {
          create: input.triggeredRules.map((rule) => ({
            rule_type: rule.ruleType as rule_type,
            points: rule.points,
            reason: rule.reason,
            evidence:
              rule.evidence as Prisma.InputJsonObject,
          })),
        },
      },
    });

    return {
      id: createdCase.id,
      created: true,
    };
  }
}
