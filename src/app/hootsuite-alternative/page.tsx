import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { LIVE_PLATFORMS_TEXT, PLATFORMS_ANSWER } from "@/lib/platform-support";
import { priceSummary } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import PublicShell from "@/components/PublicShell";
import { CompareAlternativesNav } from "@/components/CompareAlternativesNav";
import { CompareNote } from "@/components/CompareNote";
import s from "@/components/site.module.css";
import { AnimArt } from "@/components/AnimArt";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

export const metadata: Metadata = withSocial({
  title: { absolute: "Hootsuite Alternative for Instagram Auto-DM | Poskoo" },
  description:
    "An Instagram scheduler plus comment-to-DM automation, email capture and a link-in-bio page, with a free plan. A simpler Hootsuite alternative for Instagram.",
  alternates: { canonical: "/hootsuite-alternative" },
});

const whySwitch = [
  { no: "01 / Instagram", title: "Built for Instagram growth", text: "Schedule your posts and reply to every keyword comment with a DM from the same place, instead of a big suite plus a separate chatbot tool." },
  { no: "02 / Pricing", title: "Simple, clear pricing", text: `Scheduling, comment-to-DM, a link-in-bio page and lead capture live in one ${BRAND.name} account. Start on the Free plan and upgrade when you need more.` },
  { no: "03 / Leads", title: "Leads from every post", text: "Ask for an email in the DM before the link is sent, so every comment on a scheduled post can become a lead." },
];

const compare: [string, string, string, string][] = [
  ["Post scheduling", "Yes", "Yes", "No"],
  ["Calendar view", "Yes", "Yes", "No"],
  ["Instagram publishing", "Yes", "Yes", "No"],
  ["Facebook publishing", "Yes", "Yes", "No"],
  ["Threads publishing", "Yes", "Yes", "No"],
  ["Comment-to-DM automation", "Yes", "Check their site", "Yes"],
  ["Email capture in DMs", "Yes", "Check their site", "Yes"],
  ["AI DM message ideas", "Yes", "Check their site", "Yes"],
  ["Price", priceSummary(planReadiness()), "Check their site", "Check their site"],
];

const faqs = [
  { q: `Is ${BRAND.name} a Hootsuite alternative?`, a: `Yes, especially for Instagram. ${BRAND.name} schedules and publishes to ${LIVE_PLATFORMS_TEXT} on one calendar, and also sends an automatic DM to everyone who comments a keyword, with email capture built in. Hootsuite covers more networks and team features today.` },
  { q: "Can I import my Hootsuite schedule?", a: `Not yet. Add your upcoming posts in the ${BRAND.name} calendar and recreate your schedule there.` },
  { q: "Which platforms are supported?", a: PLATFORMS_ANSWER },
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
  return <>{v}</>;
}

export default function HootsuiteAlternative() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`} breadcrumbs={[{ name: "Hootsuite alternative", path: "/hootsuite-alternative" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />

      {/* Hero */}
      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Official Meta API · no password needed</span>
          <h1>
            The Hootsuite alternative for Instagram that <em className="s">turns comments into leads</em>
          </h1>
          <p className="lede">
            {BRAND.name} is a Hootsuite alternative that schedules your posts to {LIVE_PLATFORMS_TEXT} and also DMs everyone who comments a keyword, so you can capture their email and track every lead. It starts on a $0 Free plan with no credit card.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            <a className="btn btn-line" href="#compare">Compare features</a>
          </div>
        </div>
        <div className="hero-art"><AnimArt name="compare" label="Someone tips a pile of messy app windows into a recycling bin and holds up one phone that does it all" /></div>
      </header>

      {/* Why Instagram creators switch */}
      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Why switch</p>
            <h2>Why Instagram creators switch</h2>
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
            <h2>{BRAND.name} vs Hootsuite vs ManyChat</h2>
            <p>Hootsuite is a full social media management suite. ManyChat automates DMs but does not schedule posts. {BRAND.name} does Instagram scheduling and comment-to-DM in one tool.</p>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr className={s.tr}>
                  <th scope="col" className={s.th}>Feature</th>
                  <th scope="col" className={`${s.th} ${s.oursCol}`}>{BRAND.name}</th>
                  <th scope="col" className={s.th}>Hootsuite</th>
                  <th scope="col" className={s.th}>ManyChat</th>
                </tr>
              </thead>
              <tbody>
                {compare.map(([label, ours, hootsuite, manychat]) => (
                  <tr key={label} className={s.tr}>
                    <td className={s.td}>{label}</td>
                    <td className={`${s.td} ${s.oursCol}`} style={{ fontWeight: 700, textAlign: "center" }}><Cell v={ours} /></td>
                    <td className={s.td} style={{ textAlign: "center" }}><Cell v={hootsuite} /></td>
                    <td className={s.td} style={{ textAlign: "center" }}><Cell v={manychat} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CompareNote />
          <p className="small" style={{ textAlign: "center", marginTop: 16 }}>Competitor features and prices change. Check their websites for current plans.</p>
        </div>
      </section>

      {/* Plan a post, attach an auto-DM rule */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">How it works</p>
              <h2>Plan a post, attach an <em className="s">auto-DM rule</em></h2>
              <p>
                When you schedule a post in the {BRAND.name} calendar, you can attach a comment-to-DM rule to it. The rule stays off until the post goes live, then switches on by itself, so the first people who comment get your link straight away.
              </p>
            </div>
            <div className="pains">
              <div className="pain"><b>1. Schedule the post</b><span>Pick the time and write a caption that asks people to comment a keyword such as GUIDE.</span></div>
              <div className="pain"><b>2. Attach the DM rule</b><span>Set the keyword and the message with your link. It switches on when the post is published.</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Hootsuite alternative questions</h2>
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
              <h2>Schedule your posts and turn comments into <em className="s">leads</em></h2>
              <p>Start free. No credit card. Connect Instagram in one tap.</p>
              <Link className="btn" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            </div>
            <Image sizes="(max-width: 960px) 100vw, 50vw" src="/landing/card-leads.webp" width={900} height={900} loading="lazy" alt="Two friends high-five next to a board of new leads" />
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 24 }}>
            <Link className={s.vlink} href="/instagram-scheduler">Instagram scheduler</Link>
            {" · "}
            <Link className={s.vlink} href="/instagram-auto-dm">Instagram auto DM</Link>
            {" · "}
            <Link className={s.vlink} href="/">See the full product</Link>
          </p>
          <CompareAlternativesNav current="hootsuite" />
        </div>
      </section>
    </PublicShell>
  );
}
