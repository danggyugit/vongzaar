import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { ProductId } from "./types";
import { unlockScope } from "./engines";

const YEAR_MS = 365 * 24 * 3600 * 1000;

function secret(): string {
  const s = process.env.UNLOCK_SECRET;
  if (s && s.length >= 16 && s !== "change-me-to-a-long-random-string") return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("UNLOCK_SECRET 환경변수를 16자 이상의 무작위 값으로 설정해야 합니다.");
  }
  return "dev-only-unlock-secret-do-not-use-in-production";
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

/** 어떤 결과(서비스 + 입력 + 유효 범위)에 대한 결제인지 나타내는 지문 */
function fingerprint(product: ProductId, d: string, now: Date): string {
  return createHash("sha256").update(`${product}|${d}|${unlockScope(product, now)}`).digest("base64url").slice(0, 22);
}

export function issueToken(product: ProductId, d: string, orderId: string, now = new Date()): string {
  const payload = Buffer.from(JSON.stringify({ k: fingerprint(product, d, now), o: orderId, e: now.getTime() + YEAR_MS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: unknown, product: ProductId, d: string, now = new Date()): boolean {
  if (typeof token !== "string" || token.length > 400) return false;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return false;
  const a = Buffer.from(mac);
  const b = Buffer.from(sign(payload));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const { k, e } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return k === fingerprint(product, d, now) && typeof e === "number" && e > now.getTime();
  } catch {
    return false;
  }
}
