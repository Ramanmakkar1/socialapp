import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { PLATFORMS_ANSWER, LIVE_PLATFORMS_TEXT, OFFICIAL_API_ANSWER } from "@/lib/platform-support";
import { priceSummary } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import { isFeatureReadyNow } from "@/lib/featureReadinessNow";
import { withoutAiClaims } from "@/lib/aiClaims";
import PublicShell from "@/components/PublicShell";
import { CompareAlternativesNav } from "@/components/CompareAlternativesNav";
import { CompareNote } from "@/components/CompareNote";
import { StaySection, SwitchSteps } from "@/components/CompareSections";
import s from "@/components/site.module.css";
import { AnimArt } from "@/components/AnimArt";
import { toolSoftwareJsonLd, ldJson } from "@/lib/tool-schema";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

export const metadata: Metadata = withSocial({
  title: { absolute: "Sprout Social Alternative for Instagram Auto-DM | Poskoo" },
  description:
    "A Sprout Social alternative that schedules Instagram posts and auto-DMs every keyword comment, with email capture, AI captions and lead export in one tool.",
  alternates: { canonical: "/sprout-social-alternative" },
});

const whyLook = [
  { no: "01 / One tool", title: "Scheduler plus comment-to-DM", text: "Sprout Social is priced per seat. If your plan does not cover comment-to-DM keyword automation, turning comments into DMs means adding a separate chatbot tool." },
  { no: "02 / One calendar", title: "One calendar for posts and rules", text: `In ${BRAND.name} you attach a comment-to-DM rule to a scheduled post. The rule switches on when the post goes live.` },
  { no: "03 / Leads", title: "Leads from scheduled content", text: "Ask for an email in the DM before the link is sent, so posts you planned weeks ahead can still fill a lead list." },
];

const AI_ROW = "AI DM message ideas";
const compare: [string, string, string][] = [
  ["Instagram scheduling", "Yes", "Yes"],
  ["Visual calendar", "Yes", "Yes"],
  ["Facebook & Threads publishing", "Yes", "Yes"],
  ["Comment→DM keyword automation", "Yes", "Check their site"],
  ["Email capture in the DM", "Yes", "Check their site"],
  [AI_ROW, "Built, launching soon", "Check their site"],
  ["Lead CSV export", "Yes", "Check their site"],
  ["Price", priceSummary(planReadiness()), "Per-seat pricing"],
];

const switchSteps = [
  { title: "1. Connect Instagram", text: "Sign up, connect your Instagram Business or Creator account through Meta login. No password sharing." },
  { title: "2. Recreate your queue", text: "Add upcoming Instagram posts to the calendar. Paste captions from Sprout Social if you like." },
  { title: "3. Attach DM rules", text: "For lead posts, set a comment keyword and DM message on each scheduled post. Publish on time; commenters get the link in DMs." },
];

const faqs = [
  { q: `Is ${BRAND.name} a Sprout Social alternative?`, a: `Yes, for Instagram. Sprout Social is an enterprise social media suite priced per seat; check their site for the automation features your plan includes. ${BRAND.name} schedules and publishes your Instagram posts on a calendar, and also sends an automatic DM to everyone who comments a keyword, with email capture and AI caption ideas built in.` },
  { q: "Why do teams switch from Sprout Social?", a: `Per-seat pricing adds up as the team grows, and teams that need comment-to-DM often pay for a second tool on top. ${BRAND.name} combines Instagram scheduling, comment-to-DM, AI captions and lead capture in one account, starting on the Free plan.` },
  { q: "Can I import my Sprout Social schedule?", a: `There is no Sprout Social import yet. Add your upcoming posts to the ${BRAND.name} calendar. Most teams rebuild the next one to two weeks of posts in under ten minutes.` },
  { q: "Which platforms are supported?", a: PLATFORMS_ANSWER },
  { q: "Is there a free plan?", a: `Yes. The Free plan is $0 and includes Instagram scheduling and 500 auto-DMs a month. Every account starts on it, and you can upgrade to Pro or Agency any time.` },
  { q: "Does it use the official APIs only?", a: OFFICIAL_API_ANSWER },
];

