import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, BookOpen } from "lucide-react";
import PublicShell from "@/components/PublicShell";
import { AnimArt, ANIM_LABELS, type AnimName } from "@/components/AnimArt";
import { BRAND } from "@/lib/brand";
import { TOOLS, toolByHref, type ToolIconName } from "./registry";
import { ToolIcon } from "./ToolIcon";
import { RelatedToolsCarousel } from "./RelatedToolsCarousel";
import { faqJsonLd, howToJsonLd, ldJson, webAppJsonLd, type AppCategory, type ToolFaq } from "./seo";
import t from "./tools.module.css";

export { toolMetadata } from "./seo";

/**
 * Typed config for one free-tool page. Every tool page under src/app/tools/** is
 * `export const metadata = toolMetadata(config)` plus `<ToolPageTemplate config={config}><TheTool /></ToolPageTemplate>`.
 */
export type ToolPageConfig = {
  /** Route path, e.g. "/tools/instagram-hashtag-generator". */
  path: string;
  /** Full tool name for schema and the tool card, e.g. "Instagram hashtag generator". */
  name: string;
  /** Short breadcrumb label. Defaults to the registry name, then `name`. */
  crumb?: string;
  /** <title>, max 60 characters. Unique across tools. */
  title: string;
  /** Meta description, 140–155 characters. Unique across tools. */
  description: string;
  /** Small pill above the H1. */
  pill: string;
  /** H1 split so one phrase gets the lime highlight. Only one H1 per page. */
  h1: { before?: string; mark: string; after?: string };
  lede: string;
  /** Hero animation and its alt text (describe what the drawing shows). */
  art: AnimName;
  artLabel: string;
  /** Up to three short facts under the lede ("No signup", "Runs in your browser"…). */
  heroPoints?: string[];
  /** Header line of the tool card. */
  toolTitle: string;
  toolNote?: string;
  /** Exactly three "How to use" steps, each with optional art. Also feeds HowTo JSON-LD. */
  steps: { title: string; text: string; art?: AnimName; artLabel?: string }[];
  /** Section heading for the steps, e.g. "How to generate Instagram hashtags". */
  stepsTitle: string;
  /** Three (or six) benefit cards with art. */
  features: { title: string; text: string; art: AnimName; artLabel?: string }[];
  featuresTitle: string;
  /** SEO guide: one H2 and H3 sections. Bodies may contain links, lists and tables. */
  guide: { title: string; intro?: ReactNode; sections: { title: string; body: ReactNode }[] };
  /** FAQ items. Rendered and emitted as FAQPage JSON-LD from the same array. */
  faqs: ToolFaq[];
  faqTitle?: string;
  /** Hrefs of related tools from the registry (3–6). Scheduler, auto-DM and the hub are always added. */
  related: string[];
  /** Schema options. */
  schema?: { category?: AppCategory; features?: string[]; howTo?: boolean };
  /** Dark CTA band copy. */
  cta?: { title: string; mark: string; text: string; art?: AnimName; artLabel?: string };
};

const DEFAULT_STEP_ART: AnimName[] = ["writing", "visual", "card-schedule"];

const slug = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

const ok = (
  <svg width="16" height="16" aria-hidden="true">
    <use href="#tool-ok" />
  </svg>
);

/* ---------- Subcomponents (exported so pages with unusual needs can compose them) ---------- */

export function ToolHero({ config }: { config: ToolPageConfig }) {
  const { h1 } = config;
  return (
    <header className={`hero ${t.hero}`}>
      <span className="pill">{config.pill}</span>
      <h1>
        {h1.before ? `${h1.before} ` : null}
        <em className="s mark">{h1.mark}</em>
        {h1.after ? ` ${h1.after}` : null}
      </h1>
      <p className="lede">{config.lede}</p>
      {config.heroPoints && config.heroPoints.length > 0 && (
        <ul className={t.points}>
          {config.heroPoints.map((p) => (
            <li key={p}>{ok}{p}</li>
          ))}
        </ul>
      )}
      <div className={t.heroCtas}>
        <a className="btn btn-dark" href="#tool">
          Use the free tool <ArrowDown size={17} aria-hidden="true" />
        </a>
        <Link className={t.textLink} href="/instagram-scheduler">
          Schedule posts with {BRAND.name} <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="hero-art">
        <AnimArt name={config.art} label={config.artLabel} />
      </div>
    </header>
  );
}

