export type Option = { v: string; label: string; emoji?: string };

export const FACE_FIELDS: { key: "ey" | "er" | "mz" | "ct" | "vb"; label: string; options: Option[] }[] = [
  {
    key: "ey",
    label: "눈 모양",
    options: [
      { v: "round", label: "동글동글 왕눈이" },
      { v: "almond", label: "갸름한 아몬드 눈" },
      { v: "droopy", label: "순하게 처진 눈" },
      { v: "sharp", label: "또렷하게 올라간 눈" },
    ],
  },
  {
    key: "er",
    label: "귀 모양",
    options: [
      { v: "up", label: "쫑긋 선 귀" },
      { v: "fold", label: "접히거나 늘어진 귀" },
      { v: "big", label: "얼굴보다 큰 귀" },
      { v: "small", label: "작고 앙증맞은 귀" },
    ],
  },
  {
    key: "mz",
    label: "코와 주둥이",
    options: [
      { v: "short", label: "짧고 납작한 편" },
      { v: "mid", label: "딱 중간" },
      { v: "long", label: "길고 뾰족한 편" },
    ],
  },
  {
    key: "ct",
    label: "털 색",
    options: [
      { v: "white", label: "하양·크림" },
      { v: "black", label: "검정" },
      { v: "brown", label: "갈색·초코" },
      { v: "gold", label: "노랑·치즈" },
      { v: "gray", label: "회색·은색" },
      { v: "mix", label: "얼룩·삼색" },
    ],
  },
  {
    key: "vb",
    label: "첫인상",
    options: [
      { v: "soft", label: "순둥순둥" },
      { v: "chic", label: "도도·시크" },
      { v: "fun", label: "장난꾸러기" },
      { v: "solid", label: "듬직·의젓" },
    ],
  },
];
