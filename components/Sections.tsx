import type { Section } from "@/lib/types";

export function Sections({ sections, color }: { sections: Section[]; color: string }) {
  return (
    <>
      {sections.map((s) => (
        <section className="card" key={s.heading}>
          <h3 className="card-title">
            <span aria-hidden>{s.icon}</span> {s.heading}
          </h3>
          {s.body && <p className="card-body">{s.body}</p>}
          {s.items && (
            <ul className="list">
              {s.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          )}
          {s.bars && (
            <div className="bars">
              {s.bars.map((b) => (
                <div className="bar" key={b.label}>
                  <div className="bar-head">
                    <span>{b.label}</span>
                    <strong>{b.note && !/^\d/.test(b.note) ? `${b.value}점` : (b.note ?? b.value)}</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${Math.max(4, b.value)}%`, background: color }} />
                  </div>
                  {b.note && !/^\d/.test(b.note) && <p className="bar-note">{b.note}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </>
  );
}