export function ToolCard({
  title,
  note,
  icon,
  children,
}: {
  title: string;
  note?: string;
  /** Optional registry icon shown beside the title. */
  icon?: ToolIconName;
  children: ReactNode;
}) {
  return (
    <section id="tool" className={t.toolSection} aria-labelledby="tool-title">
      <div className={t.toolCard}>
        <div className={t.toolHead}>
          <div className={t.toolTitle}>
            {icon && (
              <span className={t.toolIcon} aria-hidden="true">
                <ToolIcon name={icon} size={18} />
              </span>
            )}
            <h2 id="tool-title">{title}</h2>
          </div>
          <span className={t.toolBadge}>
            <i className={t.liveDot} aria-hidden="true" />
            {note ?? "Free · runs in your browser"}
          </span>
        </div>
        <div className={t.toolBody}>{children}</div>
      </div>
    </section>
  );
}

export function HowItWorks({ title, steps }: { title: string; steps: ToolPageConfig["steps"] }) {
  return (
    <section id="how-to" className={`howSection ${t.section}`}>
      <div className="head">
        <p className="eyebrow">How to use it</p>
        <h2>{title}</h2>
      </div>
      <ol className={`howGrid ${t.howGrid}`}>
        {steps.map((st, i) => (
          <li key={st.title} className="howStep">
            <div className={`howArt ${t.howArt}`}>
              <AnimArt name={st.art ?? DEFAULT_STEP_ART[i % DEFAULT_STEP_ART.length]} label={st.artLabel ?? ANIM_LABELS[st.art ?? DEFAULT_STEP_ART[i % DEFAULT_STEP_ART.length]]} />
            </div>
            <span className="howNo">Step {i + 1}</span>
            <h3>{st.title}</h3>
            <p>{st.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ToolFeatures({ title, features }: { title: string; features: ToolPageConfig["features"] }) {
  return (
    <section className={t.section}>
      <div className="head">
        <p className="eyebrow">Why use it</p>
        <h2>{title}</h2>
      </div>
      <div className="bento">
        {features.map((f) => (
          <article key={f.title} className="bentoCard">
            <div className="bentoArt"><AnimArt name={f.art} label={f.artLabel ?? ANIM_LABELS[f.art]} /></div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ToolGuide({ guide }: { guide: ToolPageConfig["guide"] }) {
  const items = guide.sections.map((s) => ({ ...s, id: slug(s.title) }));
  return (
    <section id="guide" className={t.section} aria-labelledby="guide-title">
      <div className={t.guide}>
        <aside className={t.toc} aria-label="On this page">
          <p className="eyebrow">Guide</p>
          <ol>
            {items.map((s) => (
              <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>
            ))}
          </ol>
        </aside>
        <article className={t.prose}>
          <h2 id="guide-title">{guide.title}</h2>
          {guide.intro && <div className={t.intro}>{typeof guide.intro === "string" ? <p>{guide.intro}</p> : guide.intro}</div>}
          {items.map((s) => (
            <div key={s.id} className={t.chapter}>
              <h3 id={s.id}>{s.title}</h3>
              {typeof s.body === "string" ? <p>{s.body}</p> : s.body}
            </div>
          ))}
        </article>
      </div>
    </section>
  );
}

export function ToolFaqSection({ title, faqs }: { title: string; faqs: ToolFaq[] }) {
  return (
    <section id="faq" className={t.section}>
      <div className={t.faqLayout}>
        <div className="head">
          <p className="eyebrow">Questions</p>
          <h2>{title}</h2>
          <p className={t.faqNote}>
            <BookOpen size={16} aria-hidden="true" />
            {faqs.length} quick answers. Tap a question to open it.
          </p>
        </div>
        <div className="faq">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.aNode ?? f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RelatedTools({ hrefs, self }: { hrefs: string[]; self: string }) {
  const picked = hrefs.filter((h) => h !== self).map(toolByHref).filter((x) => x !== undefined);
  // Top up with tools from the same category so the carousel always has a full row.
  const own = toolByHref(self);
  const fill = TOOLS.filter((x) => x.href !== self && x.category === own?.category && !picked.includes(x));
  const tools = [...picked, ...fill].slice(0, Math.max(picked.length, 8));
  return (
    <section className={`${t.section} ${t.related}`} aria-labelledby="related-title">
      <div className={t.relHead}>
        <div>
          <p className="eyebrow">Keep going</p>
          <h2 id="related-title">More free social media tools</h2>
        </div>
        <Link href="/tools" className={t.textLink}>See all tools <span aria-hidden="true">→</span></Link>
      </div>
      <RelatedToolsCarousel tools={tools} />
      <nav className="relChips" aria-label="Keep exploring">
        <span>Ready to post?</span>
        <Link href="/instagram-scheduler">Instagram scheduler</Link>
        <Link href="/instagram-auto-dm">Instagram auto DM</Link>
        <Link href="/tools">All free social media tools</Link>
      </nav>
    </section>
  );
}

export function ToolCta({ cta }: { cta?: ToolPageConfig["cta"] }) {
  const c = cta ?? {
    title: "Post it on time,",
    mark: "then DM every commenter",
    text: `Schedule the post with ${BRAND.name}, and send your link to everyone who comments a keyword, on the official Meta API.`,
  };
  return (
    <section className={t.section}>
      <div className="cta">
        <div className="ctaCopy">
          <p className="ctaEyebrow">Free plan · no credit card</p>
          <h2>
            {/* Site rule: no trailing period on H1/H2. */}
            {c.title} <em className="s">{c.mark.replace(/\.$/, "")}</em>
          </h2>
          <p>{c.text}</p>
          <form className="glassBar ctaBar" action="/signup" method="get">
            <label className="sr-only" htmlFor="tool-cta-email">Email</label>
            <input id="tool-cta-email" name="email" type="email" placeholder="Enter your email..." autoComplete="email" required />
            <button type="submit">Get started free <ArrowRight size={18} aria-hidden="true" /></button>
          </form>
          <ul className="ctaChecks">
            <li><svg width="18" height="18" aria-hidden="true"><use href="#tool-ok" /></svg>Free plan</li>
            <li><svg width="18" height="18" aria-hidden="true"><use href="#tool-ok" /></svg>No credit card</li>
            <li><svg width="18" height="18" aria-hidden="true"><use href="#tool-ok" /></svg>Official Meta API</li>
          </ul>
        </div>
        {c.art ? (
          <AnimArt name={c.art} label={c.artLabel ?? ANIM_LABELS[c.art]} />
        ) : (
          <AnimArt name="card-schedule" label="A creator pins post cards onto a weekly calendar next to a smiling alarm clock" />
        )}
      </div>
    </section>
  );
}

/* ---------- The template ---------- */

export function ToolPageTemplate({
  config,
  children,
  afterTool,
  afterGuide,
}: {
  config: ToolPageConfig;
  /** The interactive tool. */
  children: ReactNode;
  /** Optional block right after the tool card (e.g. a reference table). */
  afterTool?: ReactNode;
  /** Optional block after the guide. */
  afterGuide?: ReactNode;
}) {
  const crumb = config.crumb ?? toolByHref(config.path)?.name ?? config.name;
  const jsonLd: object[] = [
    webAppJsonLd({
      name: config.name,
      description: config.description,
      path: config.path,
      category: config.schema?.category,
      features: config.schema?.features,
    }),
    faqJsonLd(config.faqs),
  ];
  if (config.schema?.howTo !== false) {
    jsonLd.push(howToJsonLd({ name: config.stepsTitle, path: config.path, steps: config.steps }));
  }
  return (
    <PublicShell
      breadcrumbs={[
        { name: "Free Instagram tools", path: "/tools" },
        { name: crumb, path: config.path },
      ]}
    >
      {jsonLd.map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(data) }} />
      ))}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <symbol id="tool-ok" viewBox="0 0 18 18">
            <circle cx="9" cy="9" r="9" fill="var(--green)" />
            <path d="M5 9.3l2.6 2.5L13 6.4" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </symbol>
        </defs>
      </svg>
      <div className={t.page}>
        <ToolHero config={config} />
        <ToolCard title={config.toolTitle} note={config.toolNote} icon={toolByHref(config.path)?.icon}>
          {children}
        </ToolCard>
        {afterTool}
        <HowItWorks title={config.stepsTitle} steps={config.steps} />
        <ToolFeatures title={config.featuresTitle} features={config.features} />
        <ToolGuide guide={config.guide} />
        {afterGuide}
        <ToolFaqSection title={config.faqTitle ?? `${config.name} FAQ`} faqs={config.faqs} />
        <RelatedTools hrefs={config.related} self={config.path} />
        <ToolCta cta={config.cta} />
      </div>
    </PublicShell>
  );
}
