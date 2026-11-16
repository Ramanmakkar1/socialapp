import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { withSocial } from "@/lib/page-metadata";
import { BRAND } from "@/lib/brand";
import { LIVE_PLATFORMS_TEXT, PLATFORMS_ANSWER } from "@/lib/platform-support";
import PublicShell from "@/components/PublicShell";
import { CompareNote } from "@/components/CompareNote";
import { CompareAlternativesNav } from "@/components/CompareAlternativesNav";
import s from "@/components/site.module.css";
import { AnimArt } from "@/components/AnimArt";

// Platform copy follows the runtime env, so refresh at most every 10 minutes.
export const revalidate = 600;

export const metadata: Metadata = withSocial({
  title: { absolute: `Later alternative: scheduling + Instagram auto-DM | ${BRAND.name}` },
  description:
    "A Later alternative that schedules posts and turns Instagram keyword comments into automatic DMs, with email capture and lead export. Free plan, no card.",
  alternates: { canonical: "/alternatives/later" },
  robots: { index: false, follow: true },
});

const comparison: { label: string; us: string; later: string }[] = [
  {
    label: "Plan and schedule posts on a visual calendar",
    us: "Yes",
    later: "Yes — Later is known for its visual planner",
  },
  {
    label: "Networks you can publish to",
    us: LIVE_PLATFORMS_TEXT,
    later: "Several networks including Instagram; check Later's site for the current list",
  },
  {
    label: "Instagram comment-to-DM keyword automation",
    us: "Yes, attached to a scheduled post",
    later: "Check Later's current plans and integrations",
  },
  {
    label: "Email capture inside the DM",
    us: "Yes",
    later: "Check Later's current plans",
  },
  {
    label: "Lead CSV export",
    us: "Yes",
    later: "Check Later's current plans",
  },
  {
    label: "Official platform APIs, no password sharing",
    us: "Yes — Meta login for Instagram",
    later: "Yes for supported networks; details on their site",
  },
  {
    label: "Free tier",
    us: "$0 Free plan, no credit card",
    later: "Check Later's pricing page for current plans",
  },
];

const chooseUs = [
  {
    title: "You want posts and comment replies in one place",
    text: "Attach a comment keyword and DM message to a post you scheduled weeks ago. When the post goes live, commenters get the reply automatically.",
  },
  {
    title: "You want leads, not just likes",
    text: "Ask for an email in the DM before sending the link, then export the list. A scheduled post becomes a lead source.",
  },
  {
    title: "You mainly publish to Instagram, Facebook and Threads",
    text: `${BRAND.name} publishes to ${LIVE_PLATFORMS_TEXT} today, with more networks in development.`,
  },
];

const chooseLater = [
  {
    title: "Your workflow runs on Later's planner",
    text: "If your team already plans, approves and publishes in Later and it works, there is no reason to rebuild for its own sake.",
  },
  {
    title: "You need networks outside our live list",
    text: "Later supports several networks we do not publish to yet. Check their site against the networks you actually use.",
  },
  {
    title: "You do not need comment automation",
    text: "If scheduling alone is enough and you are happy with your current setup, staying put is a legitimate choice.",
  },
];

const migrationQuestions = [
  {
    q: "What do I need to move?",
    a: "Your connected accounts, your upcoming posts and any saved captions or media. Reconnect Instagram, Facebook and Threads through the official Meta login, then add your next planned posts to the calendar.",
  },
  {
    q: "Can I import my Later schedule or media library?",
    a: `There is no automatic Later import yet. Download any assets you need from Later, then upload them when you create posts in ${BRAND.name}.`,
  },
  {
    q: "Will my comment automations keep working?",
    a: "Rules live on the post in Poskoo, so recreate the keywords and DM messages on the posts you are moving. Only people who comment after a rule is live receive the automatic DM.",
  },
  {
    q: "Can I run Later and Poskoo side by side first?",
    a: "Yes. Keep Later for the networks you have not moved yet, and test Poskoo on Instagram with one or two posts before moving the rest of your calendar.",
  },
];

const faqs = [
  {
    q: "Is Poskoo a Later alternative?",
    a: `Yes. ${BRAND.name} is a Later alternative for teams that want scheduling plus Instagram comment-to-DM automation in one tool, instead of adding a separate chatbot.`,
  },
  {
    q: "Does Later send automatic DMs when someone comments?",
    a: "Later is built around planning and publishing social content. Check Later's site and current plans for any messaging or automation features.",
  },
  {
    q: "Which platforms can I schedule with Poskoo?",
    a: `${PLATFORMS_ANSWER} Later supports additional networks; check their site for the current list before you switch.`,
  },
  {
    q: "Is Instagram comment-to-DM allowed?",
    a: `Yes, through the official Instagram API. ${BRAND.name} only messages people who commented first, uses Meta login, and never asks for your password.`,
  },
  {
    q: "How much does a Later alternative cost here?",
    a: `You can start on the $0 Free plan with no credit card. Paid plans and current limits are on the ${BRAND.name} pricing page; we do not list Later's prices because they change.`,
  },
];

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: BRAND.name,
  applicationCategory: "SocialMediaApplication",
  operatingSystem: "Web",
  url: `${BRAND.canonicalUrl}/alternatives/later`,
  description:
    "Social media scheduler with Instagram comment-to-DM automation, email capture and lead export.",
  featureList: [
    "Visual social media calendar",
    "Scheduled publishing through official platform APIs",
    "Instagram comment-to-DM keyword automation",
    "Email capture inside DMs",
    "Lead CSV export",
  ],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free plan, no credit card required",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

