"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QUESTIONS, scoreAnswers } from "@/lib/mbti-data";
import { usePet } from "@/lib/pet";
import { PRODUCTS } from "@/lib/products";
import type { Species } from "@/lib/types";
import { encodeInput } from "@/lib/util";
import { Choice, Field, SPECIES_OPTIONS } from "./Fields";

export function Quiz() {
  const meta = PRODUCTS.mbti;
  const router = useRouter();
  const { pet, ready, update } = usePet();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<Species>();
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<number[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    setName(pet.n ?? "");
    setSpecies(pet.s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const start = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("아이 이름을 입력해 주세요.");
    if (!species) return setError("강아지인지 고양이인지 골라주세요.");
    update({ n: name.trim(), s: species });
    setError("");
    setStep(0);
  };

  const answer = (v: number) => {
    const next = [...answers.slice(0, step), v];
    setAnswers(next);
    if (step + 1 < QUESTIONS.length) return setStep(step + 1);
    const { type, pct } = scoreAnswers(next);
    setStep(QUESTIONS.length);
    router.push(`/r/mbti?d=${encodeInput({ n: name.trim(), s: species!, t: type, p: pct.join(".") })}`);
  };

  if (step < 0) {
    return (
      <form className="form" onSubmit={start} style={{ ["--c" as string]: meta.color }}>
        <div className="form-hero">
          <span className="form-emoji" aria-hidden>
            {meta.emoji}
          </span>
          <h1>{species === "cat" ? "냥BTI" : species === "dog" ? "멍BTI" : "멍BTI · 냥BTI"} 테스트</h1>
          <p>12개의 질문으로 알아보는 우리 아이 성격유형</p>
        </div>
        <Field label="아이 이름">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={12} placeholder="예: 콩이" autoComplete="off" />
        </Field>
        <Field label="어떤 아이인가요?">
          <Choice value={species} options={SPECIES_OPTIONS} onChange={setSpecies} />
        </Field>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="btn primary big" type="submit">
          테스트 시작하기
        </button>
        <p className="form-note">평소 모습을 떠올리며 더 가까운 쪽을 골라주세요. 1분이면 끝나요.</p>
      </form>
    );
  }

  if (step >= QUESTIONS.length) {
    return (
      <div className="form" style={{ ["--c" as string]: meta.color }}>
        <div className="form-hero">
          <span className="form-emoji" aria-hidden>
            ✨
          </span>
          <h1>결과를 분석하고 있어요</h1>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[step];
  return (
    <div className="form quiz" style={{ ["--c" as string]: meta.color }}>
      <div className="progress" aria-label={`${QUESTIONS.length}문항 중 ${step + 1}번째`}>
        <div style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
      </div>
      <p className="quiz-count">
        {step + 1} / {QUESTIONS.length}
      </p>
      <h1 className="quiz-q">{q.q.replaceAll("{name}", name.trim())}</h1>
      <div className="quiz-answers">
        {q.a.map((text, i) => (
          <button type="button" className="choice tall" key={`${step}-${i}`} onClick={() => answer(i)}>
            {text}
          </button>
        ))}
      </div>
      {step > 0 && (
        <button type="button" className="link-btn" onClick={() => setStep(step - 1)}>
          ← 이전 질문
        </button>
      )}
    </div>
  );
}
