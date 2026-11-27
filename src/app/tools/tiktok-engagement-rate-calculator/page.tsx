import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import EngagementCalculator from "../instagram-engagement-rate-calculator/EngagementCalculator";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const config: ToolPageConfig = {
  path: "/tools/tiktok-engagement-rate-calculator",
  name: "TikTok engagement rate calculator",
  crumb: "TikTok engagement rate",
  title: "TikTok Engagement Rate Calculator: By Views or Followers",
  description:
    "Free TikTok engagement rate calculator: add likes, comments, shares and favorites, divide by views or followers and get the rate for any video in seconds.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "TikTok engagement rate", mark: "calculator" },
  lede: "TikTok engagement rate = (likes + comments + shares + favorites) ÷ views (or followers) × 100. Enter one video's numbers, choose views or followers as the base, and get its engagement rate in seconds.",
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
              <p>(likes + comments + shares + favorites) ÷ views × 100</p>
              <p>(likes + comments + shares + favorites) ÷ followers × 100</p>
            </div>
            <p>
              Likes, comments and the base are required, and the base must be above zero. Favorites and shares are
              optional and count as zero when left blank. The result is rounded to two decimals.
            </p>
          </>
        ),
      },
      {
        title: "Views vs followers: which base should you use?",
        body: (
          <ul>
            <li>
              <b>Views is usually the better base on TikTok.</b> The For You feed shows videos to people who do not
              follow you, so a video&apos;s audience is much bigger than your follower count. Dividing by views
              answers: of everyone who watched, how many interacted?
            </li>
            <li>
              <b>Followers answers a different question.</b> Dividing by followers asks how many of your existing
              audience engaged. It is useful for tracking your core community, but it ignores everyone the For You
              feed brought in.
            </li>
            <li>
              <b>Pick one base and stick with it.</b> Mixing views-based and follower-based rates makes comparisons
              meaningless. Compare each video on the same base.
            </li>
          </ul>
        ),
      },
      {
        title: "Where to find your TikTok numbers",
        body: (
          <>
            <p>
              Open the TikTok app, go to the video, tap <b>More</b> and then <b>Analytics</b> to see likes, comments,
              shares, favorites and views. On a computer, sign in to <b>TikTok Studio</b> and open the video&apos;s
              analytics for the same figures.
            </p>
            <p>
              Your follower count is on your profile. Write the numbers down for one video at a time, then enter them
              in the calculator; they do not change while you type.
            </p>
          </>
        ),
      },
      {
        title: "Worked example: one video, two rates",
        body: (
          <>
            <p>
              A video with 1,800 likes, 90 comments, 60 shares and 150 favorites, 30,000 views and 12,000 followers:
            </p>
            <div className={t.example}>
              <p>1,800 + 90 + 60 + 150 = 2,100 interactions</p>
              <p>By views: 2,100 ÷ 30,000 × 100 = <b>7.00%</b></p>
              <p>By followers: 2,100 ÷ 12,000 × 100 = <b>17.50%</b></p>
            </div>
            <p>
              Both are correct; they answer different questions. The 7.00% says 7 in every 100 people who watched
              interacted, while the 17.50% says the video reached well beyond your follower count. That gap is exactly
              why views is the more useful base for most TikTok videos.
            </p>
          </>
        ),
      },
      {
        title: "How to use engagement rate well",
        body: (
          <>
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
              <b>Time your posts, then check the rate.</b> Use the{" "}
              <Link href="/tools/best-time-to-post-on-tiktok">best time to post on TikTok</Link> finder to pick slots,
              then see whether those videos beat your usual rate.
            </li>
            <li>
              <b>Schedule consistently and review.</b> Plan videos ahead with the{" "}
              <Link href="/tiktok-scheduler">TikTok scheduler</Link>, then compare each new video with the last. If you
              also post elsewhere, run the same check with the{" "}
              <Link href="/tools/instagram-engagement-rate-calculator">Instagram engagement rate calculator</Link>.
            </li>
          </ul>
          <p>
            Once you know your rate, use the{" "}
            <Link href="/tools/tiktok-money-calculator">TikTok money calculator</Link> to estimate what a sponsored
            video and Creator Rewards could pay.
          </p>
          </>
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
            <li>Using views from the For You feed and followers from a different day, so the two bases do not match.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "TikTok engagement rate questions",
  faqs: [
    {
      q: "What is a good engagement rate on TikTok?",
      a: "There is no universal number. It varies by niche and by account size, so a figure that is good for one creator may be ordinary for another. The most useful comparison is your own videos over time: if a video is well above your usual rate it did well, and if it is well below, look at the hook, length and topic.",
    },
    {
      q: "How do you calculate TikTok engagement rate?",
      a: "Add a video's likes, comments, shares and favorites, divide by views (or followers) and multiply by 100. For example, 1,800 likes + 90 comments + 60 shares + 150 favorites = 2,100 interactions; 2,100 ÷ 30,000 views × 100 = 7.00%.",
    },
    {
      q: "Should I use views or followers?",
      a: "Use views for most TikTok comparisons, because the For You feed shows videos to people who do not follow you. Use followers when you want to measure how your existing audience responds. Pick one and keep it consistent across videos.",
    },
    {
      q: "Does the calculator connect to my TikTok account?",
      a: "No. You type the numbers yourself and the calculation runs in your browser. Nothing is uploaded, saved or connected to TikTok, and no login is needed.",
    },
    {
      q: "Where do I find views, favorites and shares?",
      a: "In the TikTok app, open the video, tap More and then Analytics. On desktop, open the video in TikTok Studio. Both show views, likes, comments, shares and favorites for that video.",
    },
  ],
  related: [
    "/tools/tiktok-caption-generator",
    "/tools/tiktok-hashtag-generator",
    "/tools/tiktok-money-calculator",
    "/tools/best-time-to-post-on-tiktok",
    "/tools/instagram-engagement-rate-calculator",
    "/tools/social-media-analytics-report",
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
    title: "Ready to post your next TikTok?",
    mark: "Schedule it with Poskoo.",
    text: "Plan and schedule TikTok videos with Poskoo, then come back to this calculator to see how each one did by views or followers.",
  },
};

export const metadata = toolMetadata(config);

export default function TikTokEngagementRateCalculatorPage() {
  return (
    <ToolPageTemplate config={config}>
      <EngagementCalculator platform="tiktok" />
    </ToolPageTemplate>
  );
}
