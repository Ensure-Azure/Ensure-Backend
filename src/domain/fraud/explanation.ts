import type { RuleEvaluation } from "./types";

export function buildFraudExplanation(input: {
  score: number;
  threshold: number;
  triggeredRules: RuleEvaluation[];
}): string {
  const lines = [
    `Transaction flagged with score ${input.score} (threshold: ${input.threshold}).`,
  ];

  for (const rule of input.triggeredRules) {
    lines.push(
      `${rule.reason} (+${rule.points} points).`,
    );
  }

  return lines.join("\n");
}