function faqJsonLdFor(items: typeof faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

const appJsonLd = {
  ...toolSoftwareJsonLd({ name: `${BRAND.name} Sprout Social alternative`, description: "A Sprout Social alternative that schedules Instagram posts and auto-DMs keyword commenters, with email capture and lead export.", url: `${BRAND.canonicalUrl}/sprout-social-alternative` }),
  "@id": `${BRAND.canonicalUrl}/sprout-social-alternative#software`,
};

function Cell({ v }: { v: string }) {
  if (v === "Yes") return <span style={{ color: "var(--poskoo-green)", fontWeight: 700 }}>Yes</span>;
  if (v === "No") return <span style={{ color: "var(--poskoo-muted)" }}>No</span>;
  return <span>{v}</span>;
}

export default async function SproutSocialAlternative() {
  const ai = await isFeatureReadyNow("ai");
  const faqItems = ai ? faqs : faqs.map((f) => ({ ...f, a: withoutAiClaims(f.a) }));
  const compareRows = compare.map((row): [string, string, string] => (row[0] === AI_ROW && ai ? [row[0], "Yes", row[2]] : row));
  return (
    <PublicShell className={`${s.sched} ${s.pub}`} breadcrumbs={[{ name: "Sprout Social alternative", path: "/sprout-social-alternative" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLdFor(faqItems)).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(appJsonLd) }} />

      {/* Hero */}
      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Official Meta API · no password needed</span>
          <h1>
            Sprout Social alternative with Instagram <em className="s">auto-DM</em> built in
          </h1>
          <p className="lede">
            Sprout Social is an enterprise suite priced per seat. {BRAND.name} schedules posts to {LIVE_PLATFORMS_TEXT} and auto-DMs every keyword commenter, so you can capture emails and export leads in one account, starting free.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            <a className="btn btn-line" href="#compare">Compare features</a>
          </div>
        </div>
        <div className="hero-art"><AnimArt name="compare" label="Someone tips a pile of messy app windows into a recycling bin and holds up one phone that does it all" /></div>
      </header>

      {/* Why people look for a Sprout Social alternative */}
      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Why switch</p>
            <h2>Why people look for a Sprout Social alternative</h2>
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
            <h2>{BRAND.name} vs Sprout Social</h2>
            <p>Sprout Social is a full enterprise social media management suite priced per seat. {BRAND.name} keeps Instagram scheduling and adds comment-to-DM automation in one place. Here is an honest side-by-side.</p>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr className={s.tr}>
                  <th scope="col" className={s.th}>Feature</th>
                  <th scope="col" className={`${s.th} ${s.oursCol}`}>{BRAND.name}</th>
                  <th scope="col" className={s.th}>Sprout Social</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map(([label, ours, theirs]) => (
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
          <p className="small" style={{ textAlign: "center", marginTop: 16 }}>Sprout Social features and per-seat prices change over time. Check their site for current details. We do not list their prices here.</p>
        </div>
      </section>

      <StaySection name="Sprout Social">
        Stay on Sprout Social if you need its enterprise suite end to end — multi-network publishing, social listening, reporting for large teams and workflows — and per-seat pricing works for your team size. Sprout Social is a mature platform; there is no reason to switch if you do not need comment-to-DM automation.
      </StaySection>

      <SwitchSteps steps={switchSteps} />

      {/* FAQ */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Sprout Social alternative questions</h2>
          </div>
          <div className="faq">
            {faqItems.map((f) => (
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
              <h2>Schedule like Sprout Social. <em className="s">Auto-DM every commenter</em></h2>
              <p>Start free. No credit card. Connect Instagram in one tap.</p>
              <Link className="btn" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            </div>
            <Image sizes="(max-width: 960px) 100vw, 50vw" src="/landing/card-leads.webp" width={900} height={900} loading="lazy" alt="Two friends high-five next to a board of new leads" />
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 24 }}>
            <Link className={s.vlink} href="/">See the full product</Link>
          </p>
          <CompareAlternativesNav current="sprout" />
        </div>
      </section>
    </PublicShell>
  );
}
