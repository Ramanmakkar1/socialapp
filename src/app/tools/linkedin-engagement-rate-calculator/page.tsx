import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import EngagementCalculator from "../instagram-engagement-rate-calculator/EngagementCalculator";

const config: ToolPageConfig = {
  path: "/tools/linkedin-engagement-rate-calculator",
  name: "LinkedIn engagement rate calculator",
  crumb: "LinkedIn engagement rate calculator",
  title: "LinkedIn Engagement Rate Calculator: Free, by Impressions",
  description:
    "Free LinkedIn engagement rate calculator: add reactions, comments, reposts and impressions or followers to get the engagement rate for any post in seconds.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "LinkedIn engagement rate calculator:", mark: "free", after: "by impressions" },
  lede: "LinkedIn engagement rate = (reactions + comments + reposts) / impressions x 100. Enter the numbers from one post, choose impressions or followers as the base, and get the rate as a percentage.",
  art: "analytics",
  artLabel: "A marketer reads a rising engagement chart next to a LinkedIn-style post card",
  heroPoints: ["By impressions or followers", "Reactions, comments and reposts", "No login"],
  toolTitle: "Calculate your LinkedIn engagement rate",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the LinkedIn engagement rate calculator",
  steps: [
    {
      title: "Choose By impressions or By followers",
      text: "Use the toggle at the top. Impressions compares the post to the people who actually saw it; followers compares it to your whole audience.",
      art: "analytics",
    },
    {
      title: "Enter the post's numbers",
      text: "Type Reactions, Comments and Reposts, then either Impressions or Followers. Reposts are optional: leave them blank and they count as zero.",
      art: "writing",
    },
    {
      title: "Read the rate and the formula",
      text: "The engagement rate appears as a percentage with two decimals, with the formula used shown underneath so you can check the maths.",
      art: "feat-leads",
    },
  ],
  featuresTitle: "A clearer LinkedIn engagement number",
  features: [
    {
      title: "Built for LinkedIn's metrics",
      text: "LinkedIn shows reactions, comments, reposts and impressions in its own analytics, so the calculator uses exactly those labels.",
      art: "feat-leads",
    },
    {
      title: "Two honest bases",
      text: "Switch between impressions and followers to see how a post did with the people who saw it versus your whole audience.",
      art: "analytics",
    },
    {
      title: "Private by design",
      text: "The calculator does the arithmetic in your browser. It does not connect to LinkedIn and your numbers are not uploaded.",
      art: "card-leads",
    },
  ],
  guide: {
    title: "A practical guide to LinkedIn engagement rate",
    intro:
      "Engagement rate tells you what share of an audience reacted to a post. It is most useful for comparing your own posts with each other over time, not for comparing yourself with a stranger whose numbers you cannot see.",
    sections: [
      {
        title: "How this LinkedIn engagement rate calculator works",
        body: (
          <>
            <p>
              The calculator adds reactions, comments and reposts, divides the total by your chosen base and multiplies
              by 100:
            </p>
            <div className={t.example}>
              <p>(reactions + comments + reposts) ÷ impressions × 100</p>
              <p>(reactions + comments + reposts) ÷ followers × 100</p>
            </div>
            <p>
              Reactions, comments and the base are required, and the base must be above zero. Reposts are optional and
              count as zero when left blank. The result is rounded to two decimals.
            </p>
          </>
        ),
      },
      {
        title: "Impressions or followers: which base to use",
        body: (
          <ul>
            <li>
              <b>By impressions</b> answers: of everyone who saw the post, how many reacted? LinkedIn&apos;s own
              analytics shows impressions for every post, so this is the easiest base to find.
            </li>
            <li>
              <b>By followers</b> answers: of everyone who follows you, how many engaged? It is easy to compare across
              posts while your follower count is stable.
            </li>
            <li>
              Pick one base and stick with it when you compare posts. Mixing the two makes the comparison meaningless.
            </li>
          </ul>
        ),
      },
      {
        title: "Personal profiles vs company pages",
        body: (
          <ul>
            <li>
              <b>Personal profiles</b> usually reach a mix of connections and second-degree viewers, so impressions can
              be much larger than the follower count. A follower-based rate can look low even when a post travelled far.
            </li>
            <li>
              <b>Company pages</b> tend to have a smaller organic reach per follower, so impressions are often the fairer
              base when you judge a page post.
            </li>
            <li>
              Whichever you run, keep the same base for every post in a comparison so the trend is real.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: one post, two rates",
        body: (
          <>
            <p>
              A post with 180 reactions, 24 comments and 12 reposts on a page with 9,000 followers, which received
              6,000 impressions:
            </p>
            <div className={t.example}>
              <p>By impressions: 216 ÷ 6,000 × 100 = <b>3.60%</b></p>
              <p>By followers: 216 ÷ 9,000 × 100 = <b>2.40%</b></p>
              <p>Reactions and comments only, by impressions: <b>3.40%</b></p>
            </div>
            <p>
              The last line shows why reposts matter: leaving them out hides the people who passed the post on to their
              own network.
            </p>
          </>
        ),
      },
      {
        title: "How to use engagement rate well",
        body: (
          <ul>
            <li>
              <b>Compare like with like.</b> Text posts, documents, images and videos behave differently, so compare each
              format with itself.
            </li>
            <li>
              <b>Track trends, not one post.</b> Note the rate for every post in a sheet or the{" "}
              <Link href="/tools/social-media-analytics-report">social media analytics report</Link> and look at the
              average over a month.
            </li>
            <li>
              <b>Give people a reason to comment.</b> A clear question or a comment keyword that sends a resource by DM
              turns passive viewers into conversations.
            </li>
            <li>
              <b>Read the parts.</b> A post with many comments but few reactions is still doing a job; the total rate
              hides that.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "LinkedIn engagement rate questions",
  faqs: [
    {
      q: "What is a good engagement rate on LinkedIn?",
      a: "There is no single number that fits every account. Compare your own posts with each other over time, using the same base each time, rather than judging a post against a benchmark you cannot verify.",
    },
    {
      q: "How do you calculate engagement rate by impressions?",
      a: "Add the post's reactions, comments and reposts, divide by how many times the post was shown (impressions) and multiply by 100. Impressions are shown in LinkedIn's own post analytics.",
    },
    {
      q: "Should I use impressions or followers?",
      a: "Use impressions when you want to know how the people who saw the post responded, which is usually fairer for company pages. Use followers when you want to compare against your whole audience. Pick one and keep it for every post in a comparison.",
    },
    {
      q: "Do reposts count as engagement?",
      a: "In this calculator, yes. Reposts are an optional field: fill them in from the post's analytics for a fuller picture, or leave them blank and they count as zero.",
    },
    {
      q: "Does the calculator connect to my LinkedIn account?",
      a: "No. You type the numbers yourself and the calculation runs in your browser. Nothing is uploaded or saved.",
    },
  ],
  related: [
    "/tools/linkedin-hashtag-generator",
    "/tools/linkedin-character-counter",
    "/tools/linkedin-post-preview",
    "/tools/best-time-to-post-on-linkedin",
    "/tools/social-media-analytics-report",
  ],
  schema: {
    features: [
      "Engagement rate by impressions or by followers",
      "Counts reactions, comments and reposts",
      "Optional reposts field",
      "Shows the formula used",
      "Runs in the browser, no login",
    ],
  },
  cta: {
    title: "Turn reactions into conversations.",
    mark: "Schedule the next post.",
    text: "Plan and schedule your LinkedIn posts with Poskoo, then keep an eye on what earns reactions, comments and reposts.",
  },
};

export const metadata = toolMetadata(config);

export default function LinkedInEngagementRateCalculatorPage() {
  return (
    <ToolPageTemplate config={config}>
      <EngagementCalculator labels={{ likes: "Reactions", shares: "Reposts" }} hideSaves reachLabel="Impressions" />
    </ToolPageTemplate>
  );
}
