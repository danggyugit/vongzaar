"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PRICE, PRODUCTS } from "@/lib/products";
import { premiumCacheKey, readPhoto, unlockKey } from "@/lib/pet";
import type { PremiumResult, ProductId } from "@/lib/types";
import { Sections } from "./Sections";

type State = "loading" | "locked" | "open";

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export function PremiumGate({ product, d, name }: { product: ProductId; d: string; name: string }) {
  const meta = PRODUCTS[product];
  const premium = meta.premium!;
  const isFace = product === "face";
  const [state, setState] = useState<State>("loading");
  const [result, setResult] = useState<PremiumResult | null>(null);
  const [notice, setNotice] = useState("");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [writing, setWriting] = useState(false);

  const load = useCallback(async () => {
    const photo = isFace ? readPhoto(d) : null;
    setHasPhoto(Boolean(photo));
    const token = read(unlockKey(product, d));
    if (!token) return setState("locked");

    // AI 풀이는 한 번 만든 결과를 이 기기에 보관해 다시 열 때 그대로 보여준다
    if (isFace) {
      try {
        const saved = JSON.parse(read(premiumCacheKey(product, d)) ?? "null");
        if (saved?.sections) {
          setResult(saved);
          setNotice("");
          return setState("open");
        }
      } catch {
        /* 보관본이 깨졌으면 새로 받는다 */
      }
      setWriting(Boolean(photo));
    }

    try {
      const json = await fetch("/api/premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, d, token, ...(photo ? { photo } : {}) }),
      }).then((r) => r.json());
      if (!json.ok) return setState("locked");
      setResult(json.result);
      setNotice(json.notice ?? "");
      if (json.ai) {
        try {
          localStorage.setItem(premiumCacheKey(product, d), JSON.stringify(json.result));
        } catch {
          /* 보관하지 못해도 이번 화면에는 보여준다 */
        }
      }
      setState("open");
    } catch {
      setState("locked");
    } finally {
      setWriting(false);
    }
  }, [product, d, isFace]);

  useEffect(() => {
    load();
  }, [load]);

  if (state === "open" && result) {
    return (
      <div id="premium" className="premium-open">
        <div className="premium-badge" style={{ background: meta.color }}>
          🔓 {premium.name}
        </div>
        {notice && (
          <div className="ai-notice">
            <p>{notice}</p>
            <button type="button" className="btn ghost" onClick={() => { setState("loading"); load(); }}>
              AI 풀이 다시 시도
            </button>
          </div>
        )}
        <Sections sections={result.sections} color={meta.color} />
        {result.footnote && <p className="footnote">{result.footnote}</p>}
      </div>
    );
  }

  if (state === "loading" && writing) {
    return (
      <div id="premium" className="gate writing" style={{ ["--c" as string]: meta.color }}>
        <span className="spinner" aria-hidden />
        <h2 className="gate-title">AI가 {name}의 사진을 보고 있어요</h2>
        <p className="gate-pitch">풀이를 쓰는 데 20초쯤 걸려요. 이 화면을 닫지 말아 주세요.</p>
      </div>
    );
  }

  // 관상은 사진이 있어야 AI 풀이를 살 수 있다
  const needsPhoto = isFace && state === "locked" && !hasPhoto;

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
      ) : needsPhoto ? (
        <Link className="btn primary big" href={meta.start}>
          📷 우리 아이 사진 올리고 AI 풀이 받기
        </Link>
      ) : (
        <Link className="btn primary big" href={`/pay?product=${product}&d=${d}`}>
          {PRICE.toLocaleString("ko-KR")}원으로 전체 보기
        </Link>
      )}
      <p className="gate-note">
        {needsPhoto ? "AI 풀이는 사진이 있어야 볼 수 있어요 · 사진은 이 기기에만 보관" : "가입 없이 바로 결제 · 간식 하나 값 · 이 기기에서 계속 열람"}
      </p>
    </div>
  );
}
