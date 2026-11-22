import { NextResponse } from "next/server";
import { parseInput } from "@/lib/engines";
import { isProductId, PRICE, PRODUCTS } from "@/lib/products";
import { issueToken } from "@/lib/token";
import { confirmPayment, payMode } from "@/lib/toss";

const fail = (message: string, status = 400) => NextResponse.json({ ok: false, message }, { status });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("잘못된 요청이에요.");
  const { paymentKey, orderId, amount, product, d } = body as Record<string, unknown>;

  if (!isProductId(product) || !PRODUCTS[product].premium) return fail("결제할 수 없는 상품이에요.");
  if (typeof d !== "string" || !parseInput(product, d)) return fail("결과 정보가 올바르지 않아요.");
  if (typeof paymentKey !== "string" || paymentKey.length > 200) return fail("결제 정보가 올바르지 않아요.");
  if (typeof orderId !== "string" || !/^[A-Za-z0-9_-]{6,64}$/.test(orderId) || !orderId.startsWith(`${product}-`)) {
    return fail("주문 정보가 올바르지 않아요.");
  }
  if (Number(amount) !== PRICE) return fail("결제 금액이 올바르지 않아요.");

  try {
    if (payMode() === "mock") {
      if (paymentKey !== "mock") return fail("테스트 결제 정보가 올바르지 않아요.");
    } else {
      const result = await confirmPayment(paymentKey, orderId, PRICE);
      if (!result.ok) return fail(result.message, 402);
    }
    return NextResponse.json({ ok: true, token: issueToken(product, d, orderId) });
  } catch (e) {
    console.error("[pay/confirm]", e);
    return fail("결제 처리 중 서버 오류가 발생했어요. 잠시 후 다시 시도해 주세요.", 500);
  }
}
