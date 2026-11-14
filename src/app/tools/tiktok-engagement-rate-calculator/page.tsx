import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import EngagementCalculator from "../instagram-engagement-rate-calculator/EngagementCalculator";

const config: ToolPageConfig = {
  path: "/tools/tiktok-engagement-rate-calculator",
  name: "TikTok engagement rate calculator",
  crumb: "TikTok engagement rate calculator",
  title: "TikTok Engagement Rate Calculator: Free, by Views (2026)",
  description:
    "Free TikTok engagement rate calculator: enter likes, comments, shares, favorites and views or followers to get your engagement rate and what it means.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "TikTok engagement rate calculator:", mark: "by views", after: "or followers" },
  lede: "TikTok engagement rate = (likes + comments + shares + favorites) / views x 100. Enter one video's numbers, choose views or followers as the base, and get its engagement rate as a percentage.",
  art: "analytics",
  artLabel: "A creator watches a growing bar chart while hearts and comments float up",
  heroPoints: ["By views or followers", "Favorites and shares count", "No login"],
  toolTitle: "Calculate your TikTok engagement rate",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the TikTok engagement rate calculator",
  steps: [
    {
      title: "Choose By views or By followers",
      text: "Use the toggle at the top. By views compares the video to the people who actually watched it; By followers compares it to your whole follower count.",
      art: "analytics",
    },
    {
      title: "Enter the video's numbers",
      text: "Type Likes, Comments and either Views or Followers. Favorites and Shares are optional: leave them blank and they count as zero.",
      art: "writing",
    },
    {
      title: "Read the rate and the formula",
      text: "The engagement rate appears as a percentage with two decimals, with the formula used shown underneath so you can check the maths.",
      art: "feat-leads",
    },
  ],
  featuresTitle: "A fuller TikTok number in one step",
  features: [
    {
      title: "Counts favorites and shares",
      text: "Quick formulas often stop at likes and comments. Adding favorites and shares shows when people saved a video to watch again or sent it to a friend.",
      art: "feat-leads",
    },
    {
      title: "Views or followers",
      text: "Switch between views and followers to see how a video did with the people who watched it versus your whole audience.",
      art: "analytics",
    },
    {
      title: "Private by design",
      text: "The calculator does the arithmetic in your browser. It does not connect to TikTok and your numbers are not uploaded.",
      art: "card-leads",
    },
  ],
  guide: {
    title: "A practical guide to TikTok engagement rate",
    intro:
      "Engagement rate tells you what share of an audience interacted with a video. On TikTok it is most useful for comparing your own videos with each other over time, not for comparing yourself with a stranger whose numbers you cannot see.",
    sections: [
      {
        title: "How this TikTok engagement rate calculator works",
        body: (
          <>
            <p>
              The calculator adds likes, comments, favorites and shares, divides the total by your chosen base and
              multiplies by 100:
            </p>
            <div className={t.example}>
              <p>(likes + comments + favorites + shares) ÷ views × 100</p>
              <p>(likes + comments + favorites + shares) ÷ followers × 100</p>
            </div>
            <p>
              Likes, comments and the base are required, and the base must be above zero. Favorites and shares are
              optional and count as zero when left blank. The result is rounded to two decimals.
            </p>
          </>
        ),
      },
      {
        title: "Why views is the usual base on TikTok",
        body: (
          <ul>
            <li>
              <b>The For You feed reaches non-followers.</b> A video can be shown to far more people than follow you, so
              views is the audience that actually saw it.
            </li>
            <li>
              <b>Views is the honest denominator.</b> Dividing by views answers: of everyone who watched, how many
              interacted? That is the number a video&apos;s performance really reflects.
            </li>
            <li>
              <b>Use followers when you want a different question.</b> Dividing by followers answers: of my existing
              audience, how many engaged? It is useful for tracking your core community, but it ignores everyone the
              For You feed brought in.
            </li>
            <li>
              Pick one base and stick with it when you compare videos. Mixing the two makes the comparison meaningless.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: one video, two rates",
        body: (
          <>
            <p>
              A video with 1,200 likes, 80 comments, 150 favorites and 60 shares, 40,000 views and 12,000 followers:
            </p>
            <div className={t.example}>
              <p>By views: 1,490 ÷ 40,000 × 100 = <b>3.73%</b></p>
              <p>By followers: 1,490 ÷ 12,000 × 100 = <b>12.42%</b></p>
              <p>Likes and comments only, by views: <b>3.20%</b></p>
            </div>
            <p>
              The last line shows why favorites and shares matter: leaving them out hides part of how people responded
              to a video worth saving or sending on.
            </p>
          </>
        ),
      },
      {
        title: "How to use engagement rate well in 2026",
        body: (
          <ul>
            <li>
              <b>Compare like with like.</b> Short videos, longer videos and photo carousels behave differently, so
              compare each format with itself.
            </li>
            <li>
              <b>Track trends, not one video.</b> Note the rate for every video in a sheet or the{" "}
              <Link href="/tools/social-media-analytics-report">social media analytics report</Link> and look at the
              average over a month.
            </li>
            <li>
              <b>Read low, average and high against your own videos.</b> There is no universal benchmark: a rate is low
              or high only next to what your other videos usually get.
            </li>
            <li>
              <b>Give people a reason to comment.</b> A clear question or a comment keyword that sends a resource by DM
              turns passive viewers into conversations.
            </li>
          </ul>
        ),
      },
      {
        title: "Common TikTok engagement rate mistakes",
        body: (
          <ul>
            <li>Comparing a views-based rate with someone else&apos;s follower-based rate.</li>
            <li>Judging an account by a single viral or a single quiet video.</li>
            <li>Chasing likes with bait that brings no lasting followers.</li>
            <li>Ignoring favorites and shares because they are not shown next to the like count.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "TikTok engagement rate questions",
  faqs: [
    {
      q: "How do you calculate TikTok engagement rate?",
      a: "Add a video's likes, comments, favorites and shares, divide by views (or followers) and multiply by 100. For example, 1,490 interactions on 40,000 views is a 3.73% engagement rate.",
    },
    {
      q: "Should I use views or followers?",
      a: "Use views for most TikTok comparisons, because the For You feed shows videos to people who do not follow you. Use followers when you want to measure how your existing audience responds. Pick one and keep it consistent.",
    },
    {
      q: "Do favorites count as engagement?",
      a: "Yes. A favorite means someone saved the video to watch again, which is a strong signal. This calculator includes favorites and shares alongside likes and comments.",
    },
    {
      q: "What is a good TikTok engagement rate?",
      a: "There is no universal number. Judge a video against your own recent videos: if it is well above your usual rate it did well, and if it is well below, look at the hook, length and topic. Compare the same format with itself.",
    },
    {
      q: "Does the calculator connect to my TikTok account?",
      a: "No. You type the numbers yourself and the calculation runs in your browser. Nothing is uploaded or saved.",
    },
  ],
  related: [
    "/tools/social-media-analytics-report",
    "/tools/tiktok-caption-generator",
    "/tools/tiktok-hashtag-generator",
    "/tools/tiktok-bio-generator",
    "/tools/best-time-to-post-on-tiktok",
  ],
  schema: {
    features: [
      "Engagement rate by views or by followers",
      "Counts likes, comments, favorites and shares",
      "Optional favorites and shares fields",
      "Shows the formula used",
      "Runs in the browser, no login",
    ],
  },
  cta: {
    title: "More comments are coming.",
    mark: "Reply to every one by DM.",
    text: "Schedule your next TikTok video with Poskoo and automatically DM everyone who comments your keyword, on the official API.",
  },
};

export const metadata = toolMetadata(config);

export default function TikTokEngagementRateCalculatorPage() {
  return (
    <ToolPageTemplate config={config}>
      <EngagementCalculator reachLabel="Views" labels={{ saves: "Favorites" }} />
    </ToolPageTemplate>
  );
}
