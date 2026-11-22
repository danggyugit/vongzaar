import "server-only";
import type { PremiumResult } from "../types";
import { faceType, scores, type FaceInput, type FaceType } from "../engines/face";
import { clamp, josa, rng } from "../util";

const EARS: Record<string, string> = {
  up: "쫑긋 선 귀는 소식에 밝고 눈치가 빠른 상이에요. 집안의 작은 변화도 가장 먼저 알아채요.",
  fold: "접히거나 늘어진 귀는 성품이 온화하고 복을 흘리지 않고 담아두는 상이에요.",
  big: "큰 귀는 예로부터 장수와 큰 복의 상징이에요. 타고난 명이 길고 인기가 많아요.",
  small: "작고 야무진 귀는 실속이 있고 자기 것을 잘 챙기는 상이에요. 간식 숨긴 곳을 절대 잊지 않아요.",
};
const MUZZLE: Record<string, string> = {
  short: "짧고 납작한 코는 애정운이 강한 상이에요. 어딜 가나 예쁨을 독차지해요.",
  mid: "균형 잡힌 코는 재물이 새지 않는 상이에요. 먹을 복이 평생 끊이지 않아요.",
  long: "길고 뾰족한 코는 탐구심과 추진력의 상이에요. 원하는 건 반드시 찾아내고야 말아요.",
};
const COAT: Record<string, string> = {
  white: "하얀 털빛은 깨끗한 기운을 불러 집안의 나쁜 기운을 씻어준다고 해요.",
  black: "검은 털빛은 액운을 막아주는 수호의 색이에요. 예로부터 집을 지키는 색으로 여겼어요.",
  brown: "갈색 털빛은 땅의 기운이라 안정과 풍요를 뜻해요. 집안이 든든해져요.",
  gold: "노란 털빛은 금전의 색! 재물운을 끌어오는 복덩이 색이에요.",
  gray: "회색·은빛 털은 지혜와 품격의 색이에요. 조용히 귀한 인연을 불러와요.",
  mix: "얼룩·삼색 털은 여러 복을 한 몸에 지닌 상이에요. 특히 삼색은 행운의 상징으로 유명해요.",
};

const PAST: Record<FaceType, string[]> = {
  bok: ["큰 장터의 인심 좋은 떡집 주인", "마을 잔치를 도맡던 주막 사장님"],
  noble: ["궁궐에서 귀하게 자란 왕족", "한양 최고 가문의 외동 자제"],
  general: ["성문을 지키던 수문장", "나라를 구한 무관"],
  scholar: ["밤새 책을 읽던 집현전 학자", "별을 관찰하던 천문관"],
  gag: ["저잣거리를 웃음바다로 만들던 광대", "전국을 유랑하던 놀이패 스타"],
  charm: ["온 마을의 사랑을 받던 막내", "꽃을 가꾸던 정원사"],
};

const GIFT: Record<FaceType, string> = {
  bok: "이 아이가 온 뒤로 식탁이 풍성해지고 집에 사람이 모여요. 살림이 피는 복을 가져왔어요.",
  noble: "이 아이를 귀하게 대할수록 보호자의 격도 함께 올라가요. 좋은 인연과 기회를 불러오는 복이에요.",
  general: "이 아이가 있는 집에는 나쁜 일이 쉽게 들어오지 못해요. 가족의 안녕을 지키는 복이에요.",
  scholar: "이 아이와 함께하면 보호자의 일과 공부가 술술 풀려요. 집중력과 지혜의 복을 가져왔어요.",
  gag: "이 아이 덕분에 하루 한 번은 꼭 웃게 돼요. 웃음이 곧 건강이니, 가족의 건강복을 가져온 셈이에요.",
  charm: "이 아이를 사랑하는 동안 보호자의 마음이 부드러워져요. 사람 사이의 인연이 좋아지는 복이에요.",
};

export function premium(input: FaceInput): PremiumResult {
  const type = faceType(input);
  const sc = scores(input);
  const r = rng(`${input.n}|${input.ey}${input.er}${input.mz}${input.ct}${input.vb}`);
  const base = (a: number) => clamp(62 + a * 7 + r.int(0, 8), 60, 99);
  return {
    sections: [
      { icon: "👂", heading: "귀에 담긴 복", body: EARS[input.er] },
      { icon: "👃", heading: "코에 담긴 복", body: MUZZLE[input.mz] },
      { icon: "🎨", heading: "털빛에 담긴 복", body: COAT[input.ct] },
      {
        icon: "💰",
        heading: "3대 복 점수",
        bars: [
          { label: "재물복", value: base(sc.bok + sc.scholar) },
          { label: "건강복", value: base(sc.general + sc.gag) },
          { label: "인복", value: base(sc.charm + sc.noble) },
        ],
      },
      { icon: "🎭", heading: "전생의 직업", body: `${josa(input.n, "은/는")} 전생에 ${r.pick(PAST[type])}이었을 상이에요.` },
      { icon: "🎁", heading: "보호자에게 가져다주는 복", body: GIFT[type] },
    ],
    footnote: "관상 풀이는 보호자가 고른 생김새를 바탕으로 한 재미용 콘텐츠예요.",
  };
}
