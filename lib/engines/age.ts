import type { FreeResult, Input, Species } from "../types";
import { ageInMonths, ageLabel, cleanDate, cleanName, cleanSpecies, josa, kstToday, oneOf } from "../util";

export type Size = "small" | "medium" | "large";
export const SIZES: readonly Size[] = ["small", "medium", "large"];
export const SIZE_LABEL: Record<Size, string> = { small: "소형 (10kg 미만)", medium: "중형 (10~25kg)", large: "대형 (25kg 이상)" };

export type AgeInput = Input & { b: string; z?: Size };

export function parse(raw: Record<string, unknown>): AgeInput | null {
  const n = cleanName(raw.n);
  const s = cleanSpecies(raw.s);
  const b = cleanDate(raw.b);
  if (!n || !s || !b) return null;
  if (s === "cat") return { n, s, b };
  const z = oneOf(raw.z, SIZES);
  return z ? { n, s, b, z } : null;
}

/** 사람 나이 환산: 첫해 15살, 둘째 해 +9살, 이후 해마다 +4(소형·고양이) / +5(중형) / +6(대형) */
export function humanAge(species: Species, months: number, size: Size = "small"): number {
  const years = months / 12;
  const perYear = species === "cat" ? 4 : { small: 4, medium: 5, large: 6 }[size];
  if (years <= 1) return years * 15;
  if (years <= 2) return 15 + (years - 1) * 9;
  return 24 + (years - 2) * perYear;
}

export type Stage = "baby" | "junior" | "adult" | "mature" | "senior";

export const STAGES: Record<Stage, { label: string; human: string; text: string }> = {
  baby: { label: "아기", human: "유아~어린이", text: "세상의 모든 것을 배우는 시기예요. 이때의 사회화 경험이 평생 성격을 좌우해요." },
  junior: { label: "청소년", human: "10대", text: "에너지가 폭발하고 호기심이 왕성한 사춘기예요. 규칙을 일관되게 알려주세요." },
  adult: { label: "성년", human: "20~30대", text: "몸도 마음도 가장 건강한 전성기예요. 좋은 습관을 만들어두면 노년이 편안해요." },
  mature: { label: "중년", human: "40~50대", text: "겉으로는 그대로여도 몸속 변화가 시작돼요. 정기 검진이 중요해지는 시기예요." },
  senior: { label: "노년", human: "60대 이상", text: "잠이 늘고 움직임이 느려져요. 편안함과 세심한 관찰이 가장 큰 선물이에요." },
};

export function stageOf(human: number): Stage {
  if (human < 12) return "baby";
  if (human < 20) return "junior";
  if (human < 40) return "adult";
  if (human < 60) return "mature";
  return "senior";
}

export function free(input: AgeInput, now = new Date()): FreeResult {
  const months = ageInMonths(input.b, kstToday(now));
  const human = Math.max(1, Math.round(humanAge(input.s, months, input.z)));
  const stage = STAGES[stageOf(human)];
  const nextYear = Math.round(humanAge(input.s, months + 12, input.z));
  return {
    emoji: "🎂",
    kicker: `${input.n}의 사람 나이`,
    title: `사람 나이로 ${human}살`,
    subtitle: `실제 나이 ${ageLabel(months)} · 사람으로 치면 ${stage.human}`,
    tags: [`${stage.label} 시기`, `1년 뒤엔 ${nextYear}살`],
    sections: [
      { icon: "🌱", heading: `지금은 '${stage.label}' 시기`, body: stage.text },
      {
        icon: "⏳",
        heading: "시간이 다르게 흘러요",
        body: `${input.n}의 1년은 사람의 약 ${nextYear - human}년이에요. 보호자의 하루가 ${josa(input.n, "이/가")} 느끼는 ${nextYear - human}일인 셈이죠. 오늘 함께하는 시간이 그만큼 소중해요.`,
      },
    ],
    share: `${josa(input.n, "은/는")} 사람 나이로 ${human}살! 우리 아이는 몇 살일까요?`,
  };
}
