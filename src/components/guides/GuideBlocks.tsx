import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Lightbulb, MessageSquareQuote } from "lucide-react";
import g from "./guides.module.css";

/* Building blocks for guide article bodies (src/content/guides/*.tsx). Server components only. */

/** External link to a source: new tab, rel="noopener". */
export function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener">
      {children}
    </a>
  );
}

const CALLOUT_ICON = {
  tip: <Lightbulb size={22} aria-hidden="true" />,
  example: <MessageSquareQuote size={22} aria-hidden="true" />,
  warning: <AlertTriangle size={22} aria-hidden="true" />,
};

/** Tip / example / warning box. `title` is announced as the box label. */
export function Callout({ kind, title, children }: { kind: "tip" | "example" | "warning"; title: string; children: ReactNode }) {
  return (
    <aside className={`${g.callout} ${g[kind]}`} aria-label={title}>
      {CALLOUT_ICON[kind]}
      <div>
        <b>{title}</b>
        {children}
      </div>
    </aside>
  );
}

/** Simple data table with a horizontal scroll wrapper. The first cell of each row is a row header. */
export function GuideTable({ caption, head, rows }: { caption?: string; head: string[]; rows: ReactNode[][] }) {
  return (
    <div className={g.tableWrap} role="region" aria-label={caption ?? head.join(", ")} tabIndex={0}>
      <table className={g.table}>
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) =>
                j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Dark inline CTA card: sign up + (optionally) a free tool. */
export function InlineCta({ title, text, tool }: { title: string; text: string; tool?: { href: string; label: string } }) {
  return (
    <aside className={g.inlineCta} aria-label={title}>
      <div>
        <b>{title}</b>
        <p>{text}</p>
      </div>
      <div className={g.inlineCtaBtns}>
        {tool && (
          <Link className={g.ctaGhost} href={tool.href}>
            {tool.label}
          </Link>
        )}
        <Link className={g.ctaPrimary} href="/signup">
          Start free <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}

export function Takeaways({ items }: { items: string[] }) {
  return (
    <section className={g.takeaways} aria-labelledby="key-takeaways">
      <h2 id="key-takeaways">Key takeaways</h2>
      <ul>
        {items.map((t) => (
          <li key={t}>
            <CheckCircle2 size={20} aria-hidden="true" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export type Niche = {
  name: string;
  level: "Easy" | "Medium" | "Hard";
  why: ReactNode;
  reel: string;
  carousel: string;
  story: string;
  money: string;
  angle: string;
};

/** One niche: why it works, three content ideas, monetization, difficulty and a unique-angle tip. */
export function NicheList({ niches, start }: { niches: Niche[]; start: number }) {
  return (
    <ol className={g.niches} start={start}>
      {niches.map((n, i) => (
        <li key={n.name} className={g.niche}>
          <div className={g.nicheHead}>
            <h4>
              {start + i}. {n.name}
            </h4>
            <span className={`${g.level} ${g[`level_${n.level.toLowerCase()}`]}`}>
              <span className="sr-only">Difficulty: </span>
              {n.level}
            </span>
          </div>
          <p>{n.why}</p>
          <ul className={g.ideas} aria-label={`Content ideas for ${n.name}`}>
            <li><span>Reel</span><span>{n.reel}</span></li>
            <li><span>Carousel</span><span>{n.carousel}</span></li>
            <li><span>Story</span><span>{n.story}</span></li>
          </ul>
          <div className={g.nicheFoot}>
            <p><b>Ways to earn:</b> {n.money}</p>
            <p><b>Unique angle:</b> {n.angle}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** "Day 1 … Day 7" list. */
export function DayList({ days }: { days: { title: string; body: ReactNode }[] }) {
  return (
    <ol className={g.days}>
      {days.map((d) => (
        <li key={d.title}>
          <p>
            <b>{d.title}</b>
            {d.body}
          </p>
        </li>
      ))}
    </ol>
  );
}

/** Type of an article body module. */
export type GuideBody = {
  intro: ReactNode;
  /** Each section renders as an H2 and becomes a TOC entry. */
  sections: { id: string; title: string; body: ReactNode }[];
  /** Sources list shown at the end of the article. */
  sources: { label: string; href: string }[];
};
