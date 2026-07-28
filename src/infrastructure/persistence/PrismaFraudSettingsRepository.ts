import type {
  FraudSettings,
  FraudSettingsRepository,
} from "@/application/ports/FraudSettingsRepository";
import type { RiskyMerchant } from "@/domain/fraud/types";
import type { Prisma } from "@prisma/client";
import { prisma } from "../database/prisma";

const DEFAULT_SETTINGS: FraudSettings = {
  scoreThreshold: 60,
  velocityWindowMinutes: 3,
  velocityMaxTransactions: 8,
  atypicalAmountMultiplier: 10,
  atypicalAmountMinimumSamples: 3,
  impossibleTravelMaxKmh: 900,
  riskyMerchantDefaultPoints: 20,
};

export class PrismaFraudSettingsRepository
  implements FraudSettingsRepository
{
  async getSettings(): Promise<FraudSettings> {
    const rows = await prisma.fraud_settings.findMany({
      where: {
        setting_key: {
          in: Object.keys(DEFAULT_SETTINGS),
        },
      },
    });

    return rows.reduce<FraudSettings>(
      (settings, row) => ({
        ...settings,
        [row.setting_key]: Number(row.setting_value),
      }),
      DEFAULT_SETTINGS,
    );
  }

  async findRiskyMerchant(input: {
    merchantId: string | null;
    merchantName: string | null;
    merchantCategoryCode: string | null;
  }): Promise<RiskyMerchant | null> {
    const riskFilters: Prisma.risk_merchantsWhereInput[] =
      [];

    if (input.merchantId) {
      riskFilters.push({
        merchant_id: input.merchantId,
      });
    }

    if (input.merchantName) {
      riskFilters.push({
        merchant_name: {
          equals: input.merchantName,
          mode: "insensitive",
        },
      });
    }

    if (input.merchantCategoryCode) {
      riskFilters.push({
        category_code: input.merchantCategoryCode,
      });
    }

    if (riskFilters.length === 0) {
      return null;
    }

    const merchant =
      await prisma.risk_merchants.findFirst({
        where: {
          active: true,
          OR: riskFilters,
        },
        orderBy: {
          risk_points: "desc",
        },
      });

    if (!merchant) {
      return null;
    }

    return {
      merchantId: merchant.merchant_id,
      merchantName: merchant.merchant_name,
      categoryCode: merchant.category_code,
      riskPoints: merchant.risk_points,
      reason: merchant.reason,
    };
  }
}
