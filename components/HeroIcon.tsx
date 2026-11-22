"use client";

import { useEffect, useState } from "react";
import { readPhoto } from "@/lib/pet";

/** 이 기기에 사진이 있으면 결과 카드에 사진을, 없으면 이모지를 보여준다. */
export function HeroIcon({ d, emoji }: { d: string; emoji: string }) {
  const [photo, setPhoto] = useState<string | null>(null);
  useEffect(() => setPhoto(readPhoto(d)), [d]);
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="result-photo" src={photo} alt="" />;
  }
  return (
    <span className="result-emoji" aria-hidden>
      {emoji}
    </span>
  );
}
