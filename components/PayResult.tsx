"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { unlockKey } from "@/lib/pet";
import { isProductId } from "@/lib/products";

export function PaySuccess() {
  const params = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");
  const sent = useRef(false);

  const product = params.get("product") ?? "";
  const d = params.get("d") ?? "";
  const back = isProductId(product) && d ? `/r/${product}?d=${d}` : "/";

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    fetch("/api/pay/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentKey: params.get("paymentKey"), orderId: params.get("orderId"), amount: Number(params.get("amount")), product, d }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (!res.ok) return setError(res.message ?? "결제를 확인하지 못했어요.");
        try {
          localStorage.setItem(unlockKey(product, d), res.token);
        } catch {
          return setError("결제는 완료됐지만 이 브라우저에 열람 정보를 저장하지 못했어요. 시크릿 모드가 아닌 브라우저에서 다시 시도하거나 환불정책의 문의처로 연락해 주세요.");
        }
        router.replace(`${back}#premium`);
      })
      .catch(() => setError("네트워크 문제로 결제를 확인하지 못했어요. 이 화면을 새로고침해 주세요."));
  }, [params, product, d, back, router]);

  return (
    <div className="notice">
      {error ? (
        <>
          <h1>결제 확인에 문제가 생겼어요</h1>
          <p>{error}</p>
          <Link href={back} className="btn primary big">
            결과로 돌아가기
          </Link>
        </>
      ) : (
        <>
          <span className="spinner" aria-hidden />
          <h1>결제를 확인하고 있어요</h1>
          <p>잠시만 기다려 주세요. 창을 닫지 마세요.</p>
        </>
      )}
    </div>
  );
}

export function PayFail() {
  const params = useSearchParams();
  const product = params.get("product") ?? "";
  const d = params.get("d") ?? "";
  const back = isProductId(product) && d ? `/r/${product}?d=${d}` : "/";
  return (
    <div className="notice">
      <h1>결제가 완료되지 않았어요</h1>
      <p>{params.get("message") ?? "결제가 취소되었거나 승인되지 않았어요."} 금액은 청구되지 않았습니다.</p>
      <Link href={isProductId(product) && d ? `/pay?product=${product}&d=${d}` : "/"} className="btn primary big">
        다시 시도하기
      </Link>
      <Link href={back} className="link-btn">
        ← 결과로 돌아가기
      </Link>
    </div>
  );
}
