import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";
import { softwareOffers } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import { faqJsonLd, ldJson, publisherRef } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";
import { CompareNote } from "@/components/CompareNote";
import { CompareAlternativesNav } from "@/components/CompareAlternativesNav";
import { LIVE_PLATFORMS_TEXT, PLATFORMS_ANSWER } from "@/lib/platform-support";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const PATH = "/social-media-scheduler-comparison";
const title = "Social Media Scheduler Comparison: Free Plans | Poskoo";
const description =
  "Compare social media schedulers: Poskoo plans and auto-publishes to Instagram, Facebook, Threads, YouTube, LinkedIn, Bluesky and Mastodon, with free plan.";

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
});

const platformRows = [
  {
    feature: "Week and month calendar",
    instagram: "Yes",
    facebook: "Yes",
    threads: "Yes",
  },
  {
    feature: "Media you can schedule",
    instagram: "Photos, video, carousels and Stories",
    facebook: "Text, one photo, an album of 2–10 photos, or one video",
    threads: "Text up to 500 characters, one image or one video",
  },
  {
    feature: "Publishing",
    instagram: "Auto-publish with published or failed status and retry",
    facebook: "Auto-publish with published or failed status and retry",
    threads: "Auto-publish with published or failed status and retry",
  },
  {
    feature: "Instagram comment-to-DM",
    instagram: "Yes — keyword comment triggers a DM",
    facebook: "Not available",
    threads: "Not available",
  },
];

const competitorRows = [
  { feature: "Platforms you can schedule", poskoo: LIVE_PLATFORMS_TEXT, buffer: "Check the provider", later: "Check the provider", hootsuite: "Check the provider" },
  { feature: "Week and month calendar", poskoo: "Yes", buffer: "Check the provider", later: "Check the provider", hootsuite: "Check the provider" },
  { feature: "Photos, video and carousels", poskoo: "Yes", buffer: "Check the provider", later: "Check the provider", hootsuite: "Check the provider" },
  { feature: "Publishing status and retry", poskoo: "Yes", buffer: "Check the provider", later: "Check the provider", hootsuite: "Check the provider" },
  { feature: "Instagram comment-to-DM", poskoo: "Yes", buffer: "Check the provider", later: "Check the provider", hootsuite: "Check the provider" },
  { feature: "Free plan", poskoo: "Yes — 2 accounts, 10 posts / month", buffer: "Check the provider", later: "Check the provider", hootsuite: "Check the provider" },
];

const workflows = [
  {
    title: "Instagram comment-to-DM",
    text: "You get comments on posts and want an automatic reply in the DMs. Poskoo turns a keyword comment into a DM through the official Instagram API.",
    links: [
      { label: "Instagram auto-DM", href: "/instagram-auto-dm" },
      { label: "ManyChat alternative", href: "/manychat-alternative" },
    ],
  },
  {
    title: "Meta-only scheduling",
    text: "You only run Instagram, Facebook Pages and Threads and do not need a separate inbox, ads or analytics tool. Poskoo covers those three from one calendar.",
    links: [
      { label: "Meta Business Suite alternative", href: "/meta-business-suite-alternative" },
      { label: "Instagram scheduler", href: "/instagram-scheduler" },
    ],
  },
  {
    title: "Multi-platform publishing",
    text: "You post to several networks and want one queue instead of switching apps. Compare Poskoo with general schedulers before you move.",
    links: [
      { label: "Buffer alternative", href: "/buffer-alternative" },
      { label: "Metricool alternative", href: "/metricool-alternative" },
      { label: "Hootsuite alternative", href: "/hootsuite-alternative" },
    ],
  },
  {
    title: "Link-in-bio",
    text: "You need one link your audience can tap to reach every destination. Poskoo includes an Instagram link-in-bio page next to the scheduler.",
    links: [
      { label: "Instagram link-in-bio", href: "/instagram-link-in-bio" },
      { label: "Linktree alternative", href: "/linktree-alternative" },
    ],
  },
  {
    title: "Schedule from an AI assistant",
    text: "You write posts with ChatGPT, Claude or Cursor and want them in a real publishing queue. Poskoo's MCP server lets the assistant schedule them; influence.so also offers one.",
    links: [
      { label: "Influence.so alternative", href: "/influence-alternative" },
      { label: "Schedule posts with Claude", href: "/schedule-posts-with-claude" },
    ],
  },
  {
    title: "Analytics",
    text: "You want to see how scheduled posts perform, not just that they published. Compare Poskoo's reporting with an analytics-first scheduler.",
    links: [
      { label: "Metricool alternative", href: "/metricool-alternative" },
      { label: "Poskoo pricing", href: "/pricing" },
    ],
  },
];

