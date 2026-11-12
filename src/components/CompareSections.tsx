import type { ReactNode } from "react";
import s from "./site.module.css";

// Shared sections for the competitor alternative pages, styled like the rest of
// the site (eyebrow + heading, then cards/steps), so every page reads the same.

/** "Who should stay on X": an honest note as a card, not a bare paragraph. */
export function StaySection({ name, title, children }: { name: string; title?: string; children: ReactNode }) {
  return (
    <section style={{ paddingTop: 20 }}>
      <div className="wrap">
        <div className="head">
          <p className="eyebrow">Honest take</p>
          <h2>{title ?? `Who should stay on ${name}`}</h2>
        </div>
        <div className={s.stayCard}>
          <span className={s.stayBadge} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <p className={s.stayText}>{children}</p>
        </div>
      </div>
    </section>
  );
}

/** "How to switch": numbered step cards (same look as the landing's how-it-works). */
export function SwitchSteps({ steps, title = "How to switch in 10 minutes" }: { steps: { title: string; text: string }[]; title?: string }) {
  return (
    <section style={{ paddingTop: 20 }}>
      <div className="wrap">
        <div className="head">
          <p className="eyebrow">Switching</p>
          <h2>{title}</h2>
        </div>
        <ol className={`howGrid ${s.switchGrid}`}>
          {steps.map((step, i) => (
            <li key={step.title} className="howStep">
              <span className="howNo">Step {i + 1}</span>
              <h3>{step.title.replace(/^\d+\.\s*/, "")}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
