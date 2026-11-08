import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import { CompareAlternativesNav } from "@/components/CompareAlternativesNav";
import CompareHeroIllustration from "@/components/CompareHeroIllustration";
import s from "@/components/site.module.css";

export const metadata: Metadata = {
  title: { absolute: "Sprout Social Alternative for Instagram DMs & Scheduling" },
  description:
    "A Sprout Social alternative that schedules Instagram posts and auto-DMs every keyword comment, with email capture, AI replies and lead export in one tool.",
  alternates: { canonical: "/sprout-social-alternative" },
};

const whyLook = [
  { no: "01 / One tool", title: "Scheduler plus comment-to-DM", text: "Sprout Social is priced per seat and does not include comment-to-DM keyword automation, so turning comments into DMs still means adding a separate chatbot tool." },
  { no: "02 / One calendar", title: "One calendar for posts and rules", text: `In ${BRAND.name} you attach a comment-to-DM rule to a scheduled post. The rule switches on when the post goes live.` },
  { no: "03 / Leads", title: "Leads from scheduled content", text: "Ask for an email in the DM before the link is sent, so posts you planned weeks ahead can still fill a lead list." },
];

const compare: [string, string, string][] = [
  ["Instagram scheduling", "Yes", "Yes"],
  ["Visual calendar", "Yes", "Yes"],
  ["Facebook & Threads publishing", "Yes", "Yes"],
  ["Comment→DM keyword automation", "Yes", "No"],
  ["Email capture in the DM", "Yes", "No"],
  ["AI-written DM messages", "Yes", "See their site"],
  ["Lead CSV export", "Yes", "No"],
  ["Pricing model", "Flat plans from $19 / month", "Per-seat pricing"],
];

const switchSteps = [
  { title: "1. Connect Instagram", text: "Sign up, connect your Instagram Business or Creator account through Meta login. No password sharing." },
  { title: "2. Recreate your queue", text: "Add upcoming Instagram posts to the calendar. Paste captions from Sprout Social if you like." },
  { title: "3. Attach DM rules", text: "For lead posts, set a comment keyword and DM message on each scheduled post. Publish on time; commenters get the link in DMs." },
];

const faqs = [
  { q: `Is ${BRAND.name} a Sprout Social alternative?`, a: `Yes, for Instagram. Sprout Social is an enterprise social media suite priced per seat, and it does not include built-in comment-to-DM keyword automation. ${BRAND.name} schedules and publishes your Instagram posts on a calendar, and also sends an automatic DM to everyone who comments a keyword, with email capture and AI replies built in. It can also answer DMs with AI replies that collect contact details and share your booking link.` },
  { q: "Why do teams switch from Sprout Social?", a: `Per-seat pricing adds up as the team grows, and comment-to-DM automation is not built in, so teams pay for a second tool on top. ${BRAND.name} combines Instagram scheduling, comment-to-DM, AI replies and lead capture in one flat plan. It can also answer DMs with AI replies that collect contact details and share your booking link.` },
  { q: "Can I import my Sprout Social schedule?", a: `There is no Sprout Social import yet. Add your upcoming posts to the ${BRAND.name} calendar. Most teams rebuild the next one to two weeks of posts in under ten minutes.` },
  { q: "Which platforms are supported?", a: "Instagram, Facebook Pages and Threads scheduling and auto-DMs work today. YouTube, LinkedIn, Pinterest, TikTok and WhatsApp are coming next." },
  { q: "Is there a free plan?", a: `Yes. The Free plan is $0 and includes Instagram scheduling and 500 auto-DMs a month. Every account starts on it, and you can upgrade to Pro or Agency when you grow.` },
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

export default function SproutSocialAlternative() {
  return (
    <PublicShell breadcrumbs={[{ name: "Sprout Social alternative", path: "/sprout-social-alternative" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />

      {/* Hero */}
      <header className="hero">
        <span className="pill">Official Meta API · no password needed</span>
        <h1>
          Sprout Social alternative with Instagram <em className="s">auto-DM</em> built in
        </h1>
        <p className="lede">
          Sprout Social is an enterprise suite priced per seat, with no built-in comment-to-DM keyword automation. {BRAND.name} schedules your Instagram, Facebook Page and Threads posts and auto-DMs every keyword commenter — capture emails, answer with AI and export leads in one flat plan.
        </p>
        <div className="ctas">
          <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
          <a className="btn btn-line" href="#compare">Compare features</a>
        </div>
        <CompareHeroIllustration className="mx-auto mt-10 w-full max-w-xl" />
        <div className="hero-art">
          <Image sizes="(max-width: 1140px) 100vw, 1060px" src="/landing/multichannel.webp" width={1400} height={933} alt="A creator at a laptop sends one post that splits to several phones and screens" />
        </div>
      </header>

      {/* Why people look for a Sprout Social alternative */}
      <section>
        <div className="wrap">
          <div className="head">
            <h2>Why people look for a Sprout Social alternative</h2>
          </div>
          <div className="cards">
            {whyLook.map((c) => (
              <article key={c.title} className="pcard">
                <span className="no">{c.no}</span>
                <h3>{c.title}</h3>
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
          <div className={s.tableWrap} style={{ maxWidth: 920, marginInline: "auto" }}>
            <table className={s.table}>
              <thead>
                <tr className={s.tr}>
                  <th scope="col" className={s.th}>Feature</th>
                  <th scope="col" className={`${s.th} ${s.oursCol}`}>{BRAND.name}</th>
                  <th scope="col" className={s.th}>Sprout Social</th>
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
          <p className="small" style={{ textAlign: "center", marginTop: 16 }}>Sprout Social features and per-seat prices change over time. Check their site for current details. We do not list their prices here.</p>
        </div>
      </section>

      {/* Who should stay on Sprout Social */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <h2>Who should stay on Sprout Social</h2>
            <p>
              Stay on Sprout Social if you need its enterprise suite end to end — multi-network publishing, social listening, reporting for large teams and workflows — and per-seat pricing works for your team size. Sprout Social is a mature platform; there is no reason to switch if you do not need comment-to-DM automation.
            </p>
          </div>
        </div>
      </section>

      {/* How to switch in 10 minutes */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <h2>How to switch in 10 minutes</h2>
          </div>
          <div className="pains" style={{ maxWidth: 760, marginInline: "auto" }}>
            {switchSteps.map((step) => (
              <div key={step.title} className="pain"><b>{step.title}</b><span>{step.text}</span></div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <h2>Sprout Social alternative questions</h2>
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
              <h2>Schedule like Sprout Social. <em className="s">Auto-DM every commenter.</em></h2>
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