const comparisonLinks = workflows
  .flatMap((workflow) => workflow.links)
  .filter((link, i, all) => all.findIndex((item) => item.href === link.href) === i);

const faqs = [
  {
    q: "What does this social media scheduler comparison cover?",
    a: `It compares the scheduling features Poskoo supports across ${LIVE_PLATFORMS_TEXT}: the calendar, the media you can schedule, auto-publishing, and Instagram comment-to-DM. Competitor details are marked “Check the provider” where we have not verified them.`,
  },
  {
    q: "Which platforms can I schedule in one place?",
    a: PLATFORMS_ANSWER,
  },
  {
    q: "Which platforms support Instagram comment-to-DM?",
    a: "Instagram comment-to-DM works on Instagram posts, reels and carousels, and through Story replies. Facebook Pages and Threads scheduling do not include comment-to-DM.",
  },
  {
    q: "Does Poskoo publish posts automatically?",
    a: "Yes. The publishing worker sends each due post through the official platform API and records a published or failed status. If a post fails, you can fix the cause and retry it.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. Every account starts on the $0 Free plan with 2 social accounts and 10 scheduled posts per month. No credit card is needed to sign up.",
  },
  {
    q: "How do I choose a social media scheduler?",
    a: "Start with the platforms you actually post to, then check the workflow you need most: comment-to-DM, a shared calendar, link-in-bio or analytics. Pick the tool that covers that workflow without forcing you to pay for channels you do not use.",
  },
  {
    q: "Does Poskoo support multiple platforms?",
    a: `Yes. Poskoo schedules posts to ${LIVE_PLATFORMS_TEXT} from one calendar and one publishing queue.`,
  },
  {
    q: "Which scheduler is best for Instagram comment-to-DM?",
    a: "Choose a scheduler that runs comment-to-DM on the official Instagram API and lets you pause rules. Poskoo includes keyword comment triggers and DM automation alongside scheduling, so you do not need a second tool.",
  },
];

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: `${BRAND.name} social media scheduler`,
  url: `${BRAND.canonicalUrl}${PATH}`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description,
  featureList: [
    "Instagram post, reel, carousel and Story scheduling",
    "Facebook Page post scheduling",
    "Threads post scheduling",
    "Week and month content calendar",
    "Publishing status and retries",
    "Instagram comment-to-DM automation",
  ],
  // Paid offers only once Pro/Agency checkout is live, matching /pricing.
  offers: softwareOffers(planReadiness()),
  publisher: publisherRef(),
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Choose a social media scheduler by workflow",
  itemListElement: comparisonLinks.map((link, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: link.label,
    url: `${BRAND.canonicalUrl}${link.href}`,
  })),
};

function Cell({ value }: { value: string }) {
  if (value === "Yes") {
    return <span style={{ color: "var(--poskoo-green)", fontWeight: 700 }}>Yes</span>;
  }
  if (value === "Not available") {
    return <span style={{ color: "var(--poskoo-muted)" }}>Not available</span>;
  }
  return <>{value}</>;
}

