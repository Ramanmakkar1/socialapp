import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import EngagementCalculator from "./EngagementCalculator";

const config: ToolPageConfig = {
  path: "/tools/instagram-engagement-rate-calculator",
  name: "Instagram engagement rate calculator",
  crumb: "Engagement rate calculator",
  title: "Instagram Engagement Rate Calculator: Followers or Reach",
  description:
    "Free Instagram engagement rate calculator: add likes, comments, saves and shares, divide by followers or reach and get the rate for one post in seconds.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Instagram engagement rate", mark: "calculator" },
  lede: "Instagram engagement rate = (likes + comments + saves + shares) ÷ followers × 100, or ÷ reach for a single post. Enter one post's numbers below to get its rate as a percentage.",
  art: "analytics",
  artLabel: "A creator waters a growing bar chart while hearts float up",
  heroPoints: ["By followers or reach", "Saves and shares count", "No login"],
  toolTitle: "Calculate your engagement rate",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Instagram engagement rate calculator",
  steps: [
    {
      title: "Choose By followers or By reach",
      text: "Use the toggle at the top. By followers compares the post to your audience size; By reach compares it to the accounts that actually saw it.",
      art: "analytics",
    },
    {
      title: "Enter the post's numbers",
      text: "Type Likes, Comments and either Followers or Reach. Saves and Shares are optional: leave them blank and they count as zero.",
      art: "writing",
    },
    {
      title: "Read the rate and the formula",
      text: "The engagement rate appears as a percentage with two decimals, with the formula used shown underneath so you can check the maths.",
      art: "feat-leads",
    },
  ],
  featuresTitle: "A fuller engagement number in one step",
  features: [
    {
      title: "Counts saves and shares",
      text: "Many quick formulas use only likes and comments. Adding saves and shares shows when people valued a post enough to keep or send it.",
      art: "feat-leads",
    },
    {
      title: "Two honest bases",
      text: "Switch between followers and reach to see how a post did with your whole audience versus the people who saw it.",
      art: "analytics",
    },
    {
      title: "Private by design",
      text: "The calculator does the arithmetic in your browser. It does not connect to Instagram and your numbers are not uploaded.",
      art: "card-leads",
    },
  ],
  guide: {
    title: "A practical guide to Instagram engagement rate",
    intro:
      "Engagement rate tells you what share of an audience interacted with a post. It is most useful for comparing your own posts with each other over time, not for comparing yourself with a stranger whose numbers you cannot see.",
    sections: [
      {
        title: "How this engagement rate calculator works",
        body: (
          <>
            <p>
              The calculator adds likes, comments, saves and shares, divides the total by your chosen base and multiplies
              by 100:
            </p>
            <div className={t.example}>
              <p>(likes + comments + saves + shares) ÷ followers × 100</p>
              <p>(likes + comments + saves + shares) ÷ reach × 100</p>
            </div>
            <p>
              Likes, comments and the base are required, and the base must be above zero. Saves and shares are optional
              and count as zero when left blank. The result is rounded to two decimals.
            </p>
          </>
        ),
      },
      {
        title: "Followers or reach: which base to use",
        body: (
          <ul>
            <li>
              <b>By followers</b> answers: of everyone who follows you, how many engaged? It is easy to compare across
              posts while your follower count is stable.
            </li>
            <li>
              <b>By reach</b> divides by the number of accounts that saw the post, found in the post&apos;s insights in
              the Instagram app. Reach is often lower than followers, so the same interactions give a higher percentage.
            </li>
            <li>
              Pick one base and stick with it when you compare posts. Mixing the two makes the comparison meaningless.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: one carousel, two rates",
        body: (
          <>
            <p>
              A carousel with 420 likes, 35 comments, 60 saves and 25 shares on an account with 12,000 followers, which
              reached 8,000 accounts:
            </p>
            <div className={t.example}>
              <p>By followers: 540 ÷ 12,000 × 100 = <b>4.50%</b></p>
              <p>By reach: 540 ÷ 8,000 × 100 = <b>6.75%</b></p>
              <p>Likes and comments only, by followers: <b>3.79%</b></p>
            </div>
            <p>
              The last line shows why saves and shares matter: leaving them out hides a large part of how people
              responded to a save-worthy carousel.
            </p>
          </>
        ),
      },
      {
        title: "How to use engagement rate well in 2026",
        body: (
          <ul>
            <li>
              <b>Compare like with like.</b> Reels, carousels and single images behave differently, so compare each format
              with itself.
            </li>
            <li>
              <b>Track trends, not one post.</b> Note the rate for every post in a sheet or the{" "}
              <Link href="/tools/social-media-analytics-report">social media analytics report</Link> and look at the
              average over a month.
            </li>
            <li>
              <b>Give people a reason to comment.</b> A clear question or a comment keyword that sends a resource by DM
              turns passive viewers into conversations. That is what{" "}
              <Link href="/instagram-auto-dm">Instagram auto-DM</Link> is for.
            </li>
            <li>
              <b>Read the parts.</b> A post with many saves but few likes is still doing a job; the total rate hides that.
            </li>
          </ul>
        ),
      },
      {
        title: "Common engagement rate mistakes",
        body: (
          <ul>
            <li>Comparing a reach-based rate with someone else&apos;s follower-based rate.</li>
            <li>Judging an account by a single viral or a single quiet post.</li>
            <li>Chasing likes with giveaways or bait that brings no lasting followers.</li>
            <li>Ignoring saves and shares because they are not visible on the post itself.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram engagement rate questions",
  faqs: [
    {
      q: "What is engagement rate on Instagram?",
      a: "Engagement rate is the share of an audience that interacted with a post. Add up likes, comments, saves and shares, divide by a base (usually followers or reach) and multiply by 100 to get a percentage.",
    },
    {
      q: "How do you calculate engagement rate by reach?",
      a: "Add the post's likes, comments, saves and shares, divide by how many accounts saw the post (reach) and multiply by 100. Reach-based rates often look higher than follower-based rates because reach is usually smaller than your follower count.",
    },
    {
      q: "Do saves and shares count?",
      a: "In this calculator, yes. They are optional fields: fill them in from the post's insights for a fuller picture, or leave them blank and they count as zero.",
    },
    {
      q: "Does the calculator connect to my Instagram account?",
      a: "No. You type the numbers yourself and the calculation runs in your browser. Nothing is uploaded or saved.",
    },
    {
      q: "How can I get more comments on Instagram?",
      a: "Ask a clear question in the caption, use a comment keyword in Reels or posts, and reply quickly so the thread stays active. Poskoo's comment-keyword auto-DMs send a link or resource to everyone who comments the word you choose.",
    },
  ],
  related: [
    "/tools/social-media-analytics-report",
    "/tools/instagram-posting-frequency-calculator",
    "/tools/instagram-comment-to-dm-calculator",
    "/tools/instagram-caption-counter",
    "/tools/instagram-hook-generator",
  ],
  schema: {
    features: [
      "Engagement rate by followers or by reach",
      "Counts likes, comments, saves and shares",
      "Optional saves and shares fields",
      "Shows the formula used",
      "Runs in the browser, no login",
    ],
  },
  cta: {
    title: "More comments are coming.",
    mark: "Reply to every one by DM.",
    text: "Schedule your next post with Poskoo and automatically DM everyone who comments your keyword, on the official Meta API.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramEngagementRateCalculatorPage() {
  return (
    <ToolPageTemplate config={config}>
      <EngagementCalculator />
    </ToolPageTemplate>
  );
}
