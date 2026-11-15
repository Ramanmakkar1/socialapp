import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";
import { publisherRef } from "@/lib/tool-schema";
import { softwareOffers } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import { AnimArt } from "@/components/AnimArt";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const PATH = "/instagram-dm-lead-generation";
const title = `Instagram DM Lead Generation: Comments to Leads | ${BRAND.name}`;
const description = `Instagram comment-to-DM turns comments into captured leads: keyword reply, private DM, optional email gate, link delivery, click tracking and CSV export.`;

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
});

const workflow = [
  {
    no: "01 / Comment",
    title: "Keyword comment",
    text: "A follower comments a word you picked, such as GUIDE or PRICE, on your post or reel. The keyword is the trigger, so only people who ask get the DM.",
  },
  {
    no: "02 / Public reply",
    title: "Public reply",
    text: "You can reply publicly under the comment with a short line such as “Sent you a DM!”. It stays visible to the feed and shows other commenters what to do.",
  },
  {
    no: "03 / Private DM",
    title: "Private DM",
    text: "Poskoo sends the direct message from your connected Instagram account using the official Meta API. It runs while you are offline and once per conversation.",
  },
  {
    no: "04 / Email gate",
    title: "Optional email gate",
    text: "Before the link goes out, the chat can ask for an email. The reply becomes a contact in your leads list instead of a one-off conversation.",
  },
  {
    no: "05 / Delivery",
    title: "Link delivery",
    text: "Your link, booking page or download is sent in the same thread. No passwords, no scraping and no extra chatbot tool to connect.",
  },
  {
    no: "06 / Tracking",
    title: "Click tracking",
    text: "Every tracked link shows whether the lead opened it, so you can see which posts and keywords actually send traffic and which need a new angle.",
  },
  {
    no: "07 / Export",
    title: "Lead export",
    text: "All captured contacts live in your Poskoo leads list and can be exported as CSV for your email tool, CRM or follow-up sequence.",
  },
];

const compare: [string, string, string][] = [
  ["Response speed", "As fast as you can type", "Usually within a minute, day or night"],
  ["Coverage", "Only while you are online", "Every matching comment"],
  ["Lead capture", "Copy details by hand", "Email captured in the chat"],
  ["Link tracking", "Guess which link worked", "Clicks tracked per campaign"],
  ["Lead export", "Retype into a sheet", "CSV export from your leads list"],
  ["Best for", "A handful of replies", "Posts with hundreds of comments"],
];

const checklist = [
  {
    no: "01",
    title: "Switch to a Business or Creator account",
    text: "Meta only allows comment-to-DM automation on a Business or Creator account. The switch is free and takes about a minute in the Instagram app.",
  },
  {
    no: "02",
    title: "Connect Instagram through Meta login",
    text: "Connect the account in Poskoo. You approve access on Meta's own screen; Poskoo never asks for or stores your Instagram password.",
  },
  {
    no: "03",
    title: "Pick a keyword and a post",
    text: "Choose one clear word and the post or reel it belongs to. Short, easy-to-spell words work best in a caption or on-screen text.",
  },
  {
    no: "04",
    title: "Write the DM and the link",
    text: "Write the private message, add your link, and decide whether to ask for an email first. Keep the promise in the DM identical to the comment trigger.",
  },
  {
    no: "05",
    title: "Test it on a live comment",
    text: "Comment your keyword yourself, check the public reply, the DM, the email step and the tracked link, then check the contact appears in your leads list.",
  },
  {
    no: "06",
    title: "Export and follow up",
    text: "Once the rule is running, review clicks and captured leads, then export the list or move it into your follow-up tool.",
  },
];

