import type { CSSProperties } from "react";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { AnimArt } from "@/components/AnimArt";
import { BRAND } from "@/lib/brand";
import { faqJsonLd, ldJson, publisherRef } from "@/lib/tool-schema";
import {
  ASSISTANT_GUIDES,
  ASSISTANT_LIMITS,
  ASSISTANT_ORDER,
  ASSISTANT_TOOLS,
  MCP_URL,
  type AssistantSlug,
} from "@/lib/aiAssistantGuides";

// One template for the "schedule social media posts with <assistant>" pages. Each page passes its
// slug; the copy lives in src/lib/aiAssistantGuides.ts. Code blocks match the /developers page.

const codeStyle: CSSProperties = {
  background: "var(--ink)",
  color: "var(--paper)",
  borderRadius: 12,
  padding: "16px 18px",
  overflowX: "auto",
  font: "13px/1.6 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  margin: "14px 0 0",
  whiteSpace: "pre",
};

export function AiAssistantGuidePage({ slug }: { slug: AssistantSlug }) {
  const g = ASSISTANT_GUIDES[slug];
  const others = ASSISTANT_ORDER.filter((o) => o !== slug).map((o) => ASSISTANT_GUIDES[o]);

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to schedule social media posts with ${g.name} and ${BRAND.name}`,
    description: g.description,
    url: `${BRAND.canonicalUrl}${g.path}`,
    step: g.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.title,
      text: step.text,
    })),
    publisher: publisherRef(),
  };

  return (
    <PublicShell className={`${s.sched} ${s.pub}`} breadcrumbs={[{ name: "Developers", path: "/developers" }, { name: `Schedule posts with ${g.name}`, path: g.path }]}>
      {[howToJsonLd, faqJsonLd(g.faqs)].map((data) => (
        <script key={data["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(data) }} />
      ))}

      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">MCP server · API key · official platform APIs</span>
          <h1>
            {g.h1Lead} <em className="s mark">{g.h1Em}</em>
          </h1>
          <p className="lede">{g.lede}</p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            <a className="btn btn-line" href="#setup">See the setup</a>
          </div>
        </div>
        <div className="hero-art"><AnimArt name="developers" label={`A plug connects an AI assistant to Poskoo so ${g.name} can schedule posts`} /></div>
      </header>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Who this is for</p>
            <h2>Write with {g.name}, publish with {BRAND.name}</h2>
            <p>{g.fit}</p>
          </div>
        </div>
      </section>

      <section id="setup" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Setup</p>
            <h2>Connect {g.name} to {BRAND.name} in {g.steps.length} steps</h2>
            <p>
              {BRAND.name}&apos;s MCP server lives at <strong>{MCP_URL}</strong> and signs in with your {BRAND.name} API key
              sent as <code style={{ fontFamily: "ui-monospace, monospace" }}>Authorization: Bearer poskoo_…</code>.
            </p>
          </div>
          <ol className={`howGrid ${s.switchGrid}`}>
            {g.steps.map((step, i) => (
              <li key={step.title} className="howStep">
                <span className="howNo">Step {i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          {g.steps
            .filter((step) => step.code)
            .map((step) => (
              <div key={step.title} style={{ marginTop: 24 }}>
                <p className="lede" style={{ maxWidth: 720 }}>{step.codeLabel}:</p>
                <pre style={codeStyle} aria-label={step.codeLabel}>{step.code}</pre>
              </div>
            ))}
          <div className="pains" style={{ marginTop: 24 }}>
            {g.notes.map((note) => (
              <div key={note} className="pain">
                <b>Good to know</b>
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Example prompts</p>
            <h2>What to ask {g.name}</h2>
            <p>Each prompt uses one of {BRAND.name}&apos;s MCP tools. Swap in your own captions, times and links.</p>
          </div>
          <div className="cards">
            {g.prompts.map((p) => (
              <article key={p.prompt} className="pcard">
                <span className="no">{p.tool}</span>
                <p>“{p.prompt}”</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">What the assistant can do</p>
            <h2>The {ASSISTANT_TOOLS.length} tools {g.name} gets</h2>
          </div>
          <div className="cards">
            {ASSISTANT_TOOLS.map((t) => (
              <article key={t.name} className="pcard">
                <h3 style={{ fontFamily: "ui-monospace, monospace", fontSize: "1rem" }}>{t.name}</h3>
                <p>{t.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Honest limits</p>
            <h2>What it does not do today</h2>
          </div>
          <div className="pains">
            {ASSISTANT_LIMITS.map((limit) => (
              <div key={limit} className="pain">
                <span>{limit}</span>
              </div>
            ))}
          </div>
          <p className="small" style={{ marginTop: 16, textAlign: "center" }}>
            Full reference on the <Link className={s.vlink} href="/developers">{BRAND.name} developers page</Link>. Prefer to schedule by hand? Use the{" "}
            <Link className={s.vlink} href="/social-media-scheduler">social media scheduler</Link> or see{" "}
            <Link className={s.vlink} href="/ai-social-media-manager">{BRAND.name}&apos;s AI features</Link>.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Scheduling posts with {g.name}</h2>
          </div>
          <div className="faq">
            {g.faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Let {g.name} fill your <em className="s">content calendar</em></h2>
              <p>Start free, connect a channel, create an API key and add {BRAND.name} to {g.name}.</p>
              <Link className="btn" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            </div>
            <AnimArt name="feat-ai" label={`${g.name} drafts a caption while ${BRAND.name} puts it on the calendar`} />
          </div>
          <nav aria-label="Other AI assistants" className={s.chipRow}>
            <p>Other assistants</p>
            <div>
              {others.map((o) => (
                <Link key={o.slug} href={o.path} className={s.chip}>
                  Schedule posts with {o.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </section>
    </PublicShell>
  );
}
