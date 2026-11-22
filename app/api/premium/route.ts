import { NextResponse } from "next/server";
import { parseInput } from "@/lib/engines";
import { premiumResult } from "@/lib/premium";
import { isProductId } from "@/lib/products";
import { verifyToken } from "@/lib/token";
import type { FaceInput } from "@/lib/engines/face";
import { aiEnabled, aiFaceReading, photoData, photoHash } from "@/lib/premium/face-ai";

export const maxDuration = 60;

/** 같은 결제로 AI 풀이를 반복 요청하는 것을 막는 간단한 제한 (서버 인스턴스별) */
const aiCalls = new Map<string, number>();
const MAX_AI_CALLS = 4;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const product = body?.product;
  const d = body?.d;
  if (!isProductId(product) || typeof d !== "string") return NextResponse.json({ ok: false }, { status: 400 });
  const input = parseInput(product, d);
  if (!input) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    if (!verifyToken(body?.token, product, d)) return NextResponse.json({ ok: false }, { status: 403 });
    const result = premiumResult(product, input);
    if (!result) return NextResponse.json({ ok: false }, { status: 404 });
    const headers = { "Cache-Control": "no-store" };

    // 관상: 결제한 사진이 함께 오면 AI가 사진을 보고 풀이한다. 실패하면 기본 풀이로 대신한다.
    const face = input as FaceInput;
    if (product === "face" && face.ph) {
      const photo = typeof body?.photo === "string" ? body.photo : "";
      const base64 = photoData(photo);
      const token = String(body?.token);
      const used = aiCalls.get(token) ?? 0;
      let notice = "사진을 찾지 못해 기본 풀이를 보여드려요. 결제한 기기에서 다시 열어주세요.";
      if (base64 && photoHash(photo) === face.ph) {
        if (!aiEnabled()) notice = "AI 풀이가 아직 준비 중이라 기본 풀이를 보여드려요.";
        else if (used >= MAX_AI_CALLS) notice = "AI 풀이 요청이 너무 많아 기본 풀이를 보여드려요. 잠시 후 다시 시도해 주세요.";
        else {
          aiCalls.set(token, used + 1);
          const ai = await aiFaceReading(face, base64);
          if (ai.ok) return NextResponse.json({ ok: true, result: ai.result, ai: true }, { headers });
          notice =
            ai.reason === "no-animal"
              ? "사진에서 아이 얼굴을 찾지 못해 기본 풀이를 보여드려요."
              : "AI 풀이를 불러오지 못해 기본 풀이를 보여드려요. 아래 버튼으로 다시 시도할 수 있어요.";
        }
      }
      return NextResponse.json({ ok: true, result, ai: false, notice }, { headers });
    }
    return NextResponse.json({ ok: true, result }, { headers });
  } catch (e) {
    console.error("[premium]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
