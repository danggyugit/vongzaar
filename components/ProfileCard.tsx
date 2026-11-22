"use client";

import { useRef } from "react";
import { shrinkImage, usePet } from "@/lib/pet";
import { ageInMonths, ageLabel, kstToday, speciesEmoji, speciesWord } from "@/lib/util";

export function ProfileCard() {
  const { pet, ready, update } = usePet();
  const file = useRef<HTMLInputElement>(null);
  if (!ready || !pet.n || !pet.s) return null;

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      update({ photo: await shrinkImage(f, 240, true) });
    } catch {
      /* 읽을 수 없는 이미지는 무시 */
    }
  };

  return (
    <div className="profile">
      <button type="button" className="avatar" onClick={() => file.current?.click()} aria-label="프로필 사진 바꾸기">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {pet.photo ? <img src={pet.photo} alt="" /> : <span aria-hidden>{speciesEmoji(pet.s)}</span>}
        <i aria-hidden>📷</i>
      </button>
      <input ref={file} type="file" accept="image/*" hidden onChange={onPhoto} />
      <div>
        <strong>{pet.n}</strong>
        <span>
          {speciesWord(pet.s)}
          {pet.b ? ` · ${ageLabel(ageInMonths(pet.b, kstToday()))}` : ""}
        </span>
      </div>
      <p>다시 오셨네요! 오늘의 운세부터 확인해 볼까요?</p>
    </div>
  );
}
