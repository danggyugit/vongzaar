import type { FreeResult, Input } from "../types";
import { FACE_FIELDS } from "../face-data";
import { cleanName, cleanSpecies, josa, oneOf } from "../util";

export type FaceInput = Input & { ey: string; er: string; mz: string; ct: string; vb: string };

export function parse(raw: Record<string, unknown>): FaceInput | null {
  const n = cleanName(raw.n);
  const s = cleanSpecies(raw.s);
  if (!n || !s) return null;
  const out: Record<string, string> = {};
  for (const f of FACE_FIELDS) {
    const v = oneOf(raw[f.key], f.options.map((o) => o.v));
    if (!v) return null;
    out[f.key] = v;
  }
  return { n, s, ...out } as FaceInput;
}

export type FaceType = "bok" | "noble" | "general" | "scholar" | "gag" | "charm";

export const FACE_TYPES: Record<FaceType, { name: string; emoji: string; line: string; tags: string[] }> = {
  bok: { name: "복덩이상", emoji: "🍀", line: "들어오는 집마다 웃음과 복을 몰고 오는 얼굴", tags: ["재물복", "화목", "복스러움"] },
  noble: { name: "귀공자상", emoji: "👑", line: "가만히 있어도 귀티가 흐르는, 대접받을 얼굴", tags: ["귀티", "품격", "고고함"] },
  general: { name: "장군상", emoji: "🛡️", line: "우리 집을 든든하게 지켜줄 수호신의 얼굴", tags: ["용맹", "의리", "수호"] },
  scholar: { name: "선비상", emoji: "📚", line: "총명함이 눈빛에 드러나는 영리한 얼굴", tags: ["총명", "신중", "지혜"] },
  gag: { name: "개그상", emoji: "🤣", line: "보기만 해도 웃음이 나는, 타고난 분위기 메이커", tags: ["유쾌", "끼", "인기"] },
  charm: { name: "애교상", emoji: "🥰", line: "눈만 마주쳐도 마음이 녹는 사랑받을 얼굴", tags: ["사랑복", "애교", "인복"] },
};

const SCORE: Record<string, Partial<Record<FaceType, number>>> = {
  "ey:round": { charm: 2, bok: 1 },
  "ey:almond": { noble: 2, scholar: 1 },
  "ey:droopy": { bok: 2, gag: 1 },
  "ey:sharp": { general: 2, scholar: 1 },
  "er:up": { general: 1, scholar: 1 },
  "er:fold": { bok: 1, charm: 1 },
  "er:big": { gag: 2 },
  "er:small": { noble: 1, charm: 1 },
  "mz:short": { gag: 1, charm: 1 },
  "mz:mid": { bok: 1 },
  "mz:long": { noble: 1, scholar: 1 },
  "ct:white": { noble: 1 },
  "ct:black": { general: 1 },
  "ct:brown": { bok: 1 },
  "ct:gold": { gag: 1 },
  "ct:gray": { scholar: 1 },
  "ct:mix": { charm: 1 },
  "vb:soft": { bok: 2, charm: 1 },
  "vb:chic": { noble: 3 },
  "vb:fun": { gag: 3 },
  "vb:solid": { general: 2, scholar: 1 },
};

export function scores(input: FaceInput): Record<FaceType, number> {
  const total: Record<FaceType, number> = { bok: 0, noble: 0, general: 0, scholar: 0, gag: 0, charm: 0 };
  for (const f of FACE_FIELDS) {
    const add = SCORE[`${f.key}:${input[f.key]}`] ?? {};
    for (const [k, v] of Object.entries(add)) total[k as FaceType] += v ?? 0;
  }
  return total;
}

export function faceType(input: FaceInput): FaceType {
  const total = scores(input);
  return (Object.keys(total) as FaceType[]).reduce((best, k) => (total[k] > total[best] ? k : best), "bok");
}

const EYES: Record<string, string> = {
  round: "크고 둥근 눈은 정이 많고 감정이 풍부하다는 뜻이에요. 눈으로 모든 걸 말하는 타입이라 보호자가 거절을 못 해요.",
  almond: "갸름하고 깊은 눈은 영리함과 품위를 뜻해요. 상황을 조용히 지켜보다 가장 좋은 순간에 움직이는 눈이에요.",
  droopy: "순하게 처진 눈은 '복을 담는 눈'이에요. 다툼을 싫어하고 주변을 편안하게 만드는 덕이 있어요.",
  sharp: "또렷하게 올라간 눈은 기개와 판단력이 뛰어나다는 뜻이에요. 한번 믿은 가족에겐 누구보다 충직해요.",
};

export function free(input: FaceInput): FreeResult {
  const type = FACE_TYPES[faceType(input)];
  return {
    emoji: type.emoji,
    kicker: `${input.n}의 관상`,
    title: type.name,
    subtitle: type.line,
    tags: type.tags,
    sections: [
      { icon: "👁️", heading: "눈에 담긴 이야기", body: EYES[input.ey] },
      { icon: "🔖", heading: "한 줄 총평", body: `${josa(input.n, "은/는")} 타고난 ${type.tags[0]}이 얼굴에 드러나는 상이에요. 귀와 코, 털빛에 담긴 복은 심층 풀이에서 이어져요.` },
    ],
    share: `${input.n}의 관상은 "${type.name}"! ${type.line}. 우리 아이 관상도 봐보세요.`,
  };
}
