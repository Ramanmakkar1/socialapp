import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import AutoDmDemo from "@/components/AutoDmDemo";
import FlowDemo from "./FlowDemo";

export const metadata: Metadata = {
  title: "Instagram Auto DM: DM Everyone Who Comments",
  description:
    "Auto-DM everyone who comments a keyword on your Instagram posts and reels. Official Meta API, email capture, AI replies and a simpler ManyChat alternative.",
  alternates: { canonical: "/instagram-auto-dm" },
};

const steps = [
  { n: "1", title: "Pick a post or reel", text: "Choose any post or reel on your Instagram Business or Creator account, or one you are about to schedule." },
  { n: "2", title: "Set a keyword like GUIDE", text: "Tell followers to comment a word such as GUIDE, LINK or PRICE. Match it exactly or anywhere in the comment." },
  { n: "3", title: "The DM goes out in seconds", text: "Everyone who comments the keyword gets your message and link in their DMs, day and night." },
];

const automations = [
  { no: "01 / Keywords", title: "Keyword replies", text: "Send a different DM for each keyword, on one post or across all of them." },
  { no: "02 / Leads", title: "Email + phone capture", text: "Ask for an email or phone number before the link is sent, so every comment becomes a lead." },
  { no: "03 / Growth", title: "Follow gate", text: "Only send the freebie once the person follows you, to grow your audience with every post." },
  { no: "04 / Stories", title: "Story replies", text: "Reply automatically when someone answers your story with a keyword." },
  { no: "05 / AI", title: "AI follow-up replies", text: "When people reply with a question, AI answers in your voice and keeps the chat going." },
  { no: "06 / Insights", title: "Click + lead tracking", text: "See DMs sent, link clicks and leads collected for every post." },
];

const compare: [string, string, string][] = [
  ["Price from", "$19 / month", "Varies with contacts"],
  ["Post scheduling included", "Yes", "No"],
  ["Comment-to-DM automation", "Yes", "Yes"],
  ["AI-written DM messages", "Yes", "Paid add-on"],
  ["Official Meta API", "Yes", "Yes"],
];

