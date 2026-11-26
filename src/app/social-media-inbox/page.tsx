import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";
import { softwareOffers } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import { faqJsonLd, ldJson, publisherRef } from "@/lib/tool-schema";
import { isFeatureReadyNow } from "@/lib/featureReadinessNow";
import { AnimArt } from "@/components/AnimArt";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const PATH = "/social-media-inbox";
const title = "Social Media Inbox: All Comments & DMs in One Place";
const description =
  "A social media inbox brings every comment and DM from all your channels into one shared place, with AI suggestions, keyword automation and lead capture.";

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
});

const features = [
  {
    no: "01 / Unified",
    title: "Every comment and DM in one inbox",
    text: "Instagram, Facebook and Threads conversations land in the same shared inbox, so you no longer jump between apps to find a question, a lead or a complaint.",
    art: "feat-dm" as const,
    alt: "A creator's phone gathers comments and DMs into one inbox",
  },
  {
    no: "02 / AI replies",
    title: "Reply suggestions in your voice",
    text: "For each conversation Poskoo drafts a reply you can edit and send. Suggestions use the message context, so you answer faster without sounding like a robot.",
    art: "feat-ai" as const,
    alt: "An AI helper drafts a reply suggestion beside a chat",
  },
  {
    no: "03 / Automation",
    title: "Keyword automation handles the repeat questions",
    text: "When someone comments or DMs a keyword such as PRICE or LINK, the automation sends your reply and link automatically, day or night.",
    art: "card-dm" as const,
    alt: "Automated DMs fly out of a phone to followers who commented",
  },
  {
    no: "04 / Email capture",
    title: "Turn conversations into email contacts",
    text: "Ask for an email in the chat before you send the link, then export your contacts. Every reply becomes a lead you can follow up with.",
    art: "card-leads" as const,
    alt: "A creator collects new leads in a contact list",
  },
  {
    no: "05 / Click tracking",
    title: "See which links get clicked",
    text: "Track clicks on every link you send from the inbox, so you know which keywords, posts and DM messages actually drive traffic and sales.",
    art: "analytics" as const,
    alt: "A creator reviews click and reply analytics on a growing chart",
  },
];

const faqs = [
  {
    q: "What is a social media inbox?",
    a: "A social media inbox is one place where you read and answer every comment and direct message from all your connected social accounts. Instead of opening Instagram, Facebook and Threads separately, your team works from one shared list.",
  },
  {
    q: "Which channels does the Poskoo inbox cover?",
    a: "Poskoo brings Instagram comments and DMs, Facebook Page comments and messages, and Threads replies into one inbox. You connect each account once through the official Meta login, and no passwords are stored.",
  },
  {
    q: "How do AI reply suggestions work?",
    a: "When you open a conversation, Poskoo drafts a suggested reply from the message context. You can edit the wording, change the tone or ignore it and write your own. Nothing is sent until you press send.",
  },
  {
    q: "Can automation reply while I am offline?",
    a: "Yes. Keyword rules run on the official platform APIs, so a comment or DM that matches your keyword gets your message and link even at night or at the weekend. You can pause any rule at any time.",
  },
  {
    q: "Does the inbox capture emails and track clicks?",
    a: "Yes. You can ask for an email in the chat before sharing a link, then export the contact list. Poskoo also tracks clicks on the links you send, so you can see which conversations turn into visits.",
  },
  {
    q: "Is the inbox included in my plan?",
    a: "The shared inbox is part of the Poskoo workspace alongside scheduling and auto-DM. See the pricing page for the limits on connected accounts, contacts and automation rules in each plan.",
  },
];

const faqLd = faqJsonLd(faqs);

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: `${BRAND.name} Social Media Inbox`,
  url: `${BRAND.canonicalUrl}${PATH}`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description,
  featureList: [
    "Unified Instagram, Facebook and Threads comments and DMs",
    "AI reply suggestions",
    "Keyword automation for comments and DMs",
    "Email capture in conversations",
    "Link click tracking",
  ],
  offers: softwareOffers(planReadiness()),
  publisher: publisherRef(),
};

export default async function SocialMediaInboxPage() {
  const ai = await isFeatureReadyNow("ai");
  const appLd = {
    ...appJsonLd,
    featureList: appJsonLd.featureList.filter((f) => ai || f !== "AI reply suggestions"),
  };

  return (
    <PublicShell
      className={`${s.sched} ${s.pub}`}
      breadcrumbs={[{ name: "Social media inbox", path: PATH }]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(appLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqLd) }} />

      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">One shared inbox · Official platform APIs</span>
          <p className="eyebrow">Social media inbox</p>
          <h1>
            A social media inbox for <em className="s mark">every comment and DM</em>
          </h1>
          <p className="lede">
            A social media inbox is one place where you read and answer every comment and direct
            message from all your connected accounts. {BRAND.name} brings Instagram, Facebook and
            Threads conversations into one shared list, then helps you reply faster with AI
            suggestions and keyword automation.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/app/inbox">
              Open the inbox <span aria-hidden="true">→</span>
            </Link>
            <Link className="btn btn-line" href="/instagram-dm-automation">
              See DM automation
            </Link>
          </div>
          <p className="small">
            New here?{" "}
            <Link href="/help" className={s.vlink}>
              Read the help center
            </Link>{" "}
            or{" "}
            <Link href="/pricing" className={s.vlink}>
              compare plans
            </Link>
            .
          </p>
        </div>
        <div className="hero-art">
          <AnimArt
            name="demo-dm"
            label="A comment sends a paper-plane DM with a link to a happy follower, who is saved as a new lead"
          />
        </div>
      </header>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">What it does</p>
            <h2>
              Everything your team needs to <em className="s">answer at speed</em>
            </h2>
            <p>
              The inbox is where conversations, automation and leads meet. Read a message, send a
              suggested reply, let a keyword rule run, and keep the contact for later.
            </p>
          </div>
          <div className="cards">
            {features.map((feature) => (
              <article key={feature.title} className="pcard">
                <span className="no">{feature.no}</span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
                <div style={{ marginTop: 16 }}>
                  <AnimArt name={feature.art} label={feature.alt} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Why it matters</p>
              <h2>
                Answer in minutes, <em className="s">not days</em>
              </h2>
              <p>
                Comments and DMs are where buying questions arrive. When they sit in three apps and
                an overfull notification badge, the fastest reply wins the customer. One inbox keeps
                the queue visible, assigns every conversation and makes sure nothing is answered
                twice.
              </p>
              <p>
                Pair it with{" "}
                <Link className={s.vlink} href="/instagram-dm-automation">
                  Instagram DM automation
                </Link>{" "}
                and{" "}
                <Link className={s.vlink} href="/app/inbox">
                  the live inbox
                </Link>{" "}
                so people get an answer even when your team is asleep.
              </p>
              <Link className="btn btn-dark" href="/app/inbox">
                Try the inbox
              </Link>
            </div>
            <div className="art">
              <AnimArt name="features" label="A creator points at an open toolbox of calendar, chat, mail, chart and link tools" />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Social media inbox questions</h2>
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
                Stop hunting across apps. <em className="s">Start one inbox.</em>
              </h2>
              <p>
                Connect your accounts, let AI draft the first reply and keep every lead in one
                place. Start free on {BRAND.name}.
              </p>
              <div className="ctas">
                <Link className="btn" href="/signup">
                  Start free <span aria-hidden="true">→</span>
                </Link>
                <Link className="btn btn-line" href="/pricing">
                  See pricing
                </Link>
              </div>
            </div>
            <AnimArt name="card-leads" label="Two friends high-five next to a board of contacts with check marks and a rising chart" />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
