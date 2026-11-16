import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { priceSummary } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import { PLAN_LIMITS } from "@/lib/planLimits";
import PublicShell from "@/components/PublicShell";
import { CompareAlternativesNav } from "@/components/CompareAlternativesNav";
import { CompareNote } from "@/components/CompareNote";
import s from "@/components/site.module.css";
import { AnimArt } from "@/components/AnimArt";

export const metadata: Metadata = withSocial({
  title: { absolute: "Linktree Alternative With Click Tracking & Auto-DM | Poskoo" },
  description:
    "A free Linktree alternative: build a link-in-bio page at poskoo.com/@yourname, track clicks on every link, and auto-DM people who comment on your posts.",
  alternates: { canonical: "/linktree-alternative" },
});

const whySwitch = [
  {
    no: "01 / One account",
    title: "Link-in-bio, scheduler and auto-DM in one account",
    text: "Poskoo gives you a link-in-bio page at poskoo.com/@yourname, a post scheduler and Instagram comment-to-DM automation — all in the same account, starting on Free.",
  },
  {
    no: "02 / Tracked links",
    title: "Click count for every link",
    text: "Every link on your page is a tracked short link, so you see exactly how many people tapped each one and which content works best.",
  },
  {
    no: "03 / Latest posts",
    title: "Your latest posts under your links",
    text: "Your latest published Poskoo posts show under your bio links, so visitors see recent work without leaving your page.",
  },
];

const compare: [string, string, string][] = [
  ["Link-in-bio page", "Yes", "Yes"],
  ["Click count per link", "Yes", "Check their site"],
  ["Colour themes", "Yes (4)", "Yes"],
  ["Shows your latest posts", "Yes", "Check their site"],
  ["Post scheduling", "Yes", "Check their site"],
  ["Instagram comment-to-DM", "Yes", "Check their site"],
  ["Email capture in DMs", "Yes", "Check their site"],
  ["Price", priceSummary(planReadiness()), "Check their site"],
  [
    "Links on Free plan",
    `${PLAN_LIMITS.Free.bioLinks} links (${PLAN_LIMITS.Pro.bioLinks} on paid)`,
    "Check their site",
  ],
];

const faqs = [
  {
    q: "Is Poskoo a free Linktree alternative?",
    a: "Yes. Poskoo gives you a free link-in-bio page at poskoo.com/@yourname with click tracking on every link, plus a post scheduler and Instagram comment-to-DM automation in the same account.",
  },
  {
    q: "How many links can I add?",
    a: `The Free plan includes ${PLAN_LIMITS.Free.bioLinks} links on your bio page. Pro and Agency include ${PLAN_LIMITS.Pro.bioLinks} links, so you can share more destinations from one page.`,
  },
  {
    q: "Can I see how many people click each link?",
    a: "Yes. Every link on your page gets a tracked short link, and the Link in bio screen shows the click count for each link plus the total for the page.",
  },
  {
    q: "Can I move my Linktree links to Poskoo?",
    a: "There is no importer. Add each label and link in Link in bio — it takes a few minutes, and every link gets click tracking right away.",
  },
  {
    q: "Does it use the official Instagram API?",
    a: "Yes. We connect through the official Meta login and APIs. We never ask for your password and never scrape.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

const steps = [
  {
    n: "1",
    title: "Open Link in bio",
    text: "Sign in to Poskoo and open Link in bio. Your page lives at poskoo.com/@yourname.",
  },
  {
    n: "2",
    title: "Add a label and a link",
    text: "Give each link a label such as Shop or Book a call, then paste the full https:// address. Add, reorder or remove links any time.",
  },
  {
    n: "3",
    title: "Pick a theme and publish",
    text: "Choose Sunrise, Mint, Lilac or Ink, add an optional avatar and bio, then publish your page.",
  },
];

function Cell({ v }: { v: string }) {
  if (v === "Yes") return <span style={{ color: "var(--poskoo-green)", fontWeight: 700 }}>Yes</span>;
  if (v === "No") return <span style={{ color: "var(--poskoo-muted)" }}>No</span>;
  return <>{v}</>;
}

export default function LinktreeAlternative() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`} breadcrumbs={[{ name: "Linktree alternative", path: "/linktree-alternative" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />

      {/* Hero */}
      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Free plan · {PLAN_LIMITS.Free.bioLinks} links</span>
          <h1>
            The Linktree alternative that also <em className="s">schedules your posts</em>
          </h1>
          <p className="lede">
            Poskoo gives you a free link-in-bio page at poskoo.com/@yourname with click tracking on every link, plus a post scheduler and Instagram comment-to-DM automation in the same account.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">
              Start free <span aria-hidden="true">→</span>
            </Link>
            <a className="btn btn-line" href="#compare">Compare features</a>
          </div>
        </div>
        <div className="hero-art">
          <AnimArt name="compare" label="Someone swaps a basic bio link page for a Poskoo page that tracks every click and auto-DMs commenters" />
        </div>
      </header>

      {/* Why people switch */}
      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Why switch</p>
            <h2>Why people switch</h2>
          </div>
          <div className="cards">
            {whySwitch.map((c) => (
              <article key={c.title} className="pcard">
                <span className="no">{c.no}</span>
                <h3>{c.title.replace(/-/g, "\u2011")}</h3>
                <p>{c.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="compare" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Comparison</p>
            <h2>{BRAND.name} vs Linktree</h2>
            <p>
              Linktree lets you list links in your bio. Poskoo does that too — and adds click tracking, a post scheduler and Instagram comment-to-DM in the same account.
            </p>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr className={s.tr}>
                  <th scope="col" className={s.th}>Feature</th>
                  <th scope="col" className={`${s.th} ${s.oursCol}`}>{BRAND.name}</th>
                  <th scope="col" className={s.th}>Linktree</th>
                </tr>
              </thead>
              <tbody>
                {compare.map(([label, ours, theirs]) => (
                  <tr key={label} className={s.tr}>
                    <td className={s.td}>{label}</td>
                    <td className={`${s.td} ${s.oursCol}`} style={{ fontWeight: 700, textAlign: "center" }}>
                      <Cell v={ours} />
                    </td>
                    <td className={s.td} style={{ textAlign: "center" }}>
                      <Cell v={theirs} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CompareNote />
        </div>
      </section>

      {/* How it works */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">How it works</p>
            <h2>Build your bio page in <em className="s">three steps</em></h2>
          </div>
          <div className="cards">
            {steps.map((step) => (
              <article key={step.n} className="pcard">
                <span className="no">Step {step.n}</span>
                <h3>{step.title.replace(/-/g, "\u2011")}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Linktree alternative questions</h2>
          </div>
          <div className="faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Build your bio page and track every <em className="s">click</em></h2>
              <p>Start free. Claim your handle and publish your page in minutes.</p>
              <Link className="btn" href="/signup">
                Start free <span aria-hidden="true">→</span>
              </Link>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-schedule.webp"
              width={900}
              height={900}
              loading="lazy"
              alt="Scheduled posts on a calendar, ready to publish"
            />
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 24 }}>
            <Link className={s.vlink} href="/instagram-link-in-bio">
              Instagram link in bio page
            </Link>
            {" · "}
            <Link className={s.vlink} href="/help/instagram-link-in-bio-setup">
              Set up your link in bio
            </Link>
            {" · "}
            <Link className={s.vlink} href="/instagram-auto-dm">Instagram auto DM</Link>
          </p>
          <CompareAlternativesNav current="linktree" />
        </div>
      </section>
    </PublicShell>
  );
}
