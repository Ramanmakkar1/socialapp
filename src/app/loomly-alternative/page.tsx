import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { PLATFORMS_ANSWER } from "@/lib/platform-support";
import { PRICE_SUMMARY } from "@/lib/plans";
import PublicShell from "@/components/PublicShell";
import { CompareAlternativesNav } from "@/components/CompareAlternativesNav";
import { CompareNote } from "@/components/CompareNote";
import s from "@/components/site.module.css";
import { AnimArt } from "@/components/AnimArt";

export const metadata: Metadata = withSocial({
  title: { absolute: `Loomly Alternative with Instagram Auto-DM | ${BRAND.name}` },
  description:
    "Poskoo is a Loomly alternative that schedules Instagram, Facebook and Threads posts and auto-DMs every keyword commenter to capture leads. Free plan.",
  alternates: { canonical: `${BRAND.url}/loomly-alternative` },
});

const whySwitch = [
  { no: "01 / One tool", title: "Scheduling + auto-DM in one tool", text: "Plan and publish Instagram, Facebook Page, Threads and YouTube posts, then reply to every keyword comment with a DM — without juggling a scheduler and a separate chatbot tool." },
  { no: "02 / Free to start", title: "Start on the Free plan", text: `${BRAND.name} Free includes 2 social accounts, 10 scheduled posts / month and 500 auto-DMs / month.` },
  { no: "03 / Leads", title: "Leads from every post", text: "Ask for an email in the DM before the link is sent, so every comment on a scheduled post can become a lead." },
];

const compare: [string, string, string, string][] = [
  ["Social media scheduling", "Yes", "Yes", "Yes"],
  ["Instagram, Facebook Page and Threads publishing", "Yes", "Check their site", "Depends on the tools"],
  ["Instagram comment-to-DM automation", "Yes", "Check their site", "Depends on the DM tool"],
  ["Email capture in the DM", "Yes", "Check their site", "Depends on the DM tool"],
  ["AI caption ideas", "Yes", "Check their site", "Check their site"],
  ["AI DM message ideas", "Yes", "Check their site", "Depends on the DM tool"],
  ["Lead tracking from comment to DM", "Yes", "Check their site", "Depends on the DM tool"],
  ["Price", PRICE_SUMMARY, "Check their site", "Two subscriptions"],
];

const faqs = [
  { q: `Is ${BRAND.name} a Loomly alternative?`, a: `Yes. ${BRAND.name} schedules and publishes your posts, and also sends an automatic DM to everyone who comments a keyword, with email capture and AI caption ideas built in.` },
  { q: "What is Loomly?", a: "Loomly is a social media calendar and scheduling tool for teams. For its exact features and plans, see their site." },
  { q: "Can I import my existing Loomly schedule?", a: `Not yet. Add your upcoming posts in the ${BRAND.name} calendar and recreate your queue there.` },
  { q: "Which platforms are supported?", a: PLATFORMS_ANSWER },
  { q: "Does it use the official APIs?", a: "Yes. We connect through the official Meta login and APIs. We never ask for your password and never scrape." },
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

export default function LoomlyAlternative() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`} breadcrumbs={[{ name: "Loomly alternative", path: "/loomly-alternative" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />

      {/* Hero */}
      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Official Meta API · no password needed</span>
          <h1>
            A Loomly alternative that also <em className="s">auto-DMs every comment</em>
          </h1>
          <p className="lede">
            Schedule your Instagram, Facebook Page and Threads posts, and let {BRAND.name} DM everyone who comments a keyword. Capture their email, write captions with AI and track every lead.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            <a className="btn btn-line" href="#compare">Compare features</a>
          </div>
        </div>
        <div className="hero-art"><AnimArt name="compare" label="Someone tips a pile of messy app windows into a recycling bin and holds up one phone that does it all" /></div>
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
            <h2>{BRAND.name} vs Loomly</h2>
            <p>Loomly is a social media calendar and scheduling tool for teams. For its exact features and plans, see their site. To auto-DM commenters you would add a separate chatbot tool. {BRAND.name} does both in one plan.</p>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr className={s.tr}>
                  <th scope="col" className={s.th}>Feature</th>
                  <th scope="col" className={`${s.th} ${s.oursCol}`}>{BRAND.name}</th>
                  <th scope="col" className={s.th}>Loomly</th>
                  <th scope="col" className={s.th}>Loomly + separate DM tool</th>
                </tr>
              </thead>
              <tbody>
                {compare.map(([label, ours, loomly, combo]) => (
                  <tr key={label} className={s.tr}>
                    <td className={s.td}>{label}</td>
                    <td className={`${s.td} ${s.oursCol}`} style={{ fontWeight: 700, textAlign: "center" }}><Cell v={ours} /></td>
                    <td className={s.td} style={{ textAlign: "center" }}><Cell v={loomly} /></td>
                    <td className={s.td} style={{ textAlign: "center" }}><Cell v={combo} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CompareNote />
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
            <h2>Loomly alternative questions</h2>
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
            <Link className={s.vlink} href="/instagram-auto-dm">Instagram auto DM</Link>
            {" · "}
            <Link className={s.vlink} href="/tools/instagram-caption-counter">Instagram caption counter</Link>
            {" · "}
            <Link className={s.vlink} href="/">See the full product</Link>
          </p>
          <CompareAlternativesNav current="loomly" />
        </div>
      </section>
    </PublicShell>
  );
}
