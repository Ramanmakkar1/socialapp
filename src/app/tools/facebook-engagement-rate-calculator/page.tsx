import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import EngagementCalculator from "../instagram-engagement-rate-calculator/EngagementCalculator";

const config: ToolPageConfig = {
  path: "/tools/facebook-engagement-rate-calculator",
  name: "Facebook engagement rate calculator",
  crumb: "Facebook engagement rate calculator",
  title: "Facebook Engagement Rate Calculator: Free Online Tool",
  description:
    "Free Facebook engagement rate calculator: add reactions, comments and shares, then divide by reach or followers to get one post's engagement rate fast.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Facebook engagement rate calculator:", mark: "free", after: "by reach or followers" },
  lede: "Facebook engagement rate = (reactions + comments + shares) ÷ reach or followers × 100. This free tool needs no sign-up: enter one post's numbers and it returns the rate as a percentage.",
  art: "analytics",
  artLabel: "A marketer reads a rising engagement chart next to a Facebook-style post card",
  heroPoints: ["By reach or followers", "Reactions, comments and shares", "No login"],
  toolTitle: "Calculate your Facebook engagement rate",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Facebook engagement rate calculator",
  steps: [
    {
      title: "Choose By reach or By followers",
      text: "Use the toggle at the top. Reach compares the post to the people who actually saw it; followers compares it to your whole audience.",
      art: "analytics",
    },
    {
      title: "Enter the post's numbers",
      text: "Type Reactions, Comments and Shares, then either Reach or Followers. Comments and shares are optional: leave them blank and they count as zero.",
      art: "writing",
    },
    {
      title: "Read the rate and the formula",
      text: "The engagement rate appears as a percentage with two decimals, with the formula used shown underneath so you can check the maths.",
      art: "feat-leads",
    },
  ],
  featuresTitle: "A clearer Facebook engagement number",
  features: [
    {
      title: "Built for Facebook's metrics",
      text: "Facebook shows reactions, comments and shares under each post, so the calculator uses exactly those labels.",
      art: "feat-leads",
    },
    {
      title: "Two honest bases",
      text: "Switch between reach and followers to see how a post did with the people who saw it versus your whole audience.",
      art: "analytics",
    },
    {
      title: "Private by design",
      text: "The calculator does the arithmetic in your browser. It does not connect to Facebook and your numbers are not uploaded.",
      art: "card-leads",
    },
  ],
  guide: {
    title: "A practical guide to Facebook engagement rate",
    intro:
      "Engagement rate tells you what share of an audience reacted to a post. It is most useful for comparing your own posts with each other over time, not for comparing yourself with a stranger whose numbers you cannot see.",
    sections: [
      {
        title: "How this Facebook engagement rate calculator works",
        body: (
          <>
            <p>
              The calculator adds reactions, comments and shares, divides the total by your chosen base and multiplies by
              100:
            </p>
            <div className={t.example}>
              <p>(reactions + comments + shares) ÷ reach × 100</p>
              <p>(reactions + comments + shares) ÷ followers × 100</p>
            </div>
            <p>
              Reactions, comments and the base are required, and the base must be above zero. Shares are optional and
              count as zero when left blank. The result is rounded to two decimals.
            </p>
            <p>
              Every reaction counts: Like, Love, Care, Haha, Wow, Sad and Angry are all added together. Use the total
              reaction count shown under the post, not just the likes.
            </p>
          </>
        ),
      },
      {
        title: "Reach or followers: which base to use",
        body: (
          <ul>
            <li>
              <b>By reach</b> answers: of everyone who saw the post, how many reacted? Reach is shown in Meta Business
              Suite and in the post&apos;s own insights, so this is the easiest base to find.
            </li>
            <li>
              <b>By followers</b> answers: of everyone who follows your Page, how many engaged? It is easy to compare
              across posts while your follower count is stable.
            </li>
            <li>
              Pick one base and stick with it when you compare posts. Mixing the two makes the comparison meaningless.
            </li>
          </ul>
        ),
      },
      {
        title: "Where to find post numbers on Facebook",
        body: (
          <ul>
            <li>
              In Meta Business Suite, open <b>Content</b>, then the post, to see reach and interactions for that post.
            </li>
            <li>
              On a Page post, open the <b>insights shown under the post</b> to see reach plus reactions, comments and
              shares.
            </li>
            <li>
              If you use a scheduler, copy the same numbers into the calculator. Keep the post&apos;s own figures, not
              your Page totals, so the rate matches that one post.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: one post, two rates",
        body: (
          <>
            <p>
              A post with 120 reactions, 18 comments and 12 shares on a Page with 8,000 followers, which reached 5,000
              people:
            </p>
            <div className={t.example}>
              <p>Total interactions: 120 + 18 + 12 = <b>150</b></p>
              <p>By reach: 150 ÷ 5,000 × 100 = <b>3.00%</b></p>
              <p>By followers: 150 ÷ 8,000 × 100 = <b>1.88%</b></p>
            </div>
            <p>
              The same 150 interactions give a very different rate depending on the base, which is why the base you
              choose should stay the same across a comparison.
            </p>
          </>
        ),
      },
      {
        title: "How to use engagement rate well",
        body: (
          <ul>
            <li>
              <b>Compare like with like.</b> Photos, videos, links and text posts behave differently, so compare each
              format with itself.
            </li>
            <li>
              <b>Track trends, not one post.</b> Note the rate for every post in a sheet or the{" "}
              <Link href="/tools/social-media-analytics-report">social media analytics report</Link> and look at the
              average over a month.
            </li>
            <li>
              <b>Give people a reason to react.</b> A clear question or a comment keyword that sends a resource by DM
              turns passive viewers into conversations.
            </li>
            <li>
              <b>Read the parts.</b> A post with many shares but few reactions is still doing a job; the total rate hides
              that.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Facebook engagement rate questions",
  faqs: [
    {
      q: "What is a good engagement rate on Facebook?",
      a: "There is no single number that fits every Page. Compare your own posts with each other over time, using the same base each time, rather than judging a post against a benchmark you cannot verify.",
    },
    {
      q: "How do you calculate engagement rate by reach?",
      a: "Add the post's reactions, comments and shares, divide by how many people the post reached and multiply by 100. Reach is shown in Meta Business Suite and in the insights under the post.",
    },
    {
      q: "Should I use reach or followers?",
      a: "Use reach when you want to know how the people who saw the post responded. Use followers when you want to compare against your whole audience. Pick one and keep it for every post in a comparison.",
    },
    {
      q: "Where do I find reach and interactions on Facebook?",
      a: "In Meta Business Suite, open Content and then the post to see reach and interactions. On a Page post, open the insights shown under the post to see reach plus reactions, comments and shares.",
    },
    {
      q: "Do all Facebook reactions count as engagement?",
      a: "In this calculator, yes. Like, Love, Care, Haha, Wow, Sad and Angry are all reactions, so enter the total reaction count shown under the post.",
    },
    {
      q: "Does the calculator connect to my Facebook account?",
      a: "No. You type the numbers yourself and the calculation runs in your browser. Nothing is uploaded or saved.",
    },
  ],
  related: [
    "/tools/facebook-post-preview",
    "/tools/facebook-caption-generator",
    "/tools/facebook-character-counter",
    "/tools/facebook-hashtag-generator",
    "/tools/best-time-to-post-on-facebook",
  ],
  schema: {
    features: [
      "Engagement rate by reach or by followers",
      "Counts reactions, comments and shares",
      "Every reaction type counted together",
      "Shows the formula used",
      "Runs in the browser, no login",
    ],
  },
  cta: {
    title: "See which posts land, then plan more.",
    mark: "Schedule the next post.",
    text: "Plan and schedule your Facebook posts with Poskoo, then keep an eye on what earns reactions, comments and shares.",
  },
};

export const metadata = toolMetadata(config);

export default function FacebookEngagementRateCalculatorPage() {
  return (
    <ToolPageTemplate
      config={config}
      afterTool={
        <p className={t.prose}>
          Also post on Instagram? Run the same numbers through the{" "}
          <Link href="/tools/instagram-engagement-rate-calculator">Instagram engagement rate calculator</Link>{" "}
          or plan your posts with the <Link href="/instagram-scheduler">Instagram scheduler</Link>.
        </p>
      }
    >
      <EngagementCalculator
        labels={{ likes: "Reactions", comments: "Comments", shares: "Shares" }}
        reachLabel="Reach"
        hideSaves
      />
    </ToolPageTemplate>
  );
}
