import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { helpArticleJsonLd } from "@/lib/help-schema";
import HelpGuideIllustration from "@/components/HelpGuideIllustration";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

const description = `Send an automatic Instagram DM to everyone who comments a keyword. Set up a comment-to-DM rule in ${BRAND.name} with the official Meta API, step by step.`;

export const metadata: Metadata = withSocial({
  title: "How to Auto DM Instagram Comments (Step by Step)",
  description,
  alternates: { canonical: "/help/auto-dm-instagram-comments" },
});

const linkClass = s.vlink;

const steps = [
  {
    name: "Connect a professional Instagram account",
    text: "Auto-DM only works with an Instagram professional account (Business or Creator). Connect it through Meta's official Instagram login and allow message access.",
    body: (
      <>
        Auto-DM only works with an Instagram professional account (Business or Creator). Connect it through
        Meta&apos;s official Instagram login and allow message access. Follow the{" "}
        <Link className={linkClass} href="/help/getting-started">getting started guide</Link>{" "}
        if you haven&apos;t done this yet.
      </>
    ),
  },
  {
    name: "Open Auto-DM and click New automation",
    text: "In the app, open Auto-DM and click New automation to start a blank rule, or pick a template.",
    body: (
      <>
        In the app, open{" "}
        <Link className={linkClass} href="/app/auto-dm">Auto-DM</Link>{" "}
        and click <strong>New automation</strong> to start a blank rule. You can also start from one of the
        ready-made templates on the same page.
      </>
    ),
  },
  {
    name: "Add a Name and Keywords",
    text: "Give the rule a Name you will recognise, then type your Keywords, comma-separated, up to 10 keywords.",
    body: (
      <>
        Give the rule a <strong>Name</strong> you will recognise later, such as &quot;Free guide DM&quot;. Then fill
        in <strong>Keywords</strong>: comma-separated, up to 10 keywords (for example <code>GUIDE, LINK</code>).
      </>
    ),
  },
  {
    name: "Choose the Match type",
    text: "Pick 'Comment contains keyword' to catch the word anywhere in a comment, or 'Comment matches exactly' to fire only when the whole comment is the keyword.",
    body: (
      <>
        Under <strong>Match type</strong>, pick <strong>Comment contains keyword</strong> to catch the word
        anywhere in a comment, or <strong>Comment matches exactly</strong> to fire only when the whole comment is
        the keyword.
      </>
    ),
  },
  {
    name: "Choose When to send",
    text: "Under When to send, tick 'Comments on my posts', 'Replies to my stories', or both.",
    body: (
      <>
        Under <strong>When to send</strong>, tick <strong>Comments on my posts</strong>,{" "}
        <strong>Replies to my stories</strong>, or both.
      </>
    ),
  },
  {
    name: "Write the DM message and add a Link URL",
    text: "Write the DM message (up to 1000 characters). Insert the {{username}} and {{link}} tokens, then paste the page you want to send into Link URL.",
    body: (
      <>
        Write the <strong>DM message</strong> (up to 1000 characters). Use the <code>{"{{username}}"}</code> token
        to greet the person by name and <code>{"{{link}}"}</code> where your link should go, for example:{" "}
        <code>{"Hey {{username}}! Here is your link 👉 {{link}}"}</code>. Then paste the page you want to send into{" "}
        <strong>Link URL</strong>. A preview under the form shows how the message will look.
      </>
    ),
  },
  {
    name: "Turn on optional gates",
    text: "Tick 'Ask for email first' to collect an email before the link is sent, or 'Require follow' to send the link only to followers. Captured emails appear in Leads.",
    body: (
      <>
        Two optional gates sit under the message. <strong>Ask for email first</strong> collects the person&apos;s
        email before the link is sent, and <strong>Require follow</strong> sends the link only after they follow
        you. With either gate on, a Link URL is required. Emails you capture appear in{" "}
        <Link className={linkClass} href="/app/leads">Leads</Link>.
      </>
    ),
  },
  {
    name: "Test your keywords, save and watch Activity",
    text: "Check your keywords with the free comment keyword tester, click Create automation, then watch the Activity page to see DMs being sent.",
    body: (
      <>
        Try sample comments in the free{" "}
        <Link className={linkClass} href="/tools/instagram-comment-keyword-tester">comment keyword tester</Link>{" "}
        to be sure your keywords match. Then click <strong>Create automation</strong> and open{" "}
        <Link className={linkClass} href="/app/auto-dm/activity">Activity</Link>{" "}
        to watch DMs go out.
      </>
    ),
  },
];

