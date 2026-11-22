export type Axis = "EI" | "SN" | "TF" | "JP";

export type Question = { axis: Axis; q: string; a: [string, string] };

/** a[0]은 축의 앞 글자(E·S·T·J), a[1]은 뒷 글자(I·N·F·P) */
export const QUESTIONS: Question[] = [
  { axis: "EI", q: "낯선 손님이 집에 놀러 왔어요. {name}의 반응은?", a: ["먼저 다가가서 냄새 맡고 인사한다", "멀찍이서 지켜보다 천천히 다가간다"] },
  { axis: "SN", q: "새 장난감을 선물받았어요!", a: ["늘 하던 방식으로 바로 물고 논다", "이리저리 굴려보며 새로운 놀이법을 만든다"] },
  { axis: "TF", q: "보호자가 유난히 지쳐 보이는 날, {name}의 행동은?", a: ["평소처럼 자기 할 일을 한다", "슬쩍 다가와 곁에 붙어 있어 준다"] },
  { axis: "JP", q: "밥 시간이 30분 늦어졌어요.", a: ["정확한 시간에 와서 항의한다", "주면 먹지 뭐, 별로 신경 안 쓴다"] },
  { axis: "EI", q: "밖에서 다른 동물 친구를 만났을 때", a: ["먼저 다가가 같이 놀자고 한다", "관심 없는 척 내 갈 길을 간다"] },
  { axis: "SN", q: "창밖을 바라보는 {name}, 무엇을 보고 있을까요?", a: ["지나가는 새, 사람, 자동차를 눈으로 쫓는다", "아무것도 없는 허공을 한참 응시한다"] },
  { axis: "TF", q: "잘못해서 혼이 났어요. 그 후에는?", a: ["금방 잊고 간식을 요구한다", "시무룩해져서 한동안 눈치를 본다"] },
  { axis: "JP", q: "평소 잠자리는 어떤가요?", a: ["항상 정해진 자기 자리에서 잔다", "그날 기분에 따라 여기저기서 잔다"] },
  { axis: "EI", q: "외출했던 보호자가 돌아왔을 때", a: ["온몸으로 격하게 환영한다", "슬쩍 다가와 조용히 곁에 머문다"] },
  { axis: "SN", q: "숨겨둔 간식을 찾을 때", a: ["코로 정직하게, 끝까지 냄새를 따라간다", "보호자 표정과 손을 살피며 힌트를 얻는다"] },
  { axis: "TF", q: "원하는 것이 있을 때 {name}의 전략은?", a: ["소리나 앞발로 정확하게 요구한다", "애교와 눈빛으로 마음을 녹인다"] },
  { axis: "JP", q: "산책이나 놀이를 할 때", a: ["늘 가던 길, 정해진 순서가 편하다", "매번 새로운 길, 새로운 놀이를 원한다"] },
];

export type TypeInfo = { name: string; emoji: string; line: string; traits: string[] };

