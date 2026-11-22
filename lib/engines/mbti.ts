import type { FreeResult, Input } from "../types";
import { AXES, TYPES } from "../mbti-data";
import { cleanName, cleanSpecies, josa, speciesWord } from "../util";

export type MbtiInput = Input & { t: string; p: string };

export function parse(raw: Record<string, unknown>): MbtiInput | null {
  const n = cleanName(raw.n);
  const s = cleanSpecies(raw.s);
  const t = typeof raw.t === "string" && TYPES[raw.t] ? raw.t : null;
  const p = typeof raw.p === "string" && /^\d{1,3}(\.\d{1,3}){3}$/.test(raw.p) ? raw.p : null;
  if (!n || !s || !t || !p) return null;
  if (p.split(".").some((v) => Number(v) > 100)) return null;
  return { n, s, t, p };
}

export const pcts = (input: MbtiInput) => input.p.split(".").map(Number);

export function free(input: MbtiInput): FreeResult {
  const info = TYPES[input.t];
  const brand = input.s === "dog" ? "멍BTI" : "냥BTI";
  const p = pcts(input);
  return {
    emoji: info.emoji,
    kicker: `${input.n}의 ${brand}`,
    title: `${input.t} · ${info.name}`,
    subtitle: info.line,
    tags: AXES.map((a, i) => (p[i] >= 50 ? a.leftLabel : a.rightLabel)),
    sections: [
      { icon: "✨", heading: `${josa(input.n, "은/는")} 이런 ${speciesWord(input.s)}예요`, items: info.traits },
      {
        icon: "📐",
        heading: "성향 그래프",
        bars: AXES.map((a, i) => {
          const leftWins = p[i] >= 50;
          return {
            label: leftWins ? `${a.left} ${a.leftLabel}` : `${a.right} ${a.rightLabel}`,
            value: leftWins ? p[i] : 100 - p[i],
          };
        }),
      },
    ],
    share: `${input.n}의 ${brand}는 ${input.t} "${info.name}"! 우리 아이는 무슨 유형일까요?`,
  };
}
