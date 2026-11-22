"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { unlockKey } from "@/lib/pet";
import { isProductId, PRICE, PRODUCTS } from "@/lib/products";
import { decodeInput } from "@/lib/util";

const newOrderId = (product: string) => `${product}-${Date.now().toString(36)}-${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;

export function Checkout() {
  const params = useSearchParams();
  const router = useRouter();
  const product = params.get("product");
  const d = params.get("d") ?? "";
  const valid = isProductId(product) && !!PRODUCTS[product].premium && !!decodeInput(d);

  const [mode, setMode] = useState<"loading" | "toss" | "mock" | "error">("loading");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const widgets = useRef<TossPaymentsWidgets | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!valid || started.current) return;
    started.current = true;
    (async () => {
      try {
        const cfg = await fetch("/api/pay/config").then((r) => r.json());
        if (cfg.mode === "mock") return setMode("mock");
        if (!cfg.clientKey) throw new Error("결제 설정이 아직 완료되지 않았어요. (TOSS_CLIENT_KEY)");
        setMode("toss");
        const { loadTossPayments, ANONYMOUS } = await import("@tosspayments/tosspayments-sdk");
        const toss = await loadTossPayments(cfg.clientKey);
        const w = toss.widgets({ customerKey: ANONYMOUS });
        await w.setAmount({ currency: "KRW", value: PRICE });
        await Promise.all([w.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }), w.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" })]);
        widgets.current = w;
        setReady(true);
      } catch (e) {
        setMode("error");
        setMessage(e instanceof Error && e.message ? e.message : "결제창을 불러오지 못했어요.");
      }
    })();
  }, [valid]);

  if (!valid || !isProductId(product)) {
    return (
      <div className="notice">
        <h1>결제할 리포트를 찾지 못했어요</h1>
        <Link href="/" className="btn primary big">
          처음으로
        </Link>
      </div>
    );
  }

  const meta = PRODUCTS[product];
  const name = String(decodeInput(d)?.n ?? "");
  const back = `/r/${product}?d=${d}`;
  const query = `product=${product}&d=${d}`;

  const pay = async () => {
    setBusy(true);
    setMessage("");
    const orderId = newOrderId(product);
    try {
      if (mode === "mock") {
        const res = await fetch("/api/pay/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey: "mock", orderId, amount: PRICE, product, d }),
        }).then((r) => r.json());
        if (!res.ok) throw new Error(res.message);
        localStorage.setItem(unlockKey(product, d), res.token);
        router.replace(`${back}#premium`);
        return;
      }
      await widgets.current!.requestPayment({
        orderId,
        orderName: `${meta.premium!.name} (${name})`.slice(0, 100),
        successUrl: `${window.location.origin}/pay/success?${query}`,
        failUrl: `${window.location.origin}/pay/fail?${query}`,
      });
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code !== "USER_CANCEL") setMessage(e instanceof Error && e.message ? e.message : "결제를 진행하지 못했어요.");
      setBusy(false);
    }
  };

  return (
    <div className="checkout" style={{ ["--c" as string]: meta.color }}>
      <h1>결제하기</h1>
      <div className="order">
        <span className="order-emoji" aria-hidden>
          {meta.emoji}
        </span>
        <div>
          <strong>{meta.premium!.name}</strong>
          <span>{name}의 리포트</span>
        </div>
        <b>{PRICE.toLocaleString("ko-KR")}원</b>
      </div>

      {mode === "toss" && (
        <>
          <div id="payment-method" />
          <div id="agreement" />
        </>
      )}
      {mode === "mock" && <p className="mock-note">개발용 테스트 결제 모드예요. 실제 결제 없이 잠금이 풀립니다.</p>}
      {mode === "loading" && <p className="mock-note">결제 수단을 불러오는 중…</p>}

      {message && (
        <p className="error" role="alert">
          {message}
        </p>
      )}

      {mode !== "error" && (
        <button type="button" className="btn primary big" onClick={pay} disabled={busy || mode === "loading" || (mode === "toss" && !ready)}>
          {busy ? "처리 중…" : `${PRICE.toLocaleString("ko-KR")}원 결제하기`}
        </button>
      )}
      <Link href={back} className="link-btn">
        ← 결과로 돌아가기
      </Link>
      <p className="form-note">
        결제 즉시 열람할 수 있는 디지털 콘텐츠예요. <Link href="/legal/refund">환불정책</Link>
      </p>
    </div>
  );
}