export const TYPES: Record<string, TypeInfo> = {
  ENFP: { name: "인싸 파티피플", emoji: "🎉", line: "세상 모든 것이 친구이자 놀이터", traits: ["처음 본 상대에게도 꼬리부터 흔드는 친화력", "호기심이 많아 새로운 장소에서 더 신나요", "혼자 있는 시간은 조금 힘들어해요"] },
  ENFJ: { name: "다정한 반장", emoji: "🌻", line: "가족 모두를 챙겨야 마음이 놓여요", traits: ["가족이 흩어져 있으면 한자리에 모으고 싶어 해요", "보호자의 기분 변화를 누구보다 빨리 알아채요", "칭찬 한마디에 하루가 행복해져요"] },
  ENTP: { name: "호기심 발명왕", emoji: "💡", line: "안 된다고 하면 더 해보고 싶어요", traits: ["문 여는 법, 간식 꺼내는 법을 스스로 터득해요", "반복되는 놀이에는 금방 싫증을 내요", "보호자를 시험하는 듯한 장난을 즐겨요"] },
  ENTJ: { name: "우리 집 대장", emoji: "👑", line: "이 집의 규칙은 내가 정한다", traits: ["원하는 것을 분명하게, 당당하게 요구해요", "산책 방향도 놀이 시간도 주도하고 싶어 해요", "자신감이 넘쳐 낯선 상황에도 잘 버텨요"] },
  ESFP: { name: "무대 체질 아이돌", emoji: "🎤", line: "시선이 모이면 더 빛나는 타입", traits: ["사람들이 웃어주면 같은 행동을 반복해요", "지금 이 순간의 즐거움이 제일 중요해요", "활동량이 많아 에너지를 꼭 풀어줘야 해요"] },
  ESFJ: { name: "살가운 동네 이장", emoji: "🏡", line: "모두와 두루두루 잘 지내요", traits: ["사람도 동물 친구도 가리지 않고 좋아해요", "익숙한 일상과 정해진 루틴에서 안정감을 느껴요", "관심을 못 받으면 서운한 티가 나요"] },
  ESTP: { name: "겁 없는 모험가", emoji: "🧗", line: "일단 뛰어들고 생각은 나중에", traits: ["높은 곳, 좁은 곳, 낯선 곳 어디든 먼저 가봐요", "몸으로 하는 격한 놀이를 가장 좋아해요", "지루함을 못 참아 사고를 치기도 해요"] },
  ESTJ: { name: "원칙주의 관리소장", emoji: "📋", line: "밥은 제시간에, 산책도 제시간에", traits: ["시계를 보는 것처럼 정확한 생활 리듬", "루틴이 깨지면 바로 항의가 들어와요", "집 안 순찰을 빼먹지 않는 책임감"] },
  INFP: { name: "감성 몽상가", emoji: "🌙", line: "조용하지만 마음은 누구보다 깊어요", traits: ["마음을 연 상대에게만 보여주는 애교가 있어요", "큰 소리와 갑작스러운 변화에 예민해요", "혼자만의 아늑한 공간이 꼭 필요해요"] },
  INFJ: { name: "속 깊은 수호천사", emoji: "🕊️", line: "말없이 곁을 지키는 든든함", traits: ["보호자가 힘들 때 조용히 옆에 와 있어요", "소수의 가족에게만 깊은 애정을 줘요", "분위기를 읽고 눈치껏 행동해요"] },
  INTP: { name: "4차원 연구원", emoji: "🔬", line: "혼자 골똘히 관찰하는 시간이 좋아요", traits: ["한 가지에 꽂히면 한참을 들여다봐요", "왜 그러는지 알 수 없는 엉뚱한 행동이 많아요", "과한 스킨십보다 적당한 거리를 좋아해요"] },
  INTJ: { name: "냉철한 전략가", emoji: "♟️", line: "다 계획이 있는 타입", traits: ["보호자의 패턴을 파악해 원하는 것을 얻어내요", "필요할 때만 다가오는 효율적인 애정 표현", "자기만의 규칙과 영역이 분명해요"] },
  ISFP: { name: "온순한 예술가", emoji: "🎨", line: "따뜻한 햇살과 포근한 담요면 충분해요", traits: ["갈등을 싫어하고 순하게 맞춰주는 편이에요", "촉감·냄새 같은 감각에 민감해요", "좋아하는 사람 곁에서 조용히 쉬는 걸 좋아해요"] },
  ISFJ: { name: "그림자 경호원", emoji: "🛡️", line: "보호자가 가는 곳이 곧 내 자리", traits: ["화장실까지 따라오는 한결같은 충성심", "익숙한 환경과 정해진 일과를 좋아해요", "낯선 것에는 신중하지만 가족에겐 한없이 다정해요"] },
  ISTP: { name: "쿨한 독립러", emoji: "😎", line: "내 일은 내가 알아서 해요", traits: ["혼자서도 잘 놀고 잘 쉬는 독립적인 성격", "필요 이상의 관심은 사양하는 쿨함", "사냥·추적 놀이에서 집중력이 폭발해요"] },
  ISTJ: { name: "성실한 루틴 장인", emoji: "⏰", line: "어제와 같은 오늘이 가장 편안해요", traits: ["정해진 자리, 정해진 시간을 정확히 지켜요", "새로운 것에는 충분한 적응 시간이 필요해요", "한번 익힌 규칙은 좀처럼 잊지 않아요"] },
};

export const AXES: { axis: Axis; left: string; right: string; leftLabel: string; rightLabel: string }[] = [
  { axis: "EI", left: "E", right: "I", leftLabel: "사교적", rightLabel: "신중한" },
  { axis: "SN", left: "S", right: "N", leftLabel: "현실적", rightLabel: "호기심" },
  { axis: "TF", left: "T", right: "F", leftLabel: "독립적", rightLabel: "다정한" },
  { axis: "JP", left: "J", right: "P", leftLabel: "규칙적", rightLabel: "즉흥적" },
];

/** answers[i]는 0 또는 1. 유형 코드와 축별 앞 글자 비율(0~100)을 돌려준다. */
export function scoreAnswers(answers: number[]): { type: string; pct: number[] } {
  const pct = AXES.map(({ axis }) => {
    const idx = QUESTIONS.map((q, i) => (q.axis === axis ? i : -1)).filter((i) => i >= 0);
    const left = idx.filter((i) => answers[i] === 0).length;
    return Math.round((left / idx.length) * 100);
  });
  const type = AXES.map((a, i) => (pct[i] >= 50 ? a.left : a.right)).join("");
  return { type, pct };
}
