import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import AnalyticsReportBuilder from "./AnalyticsReportBuilder";

const config: ToolPageConfig = {
  path: "/tools/social-media-analytics-report",
  name: "Social media analytics report template",
  crumb: "Analytics report template",
  title: "Social Media Analytics Report Template: Free CSV",
  description:
    "Free social media analytics report template: compare two periods of followers, reach, engagement, clicks and leads, get engagement rate and download a CSV.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Social media analytics", mark: "report template", after: "for two periods" },
  lede: "Record followers, reach, impressions, engagement, clicks and leads for two date ranges. The template calculates engagement rate and the change between periods, then exports a CSV.",
  art: "analytics",
  artLabel: "A creator waters a growing bar chart while hearts float up",
  heroPoints: ["7 metrics compared", "Engagement rate built in", "CSV download"],
  toolTitle: "Build your analytics report",
  toolNote: "Free · nothing is uploaded or saved",
  stepsTitle: "How to use the social media analytics report template",
  steps: [
    {
      title: "Fill in Period A",
      text: "Under Period A (earlier), pick the Platform, set the Start date and End date, and type Followers, Reach, Impressions, Engagement, Clicks and Leads from your insights.",
      art: "writing",
    },
    {
      title: "Fill in Period B",
      text: "Enter the same fields for Period B (later). The table below updates as you type, with engagement rate and a Change column for every metric.",
      art: "analytics",
    },
    {
      title: "Download the report",
      text: "Press Download CSV to save social-media-analytics-report.csv with both periods, dates, platform and the change for each metric.",
      art: "feat-calendar",
    },
  ],
  featuresTitle: "A report you can repeat every month",
  features: [
    {
      title: "Period-over-period change",
      text: "Every metric gets a percentage change from Period A to Period B, so you can see what grew or fell without a spreadsheet formula.",
      art: "analytics",
    },
    {
      title: "Honest engagement rate",
      text: "Engagement rate is engagement divided by reach. When reach is blank or zero the template shows a dash instead of a misleading 0%.",
      art: "feat-leads",
    },
    {
      title: "Private and platform-neutral",
      text: "Works for Instagram, Facebook, Threads, TikTok, LinkedIn, YouTube, Pinterest and X. Numbers stay in your browser.",
      art: "card-leads",
    },
  ],
  guide: {
    title: "How to write a useful social media analytics report",
    intro:
      "A good analytics report answers one question: is what you post moving the numbers you care about? Comparing the same metrics across two equal periods is the simplest way to answer it. Here is how this template works and how to read what it gives you.",
    sections: [
      {
        title: "What this report template does",
        body: (
          <>
            <p>
              You enter two periods side by side. For each one the template takes a platform, a start and end date and six
              numbers. It then builds a comparison table with seven rows: the six metrics plus <b>Engagement rate</b>.
            </p>
            <ul>
              <li>
                <b>Engagement rate</b> = engagement ÷ reach × 100, shown to two decimals.
              </li>
              <li>
                <b>Change</b> = (Period B − Period A) ÷ Period A × 100, shown to one decimal. It shows a dash when Period A
                is zero.
              </li>
            </ul>
            <p>
              Type plain numbers without commas or spaces; anything that is not a number is treated as 0. Nothing is
              saved, so download the CSV before you close the page.
            </p>
          </>
        ),
      },
      {
        title: "What each report field means",
        body: (
          <ul>
            <li>
              <b>Followers</b>: the total audience at the end of the period. It moves slowly, so read it alongside reach and
              engagement.
            </li>
            <li>
              <b>Reach</b>: unique accounts that saw your content. It is the base for engagement rate because it counts
              people, not views.
            </li>
            <li>
              <b>Impressions</b>: every time content was displayed, including repeat views. Some platforms now report
              views instead; use whichever number your insights show, consistently.
            </li>
            <li>
              <b>Engagement</b>: total interactions such as likes, comments, saves, shares and replies.
            </li>
            <li>
              <b>Clicks</b> and <b>Leads</b>: taps on your links, and the people who took the action you care about, such
              as a form fill, DM or sign-up.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: comparing two months on Instagram",
        body: (
          <>
            <p>An account enters these numbers for September (Period A) and October (Period B):</p>
            <div className={t.tableWrap}>
              <table className={t.table}>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Period A</th>
                    <th>Period B</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Followers</td><td>2,000</td><td>2,150</td><td>+7.5%</td></tr>
                  <tr><td>Reach</td><td>10,000</td><td>12,500</td><td>+25.0%</td></tr>
                  <tr><td>Impressions</td><td>18,000</td><td>21,600</td><td>+20.0%</td></tr>
                  <tr><td>Engagement</td><td>450</td><td>600</td><td>+33.3%</td></tr>
                  <tr><td>Engagement rate</td><td>4.50%</td><td>4.80%</td><td>+6.7%</td></tr>
                  <tr><td>Clicks</td><td>120</td><td>150</td><td>+25.0%</td></tr>
                  <tr><td>Leads</td><td>8</td><td>12</td><td>+50.0%</td></tr>
                </tbody>
              </table>
            </div>
            <p>
              Reach grew 25%, but engagement grew faster, so the engagement rate rose too: more people saw the posts and a
              larger share of them responded. Leads moved from 8 to 12, which looks big as a percentage but is a small
              absolute number, so watch it over another month before drawing conclusions. For single posts, try the{" "}
              <Link href="/tools/instagram-engagement-rate-calculator">engagement rate calculator</Link>.
            </p>
          </>
        ),
      },
      {
        title: "Analytics reporting best practices in 2026",
        body: (
          <ul>
            <li>
              <b>Compare like with like.</b> Use periods of the same length on the same platform, such as two full calendar
              months.
            </li>
            <li>
              <b>Report against a goal.</b> Pick the two or three metrics that match what you want: reach for awareness,
              clicks and leads for sales.
            </li>
            <li>
              <b>Add context.</b> Note what changed between periods, such as more Reels, a campaign or fewer posts.
            </li>
            <li>
              <b>Track links properly.</b> Tag links with the <Link href="/tools/instagram-utm-builder">UTM builder</Link>{" "}
              so clicks can be matched in your website analytics.
            </li>
            <li>
              <b>Keep the rhythm.</b> Run the same report every month so trends become visible.
            </li>
          </ul>
        ),
      },
      {
        title: "Common analytics report mistakes",
        body: (
          <ul>
            <li>Comparing a 7-day period with a 30-day period.</li>
            <li>Mixing platforms in one comparison, such as Instagram in Period A and Facebook in Period B.</li>
            <li>Calculating engagement rate on followers in one report and on reach in the next.</li>
            <li>Reading large percentage changes on tiny numbers as a trend.</li>
            <li>Reporting followers only and ignoring whether posts drive clicks or leads.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Social media analytics report questions",
  faqs: [
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
      q: "What is in the downloaded CSV?",
      a: "The file social-media-analytics-report.csv has Metric, Period A, Period B and Change columns, with rows for platform, start date, end date and all seven metrics including engagement rate.",
    },
    {
      q: "Which metrics matter most for a small account?",
      a: "For a small account, watch reach, engagement rate and leads first. Follower count grows slowly and can hide whether the people who already see your posts are responding. Clicks and leads show whether social is producing real business results.",
    },
  ],
  related: [
    "/tools/instagram-engagement-rate-calculator",
    "/tools/social-media-content-calendar",
    "/tools/instagram-utm-builder",
    "/tools/instagram-posting-frequency-calculator",
    "/tools/instagram-comment-to-dm-calculator",
  ],
  schema: {
    features: [
      "Two-period social media report",
      "Followers, reach, impressions, engagement, clicks and leads",
      "Engagement rate and period-over-period change",
      "CSV download for Google Sheets or Excel",
      "Runs in the browser, nothing saved",
    ],
  },
  cta: {
    title: "Want better numbers next month?",
    mark: "Post consistently.",
    text: "Schedule posts with Poskoo and auto-DM everyone who comments your keyword, so engagement turns into leads.",
  },
};

export const metadata = toolMetadata(config);

export default function SocialMediaAnalyticsReportPage() {
  return (
    <ToolPageTemplate config={config}>
      <AnalyticsReportBuilder />
    </ToolPageTemplate>
  );
}
