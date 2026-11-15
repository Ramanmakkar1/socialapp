import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import MoneyCalculator from "../instagram-money-calculator/MoneyCalculator";

const config: ToolPageConfig = {
  path: "/tools/tiktok-money-calculator",
  name: "TikTok money calculator",
  crumb: "TikTok money calculator",
  title: "TikTok Money Calculator: Estimate Brand Deal & Rewards Pay",
  description:
    "Estimate TikTok brand deal pay from followers and engagement, plus an optional Creator Rewards estimate from qualifying views. Free, no login.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "TikTok money calculator:", mark: "estimate", after: "what a video can earn" },
  lede: "A rough TikTok sponsored-video price is $10-$25 per 1,000 followers, adjusted up or down by your engagement rate. Enter your followers, engagement rate and video rate to estimate pay per sponsored video and per month, plus an optional Creator Rewards estimate.",
  art: "analytics",
  artLabel: "A creator watches an upward chart with coins and dollar signs floating up",
  heroPoints: ["Sponsored video and monthly estimates", "Optional Creator Rewards estimate", "No login"],
  toolTitle: "Estimate your TikTok brand deal pay",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the TikTok money calculator",
  steps: [
    {
      title: "Enter followers and engagement rate",
      text: "Type your follower count and average engagement rate. If you do not know the rate, the link under the field opens the TikTok engagement rate calculator.",
      art: "analytics",
    },
    {
      title: "Set your rate per 1,000 followers",
      text: "The low and high fields start at $10 and $25 per 1,000 followers per sponsored video. Edit them to match what brands pay in your niche.",
      art: "writing",
    },
    {
      title: "Read the video and monthly estimates",
      text: "The result shows an estimated range per sponsored video and per month. Add average views and an RPM for an optional Creator Rewards estimate.",
      art: "feat-leads",
    },
  ],
  featuresTitle: "One estimate for brand deals and rewards",
  features: [
    {
      title: "Engagement-adjusted ranges",
      text: "The rate scales down when engagement is under 1% and up when it is above 3%, so a highly engaged account is not priced like a quiet one.",
      art: "analytics",
    },
    {
      title: "Sponsored video and monthly",
      text: "See an estimated range for a single sponsored video and for the number of videos you take a month, ready for a brand conversation.",
      art: "feat-leads",
    },
    {
      title: "Optional Creator Rewards estimate",
      text: "Add average views and an editable $0.40-$1.00 RPM to estimate rewards from qualifying views on videos over 1 minute. It is an estimate, not data from TikTok.",
      art: "card-leads",
    },
  ],
  guide: {
    title: "A practical guide to TikTok earnings",
    intro:
      "This calculator gives a starting range, not a quote. It multiplies your followers by a rate per 1,000 followers and adjusts for engagement, so you can walk into a brand conversation with a number instead of a guess.",
    sections: [
      {
        title: "How much does TikTok pay per 1,000 views?",
        body: (
          <>
            <p>
              TikTok does not pay a flat rate per 1,000 views. The Creator Rewards Program pays only on qualifying
              views, which are views on videos longer than 1 minute, and the effective RPM usually lands somewhere
              around <b>$0.40 to $1.00 per 1,000 qualifying views</b>. Short videos and views outside the program do
              not earn from it.
            </p>
            <p>
              That is why this calculator keeps the Creator Rewards estimate separate from brand deals. Enter your
              average views and an RPM to see a rough range, and treat it as an estimate only, not data from TikTok.
            </p>
            <div className={t.example}>
              <p>100,000 qualifying views ÷ 1,000 × $0.40 to $1.00 = $40 to $100</p>
              <p>Brand deals are usually the larger and more predictable income stream</p>
            </div>
          </>
        ),
      },
      {
        title: "How much do TikTokers charge for a sponsored video?",
        body: (
          <>
            <p>
              As a rough starting point, sponsored TikTok videos are often priced at <b>$10 to $25 per 1,000
              followers</b>. That means a creator with 10,000 followers might estimate $100 to $250 per video, before
              any engagement adjustment. Micro accounts often sit near the top of that range per follower because
              their audience is more engaged, while large accounts can sit lower.
            </p>
            <p>
              Real deals also depend on the niche, usage rights, exclusivity and how many deliverables the brand
              wants. Use this calculator as a floor and ceiling for the conversation, then confirm the scope in
              writing.
            </p>
            <div className={t.example}>
              <p>10,000 followers × $10 to $25 per 1,000 = $100 to $250 per sponsored video</p>
              <p>A 4% engagement rate applies x1.5, giving $150 to $375</p>
            </div>
          </>
        ),
      },
      {
        title: "How do you grow TikTok income?",
        body: (
          <>
            <p>
              Brand deals and rewards both follow reach and engagement. Track your{" "}
              <Link href="/tools/tiktok-engagement-rate-calculator">TikTok engagement rate</Link> to see which videos
              hold attention, then post consistently with the{" "}
              <Link href="/tiktok-scheduler">TikTok scheduler</Link> so your best formats keep shipping.
            </p>
            <p>
              For more ways creators earn beyond one-off videos, read the{" "}
              <Link href="/guides/how-to-make-money-on-social-media-2026">
                guide to making money on social media in 2026
              </Link>
              .
            </p>
          </>
        ),
      },
    ],
  },
  faqTitle: "TikTok money calculator questions",
  faqs: [
    {
      q: "How much can I earn per TikTok video?",
      a: "A common starting range for a sponsored video is $10 to $25 per 1,000 followers, adjusted for engagement. A 10,000-follower account might estimate $100 to $250, or higher with strong engagement and a valuable niche.",
    },
    {
      q: "How does this calculator work?",
      a: "It divides your followers by 1,000, multiplies by your low and high rate per 1,000 followers, then applies an engagement multiplier: x0.5 under 1%, x1 for 1-3%, x1.5 for 3-6% and x2 over 6%. The optional Creator Rewards estimate divides qualifying views by 1,000 and multiplies by your RPM.",
    },
    {
      q: "Are these TikTok earnings accurate?",
      a: "No. The result is an estimate only, not a guarantee and not data from TikTok. Real rates vary by niche, audience location, usage rights, exclusivity and the brand's budget.",
    },
    {
      q: "What are qualifying views for Creator Rewards?",
      a: "Creator Rewards pays on views of videos longer than 1 minute. Views on shorter videos do not count. This calculator lets you enter an RPM of $0.40 to $1.00 to estimate rewards, but it is not official TikTok data.",
    },
    {
      q: "Does the calculator connect to my TikTok account?",
      a: "No. You type the numbers yourself and the calculation runs in your browser. Nothing is uploaded or connected to TikTok, and no login is needed.",
    },
  ],
  related: [
    "/tools/tiktok-engagement-rate-calculator",
    "/tools/tiktok-video-ideas-generator",
    "/tools/tiktok-hashtag-generator",
    "/tools/best-time-to-post-on-tiktok",
    "/tools/instagram-money-calculator",
  ],
  schema: {
    features: [
      "Estimated sponsored-video price range from followers",
      "Engagement-rate multiplier from x0.5 to x2",
      "Editable low and high rate per 1,000 followers",
      "Estimates for a sponsored video and a monthly total",
      "Optional Creator Rewards estimate from qualifying views",
      "Shows the formula, runs in the browser, no login",
    ],
  },
  cta: {
    title: "Know your worth,",
    mark: "then land the brand deal.",
    text: "Schedule your sponsored videos with Poskoo and DM everyone who comments your keyword, on the official TikTok API.",
  },
};

export const metadata = toolMetadata(config);

export default function TikTokMoneyCalculatorPage() {
  return (
    <ToolPageTemplate config={config}>
      <MoneyCalculator platform="tiktok" />
    </ToolPageTemplate>
  );
}
