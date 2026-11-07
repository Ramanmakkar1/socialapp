import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import { CompareAlternativesNav } from "@/components/CompareAlternativesNav";
import CompareHeroIllustration from "@/components/CompareHeroIllustration";
import s from "@/components/site.module.css";

export const metadata: Metadata = {
  title: { absolute: `Later Alternative With Instagram Auto-DM | ${BRAND.name}` },
  description:
    "A Later alternative that schedules Instagram posts and auto-DMs keyword commenters, with email capture and lead export. Facebook Pages and Threads too.",
  alternates: { canonical: "/later-alternative" },
};

const whyLook = [
  { no: "01 / One tool", title: "Scheduler plus comment-to-DM", text: "Later plans your grid and calendar well, but turning comments into DMs still means paying for a separate chat automation tool." },
  { no: "02 / One calendar", title: "One calendar for posts and rules", text: `In ${BRAND.name} you attach a comment-to-DM rule to a scheduled post. The rule switches on when the post goes live.` },
  { no: "03 / Leads", title: "Leads from scheduled content", text: "Ask for an email in the DM before the link is sent, so posts you planned weeks ahead can still fill a lead list." },
];

const compare: [string, string, string][] = [
  ["Scheduling for Instagram, Facebook and Threads", "Instagram now, Facebook & Threads soon", "Yes"],
  ["Visual calendar", "Yes", "Yes"],
  ["Comment→DM keyword automation", "Yes", "No"],
  ["Email capture in the DM", "Yes", "No"],
  ["Link click tracking", "Yes", "See their site"],
  ["Lead CSV export", "Yes", "No"],
  ["AI caption ideas", "Yes", "See their site"],
];

const switchSteps = [
  { title: "1. Connect Instagram", text: "Sign up, connect your Instagram Business or Creator account through Meta login. No password sharing." },
  { title: "2. Recreate your queue", text: "Add upcoming Instagram posts to the calendar. Paste captions from Later if you like." },
  { title: "3. Attach DM rules", text: "For lead posts, set a comment keyword and DM message on each scheduled post. Publish on time; commenters get the link in DMs." },
];

const faqs = [
  { q: `Is ${BRAND.name} a Later alternative?`, a: `Yes. ${BRAND.name} gives you a visual calendar with Instagram, Facebook Pages and Threads scheduling and publishing today, plus Instagram comment-to-DM automation, email capture and link tracking in the same subscription.` },
  { q: "Does Later send automatic DMs when someone comments?", a: "Later is built for planning and publishing social content. Comment-to-DM automation is not part of Later itself; teams usually add a tool like ManyChat for that." },
  { q: "Can I import my Later media library or schedule?", a: `There is no Later import yet. Download assets from Later if needed, then upload them when you create posts in ${BRAND.name}. Most teams rebuild the next one to two weeks of posts in under ten minutes.` },
  { q: "Which platforms does each tool support?", a: `Instagram, Facebook Pages and Threads scheduling and Instagram auto-DMs work today on ${BRAND.name}, with more networks later. Later supports additional networks such as Pinterest and TikTok; see their site for the current list.` },
  { q: "Is comment-to-DM allowed on Instagram?", a: `Yes, through the official Instagram API. ${BRAND.name} only messages people who commented first, uses Meta login, and never asks for your password.` },
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

export default function LaterAlternative() {
  return (
    <PublicShell breadcrumbs={[{ name: "Later alternative", path: "/later-alternative" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />

      {/* Hero */}
      <header className="hero">
        <span className="pill">Official Meta API · no password needed</span>
        <h1>
          Later alternative with Instagram <em className="s">auto-DM</em> built in
        </h1>
        <p className="lede">
          Keep a visual calendar for Instagram, Facebook Pages and Threads, and auto-DM everyone who comments a keyword on your posts. Capture emails, track link clicks and export leads without a second subscription.
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

      {/* Why people look for a Later alternative */}
      <section>
        <div className="wrap">
          <div className="head">
            <h2>Why people look for a Later alternative</h2>
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
            <h2>{BRAND.name} vs Later</h2>
            <p>Later is a strong visual scheduler. {BRAND.name} keeps scheduling and adds comment-to-DM automation in one place. Here is an honest side-by-side.</p>
          </div>
          <div className={s.tableWrap} style={{ maxWidth: 920, marginInline: "auto" }}>
            <table className={s.table}>
              <thead>
                <tr className={s.tr}>
                  <th scope="col" className={s.th}>Feature</th>
                  <th scope="col" className={`${s.th} ${s.oursCol}`}>{BRAND.name}</th>
                  <th scope="col" className={s.th}>Later</th>
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
          <p className="small" style={{ textAlign: "center", marginTop: 16 }}>Later features and plans change over time. Check their site for current details. We do not list their prices here.</p>
        </div>
      </section>

      {/* Who should stay on Later */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <h2>Who should stay on Later</h2>
            <p>
              Stay on Later if Pinterest, TikTok or other networks they support are core to your workflow, you rely on their Link in Bio product end to end, or you only need scheduling with no comment-to-DM at all. Later is a mature planner; there is no reason to switch if automation is not on your roadmap.
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
            <h2>Later alternative questions</h2>
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
              <h2>Schedule like Later. <em className="s">Auto-DM every commenter.</em></h2>
              <p>Start free. No credit card. Connect Instagram in one tap.</p>
              <Link className="btn" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            </div>
            <Image sizes="(max-width: 960px) 100vw, 50vw" src="/landing/card-leads.webp" width={900} height={900} loading="lazy" alt="Two friends high-five next to a board of new leads" />
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 24 }}>
            <Link className={s.vlink} href="/">See the full product</Link>
          </p>
          <CompareAlternativesNav current="later" />
        </div>
      </section>
    </PublicShell>
  );
}
