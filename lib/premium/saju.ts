import "server-only";
import type { PremiumResult } from "../types";
import { ELEMENTS, ELEMENT_EMOJI, elementCounts, pillars, stemElement, yearPillar, pillarName, type SajuInput } from "../engines/saju";
import { josa, kstToday } from "../util";

const FILL = [
  { color: "초록", dir: "동쪽", snack: { dog: "브로콜리·오이 같은 채소 간식", cat: "캣그라스" }, act: "풀밭·숲길 산책이나 창가에 화분 두기" },
  { color: "빨강·주황", dir: "남쪽", snack: { dog: "당근·단호박 간식", cat: "닭가슴살 트릿" }, act: "햇볕 쬐기, 신나게 뛰는 놀이" },
  { color: "노랑·베이지", dir: "집의 중앙", snack: { dog: "고구마 간식", cat: "단호박 퓨레" }, act: "규칙적인 식사 시간과 푹신한 방석" },
  { color: "하양·은색", dir: "서쪽", snack: { dog: "황태·북어 트릿", cat: "흰살생선 간식" }, act: "빗질·발톱 정리 같은 깔끔한 관리" },
  { color: "검정·남색", dir: "북쪽", snack: { dog: "수분 많은 습식 간식", cat: "츄르·습식 캔" }, act: "물그릇 늘리기, 조용히 쉬는 시간" },
];

const SURPLUS = [
  "고집이 세지고 제 뜻대로 하려는 경향이 강해질 수 있어요.",
  "쉽게 흥분하고 에너지가 넘쳐 진정이 어려울 수 있어요.",
  "움직이기 싫어하고 변화를 꺼릴 수 있어요. 체중 관리에 신경 써주세요.",
  "예민하고 경계심이 높아질 수 있어요. 안심할 공간을 만들어 주세요.",
  "생각이 많아 겁이 늘거나 혼자 있으려 할 수 있어요.",
];

/** 일간 기준으로 다른 오행과의 관계: 0 같은 기운, 1 내가 낳는, 2 내가 다스리는, 3 나를 다스리는, 4 나를 낳는 */
const relation = (me: number, other: number) => (other - me + 5) % 5;

/** 관계마다 두 가지 풀이: [양의 해, 음의 해]. 같은 기운이 2년 연달아 와도 풀이가 겹치지 않는다. */
const YEAR_LUCK: { title: [string, string]; text: [string, string] }[] = [
  {
    title: ["자신감이 붙는 해", "친구가 늘어나는 해"],
    text: [
      "나와 같은 기운이 강하게 들어와 당당해져요. 고집이 세질 수 있으니 규칙은 일관되게 지켜주세요.",
      "나와 닮은 기운이 부드럽게 들어와요. 새로운 친구를 사귀거나 가족이 늘기 좋은 해예요.",
    ],
  },
  {
    title: ["재능이 꽃피는 해", "애교가 늘어나는 해"],
    text: [
      "표현력과 활동성이 커져요. 새로운 개인기나 놀이를 가르치면 쑥쑥 배워요. 에너지 소모가 크니 잘 먹고 잘 자게 해주세요.",
      "감정 표현이 섬세해지고 보호자에게 하고 싶은 말이 많아져요. 요구가 늘 수 있으니 잘 들어주되 버릇은 잡아주세요.",
    ],
  },
  {
    title: ["먹을 복이 터지는 해", "뜻밖의 선물이 들어오는 해"],
    text: [
      "간식과 선물이 유독 많이 들어와요. 복은 좋지만 체중은 조심! 정기적으로 몸무게를 재어 주세요.",
      "꾸준히 챙겨주는 손길이 늘어나는 해예요. 새 장난감, 새 방석처럼 살림이 하나씩 늘어요.",
    ],
  },
  {
    title: ["의젓해지는 해", "차분히 다듬어지는 해"],
    text: [
      "규칙과 절제의 기운이 강하게 들어와요. 환경 변화가 생길 수 있으니 적응 시간을 넉넉히 주세요.",
      "예절이 몸에 배고 한층 어른스러워져요. 스트레스에 민감해질 수 있으니 건강검진을 꼭 챙겨주세요.",
    ],
  },
  {
    title: ["사랑을 듬뿍 받는 해", "몸과 마음이 편안해지는 해"],
    text: [
      "돌봄과 보호의 기운이 가득해요. 보호자와의 유대가 더 깊어지는 해예요.",
      "쉬어가며 회복하는 기운이에요. 푹 자고 잘 먹으며 컨디션이 안정돼요.",
    ],
  },
];

