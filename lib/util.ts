import type { Input, Species } from "./types";

/* ── 입력 인코딩 (URL에 담아 공유) ───────────────────────────── */

export function encodeInput(input: Input): string {
  const json = JSON.stringify(input);
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeInput(d: string | undefined | null): Record<string, unknown> | null {
  if (!d || d.length > 600 || !/^[A-Za-z0-9_-]+$/.test(d)) return null;
  try {
    const bin = atob(d.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const obj = JSON.parse(new TextDecoder().decode(bytes));
    return obj && typeof obj === "object" && !Array.isArray(obj) ? obj : null;
  } catch {
    return null;
  }
}

/* ── 검증 도우미 ─────────────────────────────────────────────── */

export function cleanName(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const name = v.replace(/[\u0000-\u001f<>]/g, "").trim();
  if (!name || [...name].length > 12) return null;
  return name;
}

export function cleanSpecies(v: unknown): Species | null {
  return v === "dog" || v === "cat" ? v : null;
}

export function cleanDate(v: unknown, minYear = 1990): string | null {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const [y, m, d] = v.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d);
  const dt = new Date(t);
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  if (y < minYear || t > Date.now() + 86400000) return null;
  return v;
}

export function oneOf<T extends string>(v: unknown, list: readonly T[]): T | null {
  return typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : null;
}

/* ── 한국 시간 ───────────────────────────────────────────────── */

export type Ymd = { y: number; m: number; d: number };

export function kstToday(now = new Date()): Ymd {
  const k = new Date(now.getTime() + 9 * 3600 * 1000);
  return { y: k.getUTCFullYear(), m: k.getUTCMonth() + 1, d: k.getUTCDate() };
}

export function parseYmd(s: string): Ymd {
  const [y, m, d] = s.split("-").map(Number);
  return { y, m, d };
}

export const pad2 = (n: number) => String(n).padStart(2, "0");
export const ymdKey = (t: Ymd) => `${t.y}-${pad2(t.m)}-${pad2(t.d)}`;
export const dayNumber = (t: Ymd) => Math.floor(Date.UTC(t.y, t.m - 1, t.d) / 86400000);
export const fromDayNumber = (n: number): Ymd => {
  const dt = new Date(n * 86400000);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
};

/** 생일부터 오늘까지의 개월 수 */
export function ageInMonths(birth: string, today: Ymd): number {
  const b = parseYmd(birth);
  let months = (today.y - b.y) * 12 + (today.m - b.m);
  if (today.d < b.d) months -= 1;
  return Math.max(0, months);
}

export function ageLabel(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m}개월`;
  return m === 0 ? `${y}살` : `${y}살 ${m}개월`;
}

/* ── 결정적 난수 (같은 입력 → 같은 결과) ─────────────────────── */

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed: string) {
  let a = hashStr(seed) || 1;
  const next = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => min + Math.floor(next() * (max - min + 1)),
    pick: <T,>(list: readonly T[]): T => list[Math.floor(next() * list.length)],
  };
}

/* ── 조사 처리 ───────────────────────────────────────────────── */

function hasBatchim(word: string): boolean {
  const ch = word.charCodeAt(word.length - 1);
  if (ch >= 0xac00 && ch <= 0xd7a3) return (ch - 0xac00) % 28 !== 0;
  return /[013678lmnr]$/i.test(word);
}

/** josa("콩이", "은/는") → "콩이는" */
export function josa(word: string, pair: "은/는" | "이/가" | "을/를" | "와/과" | "아/야"): string {
  const [withB, withoutB] = pair === "와/과" ? ["과", "와"] : pair.split("/");
  return word + (hasBatchim(word) ? withB : withoutB);
}

export const speciesWord = (s: Species) => (s === "dog" ? "강아지" : "고양이");
export const speciesEmoji = (s: Species) => (s === "dog" ? "🐶" : "🐱");
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