const tips = [
  "Use one short, easy word, like GUIDE or LINK. People type it faster and make fewer typos.",
  "Say the keyword in the caption and on the image or Reel, for example “Comment GUIDE and I’ll DM you the link.”",
  "Add common variations as extra keywords (GUIDE, GUIDES) instead of relying on people to spell it one way.",
  "Use 'Comment contains keyword' unless the keyword is also a common word that would trigger by mistake.",
];

const articleJsonLd = helpArticleJsonLd({
  headline: "How to auto-DM people who comment on your Instagram posts",
  description,
  path: "/help/auto-dm-instagram-comments",
  datePublished: "2026-11-07",
  dateModified: "2026-11-15",
});

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to auto-DM people who comment on your Instagram posts",
  description: metadata.description,
  image: `${BRAND.canonicalUrl}/landing/hero.webp`,
  step: steps.map((st, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: st.name,
    text: st.text,
  })),
};

const faqs = [
  {
    q: "Is it safe to auto-DM Instagram comments?",
    a: "Poskoo uses Meta's official Instagram API and the login Meta provides. It never asks for your Instagram password and never scrapes your account.",
  },
  {
    q: "Do I need a Business or Creator account?",
    a: "Yes. Meta only allows automated DMs for Instagram professional accounts, so a Business or Creator account is required. Switching is free in the Instagram app.",
  },
  {
    q: "Can I use more than one keyword in a rule?",
    a: "Yes. Add up to 10 keywords per rule, separated by commas. A comment that matches any of them triggers the DM.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function AutoDmInstagramCommentsHelpPage() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`}
      breadcrumbs={[
        { name: "Help center", path: "/help" },
        { name: "Auto-DM Instagram comments", path: "/help/auto-dm-instagram-comments" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="hero">
        <div className={s.heroText}>
          <p className="eyebrow">Guide</p>
          <h1>
              How to auto-DM people who comment on your <em className="s">Instagram posts</em>
            </h1>
          <p className="lede">
            Send an automatic DM to everyone who comments a keyword. {BRAND.name} uses Meta&apos;s official Instagram
            API, so you set one rule and every matching comment gets your message and link.
          </p>
        </div>
        <HelpGuideIllustration variant="autodm" className="hero-art" />
      </header>

      {steps.map((st, i) => (
        <section key={st.name} style={{ paddingTop: i === 0 ? 40 : 20 }}>
          <div className="wrap">
            <div className={s.prose}>
              <h2>
                Step {i + 1}: {st.name}
              </h2>
              <p>{st.body}</p>
            </div>
          </div>
        </section>
      ))}

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Tips for keywords that get comments</h2>
            <ul>
              {tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="pains" style={{ maxWidth: 760, margin: "0 auto" }}>
            <div className="pain">
              <b>Not sending?</b>
              <span>
                Work through the{" "}
                <Link className={s.vlink} href="/help/instagram-auto-dm-not-working">
                  auto-DM not working checklist
                </Link>{" "}
                or start from ready-made{" "}
                <Link className={s.vlink} href="/instagram-auto-dm/templates">auto-DM templates</Link>.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>FAQ</h2>
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

      <p className="small" style={{ textAlign: "center", marginTop: "20px" }}>
        New to {BRAND.name}?{" "}
        <Link className={s.vlink} href="/signup">Create a free account</Link>{" "}
        or email{" "}
        <a className={s.vlink} href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>.
      </p>
    </PublicShell>
  );
}