const BOND = [
  { title: "닮은꼴 단짝", text: "같은 기운을 가진 사이라 말하지 않아도 서로를 알아요. 친구처럼 편하지만 둘 다 고집을 부리면 팽팽해질 수 있어요." },
  { title: "보호자가 받는 인연", text: "아이의 기운이 보호자를 북돋아 줘요. 이 아이와 함께한 뒤로 웃을 일이 많아졌다면 그게 바로 이 인연의 힘이에요." },
  { title: "아이가 이끄는 인연", text: "알고 보면 아이가 보호자를 움직이는 사이예요. 산책 시간도 기상 시간도 어느새 아이에게 맞춰져 있을 거예요." },
  { title: "보호자가 이끄는 인연", text: "보호자가 든든한 울타리가 되어주는 사이예요. 아이는 보호자의 규칙 안에서 가장 큰 안정감을 느껴요." },
  { title: "보호자가 주는 인연", text: "보호자의 기운이 아이를 길러내는 사이예요. 주는 만큼 아이가 쑥쑥 자라고 밝아지는, 부모 자식 같은 인연이에요." },
];

export function premium(input: SajuInput, now = new Date()): PremiumResult {
  const counts = elementCounts(input.b);
  const me = stemElement(pillars(input.b).day.stem);
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  const strong = counts.indexOf(max);
  const weak = counts.indexOf(min);
  const fill = FILL[weak];
  const { y } = kstToday(now);

  const yearItems = [y, y + 1].map((year) => {
    const yp = yearPillar(year);
    const luck = YEAR_LUCK[relation(me, stemElement(yp.stem))];
    const yinYang = yp.stem % 2;
    return `${year}년(${pillarName(yp)}년) — ${luck.title[yinYang]}. ${luck.text[yinYang]}`;
  });

  let bond;
  if (input.ob) {
    const owner = stemElement(pillars(input.ob).day.stem);
    const b = BOND[relation(me, owner)];
    bond = {
      icon: "💞",
      heading: `보호자와의 인연: ${b.title}`,
      body: `${input.n}의 기운은 ${ELEMENTS[me]}, 보호자의 기운은 ${ELEMENTS[owner]}. ${b.text}`,
    };
  } else {
    const best = (me + 4) % 5;
    bond = {
      icon: "💞",
      heading: "보호자와의 인연",
      body: `${josa(input.n, "은/는")} ${ELEMENTS[best]}의 기운을 가진 보호자를 만나면 가장 편안해요. 보호자 생년월일을 함께 입력하면 두 사람의 인연을 구체적으로 풀어드려요.`,
    };
  }

  return {
    sections: [
      {
        icon: "☯️",
        heading: "오행 분포",
        bars: ELEMENTS.map((e, i) => ({ label: `${ELEMENT_EMOJI[i]} ${e}`, value: Math.round((counts[i] / 6) * 100), note: `${counts[i]}개` })),
      },
      {
        icon: "⚖️",
        heading: "넘치는 기운과 부족한 기운",
        items: [
          `가장 강한 기운은 ${ELEMENTS[strong]}(${max}개). ${SURPLUS[strong]}`,
          min === 0
            ? `${ELEMENTS[weak]}의 기운이 하나도 없어요. 아래 방법으로 생활 속에서 채워주세요.`
            : `가장 약한 기운은 ${ELEMENTS[weak]}(${min}개). 조금만 보태주면 균형이 좋아져요.`,
        ],
      },
      { icon: "🧧", heading: "올해 · 내년 총운", items: yearItems },
      bond,
      {
        icon: "🌈",
        heading: `부족한 ${ELEMENTS[weak]} 기운 채우는 법`,
        items: [`행운의 색: ${fill.color} (하네스·방석·식기 색으로)`, `행운의 방향: ${fill.dir}에 잠자리나 쉼터 두기`, `행운의 간식: ${fill.snack[input.s]}`, `추천 활동: ${fill.act}`],
      },
    ],
    footnote: "태어난 시각 없이 연·월·일 세 기둥으로 본 풀이이며, 절기는 근삿값을 사용해요. 재미로 봐주세요.",
  };
}
