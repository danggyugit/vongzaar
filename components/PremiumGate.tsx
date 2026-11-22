"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PRICE, PRODUCTS } from "@/lib/products";
import { unlockKey } from "@/lib/pet";
import type { PremiumResult, ProductId } from "@/lib/types";
import { Sections } from "./Sections";

export function PremiumGate({ product, d, name }: { product: ProductId; d: string; name: string }) {
  const meta = PRODUCTS[product];
  const premium = meta.premium!;
  const [state, setState] = useState<"loading" | "locked" | "open">("loading");
  const [result, setResult] = useState<PremiumResult | null>(null);

  useEffect(() => {
    let alive = true;
    let token: string | null = null;
    try {
      token = localStorage.getItem(unlockKey(product, d));
    } catch {
      /* 저장소 접근 불가 → 잠긴 상태로 표시 */
    }
    if (!token) {
      setState("locked");
      return;
    }
    fetch("/api/premium", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product, d, token }) })
      .then((r) => r.json())
      .then((json) => {
        if (!alive) return;
        if (json.ok) {
          setResult(json.result);
          setState("open");
        } else setState("locked");
      })
      .catch(() => alive && setState("locked"));
    return () => {
      alive = false;
    };
  }, [product, d]);

  if (state === "open" && result) {
    return (
      <div id="premium" className="premium-open">
        <div className="premium-badge" style={{ background: meta.color }}>
          🔓 {premium.name}
        </div>
        <Sections sections={result.sections} color={meta.color} />
        {result.footnote && <p className="footnote">{result.footnote}</p>}
      </div>
    );
  }

  return (
    <div id="premium" className="gate" style={{ ["--c" as string]: meta.color }}>
      <p className="gate-kicker">여기서부터는 {name}만을 위한</p>
      <h2 className="gate-title">{premium.name}</h2>
      <p className="gate-pitch">{premium.pitch}</p>
      <ul className="teasers">
        {premium.teasers.map((t) => (
          <li key={t.heading}>
            <span className="teaser-icon" aria-hidden>
              {t.icon}
            </span>
            <div>
              <strong>{t.heading}</strong>
              <span>{t.hint}</span>
              <div className="teaser-blur" aria-hidden>
                <i style={{ width: "92%" }} />
                <i style={{ width: "68%" }} />
              </div>
            </div>
            <span className="lock" aria-hidden>
              🔒
            </span>
          </li>
        ))}
      </ul>
      {state === "loading" ? (
        <div className="btn primary big disabled">확인 중…</div>
      ) : (
        <Link className="btn primary big" href={`/pay?product=${product}&d=${d}`}>
          {PRICE.toLocaleString("ko-KR")}원으로 전체 보기
        </Link>
      )}
      <p className="gate-note">가입 없이 바로 결제 · 간식 하나 값 · 이 기기에서 계속 열람</p>
    </div>
  );
}
