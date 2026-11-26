import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";
import { softwareOffers } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import { isFeatureReadyNow } from "@/lib/featureReadinessNow";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { PLATFORMS_ANSWER } from "@/lib/platform-support";
import { AnimArt } from "@/components/AnimArt";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const PATH = "/ai-social-media-manager";
const title = `AI Social Media Manager: Captions, DMs & Leads | ${BRAND.name}`;
const description = `An AI social media manager that drafts caption ideas, adapts them per platform, suggests DM replies, captures leads and shows analytics in Poskoo.`;

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
});

const workflow = [
  {
    n: "01",
    art: "feat-ai" as const,
    title: "Generate caption ideas in the composer",
    text: "Write a short brief in the post composer and Poskoo suggests caption ideas in your brand voice. You edit the draft, keep the parts you like and schedule it yourself.",
  },
  {
    n: "02",
    art: "multichannel" as const,
    title: "Customise the post per platform",
    text: "One post can go to several channels, each with its own caption and media. Adjust the wording and length for Instagram, Facebook, Threads and the other networks you connect.",
  },
  {
    n: "03",
    art: "feat-dm" as const,
    title: "Suggest AI DM replies",
    text: "When someone messages you, Poskoo can draft a reply from the instructions you save. AI replies stay switched off until you turn them on, and you can pause them at any time.",
  },
  {
    n: "04",
    art: "feat-leads" as const,
    title: "Capture lead details",
    text: "Auto-DM rules can ask for an email before sending your link, then save the contact with the post and keyword that started the conversation. Export the list to CSV.",
  },
  {
    n: "05",
    art: "analytics" as const,
    title: "Review analytics",
    text: "See reach, engagement, link clicks, DMs and captured leads per post and per Auto-DM rule, so you can tell which content and replies bring in contacts.",
  },
];

const comparison = [
  {
    task: "Writing captions",
    manual: "Start from a blank box for every post and rewrite the same idea for each network.",
    poskoo: "Caption ideas in the composer, then a separate caption per platform before you schedule.",
  },
  {
    task: "Planning and publishing",
    manual: "Keep a spreadsheet or notes app, then copy each post into every app by hand.",
    poskoo: "One week or month calendar with a publishing queue and a clear published or failed status.",
  },
  {
    task: "Replying to DMs",
    manual: "Watch the inbox and type each reply yourself, often hours after the message arrived.",
    poskoo: "AI reply suggestions from your saved instructions, with AI replies off until you enable them.",
  },
  {
    task: "Collecting leads",
    manual: "Ask for an email in the chat, then paste it into a spreadsheet later.",
    poskoo: "Auto-DM rules capture the email and save the contact with its source post and keyword.",
  },
  {
    task: "Measuring results",
    manual: "Open each platform's insights and rebuild the numbers in a sheet.",
    poskoo: "Reach, engagement, clicks, DMs and leads in one dashboard, with CSV export.",
  },
];

const faqs = [
  {
    q: "What is an AI social media manager?",
    a: "An AI social media manager is a tool that helps you plan, write and measure social posts with AI assistance. Poskoo suggests caption ideas, adapts a post per platform, drafts DM replies and captures leads, while you stay in control of what gets published.",
  },
  {
    q: "Does Poskoo post automatically without me?",
    a: "No. Poskoo publishes the posts you schedule at the time you choose, through the official platform APIs. It does not invent or publish posts on its own, and AI replies stay switched off until you enable them.",
  },
  {
    q: "Which AI features are included?",
    a: "Poskoo generates caption ideas in the composer and suggests DM message ideas and replies from the instructions you save. AI caption ideas need an AI key configured on the workspace, and AI replies also need to be switched on before they send anything.",
  },
  {
    q: "Can I customise a post for each platform?",
    a: "Yes. A post can target several connected channels, and each channel keeps its own caption and media, so the Instagram version can differ from the Facebook or Threads version before it is scheduled.",
  },
  {
    q: "How does lead capture work?",
    a: "An Auto-DM rule replies to a keyword comment or DM, can ask for an email before sending your link, and saves the contact with the post and keyword that triggered it. You can review and export the contacts as a CSV.",
  },
  {
    q: "Which platforms does Poskoo support?",
    a: PLATFORMS_ANSWER,
  },
];

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${BRAND.canonicalUrl}${PATH}#webpage`,
  url: `${BRAND.canonicalUrl}${PATH}`,
  name: title,
  description,
  isPartOf: { "@id": `${BRAND.canonicalUrl}#website` },
  about: { "@id": `${BRAND.canonicalUrl}${PATH}#software` },
};

