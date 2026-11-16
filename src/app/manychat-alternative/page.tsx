import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { priceSummary, softwareOffers } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import { publisherRef } from "@/lib/tool-schema";
import PublicShell from "@/components/PublicShell";
import { CompareAlternativesNav } from "@/components/CompareAlternativesNav";
import { CompareNote } from "@/components/CompareNote";
import s from "@/components/site.module.css";
import { AnimArt } from "@/components/AnimArt";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

export const metadata: Metadata = withSocial({
  title: { absolute: "ManyChat Alternative: Instagram Auto-DM + Scheduler" },
  description:
    "A ManyChat alternative with Instagram comment-to-DM automation, post scheduling and lead capture in one tool, built on the official Meta API.",
  alternates: { canonical: "/manychat-alternative" },
});

const whySwitch = [
  { no: "01 / One tool", title: "Chat automation + scheduler in one", text: "ManyChat automates DMs, but you still need a separate tool to plan and publish posts. Here both live in one place." },
  { no: "02 / Automation", title: "Posts that carry their own DM rule", text: "Attach a comment-to-DM rule to a scheduled post. It switches on when the post goes live, so early commenters get the link right away." },
  { no: "03 / Leads", title: "Email before the link", text: "Turn on the email gate and the DM asks for an email address before it sends your link, so comments become leads." },
];

const compare: [string, string, string][] = [
  ["Comment-to-DM on posts and Reels", "Yes", "Yes"],
  ["Keyword triggers with a link in the DM", "Yes", "Yes"],
  ["Email gate before the link", "Yes", "Yes"],
  ["Post scheduling and calendar", "Yes", "No"],
  ["DM rule attached to a scheduled post", "Yes", "No"],
  ["Leads list with CSV export", "Yes", "Yes"],
  ["AI DM message ideas", "Yes", "Yes"],
  ["Visual flow builder", "Not yet", "Yes"],
  ["WhatsApp", "On the roadmap, no date", "Yes"],
  ["Facebook Messenger", "On the roadmap, no date", "Yes"],
  ["TikTok", "On the roadmap, no date", "Yes"],
  ["Official Meta API, no password", "Yes", "Yes"],
  ["Price", priceSummary(planReadiness()), "Check their site"],
];

const faqs = [
  { q: "Is it against Instagram rules?", a: `No. ${BRAND.name} uses the official Instagram API with Instagram Login. You connect through Meta's own login screen, we never ask for your password, and we only message people who commented first.` },
  { q: "Can I move my ManyChat keywords?", a: `There is no automatic import yet. Recreate each keyword rule in ${BRAND.name}: pick the post, type the keyword and paste your DM message and link. Most rules take about a minute.` },
  { q: "Does it work with Reels comments?", a: "Yes. A comment-to-DM rule can watch a feed post or a Reel, and anyone who comments the keyword gets the DM." },
  { q: "Do I need a Business or Creator account?", a: "Yes. Instagram only allows automated messaging through its API for Business and Creator accounts. Switching is free in the Instagram app settings." },
  { q: "Can it collect emails?", a: "Yes. Turn on the email gate in a rule and the DM asks for an email address before it sends your link." },
  { q: `Does ${BRAND.name} support WhatsApp, Messenger or TikTok?`, a: "Not yet. Instagram comes first. WhatsApp, Messenger and TikTok are on the roadmap, with no date yet." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: `${BRAND.name} — ManyChat alternative`,
  description:
    "Instagram comment-to-DM automation, lead capture and post scheduling in one tool, built on the official Meta API.",
  brand: { "@type": "Brand", name: BRAND.name },
  url: `${BRAND.canonicalUrl}/manychat-alternative`,
  offers: softwareOffers(planReadiness()),
  publisher: publisherRef(),
};

function Cell({ v }: { v: string }) {
  if (v === "Yes") return <span style={{ color: "var(--poskoo-green)", fontWeight: 700 }}>Yes</span>;
  if (v === "No") return <span style={{ color: "var(--poskoo-muted)" }}>No</span>;
  return <>{v}</>;
}

export default function ManyChatAlternative() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`} breadcrumbs={[{ name: "ManyChat alternative", path: "/manychat-alternative" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c") }} />

      {/* Hero */}
      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Official Instagram API · no password needed</span>
          <h1>
            {BRAND.name} is the <em className="s">ManyChat alternative</em> for Instagram auto-DM and scheduling
          </h1>
          <p className="lede">
            Poskoo is a ManyChat alternative for Instagram: comment-to-DM automation, lead capture and post scheduling in one tool, with a $0 Free plan that includes 500 auto-DMs a month. DM everyone who comments a keyword on your posts and Reels, ask for their email before the link, and plan the posts themselves in the same tool. No second subscription for a scheduler.
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
            <h2>{BRAND.name} vs ManyChat</h2>
            <p>ManyChat is a mature chat automation tool with more channels. {BRAND.name} focuses on Instagram comment-to-DM and adds post scheduling. Here is an honest side-by-side.</p>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr className={s.tr}>
                  <th scope="col" className={s.th}>Feature</th>
                  <th scope="col" className={`${s.th} ${s.oursCol}`}>{BRAND.name}</th>
                  <th scope="col" className={s.th}>ManyChat</th>
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
          <p className="small" style={{ textAlign: "center", marginTop: 16 }}>ManyChat features and pricing change over time. Check their site for current details.</p>
        </div>
      </section>

      {/* How it works */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">How it works</p>
              <h2>Schedule the post, the <em className="s">DM rule</em> comes with it</h2>
              <p>
                With ManyChat you set up the automation in one app and plan the post in another. In {BRAND.name} you write the post, pick the time and attach the keyword rule in one step.
              </p>
              <Link className={s.vlink} href="/instagram-auto-dm/templates">Browse ready-made DM templates</Link>
            </div>
            <div className="pains">
              <div className="pain"><b>1. Schedule the post</b><span>Write a caption that asks people to comment a keyword such as GUIDE.</span></div>
              <div className="pain"><b>2. Set the keyword and link</b><span>Choose the keyword, write the DM and add your link. Turn on the email gate if you want leads.</span></div>
              <div className="pain"><b>3. Commenters get the DM</b><span>The rule switches on when the post goes live and replies to every matching comment.</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>ManyChat alternative questions</h2>
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
              <h2><span className={s.nowrap}>Auto-DM</span> your commenters and <em className="s">schedule your posts</em> in one place</h2>
              <p>Start free. No credit card. Connect Instagram in one tap.</p>
              <Link className="btn" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            </div>
            <Image sizes="(max-width: 960px) 100vw, 50vw" src="/landing/card-leads.webp" width={900} height={900} loading="lazy" alt="Two friends high-five next to a board of new leads" />
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 24 }}>
            <Link className={s.vlink} href="/instagram-auto-dm">Instagram auto DM</Link>
            {" · "}
            <Link className={s.vlink} href="/instagram-auto-dm/templates">DM templates</Link>
            {" · "}
            <Link className={s.vlink} href="/buffer-alternative">Buffer alternative</Link>
            {" · "}
            <Link className={s.vlink} href="/">See the full product</Link>
          </p>
          <CompareAlternativesNav current="manychat" />
        </div>
      </section>
    </PublicShell>
  );
}
