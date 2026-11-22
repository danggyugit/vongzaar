"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FACE_FIELDS } from "@/lib/face-data";
import { photoFingerprint, savePhoto, shrinkImage, usePet } from "@/lib/pet";
import { PRODUCTS } from "@/lib/products";
import type { Input, ProductId, Species } from "@/lib/types";
import { encodeInput } from "@/lib/util";
import { Choice, Field, SPECIES_OPTIONS } from "./Fields";

const SIZE_OPTIONS = [
  { v: "small", label: "소형 (10kg 미만)" },
  { v: "medium", label: "중형 (10~25kg)" },
  { v: "large", label: "대형 (25kg 이상)" },
];

const NEEDS_BIRTH: ProductId[] = ["fortune", "saju", "age", "health"];
const NEEDS_SIZE: ProductId[] = ["age", "health"];

export function ServiceForm({ product }: { product: Exclude<ProductId, "mbti"> }) {
  const meta = PRODUCTS[product];
  const router = useRouter();
  const { pet, ready, update } = usePet();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<Species>();
  const [birth, setBirth] = useState("");
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState("");
  const [avatar, setAvatar] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      setPhoto(await shrinkImage(f, 768));
      setAvatar(await shrinkImage(f, 240, true));
      setError("");
    } catch {
      setError("이 사진은 읽을 수 없어요. 다른 사진을 골라주세요.");
    }
  };

  useEffect(() => {
    if (!ready) return;
    setName(pet.n ?? "");
    setSpecies(pet.s);
    setBirth(pet.b ?? "");
    if (pet.z) setExtra((e) => ({ z: pet.z!, ...e }));
    // 저장된 프로필은 처음 한 번만 채운다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const set = (k: string) => (v: string) => setExtra((e) => ({ ...e, [k]: v }));
  const today = new Date().toISOString().slice(0, 10);
  const needsBirth = NEEDS_BIRTH.includes(product);
  const needsSize = NEEDS_SIZE.includes(product) && species === "dog";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return setError("아이 이름을 입력해 주세요.");
    if (!species) return setError("강아지인지 고양이인지 골라주세요.");
    if (needsBirth && !birth) return setError("생일을 입력해 주세요. 정확히 모르면 대략적인 날짜도 괜찮아요.");
    if (needsBirth && birth > today) return setError("생일이 오늘보다 뒤예요. 다시 확인해 주세요.");
    if (needsSize && !extra.z) return setError("체구를 골라주세요.");

    const input: Input = { n, s: species };
    if (needsBirth) input.b = birth;
    if (needsSize) input.z = extra.z;

    if (product === "saju" && extra.ob) input.ob = extra.ob;
    if (product === "face") {
      for (const f of FACE_FIELDS) {
        if (!extra[f.key]) return setError(`'${f.label}'을(를) 골라주세요.`);
        input[f.key] = extra[f.key];
      }
    }
    if (product === "health") {
      const w = Number(extra.w);
      if (!(w >= 0.3 && w <= (species === "cat" ? 20 : 100))) return setError("체중을 kg 단위로 입력해 주세요. (예: 4.5)");
      if (!extra.nt || !extra.rb || !extra.ac) return setError("아직 고르지 않은 항목이 있어요.");
      Object.assign(input, { w, nt: extra.nt, rb: extra.rb, ac: extra.ac });
    }

    setBusy(true);
    if (product === "face" && photo) input.ph = await photoFingerprint(photo);
    const d = encodeInput(input);
    if (product === "face" && photo && !savePhoto(d, photo)) {
      setBusy(false);
      return setError("사진을 이 기기에 저장하지 못했어요. 시크릿 모드라면 일반 창에서 다시 시도해 주세요.");
    }
    update({ n, s: species, ...(needsBirth ? { b: birth } : {}), ...(needsSize ? { z: extra.z } : {}), ...(avatar ? { photo: avatar } : {}) });
    router.push(`/r/${product}?d=${d}`);
  };

  return (
    <form className="form" onSubmit={submit} style={{ ["--c" as string]: meta.color }}>
      <div className="form-hero">
        <span className="form-emoji" aria-hidden>
          {meta.emoji}
        </span>
        <h1>{meta.title}</h1>
        <p>{meta.tagline}</p>
      </div>

      <Field label="아이 이름">
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={12} placeholder="예: 콩이" autoComplete="off" />
      </Field>
      <Field label="어떤 아이인가요?">
        <Choice value={species} options={SPECIES_OPTIONS} onChange={setSpecies} />
      </Field>
      {needsBirth && (
        <Field label="생일" hint="모르면 대략적인 날짜로">
          <input className="input" type="date" value={birth} max={today} min="1990-01-01" onChange={(e) => setBirth(e.target.value)} />
        </Field>
      )}
      {needsSize && (
        <Field label="체구">
          <Choice value={extra.z} options={SIZE_OPTIONS} onChange={set("z")} columns={1} />
        </Field>
      )}

      {product === "saju" && (
        <Field label="보호자 생년월일" hint="선택 · 인연 풀이에 사용">
          <input className="input" type="date" value={extra.ob ?? ""} max={today} min="1920-01-01" onChange={(e) => set("ob")(e.target.value)} />
        </Field>
      )}

      {product === "face" && (
        <Field label="얼굴이 잘 보이는 사진" hint="선택 · AI 풀이에 사용">
          <button type="button" className={`photo-pick${photo ? " has" : ""}`} onClick={() => fileInput.current?.click()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {photo ? <img src={photo} alt="고른 사진 미리보기" /> : <span aria-hidden>📷</span>}
            <strong>{photo ? "다른 사진으로 바꾸기" : "사진 고르기"}</strong>
            <small>정면에서 밝게 찍은 사진일수록 풀이가 정확해요</small>
          </button>
          <input ref={fileInput} type="file" accept="image/*" hidden onChange={onPhoto} />
        </Field>
      )}

      {product === "face" &&
        FACE_FIELDS.map((f) => (
          <Field label={f.label} key={f.key}>
            <Choice value={extra[f.key]} options={f.options} onChange={set(f.key)} />
          </Field>
        ))}

      {product === "health" && (
        <>
          <Field label="체중 (kg)">
            <input className="input" type="number" inputMode="decimal" step="0.1" min="0.3" max="100" value={extra.w ?? ""} onChange={(e) => set("w")(e.target.value)} placeholder="예: 4.5" />
          </Field>
          <Field label="중성화 수술">
            <Choice value={extra.nt} options={[{ v: "y", label: "했어요" }, { v: "n", label: "안 했어요" }]} onChange={set("nt")} />
          </Field>
          <Field label="옆구리를 쓰다듬으면 갈비뼈가" hint="체형 확인용">
            <Choice
              value={extra.rb}
              options={[
                { v: "easy", label: "바로 만져지고 도드라져요" },
                { v: "ok", label: "살짝 누르면 만져져요" },
                { v: "hard", label: "꾹 눌러도 잘 안 만져져요" },
              ]}
              onChange={set("rb")}
              columns={1}
            />
          </Field>
          <Field label="하루 활동량">
            <Choice value={extra.ac} options={[{ v: "low", label: "적어요" }, { v: "mid", label: "보통" }, { v: "high", label: "많아요" }]} onChange={set("ac")} columns={3} />
          </Field>
        </>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button className="btn primary big" type="submit" disabled={busy}>
        {busy ? "결과 만드는 중…" : "무료로 결과 보기"}
      </button>
      <p className="form-note">
        {product === "face"
          ? "사진은 이 기기에만 보관돼요. AI 풀이를 결제하면 그때 풀이를 만들기 위해 AI 서비스로 전송되고, 서버에 저장되지 않아요."
          : "입력한 정보는 결과를 만드는 데만 쓰이고 서버에 저장되지 않아요."}
      </p>
    </form>
  );
}
