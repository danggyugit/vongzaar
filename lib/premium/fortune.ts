import "server-only";
import type { PremiumResult } from "../types";
import { dayScore, seedOf, type FortuneInput } from "../engines/fortune";
import { dayNumber, fromDayNumber, kstToday, rng, ymdKey } from "../util";

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

const DETAIL: Record<string, { hi: string[]; lo: string[] }> = {
  건강운: { hi: ["몸이 가볍고 소화도 잘 되는 날이에요.", "활력이 넘쳐요. 평소보다 활동량을 늘려도 좋아요."], lo: ["평소보다 물을 자주 챙겨주세요.", "무리한 운동은 피하고 잠을 충분히 재워주세요."] },
  간식운: { hi: ["뜻밖의 간식이 생기는 날! 새로운 맛을 시도해 보세요.", "뭘 줘도 맛있게 먹는 날이에요."], lo: ["과식 주의. 간식은 평소의 절반만 주세요.", "입맛이 까다로운 날이에요. 익숙한 간식이 안전해요."] },
  놀이운: { hi: ["새 장난감이나 새 산책길에 도전하기 좋아요.", "집중력이 좋아 개인기 연습에 딱이에요."], lo: ["짧고 굵게, 10분 놀이로 충분해요.", "혼자만의 시간이 필요한 날이에요."] },
  애정운: { hi: ["눈만 마주쳐도 통하는 날. 스킨십을 듬뿍 해주세요.", "먼저 다가와 애교를 부릴 거예요."], lo: ["살짝 토라질 수 있어요. 이름을 다정하게 불러주세요.", "거리를 존중해 주면 저녁엔 먼저 다가와요."] },
};

export function premium(input: FortuneInput, now = new Date()): PremiumResult {
  const today = kstToday(now);
  const todayNo = dayNumber(today);
  const seed = seedOf(input);

  const detail = Object.entries(DETAIL).map(([label, text]) => {
    const r = rng(`${seed}|${ymdKey(today)}|${label}`);
    const value = r.int(50, 99);
    return { label, value, note: r.pick(value >= 75 ? text.hi : text.lo) };
  });

  const week = Array.from({ length: 7 }, (_, i) => {
    const day = fromDayNumber(todayNo + i);
    const dow = DOW[new Date(Date.UTC(day.y, day.m - 1, day.d)).getUTCDay()];
    return { label: i === 0 ? "오늘" : `${day.d}일(${dow})`, value: dayScore(input, day) };
  });

  const daysInMonth = new Date(Date.UTC(today.y, today.m, 0)).getUTCDate();
  const month = Array.from({ length: daysInMonth }, (_, i) => {
    const day = { y: today.y, m: today.m, d: i + 1 };
    return { day, score: dayScore(input, day) };
  });
  const upcoming = month.filter((x) => x.day.d >= today.d);
  const pool = upcoming.length >= 4 ? upcoming : month;
  const sorted = [...pool].sort((a, b) => b.score - a.score);
  const USES = ["미용·목욕하기 좋은 날", "병원·검진 가기 좋은 날", "여행·나들이 가기 좋은 날"];
  const lucky = sorted.slice(0, 3).sort((a, b) => a.day.d - b.day.d);
  const careful = sorted.slice(-2).sort((a, b) => a.day.d - b.day.d);

  return {
    sections: [
      { icon: "📊", heading: "오늘의 세부 운", bars: detail },
      { icon: "📅", heading: "이번 주 운세 흐름", bars: week },
      {
        icon: "🍀",
        heading: `${today.m}월의 행운의 날`,
        items: lucky.map((x, i) => `${today.m}월 ${x.day.d}일 (${x.score}점) — ${USES[i]}`),
      },
      {
        icon: "⚠️",
        heading: "조심하면 좋은 날",
        items: careful.map((x) => `${today.m}월 ${x.day.d}일 (${x.score}점) — 큰 일정은 피하고 푹 쉬게 해주세요`),
      },
    ],
    footnote: `이 리포트는 ${today.m}월 말까지 매일 새로 열려요. 운세는 재미로 봐주세요.`,
  };
}
