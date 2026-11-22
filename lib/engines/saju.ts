import type { FreeResult, Input } from "../types";
import { cleanDate, cleanName, cleanSpecies, josa, parseYmd, type Ymd } from "../util";

export type SajuInput = Input & { b: string; ob?: string };

export function parse(raw: Record<string, unknown>): SajuInput | null {
  const n = cleanName(raw.n);
  const s = cleanSpecies(raw.s);
  const b = cleanDate(raw.b);
  if (!n || !s || !b) return null;
  const ob = raw.ob === undefined || raw.ob === "" ? undefined : cleanDate(raw.ob, 1920);
  if (ob === null) return null;
  return ob ? { n, s, b, ob } : { n, s, b };
}

export const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
export const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
export const ELEMENTS = ["목", "화", "토", "금", "수"] as const;
export const ELEMENT_EMOJI = ["🌳", "🔥", "⛰️", "⚔️", "💧"];
const ZODIAC = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];
const BRANCH_ELEMENT = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
/** 각 월의 절기 시작일(근삿값). 이 날부터 해당 월의 지지가 바뀐다. */
const TERM_DAY = [6, 4, 6, 5, 6, 6, 7, 8, 8, 8, 7, 7];

export type Pillar = { stem: number; branch: number };

export const stemElement = (stem: number) => Math.floor(stem / 2);

function julianDay({ y, m, d }: Ymd): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

export function yearPillar(year: number): Pillar {
  return { stem: (((year - 4) % 10) + 10) % 10, branch: (((year - 4) % 12) + 12) % 12 };
}

/** 연·월·일 세 기둥. 태어난 시각을 모르는 경우가 많아 시주는 뺐다. */
export function pillars(date: string): { year: Pillar; month: Pillar; day: Pillar } {
  const t = parseYmd(date);
  // 사주의 한 해는 입춘(2월 4일경)에 시작한다
  const sajuYear = t.m < 2 || (t.m === 2 && t.d < TERM_DAY[1]) ? t.y - 1 : t.y;
  const year = yearPillar(sajuYear);
  // 인월(寅)=0 … 축월(丑)=11
  const monthIdx = (((t.d >= TERM_DAY[t.m - 1] ? t.m : t.m - 1) - 2) % 12 + 12) % 12;
  const month = { stem: (((year.stem % 5) * 2 + 2) + monthIdx) % 10, branch: (monthIdx + 2) % 12 };
  const idx = (julianDay(t) + 49) % 60;
  const day = { stem: idx % 10, branch: idx % 12 };
  return { year, month, day };
}

export const pillarName = (p: Pillar) => STEMS[p.stem] + BRANCHES[p.branch];

/** 오행 개수 [목, 화, 토, 금, 수] */
export function elementCounts(date: string): number[] {
  const p = pillars(date);
  const counts = [0, 0, 0, 0, 0];
  for (const x of [p.year, p.month, p.day]) {
    counts[stemElement(x.stem)]++;
    counts[BRANCH_ELEMENT[x.branch]]++;
  }
  return counts;
}

const DAY_MASTER: { name: string; image: string; text: string; tags: string[] }[] = [
  { name: "갑목", image: "곧게 뻗은 큰 나무", text: "한번 정한 건 끝까지 밀고 나가는 뚝심이 있어요. 앞장서는 걸 좋아하고 자존심이 세지만, 그만큼 든든한 기둥 같은 존재예요.", tags: ["리더십", "뚝심", "자존심"] },
  { name: "을목", image: "바람에 흔들려도 꺾이지 않는 풀꽃", text: "어디서든 적응하는 유연함을 타고났어요. 애교와 눈치로 원하는 것을 부드럽게 얻어내는 재주꾼이에요.", tags: ["적응력", "애교", "눈치"] },
  { name: "병화", image: "온 세상을 비추는 태양", text: "존재만으로 집안이 환해지는 타입이에요. 숨기는 것 없이 솔직하고, 모두의 관심을 한 몸에 받아야 직성이 풀려요.", tags: ["밝음", "솔직함", "관심쟁이"] },
  { name: "정화", image: "어둠을 밝히는 촛불", text: "조용하지만 따뜻한 온기를 가졌어요. 좋아하는 한 사람에게 깊이 집중하는 섬세한 사랑꾼이에요.", tags: ["따뜻함", "섬세함", "일편단심"] },
  { name: "무토", image: "묵직하게 자리를 지키는 큰 산", text: "웬만한 일에는 놀라지 않는 듬직함이 있어요. 느긋하고 믿음직해서 곁에 있으면 마음이 편안해져요.", tags: ["듬직함", "느긋함", "포용력"] },
  { name: "기토", image: "무엇이든 길러내는 기름진 밭", text: "순하고 다정해서 누구와도 잘 지내요. 가족을 살뜰히 챙기고, 먹는 것에 진심인 살림꾼 기질이 있어요.", tags: ["다정함", "순둥이", "먹보"] },
  { name: "경금", image: "단단하게 벼려진 바위와 쇠", text: "좋고 싫음이 분명하고 의리가 있어요. 낯선 이에겐 경계심이 강하지만 내 가족은 끝까지 지키는 타입이에요.", tags: ["의리", "용감함", "호불호"] },
  { name: "신금", image: "반짝이는 보석", text: "깔끔하고 예민한 감각의 소유자예요. 자기 관리에 철저하고, 귀하게 대접받는 것을 당연하게 여겨요.", tags: ["깔끔함", "예민함", "도도함"] },
  { name: "임수", image: "넓고 깊은 바다", text: "호기심이 많고 머리가 좋아요. 자유롭게 돌아다니며 세상을 탐험하고 싶어 하는 큰 그릇이에요.", tags: ["영리함", "자유로움", "호기심"] },
  { name: "계수", image: "조용히 스며드는 봄비", text: "감수성이 풍부하고 속이 깊어요. 보호자의 기분을 가장 먼저 알아채고 조용히 위로를 건네는 아이예요.", tags: ["감수성", "배려", "직감"] },
];

export const dayMaster = (date: string) => DAY_MASTER[pillars(date).day.stem];

export function free(input: SajuInput): FreeResult {
  const p = pillars(input.b);
  const dm = DAY_MASTER[p.day.stem];
  const el = stemElement(p.day.stem);
  return {
    emoji: ELEMENT_EMOJI[el],
    kicker: `${input.n}의 사주`,
    title: `${dm.name} · ${dm.image}`,
    subtitle: dm.text,
    tags: [`${ZODIAC[p.year.branch]}띠`, ...dm.tags],
    sections: [
      {
        icon: "📜",
        heading: "타고난 세 기둥",
        items: [`태어난 해: ${pillarName(p.year)}년 (${ZODIAC[p.year.branch]}띠)`, `태어난 달: ${pillarName(p.month)}월`, `태어난 날: ${pillarName(p.day)}일`],
      },
      {
        icon: ELEMENT_EMOJI[el],
        heading: `${josa(input.n, "을/를")} 대표하는 기운: ${ELEMENTS[el]}(${["木", "火", "土", "金", "水"][el]})`,
        body: "태어난 날의 기운(일간)은 사주에서 '나 자신'을 뜻해요. 성격과 타고난 기질의 뿌리가 됩니다.",
      },
    ],
    share: `${input.n}의 사주는 ${dm.name}, "${dm.image}"! 우리 아이 사주도 풀어보세요.`,
  };
}
