import "server-only";
import type { Input, PremiumResult, ProductId } from "../types";
import { premium as mbti } from "./mbti";
import { premium as fortune } from "./fortune";
import { premium as saju } from "./saju";
import { premium as face } from "./face";
import { premium as health } from "./health";

const PREMIUM: Partial<Record<ProductId, (input: never, now?: Date) => PremiumResult>> = { mbti, fortune, saju, face, health };

export function premiumResult(product: ProductId, input: Input, now = new Date()): PremiumResult | null {
  const fn = PREMIUM[product];
  return fn ? fn(input as never, now) : null;
}
