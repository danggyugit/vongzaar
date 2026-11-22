import "server-only";
import type { PremiumResult } from "../types";
import { profile, type HealthInput } from "../engines/health";
import type { Stage } from "../engines/age";

const round10 = (v: number) => Math.round(v / 10) * 10;

/** 하루 필요 열량 계수 (기초대사량 RER = 70 × 체중^0.75 에 곱한다) */
function energyFactor(input: HealthInput, months: number, stage: Stage, body: string): { factor: number; why: string } {
  if (input.s === "dog") {
    if (months < 4) return { factor: 3.0, why: "생후 4개월 미만 성장기" };
    if (months < 12) return { factor: 2.0, why: "성장기" };
  } else if (months < 12) {
    return { factor: 2.5, why: "성장기" };
  }
  if (body === "over") return { factor: input.s === "dog" ? 1.0 : 0.8, why: "체중 감량 목표" };
  let factor = input.s === "dog" ? (input.nt === "y" ? 1.6 : 1.8) : input.nt === "y" ? 1.2 : 1.4;
  const reasons = [input.nt === "y" ? "중성화 완료" : "중성화 전"];
  if (body === "thin") {
    factor += 0.2;
    reasons.push("체중 증량 목표");
  }
  if (input.ac === "high") {
    factor += 0.2;
    reasons.push("활동량 많음");
  }
  if (input.ac === "low") {
    factor -= 0.1;
    reasons.push("활동량 적음");
  }
  if (stage === "senior") {
    factor -= 0.1;
    reasons.push("노령기");
  }
  return { factor, why: reasons.join(" · ") };
}

const CHECKUP: Record<Stage, string[]> = {
  baby: ["기초 예방접종을 수의사가 정한 일정대로 완료하기", "분변 검사와 구충", "중성화 수술 시기 상담", "유치가 제대로 빠지는지 확인"],
  junior: ["기초 접종 완료 여부와 항체 확인", "중성화 수술 상담(아직이라면)", "첫 종합 건강검진으로 '기준 수치' 만들어두기"],
  adult: ["연 1회 건강검진 (신체검사 + 기본 혈액검사)", "연 1회 추가 접종 상담", "연 1회 구강 검진, 필요하면 스케일링"],
  mature: ["연 1회 혈액·소변 검사를 포함한 종합검진", "흉부·복부 영상 검사 상담", "치과 검진과 체중 추이 기록"],
  senior: ["6개월마다 종합검진 (혈액·소변·혈압)", "심장·신장 기능 정기 추적", "관절과 인지 기능 변화 상담", "연 1회 영상 검사 상담"],
};

function watchList(input: HealthInput, stage: Stage, body: string): string[] {
  const list: string[] = [];
  const old = stage === "mature" || stage === "senior";
  if (input.s === "dog") {
    if (input.z === "small") list.push("슬개골 탈구 — 뒷다리를 들고 걷거나 깽깽이걸음을 한다면 진료가 필요해요", "치주 질환 — 소형견은 치석이 빨리 쌓여요");
    if (input.z === "medium") list.push("피부·귀 질환 — 자주 긁거나 머리를 턴다면 확인해 보세요");
    if (input.z === "large") list.push("고관절·관절 질환 — 일어설 때 힘들어하는지 살펴주세요", "위 확장·염전 — 식후 바로 격한 운동은 피해주세요");
    if (old) list.push("심장 질환 — 밤이나 흥분했을 때 기침이 늘면 검진을 받으세요", "백내장 등 눈의 변화, 몸에 만져지는 혹");
    else list.push("심장사상충·진드기 — 예방약을 매달 챙겨주세요");
  } else {
    list.push("하부 요로 질환 — 화장실을 자주 들락거리거나 소변을 못 본다면 바로 병원에 가야 해요", "치주 질환·구내염 — 침을 흘리거나 사료를 흘리며 먹는지 살펴주세요");
    if (old) list.push("만성 신장 질환 — 물을 많이 마시고 소변량이 늘면 검사를 받으세요", "갑상선 기능 항진증 — 잘 먹는데 살이 빠진다면 의심해 볼 수 있어요");
    else list.push("헤어볼·구토 — 주 2회 이상 반복되면 진료를 받으세요");
  }
  if (body === "over") list.push("비만 관련 질환 — 당뇨와 관절염 위험이 높아져요");
  return list;
}

export function premium(input: HealthInput, now = new Date()): PremiumResult {
  const p = profile(input, now);
  const rer = 70 * Math.pow(input.w, 0.75);
  const { factor, why } = energyFactor(input, p.months, p.stage, p.body);
  const kcal = rer * factor;
  const lo = round10(kcal * 0.9);
  const hi = round10(kcal * 1.1);
  const grams = Math.round(kcal / 3.5 / 5) * 5;
  const waterLo = Math.round((input.w * (input.s === "dog" ? 50 : 40)) / 10) * 10;
  const waterHi = Math.round((input.w * (input.s === "dog" ? 60 : 50)) / 10) * 10;
  const treat = round10(kcal * 0.1);

  const weekly = [
    "매일: 양치 (어렵다면 주 3회부터 시작)",
    input.s === "dog" ? "매일: 산책 2회, 냄새 맡는 시간 충분히" : "매일: 사냥 놀이 10분씩 2회",
    "매일: 식욕·배변·음수량이 평소와 같은지 확인",
    "주 1회: 같은 시간에 체중 재고 기록하기",
    "주 1회: 귀·눈·피부·발바닥 살펴보기",
    p.body === "over" ? "감량 목표: 간식을 절반으로 줄이고, 일주일에 체중의 1% 정도씩 천천히" : "월 1회: 발톱 정리와 몸 구석구석 만져보며 혹 확인",
  ];

  return {
    sections: [
      {
        icon: "🍚",
        heading: "하루 권장 칼로리 · 급여량",
        items: [
          `하루 권장 열량: 약 ${lo}~${hi}kcal`,
          `건사료 기준 하루 약 ${grams}g (100g당 350kcal 사료일 때 — 포장지의 열량을 꼭 확인하세요)`,
          `간식은 하루 ${treat}kcal 이내 (전체 열량의 10%)`,
          `계산 근거: 체중 ${input.w}kg, ${why}`,
        ],
      },
      {
        icon: "💧",
        heading: "하루 권장 음수량",
        body: `하루 약 ${waterLo}~${waterHi}ml가 적당해요 (습식 사료에 든 수분 포함). 갑자기 물을 훨씬 많이 마시거나 거의 안 마신다면 진료가 필요해요.`,
      },
      { icon: "🗓️", heading: "지금 챙겨야 할 검진", items: CHECKUP[p.stage] },
      { icon: "🔎", heading: "이 시기에 살펴볼 신호", items: watchList(input, p.stage, p.body) },
      { icon: "✅", heading: "주간 케어 체크리스트", items: weekly },
    ],
    footnote: "이 리포트는 일반적인 사양 관리 기준으로 계산한 참고 자료이며 수의사의 진단을 대신하지 않아요. 아파 보이거나 지병이 있다면 반드시 동물병원과 상담하세요.",
  };
}
