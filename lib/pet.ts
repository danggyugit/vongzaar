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
