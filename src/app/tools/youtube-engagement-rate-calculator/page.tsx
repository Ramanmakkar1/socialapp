import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import EngagementCalculator from "../instagram-engagement-rate-calculator/EngagementCalculator";

const config: ToolPageConfig = {
  path: "/tools/youtube-engagement-rate-calculator",
  name: "YouTube engagement rate calculator",
  crumb: "YouTube engagement rate calculator",
  title: "YouTube Engagement Rate Calculator: Free, by Views",
  description:
    "Free YouTube engagement rate calculator: add likes, comments and shares, divide by views or subscribers and get one video's engagement rate in seconds.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "YouTube engagement rate calculator:", mark: "free", after: "by views" },
  lede: "YouTube engagement rate = (likes + comments + shares) / views x 100. Enter the numbers from one video, choose views or subscribers as the base, and get the rate as a percentage.",
  art: "analytics",
  artLabel: "A creator reads a rising engagement chart next to a YouTube-style video card",
  heroPoints: ["By views or subscribers", "Likes, comments and shares", "No login"],
  toolTitle: "Calculate your YouTube engagement rate",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the YouTube engagement rate calculator",
  steps: [
    {
      title: "Choose By views or By subscribers",
      text: "Use the toggle at the top. Views compares the video to the people who actually watched it; subscribers compares it to your whole channel audience.",
      art: "analytics",
    },
    {
      title: "Enter the video's numbers",
      text: "Type Likes, Comments and Shares, then either Views or Subscribers. Shares are optional: leave them blank and they count as zero.",
      art: "writing",
    },
    {
      title: "Read the rate and the formula",
      text: "The engagement rate appears as a percentage with two decimals, with the formula used shown underneath so you can check the maths.",
      art: "feat-leads",
    },
  ],
  featuresTitle: "A clearer YouTube engagement number",
  features: [
    {
      title: "Built for YouTube's metrics",
      text: "YouTube shows likes, comments, shares and views in its own analytics, so the calculator uses exactly those labels.",
      art: "feat-leads",
    },
    {
      title: "Two honest bases",
      text: "Switch between views and subscribers to see how a video did with the people who watched it versus your whole channel audience.",
      art: "analytics",
    },
    {
      title: "Private by design",
      text: "The calculator does the arithmetic in your browser. It does not connect to YouTube and your numbers are not uploaded.",
      art: "card-leads",
    },
  ],
  guide: {
    title: "A practical guide to YouTube engagement rate",
    intro:
      "Engagement rate tells you what share of an audience reacted to a video. It is most useful for comparing your own uploads with each other over time, not for comparing yourself with a channel whose numbers you cannot see.",
    sections: [
      {
        title: "How this YouTube engagement rate calculator works",
        body: (
          <>
            <p>
              The calculator adds likes, comments and shares, divides the total by your chosen base and multiplies by
              100:
            </p>
            <div className={t.example}>
              <p>(likes + comments + shares) ÷ views × 100</p>
              <p>(likes + comments + shares) ÷ subscribers × 100</p>
            </div>
            <p>
              Likes, comments and the base are required, and the base must be above zero. Shares are optional and count
              as zero when left blank. The result is rounded to two decimals.
            </p>
          </>
        ),
      },
      {
        title: "Views or subscribers: which base to use",
        body: (
          <ul>
            <li>
              <b>By views</b> answers: of everyone who watched the video, how many reacted? YouTube Studio shows views
              for every video, so this is the easiest base to find.
            </li>
            <li>
              <b>By subscribers</b> answers: of everyone who follows the channel, how many engaged? It is easy to
              compare across uploads while your subscriber count is stable.
            </li>
            <li>
              Pick one base and stick with it when you compare videos. Mixing the two makes the comparison meaningless.
            </li>
          </ul>
        ),
      },
      {
        title: "Shorts vs long videos",
        body: (
          <ul>
            <li>
              <b>Shorts</b> often collect far more views than likes and comments, so a views-based rate can look low
              even when the Short reached a large audience. Compare Shorts with other Shorts.
            </li>
            <li>
              <b>Long videos</b> tend to earn more comments per view because viewers stay longer and can respond to the
              content. Compare them with other long videos.
            </li>
            <li>
              Whichever format you publish, keep the same base for every video in a comparison so the trend is real.
            </li>
          </ul>
        ),
      },
      {
        title: "Where to find the numbers in YouTube Studio",
        body: (
          <ul>
            <li>
              Open <b>YouTube Studio</b> and go to <b>Analytics</b>, then <b>Engagement</b> to see likes, comments and
              shares for a video.
            </li>
            <li>
              Switch on <b>Advanced mode</b> to reach the detailed reports, then open the <b>Content</b> tab and pick the
              video you want to check.
            </li>
            <li>
              Views and subscribers are shown in the same Analytics area, so you can copy both numbers straight into the
              calculator.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: one video, two rates",
        body: (
          <>
            <p>
              A video with 1,200 likes, 180 comments and 90 shares on a channel with 40,000 subscribers, which received
              60,000 views:
            </p>
            <div className={t.example}>
              <p>By views: 1,470 ÷ 60,000 × 100 = <b>2.45%</b></p>
              <p>By subscribers: 1,470 ÷ 40,000 × 100 = <b>3.68%</b></p>
              <p>Likes and comments only, by views: <b>2.30%</b></p>
            </div>
            <p>
              The last line shows why shares matter: leaving them out hides the people who passed the video on to their
              own audience.
            </p>
          </>
        ),
      },
      {
        title: "How to use engagement rate well",
        body: (
          <ul>
            <li>
              <b>Compare like with like.</b> Shorts, tutorials, vlogs and reviews behave differently, so compare each
              format with itself.
            </li>
            <li>
              <b>Track trends, not one video.</b> Note the rate for every upload in a sheet or the{" "}
              <Link href="/tools/social-media-analytics-report">social media analytics report</Link> and look at the
              average over a month.
            </li>
            <li>
              <b>Give people a reason to comment.</b> A clear question or a comment keyword that sends a resource by DM
              turns passive viewers into conversations.
            </li>
            <li>
              <b>Read the parts.</b> A video with many comments but few likes is still doing a job; the total rate hides
              that.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "YouTube engagement rate questions",
  faqs: [
    {
      q: "How do you calculate engagement rate on YouTube?",
      a: "Add a video's likes, comments and shares, divide by its views (or by your subscribers) and multiply by 100. This calculator does the arithmetic in your browser as you type.",
    },
    {
      q: "Should I use views or subscribers?",
      a: "Use views when you want to know how the people who watched the video responded, which is usually fairer for Shorts. Use subscribers when you want to compare against your whole channel audience. Pick one and keep it for every video in a comparison.",
    },
    {
      q: "What is a good engagement rate on YouTube?",
      a: "There is no single number that fits every channel. Compare your own videos with each other over time, using the same base each time, rather than judging a video against a benchmark you cannot verify.",
    },
    {
      q: "Do shares count as engagement?",
      a: "In this calculator, yes. Shares are an optional field: fill them in from YouTube Studio for a fuller picture, or leave them blank and they count as zero.",
    },
    {
      q: "Where do I find likes, comments and shares in YouTube Studio?",
      a: "Open YouTube Studio, go to Analytics and then Engagement. Turn on Advanced mode for the detailed reports, then open the Content tab and choose the video you want to check.",
    },
    {
      q: "Does the calculator connect to my YouTube account?",
      a: "No. You type the numbers yourself and the calculation runs in your browser. Nothing is uploaded or saved.",
    },
  ],
  related: [
    "/tools/youtube-title-generator",
    "/tools/youtube-title-counter",
    "/tools/youtube-tag-generator",
    "/tools/best-time-to-post-on-youtube",
    "/tools/social-media-analytics-report",
  ],
  schema: {
    features: [
      "Engagement rate by views or by subscribers",
      "Counts likes, comments and shares",
      "Optional shares field",
      "Shows the formula used",
      "Runs in the browser, no login",
    ],
  },
  cta: {
    title: "Turn viewers into conversations.",
    mark: "Schedule the next video.",
    text: "Plan and schedule your YouTube uploads with Poskoo, then keep an eye on what earns likes, comments and shares.",
  },
};

export const metadata = toolMetadata(config);

export default function YouTubeEngagementRateCalculatorPage() {
  return (
    <ToolPageTemplate config={config}>
      <EngagementCalculator labels={{ likes: "Likes", shares: "Shares" }} hideSaves reachLabel="Views" followersLabel="Subscribers" />
    </ToolPageTemplate>
  );
}
