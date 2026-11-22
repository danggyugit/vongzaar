import type { FreeResult, Input, ProductId } from "../types";
import { decodeInput, kstToday, pad2 } from "../util";
import * as mbti from "./mbti";
import * as fortune from "./fortune";
import * as saju from "./saju";
import * as face from "./face";
import * as age from "./age";
import * as health from "./health";

type Engine = {
  parse: (raw: Record<string, unknown>) => Input | null;
  free: (input: never, now?: Date) => FreeResult;
};

const ENGINES: Record<ProductId, Engine> = { mbti, fortune, saju, face, age, health };

export function parseInput(product: ProductId, d: string | undefined | null): Input | null {
  const raw = decodeInput(d);
  return raw ? ENGINES[product].parse(raw) : null;
}

export function freeResult(product: ProductId, input: Input, now = new Date()): FreeResult {
  return ENGINES[product].free(input as never, now);
}

/** 결제 한 번이 유효한 범위. 운세는 달이 바뀌면 새로 결제한다. */
export function unlockScope(product: ProductId, now = new Date()): string {
  if (product !== "fortune") return "";
  const t = kstToday(now);
  return `${t.y}-${pad2(t.m)}`;
}
