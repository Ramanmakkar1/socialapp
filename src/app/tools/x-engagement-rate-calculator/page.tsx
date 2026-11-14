import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import EngagementCalculator from "../instagram-engagement-rate-calculator/EngagementCalculator";

const config: ToolPageConfig = {
  path: "/tools/x-engagement-rate-calculator",
  name: "X (Twitter) engagement rate calculator",
  crumb: "X (Twitter) engagement rate calculator",
  title: "X (Twitter) Engagement Rate Calculator: Free Online Tool",
  description:
    "Free X engagement rate calculator: add likes, replies, reposts, bookmarks and impressions or followers to get a post's engagement rate in seconds.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "X (Twitter) engagement rate calculator:", mark: "free", after: "by impressions" },
  lede: "X engagement rate = (likes + replies + reposts + bookmarks) / impressions x 100. Enter the numbers from one post, choose impressions or followers as the base, and get the rate as a percentage.",
  art: "analytics",
  artLabel: "A marketer reads a rising engagement chart next to an X-style post card",
  heroPoints: ["By impressions or followers", "Likes, replies, reposts and bookmarks", "No login"],
  toolTitle: "Calculate your X engagement rate",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the X engagement rate calculator",
  steps: [
    {
      title: "Choose By impressions or By followers",
      text: "Use the toggle at the top. Impressions compares the post to the people who actually saw it; followers compares it to your whole audience.",
      art: "analytics",
    },
    {
      title: "Enter the post's numbers",
      text: "Type Likes, Replies, Reposts and Bookmarks, then either Impressions or Followers. Reposts and bookmarks are optional: leave them blank and they count as zero.",
      art: "writing",
    },
    {
      title: "Read the rate and the formula",
      text: "The engagement rate appears as a percentage with two decimals, with the formula used shown underneath so you can check the maths.",
      art: "feat-leads",
    },
  ],
  featuresTitle: "A clearer X engagement number",
  features: [
    {
      title: "Built for X's metrics",
      text: "X shows likes, replies, reposts, bookmarks and impressions under each post, so the calculator uses exactly those labels.",
      art: "feat-leads",
    },
    {
      title: "Two honest bases",
      text: "Switch between impressions and followers to see how a post did with the people who saw it versus your whole audience.",
      art: "analytics",
    },
    {
      title: "Private by design",
      text: "The calculator does the arithmetic in your browser. It does not connect to X and your numbers are not uploaded.",
      art: "card-leads",
    },
  ],
  guide: {
    title: "A practical guide to X engagement rate",
    intro:
      "Engagement rate tells you what share of an audience reacted to a post. It is most useful for comparing your own posts with each other over time, not for comparing yourself with a stranger whose numbers you cannot see.",
    sections: [
      {
        title: "How this X engagement rate calculator works",
        body: (
          <>
            <p>
              The calculator adds likes, replies, reposts and bookmarks, divides the total by your chosen base and
              multiplies by 100:
            </p>
            <div className={t.example}>
              <p>(likes + replies + reposts + bookmarks) ÷ impressions × 100</p>
              <p>(likes + replies + reposts + bookmarks) ÷ followers × 100</p>
            </div>
            <p>
              Likes, replies and the base are required, and the base must be above zero. Reposts and bookmarks are
              optional and count as zero when left blank. The result is rounded to two decimals.
            </p>
          </>
        ),
      },
      {
        title: "Impressions or followers: which base to use",
        body: (
          <ul>
            <li>
              <b>By impressions</b> answers: of everyone who saw the post, how many reacted? X shows impressions for
              every post in its own analytics, so this is the easiest base to find.
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
        title: "Where to find post analytics on X",
        body: (
          <ul>
            <li>
              Open your post and tap the <b>analytics icon</b> (the small bar-chart icon) underneath it. That opens the
              post&apos;s own analytics with impressions and engagement.
            </li>
            <li>
              On the web you can also open the post&apos;s menu and choose <b>View post analytics</b>. The page lists
              impressions alongside likes, replies, reposts and bookmarks.
            </li>
            <li>
              If you use a scheduler or the X app&apos;s analytics screen, copy the same numbers into the calculator. Keep
              the post&apos;s own figures, not your account totals, so the rate matches that one post.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: one post, two rates",
        body: (
          <>
            <p>
              A post with 180 likes, 24 replies and 12 reposts on an account with 9,000 followers, which received
              6,000 impressions:
            </p>
            <div className={t.example}>
              <p>By impressions: 216 ÷ 6,000 × 100 = <b>3.60%</b></p>
              <p>By followers: 216 ÷ 9,000 × 100 = <b>2.40%</b></p>
              <p>Likes and replies only, by impressions: <b>3.40%</b></p>
            </div>
            <p>
              The last line shows why reposts and bookmarks matter: leaving them out hides the people who saved or
              passed the post on to their own followers.
            </p>
          </>
        ),
      },
      {
        title: "How to use engagement rate well",
        body: (
          <ul>
            <li>
              <b>Compare like with like.</b> Text posts, images, videos and threads behave differently, so compare each
              format with itself.
            </li>
            <li>
              <b>Track trends, not one post.</b> Note the rate for every post in a sheet or the{" "}
              <Link href="/tools/social-media-analytics-report">social media analytics report</Link> and look at the
              average over a month.
            </li>
            <li>
              <b>Give people a reason to reply.</b> A clear question or a comment keyword that sends a resource by DM
              turns passive viewers into conversations.
            </li>
            <li>
              <b>Read the parts.</b> A post with many replies but few likes is still doing a job; the total rate hides
              that.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "X engagement rate questions",
  faqs: [
    {
      q: "What is a good engagement rate on X?",
      a: "There is no single number that fits every account. Compare your own posts with each other over time, using the same base each time, rather than judging a post against a benchmark you cannot verify.",
    },
    {
      q: "How do you calculate engagement rate by impressions?",
      a: "Add the post's likes, replies, reposts and bookmarks, divide by how many times the post was shown (impressions) and multiply by 100. Impressions are shown in the post's own analytics on X.",
    },
    {
      q: "Should I use impressions or followers?",
      a: "Use impressions when you want to know how the people who saw the post responded. Use followers when you want to compare against your whole audience. Pick one and keep it for every post in a comparison.",
    },
    {
      q: "Where do I find post analytics on X?",
      a: "Open the post and tap the analytics icon (the small bar-chart icon) underneath it, or open the post's menu and choose View post analytics. That page lists impressions plus likes, replies, reposts and bookmarks.",
    },
    {
      q: "Do reposts and bookmarks count as engagement?",
      a: "In this calculator, yes. Reposts and bookmarks are optional fields: fill them in from the post's analytics for a fuller picture, or leave them blank and they count as zero.",
    },
    {
      q: "Does the calculator connect to my X account?",
      a: "No. You type the numbers yourself and the calculation runs in your browser. Nothing is uploaded or saved.",
    },
  ],
  related: [
    "/tools/x-post-preview",
    "/tools/x-thread-maker",
    "/tools/x-character-counter",
    "/tools/x-hashtag-generator",
    "/tools/best-time-to-post-on-x",
  ],
  schema: {
    features: [
      "Engagement rate by impressions or by followers",
      "Counts likes, replies, reposts and bookmarks",
      "Optional reposts and bookmarks fields",
      "Shows the formula used",
      "Runs in the browser, no login",
    ],
  },
  cta: {
    title: "Turn replies into conversations.",
    mark: "Schedule the next post.",
    text: "Plan and schedule your X posts with Poskoo, then keep an eye on what earns likes, replies, reposts and bookmarks.",
  },
};

export const metadata = toolMetadata(config);

export default function XEngagementRateCalculatorPage() {
  return (
    <ToolPageTemplate config={config}>
      <EngagementCalculator
        labels={{ likes: "Likes", comments: "Replies", shares: "Reposts", saves: "Bookmarks" }}
        reachLabel="Impressions"
      />
    </ToolPageTemplate>
  );
}
