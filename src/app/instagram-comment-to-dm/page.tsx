import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { withSocial } from "@/lib/page-metadata";
import { BRAND } from "@/lib/brand";
import { publisherRef } from "@/lib/tool-schema";
import { softwareOffers } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/instagram-comment-to-dm";
const title = `Instagram Comment-to-DM Automation for Creators | ${BRAND.name}`;
const description =
  "Send an automatic Instagram DM when someone comments your keyword, deliver the link, capture emails and retry failed sends. See the workflow.";

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
    title: "Connect your Instagram account",
    text: "Log in with Meta's own Instagram login. We never see your password, and you can disconnect at any time from the dashboard.",
  },
  {
    n: "2",
    title: "Pick a post or reel and a keyword",
    text: "Choose the post or reel you want to automate, then set a word such as GUIDE, LINK or PRICE. Match it exactly or anywhere in the comment.",
  },
  {
    n: "3",
    title: "Write the DM and the link",
    text: "Write the message your follower receives and add the link you want them to open. You can ask for an email before the link is delivered.",
  },
  {
    n: "4",
    title: "Comments trigger DMs automatically",
    text: "When someone comments your keyword, the reply goes out through the official Meta API, usually within a minute, day or night.",
  },
  {
    n: "5",
    title: "Pause or retry when you need to",
    text: "Switch a rule off with one tap, and failed sends are retried automatically within Meta's limits instead of being dropped silently.",
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
    text: "Not supported by Meta's API. Switching to Business or Creator is free and takes about a minute.",
  },
  {
    name: "Facebook Page and Threads",
    ok: false,
    text: "You can schedule posts to them today. Comment-to-DM rules for these channels are not part of Phase 1.",
  },
];

const useCases = [
  {
    no: "01 / Lead magnets",
    title: "Send a free guide or checklist",
    text: "Tell followers to comment GUIDE. They get the download link in a DM and their email becomes a lead you can follow up with.",
  },
  {
    no: "02 / Sales",
    title: "Share a price list or booking link",
    text: "A comment such as PRICE sends your menu, availability or booking page without you copying the same reply all day.",
  },
  {
    no: "03 / Launch",
    title: "Deliver a waitlist or product link",
    text: "Point a launch post or reel at a keyword, then send everyone the same link and track every click from one place.",
  },
  {
    no: "04 / Community",
    title: "Answer repeat questions",
    text: "Turn the questions you answer every week into keywords, so new followers get the same helpful reply in seconds.",
  },
];

const faqs = [
  {
    q: "How does Instagram comment-to-DM automation work?",
    a: "You connect an Instagram Business or Creator account, choose a post or reel and set a keyword. When someone comments that keyword, Poskoo sends them your message and link as a DM through the official Meta API, usually within a minute.",
  },
  {
    q: "Can I capture an email before sending the link?",
    a: "Yes. Add an email question to the rule and the link is only delivered after the follower replies with a valid email, so each conversation becomes a contact instead of a one-off reply.",
  },
  {
    q: "What happens if a DM fails to send?",
    a: "Failed sends are queued and retried automatically within Meta's rate limits. You see the status in the dashboard, so a temporary error does not silently lose a lead.",
  },
  {
    q: "Can I pause a comment-to-DM rule?",
    a: "Yes. Pause or switch off any rule in one tap. While a rule is paused it stops sending new DMs, and you can turn it back on whenever you want without rebuilding it.",
  },
  {
    q: "Which Meta accounts are supported?",
    a: "Instagram Business and Creator accounts are supported for comment-to-DM rules. Personal Instagram accounts are not allowed by Meta's API. Facebook Pages and Threads are supported for scheduling, but not for comment-to-DM automation in Phase 1.",
  },
  {
    q: "Is this allowed by Instagram?",
    a: "Yes, when it uses the official Meta API. Poskoo connects through Meta's login, never asks for your Instagram password, only messages people who commented first, and respects Meta's messaging limits.",
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
    "Email capture before the link",
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

export default function InstagramCommentToDmPage() {
  return (
    <PublicShell
      className={`${s.sched} ${s.pub}`}
      breadcrumbs={[{ name: "Instagram comment-to-DM", path: PATH }]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(appJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(faqJsonLd) }} />

      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Official Meta API &middot; no password needed</span>
          <p className="eyebrow">Instagram comment-to-DM</p>
          <h1>
            Instagram comment-to-DM automation <em className="s mark">that turns comments into leads</em>
          </h1>
          <p className="lede">
            Instagram comment-to-DM automation sends a direct message automatically when someone
            comments your keyword on a post or reel. {BRAND.name} delivers your link, can ask for an
            email first, and keeps retrying failed sends within Meta&apos;s limits.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">
              Create your free account <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link className="btn btn-line" href="/instagram-auto-dm">
              See the auto-DM overview
            </Link>
          </div>
          <p className="small">
            Already set up?{" "}
            <Link href="/app" className={s.vlink}>
              Open your comment-to-DM dashboard
            </Link>
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
            <p className="eyebrow">The workflow</p>
            <h2>How comment-to-DM <em className="s">runs end to end</em></h2>
            <p>
              One rule covers the whole path: the comment, the DM, the link, the email and the retry
              if something fails. Set it once and it keeps working on every new comment.
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
              <p className="eyebrow">Pauses and retries</p>
              <h2>You stay in control <em className="s">of every send</em></h2>
              <p>
                Pause a rule when a promotion ends or when you want to edit the message. While it is
                paused, no new DMs go out, and turning it back on takes one tap.
              </p>
              <p>
                When Meta returns a temporary error or a rate limit, the send is retried in the
                background instead of being lost. Each attempt is visible in the dashboard, so you can
                see what went out, what is waiting and what needs attention.
              </p>
              <p className="small">
                Prefer a hands-on demo?{" "}
                <Link href="/tools/instagram-comment-keyword-tester" className={s.vlink}>
                  test your comment keywords free
                </Link>{" "}
                before you connect an account.
              </p>
            </div>
            <div className="art">
              <Image
                sizes="(max-width: 960px) 100vw, 50vw"
                src="/landing/step-dm.webp"
                width={900}
                height={900}
                loading="lazy"
                alt="An automated Instagram DM with a link arriving on a follower's phone"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Supported accounts</p>
            <h2>Which Meta accounts <em className="s mark">work today</em></h2>
            <p>
              Comment-to-DM automation runs on Instagram accounts that Meta allows to use its
              messaging API. Here is exactly what is supported in Phase 1.
            </p>
          </div>
          <div className="cards">
            {accounts.map((account) => (
              <article key={account.name} className="pcard">
                <span className="no" style={{ color: account.ok ? "var(--poskoo-green)" : "var(--poskoo-muted)" }}>
                  {account.ok ? "Supported" : "Not supported yet"}
                </span>
                <h3>{account.name}</h3>
                <p>{account.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Use cases</p>
            <h2>What people use <em className="s">comment-to-DM for</em></h2>
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
            <p className="eyebrow">Questions</p>
            <h2>Instagram comment-to-DM questions</h2>
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
              <h2>Let your next post <em className="s">answer its own comments</em></h2>
              <p>Start free, connect Instagram and turn on your first keyword in a few minutes.</p>
              <div className="ctas">
                <Link className="btn" href="/signup">
                  Start free <span aria-hidden="true">&rarr;</span>
                </Link>
                <Link className="btn btn-line" href="/app">
                  Go to the dashboard
                </Link>
              </div>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-leads.webp"
              width={900}
              height={900}
              loading="lazy"
              alt="Two friends celebrating next to a board of new leads from automated Instagram DMs"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
