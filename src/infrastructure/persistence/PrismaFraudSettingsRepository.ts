import {
  FraudSettingsConfigurationError,
  type FraudSettings,
  type FraudSettingsRepository,
} from "@/application/ports/FraudSettingsRepository";
import type { RiskyMerchant } from "@/domain/fraud/types";
import type { Prisma } from "@prisma/client";
import { prisma } from "../database/prisma";

const REQUIRED_SETTING_KEYS = [
  "scoreThreshold",
  "velocityWindowMinutes",
  "velocityMaxTransactions",
  "atypicalAmountMultiplier",
  "atypicalAmountMinimumSamples",
  "impossibleTravelMaxKmh",
  "riskyMerchantDefaultPoints",
] as const;

export class PrismaFraudSettingsRepository
  implements FraudSettingsRepository
{
  async getSettings(): Promise<FraudSettings> {
    const rows = await prisma.fraud_settings.findMany({
      where: {
        setting_key: {
          in: REQUIRED_SETTING_KEYS,
        },
      },
    });

    const values = new Map(
      rows.map((row) => [
        row.setting_key,
        Number(row.setting_value),
      ]),
    );
    const missing = REQUIRED_SETTING_KEYS.filter(
      (key) => !values.has(key),
    );
    const invalid = REQUIRED_SETTING_KEYS.filter((key) => {
      const value = values.get(key);

      return !Number.isFinite(value) || value === undefined || value <= 0;
    });

    if (missing.length > 0 || invalid.length > 0) {
      const details = [
        missing.length > 0
          ? `missing: ${missing.join(", ")}`
          : null,
        invalid.length > 0
          ? `invalid: ${invalid.join(", ")}`
          : null,
      ]
        .filter(Boolean)
        .join("; ");

      throw new FraudSettingsConfigurationError(
        `Fraud scoring settings are not valid (${details}).`,
      );
    }

    return Object.fromEntries(
      REQUIRED_SETTING_KEYS.map((key) => [
        key,
        values.get(key),
      ]),
    ) as FraudSettings;
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
