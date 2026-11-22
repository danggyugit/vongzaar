import type { ProductId } from "./types";

export const SITE_NAME = "멍냥백서";
export const SITE_TAGLINE = "우리 아이를 더 깊이 알아가는 시간";
export const PRICE = 1000;

export type Teaser = { icon: string; heading: string; hint: string };

export type Product = {
  id: ProductId;
  emoji: string;
  title: string;
  tagline: string;
  /** 시작 화면 경로 */
  start: string;
  minutes: string;
  color: string;
  /** 유료 리포트. 없으면 전부 무료 */
  premium?: { name: string; pitch: string; teasers: Teaser[] };
};

export const PRODUCTS: Record<ProductId, Product> = {
  mbti: {
    id: "mbti",
    emoji: "🧩",
    title: "성격유형 테스트",
    tagline: "12문항으로 알아보는 멍BTI · 냥BTI",
    start: "/mbti",
    minutes: "1분",
    color: "#ff8a5c",
    premium: {
      name: "성격 심층 리포트",
      pitch: "왜 그런 행동을 하는지, 어떻게 놀아주면 좋은지까지",
      teasers: [
        { icon: "🤝", heading: "보호자와의 궁합", hint: "어떤 보호자와 가장 잘 맞을까?" },
        { icon: "🐾", heading: "찰떡 친구 · 조심할 친구", hint: "산책·합사 때 참고할 유형 궁합" },
        { icon: "🎾", heading: "맞춤 놀이 처방", hint: "이 유형이 진짜 좋아하는 놀이" },
        { icon: "😿", heading: "스트레스 신호 읽기", hint: "놓치기 쉬운 이 유형만의 SOS" },
        { icon: "💡", heading: "교감·훈련 꿀팁", hint: "성격에 맞춘 소통법" },
      ],
    },
  },
  fortune: {
    id: "fortune",
    emoji: "🔮",
    title: "오늘의 운세",
    tagline: "매일 달라지는 우리 아이의 하루",
    start: "/s/fortune",
    minutes: "10초",
    color: "#8f7bf0",
    premium: {
      name: "이달의 운세 리포트",
      pitch: "한 번 결제로 이번 달 내내 매일 열려요",
      teasers: [
        { icon: "📊", heading: "오늘의 세부 운", hint: "건강운 · 간식운 · 산책운 · 애정운" },
        { icon: "📅", heading: "이번 주 운세 흐름", hint: "7일간의 컨디션 그래프" },
        { icon: "🍀", heading: "이달의 행운의 날", hint: "미용·병원·여행 가기 좋은 날" },
        { icon: "⚠️", heading: "조심하면 좋은 날", hint: "컨디션이 처질 수 있는 날" },
      ],
    },
  },
  saju: {
    id: "saju",
    emoji: "📜",
    title: "반려동물 사주",
    tagline: "태어난 날로 보는 타고난 기질",
    start: "/s/saju",
    minutes: "10초",
    color: "#3fa796",
    premium: {
      name: "사주 심층 풀이",
      pitch: "타고난 기운부터 보호자와의 인연까지",
      teasers: [
        { icon: "☯️", heading: "오행 분포 분석", hint: "넘치는 기운과 부족한 기운" },
        { icon: "🧧", heading: "올해 · 내년 총운", hint: "한 해의 흐름과 조심할 시기" },
        { icon: "💞", heading: "보호자와의 인연 풀이", hint: "우리는 어떤 인연으로 만났을까" },
        { icon: "🌈", heading: "기운을 채우는 방법", hint: "행운의 색 · 방향 · 간식" },
      ],
    },
  },
  face: {
    id: "face",
    emoji: "👀",
    title: "관상 보기",
    tagline: "사진 한 장으로 보는 우리 아이의 복",
    start: "/s/face",
    minutes: "30초",
    color: "#e8a23a",
    premium: {
      name: "AI 사진 관상 풀이",
      pitch: "AI가 올려주신 사진을 직접 보고, 이 아이만의 풀이를 써드려요",
      teasers: [
        { icon: "📸", heading: "사진으로 본 첫인상", hint: "표정과 분위기에서 읽히는 것" },
        { icon: "🔍", heading: "눈 · 귀 · 털빛 부위별 풀이", hint: "사진 속 생김새 하나하나" },
        { icon: "💰", heading: "3대 복 점수", hint: "재물복 · 건강복 · 인복" },
        { icon: "🎭", heading: "전생 이야기", hint: "전생에 무슨 일을 했을까?" },
        { icon: "💌", heading: "아이가 보호자에게 건네는 말", hint: "얼굴에 쓰여 있는 한마디" },
      ],
    },
  },
  age: {
    id: "age",
    emoji: "🎂",
    title: "사람 나이 계산기",
    tagline: "우리 아이, 사람이라면 몇 살?",
    start: "/s/age",
    minutes: "10초",
    color: "#f27aa5",
  },
  health: {
    id: "health",
    emoji: "🩺",
    title: "건강 리포트",
    tagline: "나이·체중으로 보는 맞춤 케어",
    start: "/s/health",
    minutes: "30초",
    color: "#4a90e2",
    premium: {
      name: "맞춤 건강 케어 리포트",
      pitch: "우리 아이 숫자로 계산한 맞춤 가이드",
      teasers: [
        { icon: "🍚", heading: "하루 권장 칼로리 · 급여량", hint: "체중과 활동량으로 계산" },
        { icon: "💧", heading: "하루 권장 음수량", hint: "물, 충분히 마시고 있을까?" },
        { icon: "🗓️", heading: "나이대별 검진 스케줄", hint: "지금 챙겨야 할 검사" },
        { icon: "🔎", heading: "이 시기 주의할 질환", hint: "미리 알면 덜 놀라는 신호들" },
        { icon: "✅", heading: "주간 케어 체크리스트", hint: "양치·체중·놀이 루틴" },
      ],
    },
  },
};

export const PRODUCT_LIST: Product[] = [
  PRODUCTS.mbti,
  PRODUCTS.fortune,
  PRODUCTS.saju,
  PRODUCTS.face,
  PRODUCTS.age,
  PRODUCTS.health,
];

export const isProductId = (v: unknown): v is ProductId =>
  typeof v === "string" && Object.prototype.hasOwnProperty.call(PRODUCTS, v);
