import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { PLATFORMS_ANSWER, LIVE_PLATFORMS_TEXT } from "@/lib/platform-support";
import { PRICE_SUMMARY } from "@/lib/plans";
import PublicShell from "@/components/PublicShell";
import { CompareAlternativesNav } from "@/components/CompareAlternativesNav";
import { CompareNote } from "@/components/CompareNote";
import { StaySection, SwitchSteps } from "@/components/CompareSections";
import s from "@/components/site.module.css";
import { AnimArt } from "@/components/AnimArt";

export const metadata: Metadata = withSocial({
  title: { absolute: "Metricool Alternative for Instagram Auto-DM | Poskoo" },
  description:
    "Metricool alternative for Instagram scheduling with comment-to-DM automation, lead capture and an inbox — schedule posts and turn commenters into leads.",
  alternates: { canonical: "/metricool-alternative" },
});

const whyLook = [
  {
    no: "01 / One tool",
    title: "Scheduler plus comment-to-DM",
    text: "Metricool focuses on scheduling and analytics across many networks. If your plan does not cover comment-to-DM keyword automation, turning comments into DMs means adding a separate chatbot tool.",
  },
  {
    no: "02 / One calendar",
    title: "One calendar for posts and rules",
    text: `In ${BRAND.name} you attach a comment-to-DM rule to a scheduled post. The rule switches on when the post goes live.`,
  },
  {
    no: "03 / Leads",
    title: "Leads from scheduled content",
    text: "Ask for an email in the DM before the link is sent, so posts you planned weeks ahead can still fill a lead list.",
  },
];

const compare: [string, string, string][] = [
  ["Instagram scheduling", "Yes", "Yes"],
  ["Visual calendar", "Yes", "Yes"],
  ["Facebook & Threads publishing", "Yes", "Yes"],
  ["Comment→DM keyword automation", "Yes", "Check their site"],
  ["Email capture in the DM", "Yes", "Check their site"],
  ["AI DM message ideas", "Yes", "Check their site"],
  ["Lead CSV export", "Yes", "Check their site"],
  ["Price", PRICE_SUMMARY, "See Metricool's site for current plans"],
];

const switchSteps = [
  { title: "1. Connect Instagram", text: "Sign up, connect your Instagram Business or Creator account through Meta login. No password sharing." },
  { title: "2. Recreate your queue", text: "Add upcoming Instagram posts to the calendar. Paste captions from Metricool if you like." },
  { title: "3. Attach DM rules", text: "For lead posts, set a comment keyword and DM message on each scheduled post. Publish on time; commenters get the link in DMs." },
];

const faqs = [
  { q: `Is ${BRAND.name} a Metricool alternative?`, a: `Yes, for Instagram. Metricool focuses on scheduling and analytics across many networks; check their site for the automation features your plan includes. ${BRAND.name} schedules and publishes your Instagram posts on a calendar, and also sends an automatic DM to everyone who comments a keyword, with email capture and AI caption ideas built in.` },
  { q: "Why do teams switch from Metricool?", a: `Metricool is built for scheduling and reporting across many networks, and teams that need comment-to-DM often pay for a second tool on top. ${BRAND.name} combines Instagram scheduling, comment-to-DM, AI captions and lead capture in one account, starting on the Free plan.` },
  { q: "Can I import my Metricool schedule?", a: `There is no Metricool import yet. Add your upcoming posts to the ${BRAND.name} calendar. Most teams rebuild the next one to two weeks of posts in under ten minutes.` },
  { q: "Which platforms are supported?", a: PLATFORMS_ANSWER },
  { q: "Is there a free plan?", a: `Yes. The Free plan is $0 and includes Instagram scheduling and 500 auto-DMs a month. Every account starts on it, and you can upgrade to Pro or Agency any time.` },
  { q: "Does it use the official APIs only?", a: "Yes. We connect through the official Meta login and APIs. We never ask for your password and never scrape." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

function Cell({ v }: { v: string }) {
  if (v === "Yes") return <span style={{ color: "var(--poskoo-green)", fontWeight: 700 }}>Yes</span>;
  if (v === "No") return <span style={{ color: "var(--poskoo-muted)" }}>No</span>;
  return <span>{v}</span>;
}

export default function MetricoolAlternative() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`} breadcrumbs={[{ name: "Metricool alternative", path: "/metricool-alternative" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />

      {/* Hero */}
      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Official Meta API · no password needed</span>
          <h1>
            Metricool alternative with Instagram <em className="s">auto-DM</em> built in
          </h1>
          <p className="lede">
            Metricool focuses on scheduling and analytics across many networks. {BRAND.name} schedules your {LIVE_PLATFORMS_TEXT} posts and auto-DMs every keyword commenter, so you can capture emails and export leads in one account, starting free.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            <a className="btn btn-line" href="#compare">Compare features</a>
          </div>
        </div>
        <div className="hero-art"><AnimArt name="compare" label="Someone tips a pile of messy app windows into a recycling bin and holds up one phone that does it all" /></div>
      </header>

      {/* Why people look for a Metricool alternative */}
      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Why switch</p>
            <h2>Why people look for a Metricool alternative</h2>
          </div>
          <div className="cards">
            {whyLook.map((c) => (
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
            <h2>{BRAND.name} vs Metricool</h2>
            <p>Metricool is a social media management tool for scheduling and analytics across many networks. {BRAND.name} keeps Instagram scheduling and adds comment-to-DM automation in one place. Here is an honest side-by-side.</p>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr className={s.tr}>
                  <th scope="col" className={s.th}>Feature</th>
                  <th scope="col" className={`${s.th} ${s.oursCol}`}>{BRAND.name}</th>
                  <th scope="col" className={s.th}>Metricool</th>
                </tr>
              </thead>
              <tbody>
                {compare.map(([label, ours, theirs]) => (
                  <tr key={label} className={s.tr}>
                    <td className={s.td}>{label}</td>
                    <td className={`${s.td} ${s.oursCol}`} style={{ fontWeight: 700, textAlign: "center" }}><Cell v={ours} /></td>
                    <td className={s.td} style={{ textAlign: "center" }}><Cell v={theirs} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CompareNote />
          <p className="small" style={{ textAlign: "center", marginTop: 16 }}>Metricool features and plans change over time. Check Metricool&apos;s site for current plans. We do not list their prices here.</p>
        </div>
      </section>

      <StaySection name="Metricool">
        Stay on Metricool if you need its scheduling and reporting end to end — multi-network publishing, analytics across many networks and workflows — and you do not need comment-to-DM automation. Metricool is a mature platform; there is no reason to switch if you do not need Instagram comment-to-DM.
      </StaySection>

      <SwitchSteps steps={switchSteps} />

      {/* FAQ */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Metricool alternative questions</h2>
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
              <h2>Schedule like Metricool. <em className="s">Auto-DM every commenter</em></h2>
              <p>Start free. No credit card. Connect Instagram in one tap.</p>
              <Link className="btn" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            </div>
            <Image sizes="(max-width: 960px) 100vw, 50vw" src="/landing/card-leads.webp" width={900} height={900} loading="lazy" alt="Two friends high-five next to a board of new leads" />
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 24 }}>
            <Link className={s.vlink} href="/">See the full product</Link>
          </p>
          <CompareAlternativesNav current="metricool" />
        </div>
      </section>
    </PublicShell>
  );
}