function Cell({ value }: { value: string }) {
  if (value === "Yes") {
    return <span style={{ color: "var(--poskoo-green)", fontWeight: 700 }}>Yes</span>;
  }
  if (value.startsWith("Yes")) {
    return <span>{value}</span>;
  }
  return <span style={{ color: "var(--poskoo-muted)" }}>{value}</span>;
}

export default function LaterAlternativeComparison() {
  return (
    <PublicShell
      className={`${s.sched} ${s.pub}`}
      breadcrumbs={[{ name: "Later alternative", path: "/alternatives/later" }]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />

      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Official Meta API · No passwords</span>
          <h1>
            Later alternative with Instagram <em className="s">auto-DM</em> built in
          </h1>
          <p className="lede">
            {BRAND.name} is a Later alternative that schedules your posts and automatically DMs people
            who comment a keyword. It answers the main question first: if you want one calendar for
            publishing and comment-to-DM replies, {BRAND.name} does both; if you only need Later&apos;s
            visual planner for other networks, Later may still fit you.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">
              Start free <span aria-hidden="true">→</span>
            </Link>
            <a className="btn btn-line" href="#compare">
              See the comparison
            </a>
          </div>
        </div>
        <div className="hero-art">
          <AnimArt
            name="compare"
            label="A creator compares two scheduling apps, then holds up one phone that schedules posts and sends DMs"
          />
        </div>
      </header>

      <section id="compare" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Side by side</p>
            <h2>{BRAND.name} vs Later</h2>
            <p>
              Only publicly observable capabilities are listed. Where a Later feature depends on their
              current plan or changes often, the table says to check their site instead of guessing.
            </p>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr className={s.tr}>
                  <th scope="col" className={s.th}>
                    Capability
                  </th>
                  <th scope="col" className={`${s.th} ${s.oursCol}`}>
                    {BRAND.name}
                  </th>
                  <th scope="col" className={s.th}>
                    Later
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.label} className={s.tr}>
                    <td className={s.td}>{row.label}</td>
                    <td
                      className={`${s.td} ${s.oursCol}`}
                      style={{ fontWeight: 700, textAlign: "center" }}
                    >
                      <Cell value={row.us} />
                    </td>
                    <td className={s.td} style={{ textAlign: "center" }}>
                      <Cell value={row.later} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CompareNote />
          <p className="small" style={{ textAlign: "center", marginTop: 16 }}>
            Later&apos;s features and plans change over time. Check their site for current details. We do
            not list their prices here.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Choosing</p>
            <h2>Who should choose each product</h2>
          </div>
          <div className="cards">
            <article className="pcard">
              <span className="no">Choose {BRAND.name} if</span>
              <h3>You want scheduling and comment replies together</h3>
              <ul style={{ margin: "12px 0 0", paddingLeft: 18 }}>
                {chooseUs.map((item) => (
                  <li key={item.title} style={{ marginBottom: 10 }}>
                    <strong>{item.title}.</strong> {item.text}
                  </li>
                ))}
              </ul>
            </article>
            <article className="pcard">
              <span className="no">Stay on Later if</span>
              <h3>Your current planner already fits</h3>
              <ul style={{ margin: "12px 0 0", paddingLeft: 18 }}>
                {chooseLater.map((item) => (
                  <li key={item.title} style={{ marginBottom: 10 }}>
                    <strong>{item.title}.</strong> {item.text}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Migrating</p>
            <h2>Questions to ask before switching from Later</h2>
            <p>Answer these four before you move a live calendar, so nothing publishes unexpectedly.</p>
          </div>
          <div className="faq">
            {migrationQuestions.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Later alternative FAQs</h2>
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

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>
                Schedule like Later. <em className="s">Auto-DM every commenter</em>
              </h2>
              <p>Start free, connect Instagram with Meta login, and publish your first scheduled post.</p>
              <Link className="btn" href="/signup">
                Start free <span aria-hidden="true">→</span>
              </Link>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-schedule.webp"
              width={900}
              height={900}
              loading="lazy"
              alt="A creator scheduling posts on a calendar while comment replies queue up"
            />
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 24 }}>
            <Link className={s.vlink} href="/instagram-comment-to-dm">
              How Instagram comment-to-DM works
            </Link>{" "}
            ·{" "}
            <Link className={s.vlink} href="/pricing">
              See {BRAND.name} pricing
            </Link>
          </p>
          <CompareAlternativesNav current="later" />
        </div>
      </section>
    </PublicShell>
  );
}
