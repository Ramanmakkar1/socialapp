import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import MoneyCalculator from "./MoneyCalculator";

const config: ToolPageConfig = {
  path: "/tools/instagram-money-calculator",
  name: "Instagram money calculator",
  crumb: "Instagram money calculator",
  title: "Instagram Money Calculator: Estimate Sponsored Post Pay",
  description:
    "A rough Instagram sponsored-post price is $5-$25 per 1,000 followers, adjusted by engagement rate. Estimate post, Reel, Story and monthly pay free.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Instagram money calculator:", mark: "estimate", after: "what a post can earn" },
  lede: "A rough Instagram sponsored-post price is $5-$25 per 1,000 followers, adjusted up or down by your engagement rate. Enter your followers, engagement rate and post rate to estimate pay per post, Reel, Story and month.",
  art: "analytics",
  artLabel: "A creator watches an upward chart with coins and dollar signs floating up",
  heroPoints: ["Post, Reel and Story estimates", "Adjusts for engagement", "No login"],
  toolTitle: "Estimate your sponsored-post pay",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Instagram money calculator",
  steps: [
    {
      title: "Enter followers and engagement rate",
      text: "Type your follower count and average engagement rate. If you do not know the rate, the link under the field opens the Instagram engagement rate calculator.",
      art: "analytics",
    },
    {
      title: "Set your rate per 1,000 followers",
      text: "The low and high fields start at $5 and $25 per 1,000 followers per feed post. Edit them to match what brands pay in your niche.",
      art: "writing",
    },
    {
      title: "Read the post, Reel, Story and monthly estimates",
      text: "The result shows an estimated range for a feed post, Reel (x1.3), Story (x0.4) and N posts a month. The formula is shown underneath.",
      art: "feat-leads",
    },
  ],
  featuresTitle: "One estimate across every sponsored format",
  features: [
    {
      title: "Engagement-adjusted ranges",
      text: "The rate scales down when engagement is under 1% and up when it is above 3%, so a highly engaged account is not priced like a quiet one.",
      art: "analytics",
    },
    {
      title: "Post, Reel and Story",
      text: "Reels are estimated at 1.3 times a feed post and Stories at 0.4 times, giving you a quick range for each placement.",
      art: "feat-leads",
    },
    {
      title: "Monthly planning",
      text: "Set how many sponsored posts you take a month and see an estimated monthly range you can use when talking to brands.",
      art: "card-leads",
    },
  ],
  guide: {
    title: "A practical guide to Instagram sponsored-post pricing",
    intro:
      "This calculator gives a starting range, not a quote. It multiplies your followers by a rate per 1,000 followers and adjusts for engagement, so you can walk into a brand conversation with a number instead of a guess.",
    sections: [
      {
        title: "How much do Instagram influencers make per post?",
        body: (
          <>
            <p>
              As a rough starting point, sponsored feed posts are often priced at <b>$5 to $25 per 1,000 followers</b>.
              That means a creator with 10,000 followers might estimate $50 to $250 per feed post, before any engagement
              adjustment. Micro accounts often sit near the top of that range per follower because their audience is
              more engaged, while large accounts can sit lower.
            </p>
            <p>
              Real deals also depend on the niche, usage rights, exclusivity and how many deliverables the brand wants.
              Use this calculator as a floor and ceiling for the conversation, then confirm the scope in writing.
            </p>
            <div className={t.example}>
              <p>10,000 followers × $5 to $25 per 1,000 = $50 to $250 per feed post</p>
              <p>A 4% engagement rate applies x1.5, giving $75 to $375</p>
              <p>The same post as a Reel estimates at 1.3×, and as a Story at 0.4×</p>
            </div>
            <p>
              For more ways creators earn beyond one-off posts, read the{" "}
              <Link href="/guides/how-to-make-money-on-social-media-2026">
                guide to making money on social media in 2026
              </Link>
              .
            </p>
          </>
        ),
      },
      {
        title: "Does engagement rate matter more than followers?",
        body: (
          <>
            <p>
              Followers set the size of the audience, but engagement tells a brand how many of those people actually
              respond. A smaller, highly engaged account can be worth more per follower than a large, quiet one. That is
              why this calculator adjusts the rate:
            </p>
            <ul>
              <li><b>Under 1%:</b> x0.5, because the audience is slow to interact.</li>
              <li><b>1% to 3%:</b> x1, the neutral default.</li>
              <li><b>3% to 6%:</b> x1.5, a healthy rate for a sponsored post.</li>
              <li><b>Over 6%:</b> x2, a very responsive audience.</li>
            </ul>
            <p>
              Measure the rate on recent posts, not one viral hit. If you are unsure, use the{" "}
              <Link href="/tools/instagram-engagement-rate-calculator">Instagram engagement rate calculator</Link>{" "}
              first, then come back here.
            </p>
          </>
        ),
      },
      {
        title: "How else can creators earn on Instagram?",
        body: (
          <>
            <p>
              Sponsored posts are only one stream. Creators also earn from affiliate links, digital products, coaching,
              brand ambassadorships and lead generation. Lead capture is often the most durable: a comment keyword can
              send a link, guide or booking page straight to a warm follower, and you keep the contact.
            </p>
            <p>
              Poskoo&apos;s <Link href="/instagram-auto-dm">Instagram auto-DM</Link> sends that link automatically when
              someone comments your chosen keyword, so a sponsored post can keep producing leads after the campaign
              ends. Schedule the content, then capture the interest it creates.
            </p>
          </>
        ),
      },
    ],
  },
  faqTitle: "Instagram money calculator questions",
  faqs: [
    {
      q: "How much can I earn per Instagram post?",
      a: "A common starting range is $5 to $25 per 1,000 followers per feed post, adjusted for engagement. A 10,000-follower account might estimate $50 to $250, or higher with strong engagement and a valuable niche.",
    },
    {
      q: "How does this calculator work?",
      a: "It divides your followers by 1,000, multiplies by your low and high rate per 1,000 followers, then applies an engagement multiplier: x0.5 under 1%, x1 for 1-3%, x1.5 for 3-6% and x2 over 6%. Reels use x1.3 and Stories x0.4 of the feed-post estimate.",
    },
    {
      q: "Are these Instagram earnings accurate?",
      a: "No. The result is an estimate only, not a guarantee and not data from Instagram. Real rates vary by niche, audience location, usage rights, exclusivity and the brand's budget.",
    },
    {
      q: "Why do Reels and Stories pay differently?",
      a: "Brands usually pay more for a Reel because it can reach new viewers for longer, and less for a Story because it disappears after 24 hours. This calculator applies x1.3 for Reels and x0.4 for Stories as simple starting multipliers.",
    },
    {
      q: "Does the calculator connect to my Instagram account?",
      a: "No. You type the numbers yourself and the calculation runs in your browser. Nothing is uploaded or connected to Instagram, and no login is needed.",
    },
  ],
  related: [
    "/tools/instagram-engagement-rate-calculator",
    "/tools/instagram-posting-frequency-calculator",
    "/tools/instagram-comment-to-dm-calculator",
    "/tools/instagram-bio-generator",
    "/tools/best-time-to-post-on-instagram",
  ],
  schema: {
    features: [
      "Estimated sponsored-post price range from followers",
      "Engagement-rate multiplier from x0.5 to x2",
      "Editable low and high rate per 1,000 followers",
      "Estimates for feed posts, Reels, Stories and a monthly total",
      "Shows the formula, runs in the browser, no login",
    ],
  },
  cta: {
    title: "Know your worth,",
    mark: "then land the brand deal.",
    text: "Schedule your sponsored posts with Poskoo and DM everyone who comments your keyword, on the official Meta API.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramMoneyCalculatorPage() {
  return (
    <ToolPageTemplate config={config}>
      <MoneyCalculator platform="instagram" />
    </ToolPageTemplate>
  );
}
