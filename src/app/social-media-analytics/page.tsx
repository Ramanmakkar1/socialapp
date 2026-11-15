import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";
import { softwareOffers } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const PATH = "/social-media-analytics";
const title = `Social Media Analytics: Reach, Clicks & Leads | ${BRAND.name}`;
const description = `Poskoo social media analytics shows post performance, reach, engagement rate, link clicks, leads and DM analytics in one dashboard, with CSV export.`;

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
});

const metrics = [
  {
    name: "Post performance",
    text: "See every published post with its reach, views, likes, comments and saves in one table, plus the Auto-DM rule attached to it.",
  },
  {
    name: "Reach",
    text: "Reach counts the accounts that saw your posts in the selected period, so you can tell whether a post found new people.",
  },
  {
    name: "Engagement rate",
    text: "Engagement rate is likes plus comments plus saves divided by reach, calculated across the posts you published in the period.",
  },
  {
    name: "Link clicks",
    text: "Link clicks track clicks on the short links inside your Auto-DM messages, so you can see which post drove traffic.",
  },
  {
    name: "Leads",
    text: "Leads are the contacts your Auto-DMs collected, with the share of DMs that captured an email address.",
  },
  {
    name: "DM analytics",
    text: "DM analytics covers DMs sent, link clicks, click-through rate and leads captured, broken down per Auto-DM rule.",
  },
];

const sections = [
  {
    n: "01",
    art: "analytics" as const,
    title: "Post performance and reach",
    text: "The Posts tab lists each published post with reach, views, likes, comments, saves, DMs, clicks and leads. Filter by date range and channel to compare posts.",
  },
  {
    n: "02",
    art: "card-leads" as const,
    title: "Leads, link clicks and DM analytics",
    text: "The DM performance tab shows DMs sent, link clicks, click-through rate and leads captured per Auto-DM rule, with your best rule, top day for DMs and top day for clicks.",
  },
  {
    n: "03",
    art: "card-schedule" as const,
    title: "Best posting times and export",
    text: "The report shows when your audience commented over the last 30 days as a guide to the best times to post. Export post performance to CSV, or print the full report.",
  },
];

const faqs = [
  {
    q: "What metrics does Poskoo social media analytics show?",
    a: "Poskoo shows followers, posts, likes, comments, engagement rate, reach, DMs sent, leads and link clicks, plus reach, views, likes, comments and saves for each post. DM performance adds DMs sent, link clicks, click-through rate and leads per Auto-DM rule.",
  },
  {
    q: "How is engagement rate calculated?",
    a: "Engagement rate is likes plus comments plus saves divided by reach, across the posts published in the selected period. If a post has no reach data yet, the rate is left blank instead of showing a misleading zero.",
  },
  {
    q: "Can I export my social media analytics?",
    a: "Yes. Export CSV downloads post performance with reach, views, likes, comments, saves and link clicks. The analytics report page prints or saves as a PDF with post performance, account growth and best times to post.",
  },
  {
    q: "Which platforms does analytics cover?",
    a: "Post performance comes from the Instagram insights of your connected accounts, and DM analytics covers the Auto-DM rules you run in Poskoo. Scheduling itself supports 10 platforms, so you can plan posts and measure the Instagram results in one workspace.",
  },
  {
    q: "Do I need a paid plan to see analytics?",
    a: "No. Analytics is available on the Free plan once you publish posts or run an Auto-DM. Paid plans add more social accounts, scheduled posts and Auto-DM capacity, as shown on the pricing page.",
  },
];

const appJsonLd = {
  ...toolSoftwareJsonLd({
    name: `${BRAND.name} social media analytics`,
    description,
    url: `${BRAND.canonicalUrl}${PATH}`,
  }),
  "@id": `${BRAND.canonicalUrl}${PATH}#software`,
  featureList: [
    "Post performance with reach, views, likes, comments and saves",
    "Engagement rate from likes, comments and saves against reach",
    "Link clicks and leads from Instagram Auto-DMs",
    "DM analytics per Auto-DM rule with click-through rate",
    "CSV export and printable analytics report",
    "Best times to post from audience comment times",
  ],
  offers: softwareOffers(planReadiness()),
};

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

export default function SocialMediaAnalyticsPage() {
  return (
    <PublicShell className={s.sched} breadcrumbs={[{ name: "Social media analytics", path: PATH }]}>
      {[appJsonLd, webPageJsonLd, faqJsonLd(faqs)].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(data) }}
        />
      ))}

      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Post performance · DM analytics · CSV export</span>
          <p className="eyebrow">Social media analytics</p>
          <h1>Social media analytics that connect posts to leads</h1>
          <p className="lede">
            Poskoo shows post performance, reach, engagement rate, link clicks, leads and DM analytics in one
            dashboard. Filter by date range and channel, export post performance to CSV, and see which posts and
            Auto-DMs bring in contacts.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            <Link className="btn btn-line" href="/app/analytics">Open analytics</Link>
          </div>
          <p className="small">Free plan included. No credit card needed.</p>
        </div>
        <div className="hero-art"><AnimArt name="analytics" label="A creator waters a growing bar chart while hearts float up from a phone" /></div>
      </header>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">What you can measure</p>
            <h2>Which social media metrics does Poskoo track?</h2>
          </div>
          <div className="cards">
            {metrics.map((metric) => (
              <article key={metric.name} className="pcard">
                <h3>{metric.name}</h3>
                <p>{metric.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Inside the dashboard</p>
            <h2>How does the analytics dashboard work?</h2>
          </div>
          <div className="howGrid">
            {sections.map((section) => (
              <article key={section.n} className="howStep">
                <div className="howArt"><AnimArt name={section.art} /></div>
                <span className="howNo">Part {section.n}</span>
                <h3>{section.title}</h3>
                <p>{section.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Export and reporting</p>
            <h2>Can you export a social media analytics report?</h2>
          </div>
          <p className="lede">
            Yes. Post performance exports to CSV with reach, views, likes, comments, saves and link clicks, which
            opens cleanly in a spreadsheet. The analytics report page adds account growth and best times to post,
            and prints or saves as a PDF for a client or team update. Build a two-period report straight from the
            free{" "}
            <Link className={s.vlink} href="/tools/social-media-analytics-report">social media analytics report</Link>{" "}
            tool if you need a template before connecting an account.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Related</p>
            <h2>Plan posts, then measure what worked</h2>
          </div>
          <nav className="relChips" aria-label="Related Poskoo pages">
            <span>Keep going</span>
            <Link href="/social-media-scheduler">Social media scheduler</Link>
            <Link href="/app/analytics">Open your analytics</Link>
            <Link href="/tools/social-media-analytics-report">Analytics report template</Link>
            <Link href="/pricing">Plans and pricing</Link>
          </nav>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Social media analytics FAQs</p>
            <h2>Metrics, exports and plans</h2>
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
              <h2>See which posts <em className="s">bring in leads</em></h2>
              <p>Start free, publish a post, and watch reach, clicks and leads land in one dashboard.</p>
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
