import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { PLATFORMS_ANSWER, LIVE_PLATFORMS_TEXT } from "@/lib/platform-support";
import { priceSummary, softwareOffers } from "@/lib/plans";
import { publisherRef } from "@/lib/tool-schema";
import { planReadiness } from "@/lib/featureReadiness";
import PublicShell from "@/components/PublicShell";
import { CompareAlternativesNav } from "@/components/CompareAlternativesNav";
import { CompareNote } from "@/components/CompareNote";
import s from "@/components/site.module.css";
import { AnimArt } from "@/components/AnimArt";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const PATH = "/zoho-social-alternative";

export const metadata: Metadata = withSocial({
  title: { absolute: "Zoho Social Alternative: Instagram Auto-DM | Poskoo" },
  description:
    "Poskoo is a Zoho Social alternative: schedule Instagram, Facebook, Threads, YouTube, LinkedIn, Bluesky and Mastodon and auto-DM commenters. Free plan.",
  alternates: { canonical: `${BRAND.url}${PATH}` },
});

const whySwitch = [
  { no: "01 / One tool", title: "Scheduling + auto-DM in one tool", text: `Plan and publish posts to ${LIVE_PLATFORMS_TEXT}, then reply to every keyword comment with a DM — without juggling a scheduler and a separate chatbot tool.` },
  { no: "02 / Free to start", title: "Start on the Free plan", text: `${BRAND.name} Free includes 2 social accounts, 10 scheduled posts / month and 500 auto-DMs / month.` },
  { no: "03 / Leads", title: "Leads from every post", text: "Ask for an email in the DM before the link is sent, so every comment on a scheduled post can become a lead." },
];

const compare: [string, string, string, string][] = [
  ["Social media scheduling", "Yes", "Check the provider", "Check the provider"],
  [`Publishing to ${LIVE_PLATFORMS_TEXT}`, "Yes", "Check the provider", "Check the provider"],
  ["Instagram comment-to-DM automation", "Yes", "Check the provider", "Check the provider"],
  ["Email capture in the DM", "Yes", "Check the provider", "Check the provider"],
  ["AI caption ideas", "Yes", "Check the provider", "Check the provider"],
  ["AI DM message ideas", "Yes", "Check the provider", "Check the provider"],
  ["Lead tracking from comment to DM", "Yes", "Check the provider", "Check the provider"],
  ["Price", priceSummary(planReadiness()), "Check the provider", "Check the provider"],
];

const faqs = [
  { q: "Is Poskoo a Zoho Social alternative?", a: `Yes. ${BRAND.name} schedules and publishes your posts, and also sends an automatic DM to everyone who comments a keyword, with email capture and AI caption ideas built in.` },
  { q: "What is Zoho Social?", a: "Zoho Social is the social media tool in the Zoho suite, aimed at businesses and agencies. See their site for current features and plans." },
  { q: "Can I import my Zoho Social schedule?", a: `Not yet. Add your upcoming posts in the ${BRAND.name} calendar and recreate your queue there.` },
  { q: "Which platforms are supported?", a: PLATFORMS_ANSWER },
  { q: "Does it use the official APIs?", a: "Yes. We connect through the official Meta login and APIs. We never ask for your password and never scrape." },
];

const description =
  "Looking for a Zoho Social alternative? Poskoo schedules posts to 7 networks from one calendar, auto-DMs Instagram commenters and has a free plan to start.";

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: BRAND.name,
  url: `${BRAND.url}${PATH}`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description,
  featureList: [
    "Social media post scheduling",
    "Instagram comment-to-DM automation",
    "Email capture in the DM",
    "AI caption ideas",
    "Lead tracking from comment to DM",
  ],
  // Paid offers only once Pro/Agency checkout is live, matching /pricing.
  offers: softwareOffers(planReadiness()),
  publisher: publisherRef(),
};

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

export default function ZohoSocialAlternative() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`} breadcrumbs={[{ name: "Zoho Social alternative", path: PATH }]}>
      {[appJsonLd, faqJsonLd].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
        />
      ))}

      {/* Hero */}
      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Official Meta API · no password needed</span>
          <h1>
            A Zoho Social alternative that also <em className="s">auto-DMs every comment</em>
          </h1>
          <p className="lede">
            Looking for a Zoho Social alternative? {BRAND.name} schedules your posts and auto-DMs everyone who comments a keyword, with a free plan and flat pricing instead of per-user seats.
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
            <h2>{BRAND.name} vs Zoho Social</h2>
            <p>Zoho Social is the social media tool in the Zoho suite, aimed at businesses and agencies. For its exact features and plans, see their site. This page focuses on what Poskoo does.</p>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr className={s.tr}>
                  <th scope="col" className={s.th}>Feature</th>
                  <th scope="col" className={`${s.th} ${s.oursCol}`}>{BRAND.name}</th>
                  <th scope="col" className={s.th}>Zoho Social</th>
                  <th scope="col" className={s.th}>Zoho Social + separate DM tool</th>
                </tr>
              </thead>
              <tbody>
                {compare.map(([label, ours, zoho, combo]) => (
                  <tr key={label} className={s.tr}>
                    <td className={s.td}>{label}</td>
                    <td className={`${s.td} ${s.oursCol}`} style={{ fontWeight: 700, textAlign: "center" }}><Cell v={ours} /></td>
                    <td className={s.td} style={{ textAlign: "center" }}><Cell v={zoho} /></td>
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
            <h2>Zoho Social alternative questions</h2>
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
          <CompareAlternativesNav current="zoho" />
        </div>
      </section>
    </PublicShell>
  );
}
