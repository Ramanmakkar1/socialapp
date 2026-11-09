import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";
import { SOFTWARE_APPLICATION_OFFERS } from "@/lib/plans";

const PATH = "/instagram-dm-automation";
const title = `Instagram DM Automation: Turn Comments Into Leads | ${BRAND.name}`;
const description = `Instagram DM automation replies to comment keywords, Story replies and incoming DMs, captures emails and sends AI answers. See how ${BRAND.name} works.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
};

const useCases = [
  {
    no: "01 / Comments",
    title: "Comment keyword triggers",
    text: "Tell followers to comment a word such as GUIDE or LINK on a post or reel. Every comment that matches your keyword gets your DM automatically.",
  },
  {
    no: "02 / Stories",
    title: "Story reply triggers",
    text: "When someone replies to your Story with your keyword, the automation sends the DM for you, even if you are offline.",
  },
  {
    no: "03 / Leads",
    title: "Email and phone capture",
    text: "Ask for an email or phone number in the chat before you send the link, so each conversation becomes a contact you can follow up with.",
  },
  {
    no: "04 / Replies",
    title: "AI replies",
    text: "When people ask a question in the DM, AI answers in your voice and can share your link, keeping the conversation moving without manual typing.",
  },
];

const compare: [string, string, string][] = [
  ["Response speed", "As fast as you can type", "Sent in seconds, day or night"],
  ["Coverage", "Only while you are online", "Every matching comment and Story reply"],
  ["Lead capture", "Copy details by hand", "Email and phone captured in the chat"],
  ["Follow-up questions", "You write each reply", "AI replies in your voice"],
  ["Best for", "A handful of replies", "Posts with hundreds of comments"],
];

const faqs = [
  {
    q: "What does Instagram DM automation do?",
    a: "It sends a direct message automatically when someone comments a keyword on your post or reel, replies to your Story with a keyword, or asks a question in a DM. Poskoo handles the reply, can capture an email or phone number, and can answer follow-up questions with AI.",
  },
  {
    q: "How do comment keyword triggers work?",
    a: "You choose a post or reel, set a keyword such as GUIDE and write the message. When a follower comments that keyword, Poskoo sends the DM from your connected Instagram account using the official Meta API.",
  },
  {
    q: "Can Poskoo reply to Instagram Story replies?",
    a: "Yes. If someone replies to your Story with your keyword, the automation sends the same kind of DM it sends for post comments, so you do not have to watch your inbox all day.",
  },
  {
    q: "Can it capture emails and phone numbers?",
    a: "Yes. You can ask for an email or phone number in the chat before sharing your link, so every automated conversation can become a lead instead of a one-off reply.",
  },
  {
    q: "Does Instagram DM automation break the rules?",
    a: "Not when it uses the official Meta API. Poskoo connects through Meta's own login, never asks for your Instagram password, only messages people who commented or replied first, and respects Meta's messaging limits.",
  },
  {
    q: "Do I need an Instagram Business or Creator account?",
    a: "Yes. Meta only allows DM automation on Business or Creator accounts. Switching is free and takes about a minute in the Instagram app.",
  },
];

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: BRAND.name,
  url: `${BRAND.url}${PATH}`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description,
  featureList: [
    "Instagram comment keyword triggers",
    "Instagram Story reply triggers",
    "Email and phone capture in DMs",
    "AI replies in your voice",
    "Click and lead tracking",
  ],
  offers: SOFTWARE_APPLICATION_OFFERS,
  publisher: { "@type": "Organization", name: BRAND.company },
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

function Cell({ v }: { v: string }) {
  return <>{v}</>;
}

export default function InstagramDmAutomationPage() {
  return (
    <PublicShell breadcrumbs={[{ name: "Instagram DM automation", path: PATH }]}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld(appJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld(faqJsonLd) }}
      />

      <header className="hero">
        <span className="pill">Official Meta API · no password needed</span>
        <p className="eyebrow">Instagram DM automation</p>
        <h1>
          Instagram DM automation that <em className="s mark">turns comments into leads</em>
        </h1>
        <p className="lede">
          Instagram DM automation sends a direct message for you when someone comments a keyword on
          your post or reel, replies to your Story, or messages you. {BRAND.name} replies in seconds,
          captures their email and lets AI handle the follow-up questions.
        </p>
        <div className="ctas">
          <Link className="btn btn-dark" href="/signup">
            Start free <span aria-hidden="true">→</span>
          </Link>
          <Link className="btn btn-line" href="/instagram-auto-dm">
            See how auto-DM works
          </Link>
        </div>
        <p className="small">
          <Link href="/tools/instagram-comment-keyword-tester" className={s.vlink}>
            Test your comment keywords free
          </Link>
        </p>
        <div className="hero-art" style={{ maxWidth: 640 }}>
          <Image
            sizes="(max-width: 960px) 100vw, 640px"
            src="/landing/card-dm.webp"
            width={900}
            height={900}
            priority
            alt="A creator relaxing while automated DMs fly from their phone to new followers"
          />
        </div>
      </header>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">What it does</p>
            <h2>What Instagram DM automation <em className="s">handles for you.</em></h2>
            <p>
              It does the repetitive replies: matching keywords, sending your link, asking for an
              email and answering common questions. You set the rules once and the DMs keep going
              while you create.
            </p>
          </div>
          <div className="cards">
            {useCases.map((useCase) => (
              <article key={useCase.title} className="pcard">
                <span className="no">{useCase.no}</span>
                <h3>{useCase.title}</h3>
                <p>{useCase.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Comparison</p>
            <h2>Manual replies vs <em className="s mark">{BRAND.name} automation</em></h2>
            <p>Both are allowed. The difference is how much of your day the reply work takes.</p>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th className={s.th}>Feature</th>
                  <th className={s.th}>Manual replies</th>
                  <th className={`${s.th} ${s.oursCol}`} style={{ color: "var(--poskoo-ink)" }}>
                    {BRAND.name} automation
                  </th>
                </tr>
              </thead>
              <tbody>
                {compare.map(([label, manual, ours]) => (
                  <tr key={label} className={s.tr}>
                    <td className={s.td}>{label}</td>
                    <td className={s.td} style={{ color: "var(--poskoo-muted)" }}>
                      <Cell v={manual} />
                    </td>
                    <td className={`${s.td} ${s.oursCol}`} style={{ fontWeight: 700 }}>
                      <Cell v={ours} />
                    </td>
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
              <h2>Is Instagram DM automation <em className="s">safe?</em></h2>
              <p>
                Yes, when it runs on the official Meta API. {BRAND.name} connects through Meta&apos;s
                own login, so we never see or store your Instagram password. We only message people
                who commented or replied first, and we respect Meta&apos;s rate limits and the
                messaging window.
              </p>
              <p className="small">
                Want the full setup walkthrough?{" "}
                <Link className={s.vlink} href="/help/auto-dm-instagram-comments">
                  Read the comment-to-DM setup guide
                </Link>
                .
              </p>
            </div>
            <div className="art">
              <Image
                sizes="(max-width: 960px) 100vw, 50vw"
                src="/landing/problem.webp"
                width={900}
                height={900}
                loading="lazy"
                alt="A tired creator under a pile of chat notifications before automating Instagram replies"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram DM automation questions</h2>
          </div>
          <div className="faq">
            {faqs.map((faq) => (
              <details key={faq.q}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Let your next post <em className="s">answer its own comments.</em></h2>
              <p>Start free, connect Instagram and turn on your first keyword in minutes.</p>
              <Link className="btn" href="/signup">
                Start free <span aria-hidden="true">→</span>
              </Link>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-leads.webp"
              width={900}
              height={900}
              loading="lazy"
              alt="Two friends celebrating next to a board of new leads"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