export default async function AiSocialMediaManagerPage() {
  const ai = await isFeatureReadyNow("ai");
  const aiReplies = await isFeatureReadyNow("ai_replies");

  const appJsonLd = {
    ...toolSoftwareJsonLd({
      name: `${BRAND.name} AI social media manager`,
      description,
      url: `${BRAND.canonicalUrl}${PATH}`,
    }),
    "@id": `${BRAND.canonicalUrl}${PATH}#software`,
    featureList: [
      ...(ai ? ["AI caption ideas in the post composer"] : []),
      "Per-platform captions and media for one post",
      ...(aiReplies ? ["AI DM reply suggestions from saved instructions"] : []),
      "Auto-DM keyword rules with email lead capture",
      "Reach, engagement, clicks, DMs and leads analytics",
      "CSV export of captured contacts",
    ],
    offers: softwareOffers(planReadiness()),
  };

  return (
    <PublicShell className={s.sched} breadcrumbs={[{ name: "AI social media manager", path: PATH }]}>
      {[appJsonLd, webPageJsonLd, faqJsonLd(faqs)].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(data) }}
        />
      ))}

      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Caption ideas · DM replies · Lead capture</span>
          <p className="eyebrow">AI social media manager</p>
          <h1>An AI social media manager that helps you plan, reply and capture leads</h1>
          <p className="lede">
            Poskoo is an AI social media manager for scheduling and Instagram DMs. It suggests caption ideas in the
            composer, lets you customise each post per platform, drafts DM replies, captures lead details and shows
            the analytics, all in one workspace.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            <Link className="btn btn-line" href="/features">See all features</Link>
          </div>
          <p className="small">Free plan included. No credit card needed.</p>
        </div>
        <div className="hero-art"><AnimArt name="feat-ai" label="An AI helper drafts a caption idea beside a phone while a creator reviews it" /></div>
      </header>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">The workflow</p>
            <h2>How does the AI social media manager workflow work?</h2>
            <p>
              Five steps from an idea to a measured result. You approve every post and every reply, and nothing is
              published or sent by AI on its own.
            </p>
          </div>
          <div className="howGrid">
            {workflow.map((step) => (
              <article key={step.n} className="howStep">
                <div className="howArt"><AnimArt name={step.art} /></div>
                <span className="howNo">Step {step.n}</span>
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
            <p className="eyebrow">Manual vs Poskoo</p>
            <h2>How does Poskoo compare with a manual workflow?</h2>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th className={s.th} scope="col">Task</th>
                  <th className={s.th} scope="col">Manual workflow</th>
                  <th className={s.th} scope="col">With Poskoo</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.task}>
                    <td className={s.td} style={{ fontWeight: 600 }}>{row.task}</td>
                    <td className={s.td}>{row.manual}</td>
                    <td className={s.td}>{row.poskoo}</td>
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
            <p className="eyebrow">Related</p>
            <h2>Plan posts, automate replies, then measure what worked</h2>
          </div>
          <nav className="relChips" aria-label="Related Poskoo pages">
            <span>Keep going</span>
            <Link href="/features">All features</Link>
            <Link href="/social-media-scheduler">Social media scheduler</Link>
            <Link href="/instagram-dm-lead-generation">Instagram DM lead generation</Link>
            <Link href="/pricing">Plans and pricing</Link>
          </nav>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">AI social media manager FAQs</p>
            <h2>AI features, publishing and lead capture</h2>
          </div>
          <div className="faq">
            {faqs.map((faq, index) => (
              <details key={faq.q} open={index === 0}>
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
              <h2>Draft, schedule and <em className="s">capture leads</em> in one place</h2>
              <p>{ai ? "Start free, write your first post with AI ideas, and see the replies and leads land in one dashboard." : "Start free, write and schedule your first post, and see the replies and leads land in one dashboard."}</p>
              <Link className="btn" href="/signup">Start free <span aria-hidden="true">→</span></Link>
              {" "}
              <Link className="btn" href="/pricing">Compare plans</Link>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
