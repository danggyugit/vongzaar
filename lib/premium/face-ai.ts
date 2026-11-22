import "server-only";
import { createHash } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { PremiumResult } from "../types";
import { FACE_TYPES, faceType, type FaceInput } from "../engines/face";
import { clamp, josa, speciesWord } from "../util";

/** 브라우저에서 줄여 보낸 JPEG. base64 기준 약 450KB까지만 받는다. */
const PHOTO_PATTERN = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/;
const MAX_PHOTO_CHARS = 600_000;

export function photoData(photo: unknown): string | null {
  if (typeof photo !== "string" || photo.length > MAX_PHOTO_CHARS) return null;
  return PHOTO_PATTERN.exec(photo)?.[1] ?? null;
}

/** 결제한 사진과 풀이를 요청한 사진이 같은지 확인하는 짧은 지문 */
export const photoHash = (photo: string) => createHash("sha256").update(photo).digest("hex").slice(0, 12);

export const aiEnabled = () => Boolean(process.env.ANTHROPIC_API_KEY);

const Reading = z.object({
  showsAnimal: z.boolean().describe("사진에 강아지나 고양이가 실제로 보이면 true"),
  firstImpression: z.string().describe("사진에서 실제로 보이는 표정·자세·분위기를 짚은 첫인상 풀이, 2~3문장"),
  features: z
    .array(z.object({ part: z.string().describe("예: 눈, 귀, 코와 입, 털빛, 표정"), reading: z.string().describe("그 부위가 사진에서 어떻게 보이는지와 관상 풀이, 2문장") }))
    .describe("사진에서 잘 보이는 부위 3~4개"),
  personality: z.string().describe("얼굴에서 읽히는 성격, 2~3문장"),
  wealth: z.number().describe("재물복 점수 60~99"),
  health: z.number().describe("건강복 점수 60~99. 재미용 점수이며 실제 건강 상태 판단이 아님"),
  bond: z.number().describe("인복 점수 60~99"),
  pastLife: z.string().describe("얼굴 분위기에 어울리는 전생의 직업과 짧은 이야기, 2문장"),
  toOwner: z.string().describe("아이가 보호자에게 건네는 한마디. 아이의 말투로 1~2문장, 따옴표 없이"),
});

const SYSTEM = `당신은 반려동물 관상을 재미있게 풀어주는 관상가입니다. 보호자가 올린 사진을 직접 보고, 그 아이에게만 해당하는 풀이를 씁니다.

풀이를 읽는 사람은 그 아이를 매일 보는 보호자입니다. 사진에 실제로 보이는 것(털 색과 무늬, 눈매, 귀 모양, 표정, 자세, 주변 소품)을 구체적으로 짚을수록 "정말 우리 아이를 보고 썼구나" 하고 느낍니다. 사진에서 확인할 수 없는 것은 지어내지 말고, 어느 아이에게나 붙일 수 있는 일반적인 문장은 피하세요.

이 콘텐츠는 재미를 위한 것입니다. 따뜻하고 유쾌하게, 아이를 아끼는 마음이 느껴지게 써주세요. 질병이나 건강 이상을 진단하거나 암시하지 않습니다. 사진에 사람이 함께 있어도 사람에 대해서는 언급하지 않습니다.

말투는 친근한 해요체로 쓰고, 이모지는 쓰지 않습니다. 무료 결과에서 이미 알려준 관상 유형과 어긋나지 않게, 그 유형이 왜 맞는지 사진으로 뒷받침해 주세요.

사진에 강아지나 고양이가 보이지 않으면 showsAnimal을 false로 하고 나머지 항목은 짧게 비워두세요.`;

let client: Anthropic | null = null;

export type AiReading = { ok: true; result: PremiumResult } | { ok: false; reason: "no-animal" | "declined" | "error" };

export async function aiFaceReading(input: FaceInput, base64: string): Promise<AiReading> {
  client ??= new Anthropic({ maxRetries: 1, timeout: 45_000 });
  const type = FACE_TYPES[faceType(input)];
  try {
    const response = await client.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      output_config: { effort: "low", format: zodOutputFormat(Reading) },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
            {
              type: "text",
              text: `이름: ${input.n}\n종: ${speciesWord(input.s)}\n무료 결과로 알려준 관상 유형: ${type.name} (${type.line})\n\n이 사진을 보고 ${input.n}의 관상을 풀어주세요.`,
            },
          ],
        },
      ],
    });
    if (response.stop_reason === "refusal") return { ok: false, reason: "declined" };
    const r = response.parsed_output;
    if (!r) return { ok: false, reason: "error" };
    if (!r.showsAnimal) return { ok: false, reason: "no-animal" };

    const score = (v: number) => clamp(Math.round(v), 60, 99);
    return {
      ok: true,
      result: {
        sections: [
          { icon: "📸", heading: "사진으로 본 첫인상", body: r.firstImpression },
          ...r.features.slice(0, 4).map((f) => ({ icon: "🔍", heading: `${f.part}에 담긴 이야기`, body: f.reading })),
          { icon: "🧠", heading: "얼굴에서 읽히는 성격", body: r.personality },
          { icon: "💰", heading: "3대 복 점수", bars: [{ label: "재물복", value: score(r.wealth) }, { label: "건강복", value: score(r.health) }, { label: "인복", value: score(r.bond) }] },
          { icon: "🎭", heading: "전생 이야기", body: r.pastLife },
          { icon: "💌", heading: `${josa(input.n, "이/가")} 보호자에게`, body: `"${r.toOwner.replace(/^["“”']+|["“”']+$/g, "")}"` },
        ],
        footnote: "AI가 올려주신 사진을 보고 쓴 재미용 풀이예요. 건강 상태에 대한 판단이 아니에요.",
      },
    };
  } catch (e) {
    if (e instanceof Anthropic.APIError) console.error("[face-ai]", e.status, e.message);
    else console.error("[face-ai]", e);
    return { ok: false, reason: "error" };
  }
}
