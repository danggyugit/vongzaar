"use client";

import type { ReactNode } from "react";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="field">
      <div className="field-label">
        {label}
        {hint && <span>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function Choice<T extends string>({
  value,
  options,
  onChange,
  columns = 2,
}: {
  value: T | undefined;
  options: { v: T; label: string }[];
  onChange: (v: T) => void;
  columns?: number;
}) {
  return (
    <div className="choices" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }} role="radiogroup">
      {options.map((o) => (
        <button type="button" key={o.v} role="radio" aria-checked={value === o.v} className={`choice${value === o.v ? " on" : ""}`} onClick={() => onChange(o.v)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const SPECIES_OPTIONS = [
  { v: "dog" as const, label: "🐶 강아지" },
  { v: "cat" as const, label: "🐱 고양이" },
];
