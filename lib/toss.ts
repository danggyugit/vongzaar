import "server-only";

const API = "https://api.tosspayments.com/v1/payments";

export type PayMode = "toss" | "mock";

/** mock 결제는 개발 환경에서만 켤 수 있다. */
export function payMode(): PayMode {
  return process.env.PAYMENT_MODE === "mock" && process.env.NODE_ENV !== "production" ? "mock" : "toss";
}

type Payment = { status?: string; totalAmount?: number; orderId?: string; code?: string; message?: string };

async function call(path: string, init: RequestInit): Promise<{ ok: boolean; data: Payment }> {
  const key = process.env.TOSS_SECRET_KEY;
  if (!key) throw new Error("TOSS_SECRET_KEY 환경변수가 설정되지 않았습니다.");
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Basic ${Buffer.from(`${key}:`).toString("base64")}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as Payment;
  return { ok: res.ok, data };
}

export type ConfirmResult = { ok: true } | { ok: false; message: string };

/**
 * 토스페이먼츠 결제 승인. 금액은 서버가 정한 값만 보내므로,
 * 브라우저에서 금액을 바꿔 결제했다면 토스 쪽에서 승인이 거절된다.
 */
export async function confirmPayment(paymentKey: string, orderId: string, amount: number): Promise<ConfirmResult> {
  const paid = (p: Payment) => p.status === "DONE" && p.totalAmount === amount && p.orderId === orderId;

  const res = await call("/confirm", { method: "POST", body: JSON.stringify({ paymentKey, orderId, amount }) });
  if (res.ok && paid(res.data)) return { ok: true };

  // 승인 직후 새로고침 등으로 같은 요청이 다시 온 경우: 이미 끝난 결제인지 조회해서 확인
  if (res.data.code === "ALREADY_PROCESSED_PAYMENT") {
    const again = await call(`/${encodeURIComponent(paymentKey)}`, { method: "GET" });
    if (again.ok && paid(again.data)) return { ok: true };
  }
  return { ok: false, message: res.data.message ?? "결제 승인에 실패했어요." };
}
