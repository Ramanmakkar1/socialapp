import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import { CompareAlternativesNav } from "@/components/CompareAlternativesNav";
import { CompareNote } from "@/components/CompareNote";
import { StaySection } from "@/components/CompareSections";
import s from "@/components/site.module.css";
import { AnimArt } from "@/components/AnimArt";
import { toolSoftwareJsonLd, ldJson } from "@/lib/tool-schema";

export const metadata: Metadata = withSocial({
  title: { absolute: `Meta Business Suite Alternative for Instagram | ${BRAND.name}` },
  description:
    "Meta Business Suite alternative for Instagram: schedule posts on a calendar, auto-DM every keyword commenter, capture emails and write captions with AI.",
  alternates: { canonical: "/meta-business-suite-alternative" },
});

const whyLook = [
  {
    no: "01 / Reliability",
    title: "Posts stuck or failing",
    text: "Scheduled posts that sit in a failed or stuck state are the most common reason creators start looking for another scheduler. Most of the time the post never goes out and you only notice hours later.",
  },
  {
    no: "02 / Automation",
    title: "No keyword comment-to-DM",
    text: `Meta Business Suite has an inbox with automated replies; check Meta's help pages for what it can send when someone comments. ${BRAND.name} sends a DM with your link to everyone who comments your keyword, on every post you choose.`,
  },
  {
    no: "03 / Usability",
    title: "Clunky on mobile",
    text: "Planning on a phone can feel slow. Creators who plan on the go want a calendar and composer that stay quick and simple on a small screen.",
  },
];

const compare: [string, string, string][] = [
  ["Instagram scheduling", "Yes", "Yes"],
  ["Facebook Page publishing", "Yes", "Yes"],
  ["Comment→DM keyword automation with link delivery", "Yes", "Check their site"],
  ["Email capture in the DM", "Yes", "Check their site"],
  ["Lead / email list export (CSV)", "Yes", "Check their site"],
  ["AI caption ideas", "Yes", "Check their site"],
  ["Free plan", "Yes", "Yes"],
  ["Made by Meta", "No", "Yes"],
];

const faqs = [
  { q: `Is ${BRAND.name} a Meta Business Suite alternative?`, a: `Yes, for Instagram creators and small brands. ${BRAND.name} schedules your Instagram posts on a calendar and also sends an automatic DM with your link to everyone who comments a keyword, with email capture and AI caption ideas built in. Meta Business Suite is free and made by Meta; check Meta's help pages for its current automation options.` },
  { q: "Why do scheduled posts fail or get stuck in Meta Business Suite?", a: `Common causes are an expired Facebook or Instagram connection, a photo or video in a size or format Instagram does not accept, or a temporary sync problem between the Facebook Page and the Instagram account. Reconnecting the account and re-uploading the media in a supported format fixes most of them, and ${BRAND.name} publishes through the official Meta APIs.` },
  { q: "Can I use both tools at the same time?", a: `Yes. Many creators keep Meta Business Suite for ads and Page settings and use ${BRAND.name} for scheduling and comment-to-DM automation. Just avoid scheduling the same post in both tools so it is not published twice.` },
  { q: "Is there a free plan?", a: "Yes. The Free plan is $0 and includes Instagram scheduling and 500 auto-DMs a month. Every account starts on it, and you can upgrade to Pro or Agency any time." },
  { q: "Is it safe for my Instagram account?", a: "Yes. We connect through the official Meta login and APIs, never ask for your password, never scrape, and follow Meta's messaging limits." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

const appJsonLd = {
  ...toolSoftwareJsonLd({ name: `${BRAND.name} Meta Business Suite alternative`, description: "A Meta Business Suite alternative that schedules Instagram and Facebook Page posts and auto-DMs keyword commenters, with email capture.", url: `${BRAND.canonicalUrl}/meta-business-suite-alternative` }),
  "@id": `${BRAND.canonicalUrl}/meta-business-suite-alternative#software`,
};

function Cell({ v }: { v: string }) {
  if (v === "Yes") return <span style={{ color: "var(--poskoo-green)", fontWeight: 700 }}>Yes</span>;
  if (v === "No") return <span style={{ color: "var(--poskoo-muted)" }}>No</span>;
  return <span>{v}</span>;
}

export default function MetaBusinessSuiteAlternative() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`} breadcrumbs={[{ name: "Meta Business Suite alternative", path: "/meta-business-suite-alternative" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(appJsonLd) }} />

      {/* Hero */}
      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Official Meta API · no password needed</span>
          <h1>
            Meta Business Suite alternative with Instagram <em className="s">auto-DM</em> built in
          </h1>
          <p className="lede">
            Tired of posts that fail or get stuck in Meta Business Suite? {BRAND.name} schedules your Instagram and Facebook Page posts on a clear calendar and auto-DMs every keyword commenter, so you can capture emails, write captions with AI and export leads in one place.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            <a className="btn btn-line" href="#compare">Compare features</a>
          </div>
        </div>
        <div className="hero-art"><AnimArt name="compare" label="Someone tips a pile of messy app windows into a recycling bin and holds up one phone that does it all" /></div>
      </header>

      {/* Why people look for a Meta Business Suite alternative */}
      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Why switch</p>
            <h2>Why people look for a Meta Business Suite alternative</h2>
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
          <p className="small" style={{ textAlign: "center", marginTop: 16 }}>
            See how the{" "}
            <Link className={s.vlink} href="/instagram-scheduler">Instagram scheduler</Link>
            {" "}and{" "}
            <Link className={s.vlink} href="/instagram-auto-dm">Instagram auto-DM</Link>
            {" "}work in {BRAND.name}.
          </p>
        </div>
      </section>

      {/* Comparison */}
      <section id="compare" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Comparison</p>
            <h2>{BRAND.name} vs Meta Business Suite</h2>
            <p>Meta Business Suite is Meta&apos;s free tool for scheduling Facebook and Instagram posts, with an inbox that has basic automated replies. {BRAND.name} keeps Instagram scheduling and adds keyword comment-to-DM automation and lead capture. Here is an honest side-by-side.</p>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr className={s.tr}>
                  <th scope="col" className={s.th}>Feature</th>
                  <th scope="col" className={`${s.th} ${s.oursCol}`}>{BRAND.name}</th>
                  <th scope="col" className={s.th}>Meta Business Suite</th>
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
          <p className="small" style={{ textAlign: "center", marginTop: 16 }}>Meta Business Suite features change over time. Check Meta&apos;s site for the current feature list.</p>
        </div>
      </section>

      <StaySection name="Meta Business Suite" title="When Meta Business Suite is enough">
        Stay on Meta Business Suite if your posts publish without problems, you also run Meta ads from the same place, and you do not need comments turned into DMs with a link or an email list. It is free, made by Meta and covers basic Facebook and Instagram scheduling well. Switch when you want keyword comment-to-DM, lead capture and AI caption ideas in one tool.
      </StaySection>

      {/* FAQ */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Meta Business Suite alternative questions</h2>
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
              <h2>Schedule without the stuck posts. <em className="s">Auto-DM every commenter</em></h2>
              <p>Start free. No credit card. Connect Instagram in one tap.</p>
              <Link className="btn" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            </div>
            <Image sizes="(max-width: 960px) 100vw, 50vw" src="/landing/card-leads.webp" width={900} height={900} loading="lazy" alt="Two friends high-five next to a board of new leads" />
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 24 }}>
            <Link className={s.vlink} href="/">See the full product</Link>
          </p>
          <CompareAlternativesNav current="meta" />
        </div>
      </section>
    </PublicShell>
  );
}