export default function SocialMediaSchedulerComparisonPage() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`} breadcrumbs={[{ name: "Social media scheduler comparison", path: PATH }]}>
      {[appJsonLd, faqJsonLd(faqs), itemListJsonLd].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(data) }}
        />
      ))}

      <header className="hero">

        <div className={s.heroText}>
          <span className="pill">Official Meta API · no password needed</span>
          <p className="eyebrow">Scheduler comparison</p>
          <h1>
            Social media scheduler comparison for <em className="s mark">every network you post to</em>
          </h1>
          <p className="lede">
            Poskoo schedules posts to {LIVE_PLATFORMS_TEXT} from one calendar and auto-publishes them, and adds Instagram
            comment-to-DM. This page compares those features side by side and marks competitor details we have not
            verified as “Check the provider”.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            <a className="btn btn-line" href="#compare">Compare features</a>
          </div>

        </div>
        <div className="hero-art"><AnimArt name="compare" label="Someone tips a pile of messy app windows into a recycling bin and holds up one phone that does it all" /></div>
      </header>

      <section id="platforms">
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Platform support</p>
            <h2>What Poskoo supports on <em className="s">each platform</em></h2>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th className={s.th} scope="col">Capability</th>
                  <th className={s.th} scope="col">Instagram</th>
                  <th className={s.th} scope="col">Facebook Pages</th>
                  <th className={s.th} scope="col">Threads</th>
                </tr>
              </thead>
              <tbody>
                {platformRows.map((row) => (
                  <tr key={row.feature}>
                    <td className={s.td} style={{ fontWeight: 600 }}>{row.feature}</td>
                    <td className={s.td}><Cell value={row.instagram} /></td>
                    <td className={s.td}><Cell value={row.facebook} /></td>
                    <td className={s.td}><Cell value={row.threads} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small" style={{ marginTop: 16, textAlign: "center" }}>
            Read the platform pages:{" "}
            <Link className={s.vlink} href="/instagram-scheduler">Instagram scheduler</Link>
            {" · "}
            <Link className={s.vlink} href="/facebook-scheduler">Facebook Page scheduler</Link>
            {" · "}
            <Link className={s.vlink} href="/threads-scheduler">Threads scheduler</Link>
            {" · "}
            <Link className={s.vlink} href="/youtube-scheduler">YouTube scheduler</Link>
            {" · "}
            <Link className={s.vlink} href="/linkedin-scheduler">LinkedIn scheduler</Link>
            {" · "}
            <Link className={s.vlink} href="/bluesky-scheduler">Bluesky scheduler</Link>
            {" · "}
            <Link className={s.vlink} href="/mastodon-scheduler">Mastodon scheduler</Link>
          </p>
        </div>
      </section>

      <section id="workflows" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Choose by workflow</p>
            <h2>Pick the scheduler that fits <em className="s">how you work</em></h2>
            <p>
              Start from the job you need done, then open the page that compares Poskoo with the tool built for it.
            </p>
          </div>
          <div className="cards">
            {workflows.map((workflow) => (
              <article key={workflow.title} className="pcard">
                <h3>{workflow.title}</h3>
                <p>{workflow.text}</p>
                <p>
                  {workflow.links.map((link, i) => (
                    <span key={link.href}>
                      {i > 0 ? " · " : null}
                      <Link className={s.vlink} href={link.href}>{link.label}</Link>
                    </span>
                  ))}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="alternatives" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Switching tools?</p>
            <h2>Compare Poskoo with <em className="s">each alternative</em></h2>
            <p>
              Side-by-side pages for the schedulers and DM tools people most often switch from, with what Poskoo really
              supports today.
            </p>
          </div>
          <CompareAlternativesNav />
        </div>
      </section>

      <section id="compare" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Scheduler comparison</p>
            <h2>Poskoo vs other <em className="s">social media schedulers</em></h2>
            <p>
              We only list Poskoo features we can confirm. Where a competitor detail is unavailable or unverified, the
              table says “Check the provider” instead of guessing.
            </p>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th className={s.th} scope="col">Feature</th>
                  <th className={`${s.th} ${s.oursCol}`} scope="col">{BRAND.name}</th>
                  <th className={s.th} scope="col"><Link className={s.vlink} href="/buffer-alternative">Buffer</Link></th>
                  <th className={s.th} scope="col"><Link className={s.vlink} href="/later-alternative">Later</Link></th>
                  <th className={s.th} scope="col"><Link className={s.vlink} href="/hootsuite-alternative">Hootsuite</Link></th>
                </tr>
              </thead>
              <tbody>
                {competitorRows.map((row) => (
                  <tr key={row.feature}>
                    <td className={s.td} style={{ fontWeight: 600 }}>{row.feature}</td>
                    <td className={`${s.td} ${s.oursCol}`} style={{ fontWeight: 700 }}><Cell value={row.poskoo} /></td>
                    <td className={s.td}>{row.buffer}</td>
                    <td className={s.td}>{row.later}</td>
                    <td className={s.td}>{row.hootsuite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small" style={{ marginTop: 16, textAlign: "center" }}>
            Compare plans on the <Link className={s.vlink} href="/pricing">Poskoo pricing page</Link>. Or read the full comparisons:{" "}
            <Link className={s.vlink} href="/buffer-alternative">Poskoo vs Buffer</Link>
            {" · "}
            <Link className={s.vlink} href="/later-alternative">Poskoo vs Later</Link>
            {" · "}
            <Link className={s.vlink} href="/hootsuite-alternative">Poskoo vs Hootsuite</Link>
          </p>
          <CompareNote />
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Social media scheduler questions</h2>
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
              <h2>Schedule every network <em className="s">in one place</em></h2>
              <p>Start free. No credit card. Connect through Meta&apos;s official login.</p>
              <Link className="btn" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-schedule.webp"
              width={900}
              height={900}
              loading="lazy"
              alt="A creator pins scheduled post cards to a weekly calendar beside a friendly alarm clock"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
