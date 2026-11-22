"use client";

import { useCallback, useEffect, useState } from "react";
import type { Species } from "./types";

/** 이 기기에만 저장되는 우리 아이 프로필 (서버로 보내지 않는다) */
export type Pet = { n?: string; s?: Species; b?: string; z?: string; photo?: string };

const KEY = "pet";

export function readPet(): Pet {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

export function savePet(patch: Pet): Pet {
  const next = { ...readPet(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* 저장 공간이 없거나 막혀 있어도 서비스는 계속 쓸 수 있다 */
  }
  return next;
}

export function usePet() {
  const [pet, setPet] = useState<Pet>({});
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setPet(readPet());
    setReady(true);
  }, []);
  const update = useCallback((patch: Pet) => setPet(savePet(patch)), []);
  return { pet, ready, update };
}

export const unlockKey = (product: string, d: string) => `unlock:${product}:${d}`;

/* ── 관상용 사진: 결과(d)별로 이 기기에만 보관 ─────────────────── */

const photoKey = (d: string) => `photo:${d}`;
export const premiumCacheKey = (product: string, d: string) => `premium:${product}:${d}`;

export function readPhoto(d: string): string | null {
  try {
    return localStorage.getItem(photoKey(d));
  } catch {
    return null;
  }
}

/** 저장 공간을 아끼려고, 결제하지 않은 이전 사진은 지우고 새 사진을 넣는다. */
export function savePhoto(d: string, photo: string): boolean {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith("photo:") && !localStorage.getItem(unlockKey("face", key.slice(6)))) localStorage.removeItem(key);
    }
    localStorage.setItem(photoKey(d), photo);
    return true;
  } catch {
    return false;
  }
}

/** 긴 변을 max 픽셀로 줄인 JPEG data URL */
export function shrinkImage(file: File, max: number, square = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      if (square) {
        const side = Math.min(img.width, img.height);
        canvas.width = canvas.height = Math.min(max, side);
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
      } else {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };
    img.src = url;
  });
}

export async function photoFingerprint(photo: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(photo));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("").slice(0, 12);
}
