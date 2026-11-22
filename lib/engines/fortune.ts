import type { FreeResult, Input } from "../types";
import { cleanDate, cleanName, cleanSpecies, josa, kstToday, rng, ymdKey, type Ymd } from "../util";

export type FortuneInput = Input & { b: string };

export function parse(raw: Record<string, unknown>): FortuneInput | null {
  const n = cleanName(raw.n);
  const s = cleanSpecies(raw.s);
  const b = cleanDate(raw.b);
  if (!n || !s || !b) return null;
  return { n, s, b };
}

export const seedOf = (input: FortuneInput) => `${input.n}|${input.s}|${input.b}`;

/** 하루 총운 점수 (55~99). 유료 리포트의 주간·월간 흐름과 같은 값을 쓴다. */
export function dayScore(input: FortuneInput, day: Ymd): number {
  return rng(`${seedOf(input)}|${ymdKey(day)}|total`).int(55, 99);
}

const HEADLINE: { min: number; title: string; text: string[] }[] = [
  { min: 90, title: "최고의 하루", text: ["뭘 해도 예쁨받는 날이에요. 평소 미뤄둔 새로운 도전을 해보기 딱 좋아요.", "행운이 꼬리를 물고 따라오는 날. 오늘 찍은 사진은 인생샷이 될 거예요."] },
  { min: 80, title: "기분 좋은 하루", text: ["컨디션이 좋아 발걸음이 가벼운 날이에요. 평소보다 조금 긴 놀이 시간을 선물해 주세요.", "좋은 냄새, 좋은 만남이 기다리는 날. 새로운 길로 가보는 것도 좋아요."] },
  { min: 70, title: "무난하게 평화로운 하루", text: ["큰 사건 없이 포근하게 흘러가는 날이에요. 익숙한 루틴이 가장 큰 행복이에요.", "잔잔한 하루예요. 창가에서 햇볕 쬐는 시간이 오늘의 하이라이트."] },
  { min: 0, title: "쉬어가는 하루", text: ["조금 예민해질 수 있는 날이에요. 무리한 일정보다 푹 쉬게 해주세요.", "에너지가 평소보다 낮은 날. 조용한 자리와 좋아하는 담요가 약이에요."] },
];

const SNACK = { dog: ["고구마 말랭이", "닭가슴살 육포", "북어 트릿", "단호박 큐브", "오리 목뼈 껌", "사과 한 조각", "황태 스틱", "치즈 큐브"], cat: ["츄르", "동결건조 닭가슴살", "북어 트릿", "캣닢 쿠키", "참치 캔 한 숟갈", "연어 트릿", "열빙어 간식", "캣그라스"] };
const COLOR = ["개나리 노랑", "하늘 파랑", "딸기 분홍", "숲 초록", "크림 아이보리", "노을 주황", "라벤더 보라", "구름 하양"];
const ITEM = { dog: ["삑삑이 공", "보호자 양말", "포근한 담요", "새 하네스", "노즈워크 매트", "창가 자리"], cat: ["택배 상자", "깃털 낚싯대", "햇볕 드는 창틀", "스크래처", "보호자 무릎", "종이봉투"] };
const VOICE = { dog: ["오늘은 산책 5분만 더 해줘. 그게 내 소원이야.", "네가 웃으면 나도 꼬리가 멈추질 않아.", "간식 봉지 소리, 다 듣고 있어.", "오늘도 현관 앞에서 기다릴게.", "쓰다듬는 손은 멈추지 말아 줘."], cat: ["오늘은 내가 먼저 다가가 줄게. 특별히.", "키보드 위는 내 자리야. 양보는 없어.", "밥그릇 바닥이 보이면 그건 비상사태야.", "네 무릎, 오늘은 예약했어.", "새벽 우다다는 사랑의 표현이야."] };

export function free(input: FortuneInput, now = new Date()): FreeResult {
  const today = kstToday(now);
  const score = dayScore(input, today);
  const r = rng(`${seedOf(input)}|${ymdKey(today)}|free`);
  const head = HEADLINE.find((h) => score >= h.min)!;
  return {
    emoji: "🔮",
    kicker: `${today.m}월 ${today.d}일 · ${input.n}의 오늘의 운세`,
    title: `${score}점 · ${head.title}`,
    subtitle: r.pick(head.text),
    tags: [`행운의 간식 ${r.pick(SNACK[input.s])}`, `행운의 색 ${r.pick(COLOR)}`],
    sections: [
      { icon: "🧸", heading: "오늘의 행운 아이템", body: `${r.pick(ITEM[input.s])} — 오늘 ${josa(input.n, "이/가")} 유독 좋아할 거예요.` },
      { icon: "💬", heading: `${josa(input.n, "이/가")} 전하는 한마디`, body: `"${r.pick(VOICE[input.s])}"` },
    ],
    share: `${input.n}의 오늘 운세는 ${score}점 "${head.title}"! 우리 아이 운세도 확인해 보세요.`,
  };
}
