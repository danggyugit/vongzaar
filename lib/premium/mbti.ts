import "server-only";
import type { PremiumResult } from "../types";
import { TYPES } from "../mbti-data";
import type { MbtiInput } from "../engines/mbti";
import { josa } from "../util";

const flip = (c: string) => ({ E: "I", I: "E", S: "N", N: "S", T: "F", F: "T", J: "P", P: "J" })[c] ?? c;

const OWNER: Record<string, string> = {
  E: "함께 밖으로 나가 사람도 친구도 자주 만나게 해주는 활동적인 보호자와 잘 맞아요. 집에만 있으면 에너지가 갈 곳을 잃어요.",
  I: "먼저 다가올 때까지 기다려주는 차분한 보호자와 잘 맞아요. 억지로 안거나 낯선 자리에 데려가면 신뢰가 깎여요.",
  T: "애정 표현이 적다고 서운해하지 않는 보호자가 좋아요. 곁에 머무는 것 자체가 이 아이의 사랑 표현이에요.",
  F: "말을 자주 걸어주고 눈을 맞춰주는 다정한 보호자가 좋아요. 무심한 태도에는 생각보다 크게 상처받아요.",
  J: "식사·산책·취침 시간을 일정하게 지켜주는 보호자와 있을 때 가장 안정돼요.",
  P: "매번 조금씩 다른 자극을 주는 유연한 보호자와 있을 때 가장 즐거워해요.",
};

const PLAY: Record<string, string[]> = {
  ES: ["공 던지기·터그처럼 몸을 크게 쓰는 놀이", "여럿이 함께하는 놀이 모임이나 운동장 나들이"],
  EN: ["숨바꼭질, 새로운 개인기 배우기", "매주 장난감을 바꿔주는 '장난감 로테이션'"],
  IS: ["조용한 곳에서 하는 노즈워크·냄새 맡기 산책", "혼자 오래 씹고 핥을 수 있는 장난감"],
  IN: ["퍼즐 급여기, 간식 찾기 미로", "창가 관찰석 만들어주기 — 바깥 구경이 최고의 놀이"],
};

const STRESS: Record<string, string> = {
  EJ: "평소보다 요구성 소리가 늘고 보호자를 졸졸 따라다니며 재촉한다면, 루틴이 깨졌거나 관심이 부족하다는 신호예요.",
  EP: "물건을 물어뜯거나 집 안을 미친 듯이 뛰어다닌다면 에너지가 남는다는 뜻이에요. 혼내기보다 놀이 시간을 늘려주세요.",
  IJ: "갑자기 숨거나 정해진 자리 밖으로 나오지 않는다면 환경 변화가 버거운 거예요. 가구 배치·손님·이사 같은 변화를 점검해 보세요.",
  IP: "몸을 과하게 핥거나 식욕이 들쭉날쭉하다면 조용히 스트레스를 쌓는 중이에요. 티를 안 내는 유형이라 더 세심하게 봐주세요.",
};

const TIP: Record<string, string[]> = {
  S: ["말보다 손짓·간식처럼 눈에 보이는 신호가 잘 통해요", "한 번에 한 가지씩, 짧게 여러 번 반복하세요"],
  N: ["같은 훈련도 장소와 방식을 바꿔주면 집중력이 올라가요", "스스로 답을 찾았을 때 크게 칭찬해 주세요"],
  T: ["보상이 확실해야 움직여요. 좋아하는 간식 순위를 파악해 두세요", "억지 스킨십 대신 놀이로 유대감을 쌓으세요"],
  F: ["간식보다 칭찬하는 목소리와 쓰다듬기가 더 큰 보상이에요", "큰 소리로 혼내면 오래 위축돼요. 무시하기가 더 효과적이에요"],
};

export function premium(input: MbtiInput): PremiumResult {
  const [e, s, t, j] = input.t.split("");
  const soulmate = flip(e) + s + t + flip(j);
  const tension = input.t.split("").map(flip).join("");
  const n = input.n;
  return {
    sections: [
      { icon: "🤝", heading: "보호자와의 궁합", items: [OWNER[e], OWNER[t], OWNER[j]] },
      {
        icon: "🐾",
        heading: "찰떡 친구 · 조심할 친구",
        items: [
          `찰떡 친구는 ${soulmate} "${TYPES[soulmate].name}". 관심사는 같고 에너지는 서로 채워줘서 오래 봐도 편안해요.`,
          `조심할 친구는 ${tension} "${TYPES[tension].name}". 모든 성향이 반대라 첫 만남은 짧게, 거리를 두고 천천히 소개해 주세요.`,
        ],
      },
      { icon: "🎾", heading: `${n} 맞춤 놀이 처방`, items: PLAY[e + s] },
      { icon: "😿", heading: "스트레스 신호 읽기", body: STRESS[e + j] },
      { icon: "💡", heading: "교감·훈련 꿀팁", items: [...TIP[s], ...TIP[t]] },
      {
        icon: "💌",
        heading: `${josa(n, "이/가")} 보호자에게`,
        body:
          t === "F"
            ? `"표현이 서툴 때도 있지만, 나는 하루 종일 네가 돌아오기만 기다려. 오늘도 이름 많이 불러줘."`
            : `"자주 안기진 않아도, 내가 네 근처에서 자는 건 너를 믿는다는 뜻이야. 그것만 알아줘."`,
      },
    ],
    footnote: "성격유형 테스트는 보호자의 관찰을 바탕으로 한 재미용 콘텐츠예요.",
  };
}
