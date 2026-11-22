export type Species = "dog" | "cat";

export type ProductId = "mbti" | "fortune" | "saju" | "face" | "age" | "health";

export type Bar = { label: string; value: number; note?: string };

export type Section = {
  icon: string;
  heading: string;
  body?: string;
  items?: string[];
  bars?: Bar[];
};

export type FreeResult = {
  emoji: string;
  kicker: string;
  title: string;
  subtitle: string;
  tags: string[];
  sections: Section[];
  /** 카카오톡 등에 공유될 때 쓰는 한 줄 */
  share: string;
};

export type PremiumResult = { sections: Section[]; footnote?: string };

/** 모든 서비스가 공유하는 입력. 서비스별 추가 값은 문자열/숫자만 허용. */
export type Input = {
  n: string;
  s: Species;
  b?: string;
  [key: string]: string | number | undefined;
};
