import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import FrequencyCalculator from "./FrequencyCalculator";

const config: ToolPageConfig = {
  path: "/tools/instagram-posting-frequency-calculator",
  name: "Instagram posting frequency calculator",
  crumb: "Posting frequency calculator",
  title: "Instagram Posting Frequency Calculator: Plan Your Week",
  description:
    "Free Instagram posting frequency calculator: set a weekly time budget, pick Reels, carousels, feed posts or Stories and see a realistic weekly range.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Instagram posting frequency", mark: "calculator" },
  lede: "Pick a weekly time budget and the formats you make. The calculator turns them into a realistic posts-per-week range and a sample week you can actually keep.",
  art: "analytics",
  artLabel: "A creator waters a growing bar chart while hearts float up",
  heroPoints: ["1 to 12 hours a week", "4 content formats", "No signup"],
  toolTitle: "Calculate your weekly posting range",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Instagram posting frequency calculator",
  steps: [
    {
      title: "Set your weekly time budget",
      text: "Drag the Weekly time budget slider to the hours you can really spend on Instagram content each week, from 1 to 12.",
      art: "card-schedule",
    },
    {
      title: "Tick the formats you make",
      text: "Choose any mix of Reels (about 45 min each), Carousels (30 min), Feed posts (20 min) and Stories (10 min).",
      art: "visual",
    },
    {
      title: "Read the range and sample week",
      text: "The result shows a low-to-high posts-per-week range and a sample week that splits your hours evenly across the formats you ticked.",
      art: "analytics",
    },
  ],
  featuresTitle: "A cadence built on your time, not a magic number",
  features: [
    {
      title: "Based on your real hours",
      text: "The range comes from your own weekly budget and per-format time estimates, so it is a plan you can sustain.",
      art: "feat-calendar",
    },
    {
      title: "A balanced sample week",
      text: "See how many of each format fit when the time is shared equally, for example 2 Reels and 6 feed posts in 4 hours.",
      art: "card-schedule",
    },
    {
      title: "Private and instant",
      text: "Everything is simple arithmetic in your browser. Nothing is uploaded and no Instagram login is needed.",
      art: "analytics",
    },
  ],
  guide: {
    title: "How often to post on Instagram in 2026",
    intro:
      "There is no single posting frequency that works for every account. A cadence you can keep up week after week, with content your audience responds to, beats a burst of daily posts you abandon after a month. This calculator helps you find that cadence from the time you actually have.",
    sections: [
      {
        title: "What this calculator does",
        body: (
          <>
            <p>
              Each format has a rough time estimate for one finished piece, including the caption:{" "}
              <b>Reels about 45 minutes</b>, <b>carousels 30</b>, <b>feed posts 20</b> and <b>Stories 10</b>. The
              calculator converts your weekly hours to minutes and divides them by those estimates.
            </p>
            <ul>
              <li>The <b>low end</b> of the range assumes you spend the whole week on your slowest selected format.</li>
              <li>The <b>high end</b> assumes you spend it all on your fastest selected format.</li>
              <li>
                The <b>sample week</b> splits your hours equally across the formats you ticked and rounds each one down.
              </li>
            </ul>
            <p>
              It is a planning estimate. It does not look at your account, your Insights or your audience, and it does
              not predict growth.
            </p>
          </>
        ),
      },
      {
        title: "Best practices for posting frequency",
        body: (
          <ul>
            <li>
              <b>Consistency over volume.</b> Pick a number you can hold for months, then raise it only when the work
              feels easy.
            </li>
            <li>
              <b>Mix formats by job.</b> Many <Link href="/social-media-scheduler-for-creators">creators</Link> use Reels to reach new people, carousels and feed posts for
              saves, and Stories to stay visible to existing followers.
            </li>
            <li>
              <b>Batch the work.</b> Create the week&apos;s content in one or two sessions, then queue it in an{" "}
              <Link href="/instagram-scheduler">Instagram scheduler</Link> so publishing does not eat into creation time.
            </li>
            <li>
              <b>Let Insights decide the mix.</b> Watch saves, shares, comments and follows per post, and move hours
              toward the format your audience responds to.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: 4 hours a week with Reels and feed posts",
        body: (
          <>
            <p>
              With the slider on 4 hours and only Reels and Feed posts ticked (the defaults), the calculator shows:
            </p>
            <div className={t.example}>
              <p><b>5–12 posts / week</b></p>
              <p>5 if you spend the week on your slowest format, up to 12 on your fastest.</p>
              <p>Sample week (8 posts): 2 reels · 6 feed posts</p>
            </div>
            <p>
              The 240 minutes are split into 120 for Reels (2 at 45 minutes) and 120 for feed posts (6 at 20 minutes).
              If your Reels take longer than 45 minutes, plan toward the low end of the range.
            </p>
          </>
        ),
      },
      {
        title: "Turn the range into a calendar",
        body: (
          <>
            <p>
              Spread the sample week across fixed days so followers learn when to expect you, and leave one slot free
              for something timely. Plot it in the{" "}
              <Link href="/tools/social-media-content-calendar">social media content calendar</Link>, then check the
              order of work with the <Link href="/tools/instagram-scheduling-checklist">scheduling checklist</Link>.
            </p>
          </>
        ),
      },
      {
        title: "Common posting frequency mistakes",
        body: (
          <ul>
            <li>Copying another creator&apos;s schedule without their team or time budget.</li>
            <li>Planning to the high end of the range when most of your content is Reels.</li>
            <li>Posting more often while quality drops, instead of posting a little less.</li>
            <li>Changing the cadence every week, so you never learn what actually works.</li>
            <li>Forgetting time for replies to comments and DMs, which also takes hours.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram posting frequency questions",
  faqs: [
    {
      q: "How often should I post on Instagram?",
      a: "There is no universal ideal frequency. A cadence you can sustain beats a burst you abandon, and the right number depends on your time and how your audience responds. Use the calculator to turn your weekly time budget into a range you can keep, then adjust using Instagram Insights.",
    },
    {
      q: "Does posting more often guarantee more growth?",
      a: "No. Volume on its own is not a growth plan. Consistency, content quality and how people respond (saves, shares, comments and follows) matter more than hitting a set number of posts.",
    },
    {
      q: "How does the calculator work out the range?",
      a: "It converts your weekly hours to minutes and divides by rough per-piece estimates: Reels 45 minutes, carousels 30, feed posts 20 and Stories 10. The low number assumes only your slowest selected format, the high number only your fastest.",
    },
    {
      q: "What is the sample week?",
      a: "It splits your weekly minutes equally across the formats you selected and shows how many of each fit, rounded down. It is one balanced example, not the only right mix.",
    },
    {
      q: "How do I keep a posting schedule without posting manually every day?",
      a: "Batch-create content once a week and schedule it. Poskoo's Instagram scheduler publishes feed posts, Reels, carousels and Stories at the times you pick, and has a free plan.",
    },
  ],
  related: [
    "/tools/social-media-content-calendar",
    "/tools/instagram-scheduling-checklist",
    "/tools/instagram-time-zone-converter",
    "/tools/instagram-post-ideas-generator",
    "/tools/instagram-engagement-rate-calculator",
  ],
  schema: {
    features: [
      "Weekly time budget from 1 to 12 hours",
      "Reels, carousels, feed posts and Stories",
      "Low-to-high posts-per-week range",
      "Balanced sample week",
      "Runs in the browser, no signup",
    ],
  },
  cta: {
    title: "Your weekly plan is set.",
    mark: "Let it publish itself.",
    text: "Batch your posts once, schedule the whole week with Poskoo, and auto-DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramPostingFrequencyCalculatorPage() {
  return (
    <ToolPageTemplate config={config}>
      <FrequencyCalculator />
    </ToolPageTemplate>
  );
}
