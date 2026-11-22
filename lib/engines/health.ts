import type { FreeResult, Input } from "../types";
import { ageInMonths, ageLabel, cleanDate, cleanName, cleanSpecies, kstToday, oneOf } from "../util";
import { humanAge, SIZES, stageOf, STAGES, type Size } from "./age";

export const RIB = ["easy", "ok", "hard"] as const;
export const ACT = ["low", "mid", "high"] as const;
export const NEUT = ["y", "n"] as const;

export type HealthInput = Input & {
  b: string;
  z?: Size;
  w: number;
  nt: (typeof NEUT)[number];
  rb: (typeof RIB)[number];
  ac: (typeof ACT)[number];
};

export function parse(raw: Record<string, unknown>): HealthInput | null {
  const n = cleanName(raw.n);
  const s = cleanSpecies(raw.s);
  const b = cleanDate(raw.b);
  const w = typeof raw.w === "number" ? Math.round(raw.w * 10) / 10 : NaN;
  const nt = oneOf(raw.nt, NEUT);
  const rb = oneOf(raw.rb, RIB);
  const ac = oneOf(raw.ac, ACT);
  if (!n || !s || !b || !nt || !rb || !ac) return null;
  if (!(w >= 0.3 && w <= (s === "cat" ? 20 : 100))) return null;
  if (s === "cat") return { n, s, b, w, nt, rb, ac };
  const z = oneOf(raw.z, SIZES);
  return z ? { n, s, b, z, w, nt, rb, ac } : null;
}

export type Body = "thin" | "ideal" | "over";

export const BODY: Record<Body, { label: string; text: string }> = {
  thin: { label: "마른 편", text: "갈비뼈가 쉽게 만져지고 도드라진다면 살이 조금 부족할 수 있어요. 급여량과 기생충·치아 상태를 확인해 보세요." },
  ideal: { label: "적정 체형", text: "얇은 지방 아래로 갈비뼈가 만져지는 이상적인 상태예요. 지금 식단과 운동량을 유지해 주세요." },
  over: { label: "통통한 편", text: "갈비뼈가 잘 만져지지 않는다면 체중 관리가 필요해요. 적정 체중보다 10~20%만 넘어도 관절과 심장에 부담이 돼요." },
};

export const bodyOf = (input: HealthInput): Body => ({ easy: "thin", ok: "ideal", hard: "over" } as const)[input.rb];

export function profile(input: HealthInput, now = new Date()) {
  const months = ageInMonths(input.b, kstToday(now));
  const human = Math.max(1, Math.round(humanAge(input.s, months, input.z)));
  const stage = stageOf(human);
  const body = bodyOf(input);
  let score = 92;
  if (body !== "ideal") score -= 12;
  if (input.ac === "low") score -= 8;
  if (input.ac === "mid") score -= 2;
  if (stage === "mature") score -= 4;
  if (stage === "senior") score -= 8;
  return { months, human, stage, body, score };
}

export function free(input: HealthInput, now = new Date()): FreeResult {
  const p = profile(input, now);
  const stage = STAGES[p.stage];
  const body = BODY[p.body];
  const focus =
    p.body === "over" ? "체중 관리" : p.body === "thin" ? "영양 보충" : input.ac === "low" ? "활동량 늘리기" : p.stage === "senior" || p.stage === "mature" ? "정기 검진" : "지금 습관 유지";
  return {
    emoji: "🩺",
    kicker: `${input.n}의 건강 리포트`,
    title: `생활 건강 점수 ${p.score}점`,
    subtitle: `${ageLabel(p.months)} · ${input.w}kg · 사람 나이 ${p.human}살`,
    tags: [`${stage.label} 시기`, body.label, `핵심 과제: ${focus}`],
    sections: [
      { icon: "⚖️", heading: `체형 진단: ${body.label}`, body: body.text },
      { icon: "🌱", heading: `생애주기: ${stage.label}`, body: stage.text },
      {
        icon: "🎯",
        heading: "지금 가장 중요한 한 가지",
        body: `${input.n}에게 지금 가장 필요한 건 '${focus}'예요. 구체적인 칼로리·음수량·검진 일정은 맞춤 케어 리포트에서 계산해 드려요.`,
      },
    ],
    share: `${input.n}의 생활 건강 점수는 ${p.score}점! 우리 아이 건강 리포트도 받아보세요.`,
  };
}
