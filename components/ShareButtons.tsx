"use client";

import { useState } from "react";
import { SITE_NAME } from "@/lib/products";

type KakaoSdk = {
  isInitialized: () => boolean;
  init: (key: string) => void;
  Share: { sendDefault: (args: unknown) => void };
};

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
const KAKAO_SDK = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";

function loadKakao(): Promise<KakaoSdk> {
  const w = window as unknown as { Kakao?: KakaoSdk };
  if (w.Kakao) return Promise.resolve(w.Kakao);
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = KAKAO_SDK;
    el.async = true;
    el.onload = () => (w.Kakao ? resolve(w.Kakao) : reject(new Error("Kakao SDK")));
    el.onerror = () => reject(new Error("Kakao SDK"));
    document.head.appendChild(el);
  });
}

export function ShareButtons({ path, text, title, image }: { path: string; text: string; title: string; image: string }) {
  const [note, setNote] = useState("");
  const flash = (msg: string) => {
    setNote(msg);
    setTimeout(() => setNote(""), 2500);
  };
  const url = () => `${window.location.origin}${path}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      flash("링크를 복사했어요. 카톡 대화방에 붙여넣어 보세요!");
    } catch {
      flash("복사하지 못했어요. 주소창의 링크를 직접 복사해 주세요.");
    }
  };

  const share = async () => {
    const link = url();
    if (KAKAO_KEY) {
      try {
        const Kakao = await loadKakao();
        if (!Kakao.isInitialized()) Kakao.init(KAKAO_KEY);
        Kakao.Share.sendDefault({
          objectType: "feed",
          content: { title, description: text, imageUrl: `${window.location.origin}${image}`, link: { mobileWebUrl: link, webUrl: link } },
          buttons: [{ title: "우리 아이도 해보기", link: { mobileWebUrl: link, webUrl: link } }],
        });
        return;
      } catch {
        /* SDK를 못 불러오면 아래 기본 공유로 넘어간다 */
      }
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: `${title} | ${SITE_NAME}`, text, url: link });
      } catch {
        /* 사용자가 공유 창을 닫은 경우 */
      }
      return;
    }
    await copy();
  };

  return (
    <div className="share">
      <p className="share-lead">친구네 아이는 어떨까요? 결과를 공유해 보세요</p>
      <div className="share-row">
        <button type="button" className="btn kakao" onClick={share}>
          💬 카톡으로 공유
        </button>
        <button type="button" className="btn ghost" onClick={copy}>
          🔗 링크 복사
        </button>
      </div>
      <p className="share-note" role="status">
        {note}
      </p>
    </div>
  );
}
