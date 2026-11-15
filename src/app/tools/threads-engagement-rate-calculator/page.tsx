import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import EngagementCalculator from "../instagram-engagement-rate-calculator/EngagementCalculator";

const config: ToolPageConfig = {
  path: "/tools/threads-engagement-rate-calculator",
  name: "Threads engagement rate calculator",
  crumb: "Threads engagement rate calculator",
  title: "Threads Engagement Rate Calculator: Free Online Tool",
  description:
    "Free Threads engagement rate calculator: add likes, replies, reposts and quotes, then divide by views or followers to get one post's engagement rate.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Threads engagement rate calculator:", mark: "free", after: "by views or followers" },
  lede: "Threads engagement rate = (likes + replies + reposts + quotes) / views x 100. Enter one post's numbers, choose views or followers as the base and get the rate as a percentage.",
  art: "analytics",
  artLabel: "A marketer reads a rising engagement chart next to a Threads-style post card",
  heroPoints: ["By views or followers", "Likes, replies, reposts and quotes", "No login"],
  toolTitle: "Calculate your Threads engagement rate",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Threads engagement rate calculator",
  steps: [
    {
      title: "Choose By views or By followers",
      text: "Use the toggle at the top. Views compares the post to the people who actually saw it; followers compares it to your whole audience.",
      art: "analytics",
    },
    {
      title: "Enter the post's numbers",
      text: "Type Likes, Replies, Reposts and Quotes, then either Views or Followers. Quotes are optional: leave them blank and they count as zero.",
      art: "writing",
    },
    {
      title: "Read the rate and the formula",
      text: "The engagement rate appears as a percentage with two decimals, with the formula used shown underneath so you can check the maths.",
      art: "feat-leads",
    },
  ],
  featuresTitle: "A clearer Threads engagement number",
  features: [
    {
      title: "Built for Threads' metrics",
      text: "Threads shows likes, replies, reposts, quotes and views on each post, so the calculator uses exactly those labels.",
      art: "feat-leads",
    },
    {
      title: "Two honest bases",
      text: "Switch between views and followers to see how a post did with the people who saw it versus your whole audience.",
      art: "analytics",
    },
    {
      title: "Private by design",
      text: "The calculator does the arithmetic in your browser. It does not connect to Threads and your numbers are not uploaded.",
      art: "card-leads",
    },
  ],
  guide: {
    title: "A practical guide to Threads engagement rate",
    intro:
      "Engagement rate tells you what share of an audience reacted to a post. It is most useful for comparing your own Threads posts with each other over time, not for comparing yourself with a stranger whose numbers you cannot see.",
    sections: [
      {
        title: "How this Threads engagement rate calculator works",
        body: (
          <>
            <p>
              The calculator adds likes, replies, reposts and quotes, divides the total by your chosen base and
              multiplies by 100:
            </p>
            <div className={t.example}>
              <p>(likes + replies + reposts + quotes) ÷ views × 100</p>
              <p>(likes + replies + reposts + quotes) ÷ followers × 100</p>
            </div>
            <p>
              Likes, replies and the base are required, and the base must be above zero. Reposts and quotes are
              optional and count as zero when left blank. The result is rounded to two decimals.
            </p>
          </>
        ),
      },
      {
        title: "Views or followers: which base to use",
        body: (
          <ul>
            <li>
              <b>By views</b> answers: of everyone who saw the post, how many reacted? Threads shows a views count for
              every post, so this is the easiest base to find.
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
        title: "Where to find post insights on Threads",
        body: (
          <ul>
            <li>
              Open the post and tap the <b>views count</b> under it to see post insights. That view lists views
              alongside likes, replies, reposts and quotes for that one post.
            </li>
            <li>
              On your profile, open the <b>Insights</b> page to see how your posts are performing across a date range.
            </li>
            <li>
              If you use a scheduler, copy the same numbers into the calculator. Keep the post&apos;s own figures, not
              your account totals, so the rate matches that one post.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: one post, two rates",
        body: (
          <>
            <p>
              A post with 90 likes, 15 replies, 6 reposts and 4 quotes on an account with 2,500 followers, which
              received 4,000 views:
            </p>
            <div className={t.example}>
              <p>90 + 15 + 6 + 4 = 115</p>
              <p>By views: 115 ÷ 4,000 × 100 = <b>2.88%</b></p>
              <p>By followers: 115 ÷ 2,500 × 100 = <b>4.60%</b></p>
            </div>
            <p>
              The same 115 interactions look very different against views and followers, which is why the base you pick
              matters when you compare posts.
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
  faqTitle: "Threads engagement rate questions",
  faqs: [
    {
      q: "What is a good engagement rate on Threads?",
      a: "There is no single number that fits every account. Compare your own posts with each other over time, using the same base each time, rather than judging a post against a benchmark you cannot verify.",
    },
    {
      q: "How do you calculate engagement rate by views?",
      a: "Add the post's likes, replies, reposts and quotes, divide by how many times the post was viewed (views) and multiply by 100. Tap the views count under a Threads post to see its insights.",
    },
    {
      q: "Should I use views or followers?",
      a: "Use views when you want to know how the people who saw the post responded. Use followers when you want to compare against your whole audience. Pick one and keep it for every post in a comparison.",
    },
    {
      q: "Where do I find post insights on Threads?",
      a: "Open the post and tap the views count under it to see post insights, or use the Insights page on your Threads profile. Both show views plus likes, replies, reposts and quotes.",
    },
    {
      q: "Do reposts and quotes count as engagement?",
      a: "In this calculator, yes. Reposts and quotes are optional fields: fill them in from the post's insights for a fuller picture, or leave them blank and they count as zero.",
    },
    {
      q: "Does the calculator connect to my Threads account?",
      a: "No. You type the numbers yourself and the calculation runs in your browser. Nothing is uploaded or saved.",
    },
  ],
  related: [
    "/tools/threads-post-preview",
    "/tools/threads-character-counter",
    "/tools/threads-thread-maker",
    "/tools/threads-bio-generator",
    "/tools/best-time-to-post-on-threads",
  ],
  schema: {
    features: [
      "Engagement rate by views or by followers",
      "Counts likes, replies, reposts and quotes",
      "Optional quotes field",
      "Shows the formula used",
      "Runs in the browser, no login",
    ],
  },
  cta: {
    title: "Turn replies into conversations.",
    mark: "Schedule the next Threads post.",
    text: "Plan and schedule your Threads posts with Poskoo, then keep an eye on what earns likes, replies, reposts and quotes.",
  },
};

export const metadata = toolMetadata(config);

export default function ThreadsEngagementRateCalculatorPage() {
  return (
    <ToolPageTemplate config={config}>
      <EngagementCalculator
        labels={{ likes: "Likes", comments: "Replies", shares: "Reposts", saves: "Quotes" }}
        reachLabel="Views"
      />
    </ToolPageTemplate>
  );
}