const faqs = [
  {
    q: "What is Instagram DM lead generation?",
    a: "It turns Instagram comments and replies into leads. When someone comments a keyword, Poskoo sends them a private DM, optionally asks for their email, delivers your link and records the click so the conversation becomes a contact you can follow up with.",
  },
  {
    q: "How does a keyword comment become a DM?",
    a: "You choose a post and a keyword. When a follower comments that exact word, Poskoo matches the comment and sends your DM from the connected account through Meta's official API. It can reply publicly too, so the thread stays visible.",
  },
  {
    q: "Do I need an email gate?",
    a: "No, it is optional. You can send the link straight away, or ask for an email first when the goal is a contact list. Either way the DM, link and click are tracked in Poskoo.",
  },
  {
    q: "Can I export the leads?",
    a: "Yes. Captured contacts appear in your Poskoo leads list and can be exported as CSV, so you can follow up in your email tool or CRM.",
  },
  {
    q: "Is comment-to-DM automation allowed on Instagram?",
    a: "Yes, when it uses Meta's official API and only messages people who commented or messaged first. Poskoo connects through Meta's login, never asks for your password and respects Meta's messaging limits.",
  },
  {
    q: "How quickly can I set it up?",
    a: "You can connect Instagram, choose a keyword and send a test DM in a few minutes. The first step is a free Poskoo account, and you can start with one rule on one post before rolling it out.",
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
    "Instagram keyword comment triggers",
    "Public comment replies",
    "Private DM delivery",
    "Optional email capture",
    "Link click tracking",
    "Lead list and CSV export",
  ],
  // Paid offers only once Pro/Agency checkout is live, matching /pricing.
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

export default function InstagramDmLeadGenerationPage() {
  return (
    <PublicShell
      className={`${s.sched} ${s.pub}`}
      breadcrumbs={[{ name: "Instagram DM lead generation", path: PATH }]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(appJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(faqJsonLd) }} />

      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Official Meta API · no password needed</span>
          <p className="eyebrow">Instagram DM lead generation</p>
          <h1>
            Instagram comment-to-DM <em className="s mark">turns comments into captured leads</em>
          </h1>
          <p className="lede">
            Instagram comment-to-DM lead generation works like this: a follower comments your keyword,
            {" "}{BRAND.name} replies in public, sends a private DM with your link, can ask for their email first
            and records every click. Each comment becomes a contact in your leads list, not just a notification.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">
              Start free <span aria-hidden="true">→</span>
            </Link>
            <Link className="btn btn-line" href="/instagram-dm-automation">
              See DM automation
            </Link>
          </div>
          <p className="small">
            <Link href="/tools/instagram-comment-to-dm-calculator" className={s.vlink}>
              Estimate your comment-to-DM results free
            </Link>
          </p>
        </div>
        <div className="hero-art">
          <AnimArt
            name="card-leads"
            label="A creator celebrating as Instagram comments turn into private messages and captured leads"
          />
        </div>
      </header>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">The workflow</p>
            <h2>
              From a keyword comment to <em className="s">a lead in your list</em>
            </h2>
            <p>
              Seven steps run in order every time someone comments. You set them once and they keep
              working while you create.
            </p>
          </div>
          <div className="cards">
            {workflow.map((step) => (
              <article key={step.title} className="pcard">
                <span className="no">{step.no}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Comparison</p>
            <h2>
              Manual replies vs <em className="s mark">comment-to-DM lead generation</em>
            </h2>
            <p>Both are allowed. The difference is how much of your day the follow-up takes.</p>
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
                      {manual}
                    </td>
                    <td className={`${s.td} ${s.oursCol}`} style={{ fontWeight: 700 }}>
                      {ours}
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
          <div className="head">
            <p className="eyebrow">Implementation checklist</p>
            <h2>
              Set up your first rule <em className="s">in six steps</em>
            </h2>
            <p>
              Most of the work is choosing one keyword and one post. The test on a live comment is the
              most important step.
            </p>
          </div>
          <div className="cards">
            {checklist.map((item) => (
              <article key={item.title} className="pcard">
                <span className="no">{item.no}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Before you launch</p>
              <h2>
                Write the comment and the DM <em className="s">as one promise</em>
              </h2>
              <p>
                Say exactly what the DM will contain. If the caption offers a template, the DM should
                deliver that template and nothing else. Matching the promise keeps trust high and makes
                the email step easier to accept.
              </p>
              <p className="small">
                Want message wording to copy? Browse{" "}
                <Link className={s.vlink} href="/instagram-auto-dm/templates">
                  auto-DM templates
                </Link>{" "}
                or see the broader{" "}
                <Link className={s.vlink} href="/instagram-dm-automation">
                  Instagram DM automation guide
                </Link>
                . Start with{" "}
                <Link className={s.vlink} href="/instagram-auto-dm">
                  comment-to-DM rules
                </Link>
                , then check captured contacts in{" "}
                <Link className={s.vlink} href="/app/leads">
                  your leads list
                </Link>
                .
              </p>
            </div>
            <div className="art">
              <AnimArt
                name="demo-dm"
                label="A phone showing a keyword comment, a public reply and a private DM with a link"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram DM lead generation questions</h2>
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
              <h2>
                Turn your next comment <em className="s">into a lead</em>
              </h2>
              <p>Start free, connect Instagram and switch on your first keyword in minutes.</p>
              <Link className="btn" href="/signup">
                Start free <span aria-hidden="true">→</span>
              </Link>
            </div>
            <AnimArt
              name="card-dm"
              label="A relaxed creator while DMs and new leads fly out of his phone"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