const faqs = [
  { q: "How do I auto DM people who comment on Instagram?", a: `Connect your Instagram Business or Creator account to ${BRAND.name}, pick a post, set a keyword and write your message. Everyone who comments that keyword gets the DM automatically.` },
  { q: "Will auto DMs get my Instagram account banned?", a: "Not when you use the official Meta API. We never ask for your password, we respect Meta's rate limits and we only message people who commented first." },
  { q: `Is ${BRAND.name} a ManyChat alternative?`, a: `Yes. ${BRAND.name} does comment-to-DM automation, email capture and AI replies, and also schedules your posts, so you can use one tool instead of two. It can also answer DMs with AI replies that collect contact details and share your booking link.` },
  { q: "Do I need an Instagram business account?", a: "Yes, Meta only allows DM automation on Business or Creator accounts. Switching is free and takes about a minute in the Instagram app." },
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

export default function InstagramAutoDm() {
  return (
    <PublicShell breadcrumbs={[{ name: "Instagram auto-DM", path: "/instagram-auto-dm" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
      <header className="hero">
        <span className="pill">Official Meta API · no password needed</span>
        <p className="eyebrow">Instagram auto DM</p>
        <h1>
          They comment. <em className="s mark">You get the lead.</em>
        </h1>
        <p className="lede">
          Someone comments a keyword on your post or reel, and {BRAND.name} sends them your link in a DM within seconds. Capture their email, answer with AI and track every lead.
        </p>
        <div className="ctas">
          <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
          <Link className="btn btn-line" href="#how">How it works</Link>
        </div>
        <p className="small">
          <Link href="/tools/instagram-comment-keyword-tester" className={s.vlink}>
            Test your keywords free
          </Link>
        </p>
        <div className="hero-art" style={{ maxWidth: 640 }}>
          <Image
            sizes="(max-width: 960px) 100vw, 640px"
            src="/landing/card-dm.webp"
            width={900}
            height={900}
            alt="A relaxed creator on a beanbag while DMs fly out of their phone to followers"
          />
        </div>
      </header>

      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <AutoDmDemo />
        </div>
      </section>

      <section id="how" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">How it works</p>
            <h2>How comment-to-DM <em className="s">works.</em></h2>
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
          <FlowDemo />
          <div
            style={{
              marginTop: 22,
              display: "grid",
              gap: 14,
              justifyItems: "center",
              textAlign: "center",
            }}
          >
            <p className="small">
              The preview above is a local simulation. Your live rules run on your own connected account, day and night.
            </p>
            <div className="ctas">
              <Link className="btn btn-dark" href="/signup">
                Start free — connect Instagram <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Automations</p>
            <h2>What you can <em className="s mark">automate.</em></h2>
          </div>
          <div className="cards">
            {automations.slice(0, 3).map((a) => (
              <article key={a.title} className="pcard">
                <span className="no">{a.no}</span>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </article>
            ))}
          </div>
          <div className="cards" style={{ marginTop: 26 }}>
            {automations.slice(3).map((a) => (
              <article key={a.title} className="pcard">
                <span className="no">{a.no}</span>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </article>
            ))}
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 24 }}>
            <Link href="/instagram-auto-dm/templates" className={s.vlink}>Browse DM templates →</Link>
          </p>
          <div className="mt-8">
            <p className="eyebrow" style={{ textAlign: "center" }}>Learn how to set it up</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Link href="/help/instagram-auto-dm-not-working" className="group min-w-0 rounded-2xl border border-line bg-surface p-5 transition hover:border-brand/40">
                <span className="font-medium">Instagram auto DM not working?</span>
                <p className="text-sm text-ink-2">A checklist to find why a DM did not send.</p>
              </Link>
              <Link href="/tools/instagram-comment-keyword-tester" className="group min-w-0 rounded-2xl border border-line bg-surface p-5 transition hover:border-brand/40">
                <span className="font-medium">Free comment keyword tester</span>
                <p className="text-sm text-ink-2">See which comments your keywords will match.</p>
              </Link>
              <Link href="/tools/instagram-comment-to-dm-calculator" className="group min-w-0 rounded-2xl border border-line bg-surface p-5 transition hover:border-brand/40">
                <span className="font-medium">Comment-to-DM campaign calculator</span>
                <p className="text-sm text-ink-2">Estimate comments, DMs and link clicks from your views and rates.</p>
              </Link>
              <Link href="/instagram-dm-automation" className="group min-w-0 rounded-2xl border border-line bg-surface p-5 transition hover:border-brand/40">
                <span className="font-medium">Instagram DM automation explained</span>
                <p className="text-sm text-ink-2">See what comment keywords, Story replies, email capture and AI replies can automate.</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <div className="head">
            <p className="eyebrow">Comparison</p>
            <h2>{BRAND.name} vs ManyChat</h2>
            <p>Both send comment-to-DM messages. {BRAND.name} also schedules your posts.</p>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th className={s.th}>Feature</th>
                  <th className={`${s.th} ${s.oursCol}`} style={{ color: "var(--poskoo-ink)" }}>{BRAND.name}</th>
                  <th className={s.th}>ManyChat</th>
                </tr>
              </thead>
              <tbody>
                {compare.map(([label, ours, theirs]) => (
                  <tr key={label} className={s.tr}>
                    <td className={s.td}>{label}</td>
                    <td className={`${s.td} ${s.oursCol}`} style={{ fontWeight: 700 }}><Cell v={ours} /></td>
                    <td className={s.td} style={{ color: "var(--poskoo-muted)" }}><Cell v={theirs} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Safety</p>
              <h2>Is Instagram auto DM <em className="s">safe?</em></h2>
              <p>
                Yes, when it runs on the official Meta API. {BRAND.name} connects through Meta&apos;s own login, so we never see or store your Instagram password. We only message people who commented or replied first, we respect Meta&apos;s rate limits, and we follow the 24-hour messaging window: replies are sent while the conversation is open, never as cold spam.
              </p>
            </div>
            <div className="art">
              <Image sizes="(max-width: 960px) 100vw, 50vw" src="/landing/problem.webp" width={900} height={900} loading="lazy" alt="A tired creator at night buried under chat-bubble notifications, before automating replies" />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram auto DM questions</h2>
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
              <h2>Turn your next comment section <em className="s">into leads.</em></h2>
              <p>Start free. No credit card. Connect Instagram in one tap.</p>
              <Link className="btn" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            </div>
            <Image sizes="(max-width: 960px) 100vw, 50vw" src="/landing/card-leads.webp" width={900} height={900} loading="lazy" alt="Two friends high-five next to a board of new leads" />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
