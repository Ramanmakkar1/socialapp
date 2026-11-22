import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { withSocial } from "@/lib/page-metadata";
import { BRAND } from "@/lib/brand";
import { publisherRef } from "@/lib/tool-schema";
import { softwareOffers } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { AnimArt } from "@/components/AnimArt";

// Readiness / pricing copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const PATH = "/features/instagram-comment-to-dm";
const title = `Instagram Comment-to-DM Automation for Leads | ${BRAND.name}`;
const description =
  "Turn Instagram comments into automatic DMs: keyword triggers, optional email capture, link delivery, pauses and retries on the official Meta API.";

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
});

const steps = [
  {
    n: "1",
    title: "Connect Instagram with Meta's login",
    text: "Use the official Meta login for an Instagram Business or Creator account. Poskoo never asks for your password, and you can disconnect from the dashboard at any time.",
  },
  {
    n: "2",
    title: "Choose a post or reel and a keyword",
    text: "Pick the post or reel to watch, then set a word such as GUIDE, LINK or PRICE. Match the whole comment or just the word inside it.",
  },
  {
    n: "3",
    title: "Write the DM and add your link",
    text: "Write the message a follower receives and add the link you want them to open. You can ask for an email before the link is delivered.",
  },
  {
    n: "4",
    title: "Every matching comment gets a DM",
    text: "When someone comments your keyword, Poskoo sends the message through the official Meta API, usually within a minute, day or night.",
  },
  {
    n: "5",
    title: "Pause, edit or retry from one place",
    text: "Switch a rule off with one tap, change the message without rebuilding it, and let failed sends retry automatically within Meta's limits.",
  },
];

const benefits = [
  {
    no: "01 / Capture",
    title: "Collect an email before the link",
    text: "Add an email question to the rule and the link is only delivered after a valid reply. Each conversation becomes a contact in your leads list instead of a one-off DM.",
  },
  {
    no: "02 / Qualify",
    title: "Add a follow gate when it fits",
    text: "Ask people to follow first if that suits the campaign. The gate is optional, so you can keep the flow short when speed matters more.",
  },
  {
    no: "03 / Track",
    title: "See which posts and keywords convert",
    text: "Tracked links show whether a lead opened your page, so you can compare posts, keywords and messages and keep the ones that send real traffic.",
  },
  {
    no: "04 / Follow up",
    title: "Export leads to your own tools",
    text: "Captured contacts live in your Poskoo leads list and can be exported as CSV for your email tool, CRM or follow-up sequence.",
  },
];

const accounts = [
  {
    name: "Instagram Business",
    ok: true,
    text: "Full support for comment-to-DM rules, Story replies, email capture and link tracking.",
  },
  {
    name: "Instagram Creator",
    ok: true,
    text: "Full support for comment-to-DM rules, Story replies, email capture and link tracking.",
  },
  {
    name: "Instagram personal",
    ok: false,
    text: "Not supported by Meta's API. Switching to Business or Creator is free and takes about a minute in the Instagram app.",
  },
  {
    name: "Facebook Page and Threads",
    ok: false,
    text: "You can schedule posts to them today. Comment-to-DM rules for these channels are not part of Phase 1.",
  },
];

const faqs = [
  {
    q: "What triggers an Instagram comment-to-DM reply?",
    a: "A comment that matches the keyword on the post or reel you chose. You can match the exact comment or the keyword anywhere inside it, and you can add Story-reply and DM-keyword triggers to the same rule.",
  },
  {
    q: "Can I pause a comment-to-DM rule?",
    a: "Yes. Pause or switch off any rule in one tap. While it is paused no new DMs go out, and turning it back on takes one tap without rebuilding the rule.",
  },
  {
    q: "What happens to replies while a rule is paused?",
    a: "Comments made during the pause are not sent a DM automatically. When you turn the rule back on it starts answering new matching comments again; it does not backfill old ones.",
  },
  {
    q: "Does Poskoo reply publicly to the comment too?",
    a: "You can add a short public reply such as \"Sent you a DM!\" under the comment, and the private message goes out separately. The public reply is optional and stays visible in the feed.",
  },
  {
    q: "Does comment-to-DM use the official Instagram API?",
    a: "Yes. Poskoo connects through Meta's official login and messaging API, never asks for your Instagram password, only messages people who commented first, and respects Meta's messaging limits. There is no scraping.",
  },
  {
    q: "What happens if a DM fails to send?",
    a: "Failed sends are queued and retried automatically within Meta's rate limits. You see the status in the dashboard, so a temporary error does not silently lose a lead.",
  },
  {
    q: "Do I need a paid plan to start?",
    a: "No. The Free plan includes 2 social accounts and 500 auto-DMs per month, so you can test a keyword on a real post before upgrading. Paid plans raise the account and DM limits.",
  },
];

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: BRAND.name,
  url: `${BRAND.canonicalUrl}${PATH}`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description,
  featureList: [
    "Instagram comment keyword triggers",
    "Automatic DM link delivery",
    "Optional email capture before the link",
    "Pause and resume rules",
    "Automatic retries for failed DMs",
    "Click and lead tracking",
  ],
  offers: softwareOffers(planReadiness()),
  publisher: publisherRef(),
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

