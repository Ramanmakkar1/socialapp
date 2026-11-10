import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import AnalyticsReportBuilder from "./AnalyticsReportBuilder";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";

const PATH = "/tools/social-media-analytics-report";
const description =
  "Build a social media analytics report for two periods: enter followers, reach, impressions, engagement, clicks and leads, then download a CSV.";

export const metadata: Metadata = {
  title: { absolute: "Free Social Media Analytics Report Template + CSV" },
  description,
  alternates: { canonical: PATH },
};

const faqs = [
  {
    q: "What should a social media analytics report include?",
    a: "Start with the metrics that map to your goal: followers for audience growth, reach and impressions for visibility, engagement for how people respond, clicks for traffic and leads for business results. Add the platform and date range so each number has context.",
  },
  {
    q: "How is engagement rate calculated?",
    a: "Engagement rate is engagement divided by reach, multiplied by 100. If reach is zero or blank, the rate cannot be calculated, so the tool shows a dash instead of a misleading 0%.",
  },
  {
    q: "How do I compare two periods?",
    a: "Enter the earlier period in Period A and the later period in Period B. The Change column shows the percentage difference for each metric, so you can see what grew or fell between the two date ranges.",
  },
  {
    q: "Is my data uploaded or saved?",
    a: "No. The report builder runs entirely in your browser. Nothing is sent to a server, stored in an account or kept after you close the page. The CSV is generated locally on your device.",
  },
  {
    q: "Which metrics matter most for a small account?",
    a: "For a small account, watch reach, engagement rate and leads first. Follower count grows slowly and can hide whether the people who already see your posts are responding. Clicks and leads show whether social is producing real business results.",
  },
];

const toolJsonLd = toolSoftwareJsonLd({
  name: "Social Media Analytics Report Template",
  description,
  url: `${BRAND.url}${PATH}`,
});

export default function SocialMediaAnalyticsReportPage() {
  return (
    <PublicShell
      breadcrumbs={[
        { name: "Free Instagram tools", path: "/tools" },
        { name: "Analytics report template", path: PATH },
      ]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <header className="hero">
        <span className="pill">Free · runs in your browser · nothing is uploaded</span>
        <h1>
          Social media analytics <em className="s mark">report template</em>
        </h1>
        <p className="lede">
          A social media analytics report template is a repeatable way to record followers, reach, impressions,
          engagement, clicks and leads for a date range. Enter two periods below to calculate engagement rate and the
          change between them, then download a CSV for Google Sheets or Excel.
        </p>
        <div className="hero-art" style={{ maxWidth: 520 }}>
          <Image
            sizes="(max-width: 520px) 100vw, 520px"
            src="/landing/card-leads.webp"
            width={900}
            height={900}
            loading="lazy"
            alt="A social media analytics dashboard with a rising engagement chart and metric cards"
          />
        </div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <AnalyticsReportBuilder />
      </div>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>What each report field means</h2>
            <p>
              <strong>Followers</strong> is the total audience at the end of the period. It shows long-term growth but
              moves slowly, so read it alongside reach and engagement.
            </p>
            <p>
              <strong>Reach</strong> is the number of unique accounts that saw your content. <strong>Impressions</strong>{" "}
              counts every time content was displayed, including repeat views. Reach is the base for engagement rate
              because it reflects people, not views.
            </p>
            <p>
              <strong>Engagement</strong> is the total interactions for the period: likes, comments, saves, shares and
              replies. <strong>Engagement rate</strong> is engagement ÷ reach × 100. If reach is zero, the rate is shown
              as a dash because dividing by zero has no meaning.
            </p>
            <p>
              <strong>Clicks</strong> counts taps on your links, and <strong>leads</strong> counts the people who took the
              action you care about, such as a form fill, DM or sign-up. The <strong>change</strong> column is
              (Period B − Period A) ÷ Period A × 100, and it also shows a dash when the earlier value is zero.
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Social media analytics report FAQ</h2>
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
              <h2>See your real numbers in one dashboard</h2>
              <p>
                The{" "}
                <Link className={s.vlink} href="/app/analytics">
                  Poskoo analytics dashboard
                </Link>{" "}
                tracks reach, engagement and leads from your connected accounts, and{" "}
                <Link className={s.vlink} href="/pricing">
                  pricing
                </Link>{" "}
                shows which plan fits your reporting needs.
              </p>
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
              alt="A social media analytics dashboard with a rising engagement chart"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
