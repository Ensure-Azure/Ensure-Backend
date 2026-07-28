import type { RiskyMerchant } from "@/domain/fraud/types";

export type FraudSettings = {
  scoreThreshold: number;
  velocityWindowMinutes: number;
  velocityMaxTransactions: number;
  atypicalAmountMultiplier: number;
  atypicalAmountMinimumSamples: number;
  impossibleTravelMaxKmh: number;
  riskyMerchantDefaultPoints: number;
};

export interface FraudSettingsRepository {
  getSettings(): Promise<FraudSettings>;

  findRiskyMerchant(input: {
    merchantId: string | null;
    merchantName: string | null;
    merchantCategoryCode: string | null;
  }): Promise<RiskyMerchant | null>;
}