const ld = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

const mockCard: CSSProperties = {
  background: "var(--poskoo-card, #fff)",
  border: "1px solid rgba(24, 18, 40, 0.1)",
  borderRadius: 20,
  boxShadow: "0 18px 40px rgba(24, 18, 40, 0.12)",
  padding: 18,
};

export default function InstagramCommentToDmFeaturePage() {
  return (
    <PublicShell
      className={`${s.sched} ${s.pub}`}
      breadcrumbs={[
        { name: "Features", path: "/features" },
        { name: "Instagram comment-to-DM", path: PATH },
      ]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(appJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(faqJsonLd) }} />

      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Official Meta API &middot; no password needed</span>
          <p className="eyebrow">Feature &middot; Instagram comment-to-DM</p>
          <h1>
            Instagram comment-to-DM automation <em className="s mark">that turns comments into leads</em>
          </h1>
          <p className="lede">
            Instagram comment-to-DM automation sends a direct message automatically when someone comments your
            keyword on a post or reel. {BRAND.name} delivers your link, can ask for an email first, and keeps
            retrying failed sends within Meta&apos;s limits.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">
              Create your free account <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link className="btn btn-line" href="/tools/instagram-comment-to-dm-preview">
              Preview a comment-to-DM flow free
            </Link>
          </div>
          <p className="small">
            Already set up?{" "}
            <Link href="/app" className={s.vlink}>
              Open your comment-to-DM dashboard
            </Link>
            .
          </p>
        </div>
        <div className="hero-art">
          <AnimArt
            name="card-dm"
            label="A creator relaxing while automated DMs with links fly out of a phone to followers"
          />
        </div>
      </header>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Inside the product</p>
            <h2>A comment becomes a DM <em className="s">in one rule</em></h2>
            <p>
              The rule watches one post, matches your keyword and sends the message you wrote. Here is what that
              looks like in the app.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 18,
              alignItems: "stretch",
            }}
          >
            <div style={mockCard}>
              <p className="eyebrow" style={{ marginBottom: 10 }}>
                Post comments
              </p>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #f6b8a8, #b79cff)",
                    flex: "0 0 auto",
                  }}
                />
                <div>
                  <strong style={{ fontSize: 14 }}>maya.creates</strong>
                  <p style={{ margin: "2px 0 0", fontSize: 14 }}>GUIDE please!</p>
                </div>
              </div>
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(123, 92, 255, 0.08)",
                  fontSize: 13,
                }}
              >
                Keyword <strong>GUIDE</strong> matched &middot; DM queued
              </div>
            </div>

            <div style={mockCard}>
              <p className="eyebrow" style={{ marginBottom: 10 }}>
                Automated DM
              </p>
              <div
                style={{
                  background: "linear-gradient(135deg, #7b5cff, #a78bfa)",
                  color: "#fff",
                  borderRadius: 16,
                  padding: 14,
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                Thanks for commenting! Here is the free guide you asked for. What is the best email to send it to?
              </div>
              <div
                style={{
                  marginTop: 10,
                  alignSelf: "flex-end",
                  background: "rgba(24, 18, 40, 0.06)",
                  borderRadius: 16,
                  padding: "10px 14px",
                  fontSize: 14,
                  maxWidth: "85%",
                  marginLeft: "auto",
                }}
              >
                maya@example.com
              </div>
              <p style={{ margin: "12px 0 0", fontSize: 13, opacity: 0.75 }}>
                Email captured &middot; link delivered &middot; click tracked
              </p>
            </div>

            <div style={mockCard}>
              <p className="eyebrow" style={{ marginBottom: 10 }}>
                Rule settings
              </p>
              <dl style={{ margin: 0, fontSize: 14, lineHeight: 1.9 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <dt style={{ opacity: 0.7 }}>Trigger</dt>
                  <dd style={{ margin: 0, fontWeight: 600 }}>Comment keyword</dd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <dt style={{ opacity: 0.7 }}>Keyword</dt>
                  <dd style={{ margin: 0, fontWeight: 600 }}>GUIDE</dd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <dt style={{ opacity: 0.7 }}>Email gate</dt>
                  <dd style={{ margin: 0, fontWeight: 600 }}>On</dd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <dt style={{ opacity: 0.7 }}>Status</dt>
                  <dd style={{ margin: 0, fontWeight: 600, color: "var(--poskoo-green)" }}>Active</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">The workflow</p>
            <h2>How comment-to-DM <em className="s">runs end to end</em></h2>
            <p>
              One rule covers the whole path: the comment, the DM, the link, the email and the retry if something
              fails. Set it once and it keeps working on every new comment.
            </p>
          </div>
          <div className="cards">
            {steps.map((st) => (
              <article key={st.n} className="pcard">
                <span className="no">Step {st.n}</span>
                <h3>{st.title}</h3>
                <p>{st.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Lead capture</p>
              <h2>Every comment can become <em className="s mark">a contact</em></h2>
              <p>
                A reply is useful once. A captured email is useful again next week. Add an optional email question
                to the rule and the link is only delivered after the follower answers, so the conversation ends
                with a lead you can follow up with.
              </p>
              <ul>
                <li>Ask for an email before the link goes out.</li>
                <li>Add a follow gate only when the campaign needs it.</li>
                <li>Track clicks per post, keyword and message.</li>
                <li>Export captured contacts as CSV for your CRM.</li>
              </ul>
              <Link className="btn btn-line" href="/signup">
                Start free and capture your first lead <span aria-hidden="true">&rarr;</span>
              </Link>
              <p className="small">
                Want the numbers first?{" "}
                <Link className={s.vlink} href="/tools/instagram-comment-to-dm-calculator">
                  estimate comment-to-DM leads with the free calculator
                </Link>
                .
              </p>
            </div>
            <div className="art">
              <AnimArt
                name="card-leads"
                label="Two friends high-five next to a board of contacts with check marks and a rising chart"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Lead-capture benefits</p>
            <h2>What you get <em className="s">from each conversation</em></h2>
          </div>
          <div className="cards">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="pcard">
                <span className="no">{benefit.no}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Supported platforms</p>
            <h2>Which Meta accounts <em className="s mark">work today</em></h2>
            <p>
              Comment-to-DM automation runs on Instagram accounts that Meta allows to use its messaging API. Here
              is exactly what is supported in Phase 1.
            </p>
          </div>
          <div className="cards">
            {accounts.map((account) => (
              <article key={account.name} className="pcard">
                <span
                  className="no"
                  style={{ color: account.ok ? "var(--poskoo-green)" : "var(--poskoo-muted)" }}
                >
                  {account.ok ? "Supported" : "Not supported yet"}
                </span>
                <h3>{account.name}</h3>
                <p>{account.text}</p>
              </article>
            ))}
          </div>
          <p className="small" style={{ marginTop: 16 }}>
            Scheduling also works on Facebook Pages and Threads. See the{" "}
            <Link className={s.vlink} href="/instagram-scheduler">
              Instagram scheduler
            </Link>{" "}
            and the{" "}
            <Link className={s.vlink} href="/instagram-auto-dm">
              Instagram auto-DM overview
            </Link>{" "}
            for the rest of the workflow.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram comment-to-DM FAQs</h2>
          </div>
          <div className="faq">
            {faqs.map((faq) => (
              <details key={faq.q}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
          <p className="small" style={{ marginTop: 16 }}>
            Test a keyword before you connect an account with the{" "}
            <Link className={s.vlink} href="/tools/instagram-comment-keyword-tester">
              free Instagram comment keyword tester
            </Link>
            .
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Let your next post <em className="s">answer its own comments</em></h2>
              <p>Start free, connect Instagram and turn on your first keyword in a few minutes.</p>
              <div className="ctas">
                <Link className="btn" href="/signup">
                  Start free <span aria-hidden="true">&rarr;</span>
                </Link>
                <Link className="btn btn-line" href="/tools/instagram-comment-to-dm-preview">
                  Try the free flow preview
                </Link>
              </div>
            </div>
            <AnimArt
              name="card-leads"
              label="Two friends celebrating next to a board of new leads from automated Instagram DMs"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
