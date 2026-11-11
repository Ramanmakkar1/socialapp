import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import CampaignCalculator from "./CampaignCalculator";

const config: ToolPageConfig = {
  path: "/tools/instagram-comment-to-dm-calculator",
  name: "Instagram comment-to-DM campaign calculator",
  crumb: "Comment-to-DM calculator",
  title: "Instagram Comment-to-DM Calculator: Estimate DMs & Clicks",
  description:
    "Free Instagram comment-to-DM calculator: estimate comments, delivered DMs and link clicks from post views and your own rates. Formulas shown, no signup.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Instagram comment-to-DM", mark: "campaign calculator" },
  lede: "Estimate how many comments, DMs and link clicks a comment-keyword campaign could produce from your views and rates. Change any number and the estimate updates.",
  art: "analytics",
  artLabel: "A creator waters a growing bar chart while hearts float up",
  heroPoints: ["Views to clicks", "Formulas shown", "No signup"],
  toolTitle: "Estimate your campaign",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the comment-to-DM calculator",
  steps: [
    {
      title: "Enter your post views",
      text: "Type the total views on the post, Reel or Story where you ask people to comment a keyword. The default is 10,000.",
      art: "analytics",
    },
    {
      title: "Set the three rates",
      text: "Adjust Comment rate, DM delivery rate and Link-click rate as percentages from 0 to 100. Use your own past numbers where you have them.",
      art: "card-dm",
    },
    {
      title: "Read the estimate",
      text: "The Comments, DMs delivered and Link clicks boxes update instantly, with the three formulas listed underneath.",
      art: "card-leads",
    },
  ],
  featuresTitle: "Plan a keyword campaign with numbers you trust",
  features: [
    {
      title: "Full funnel in one view",
      text: "Follow the drop from views to comments, delivered DMs and clicks, so you can see which step limits the result.",
      art: "analytics",
    },
    {
      title: "Transparent maths",
      text: "Three plain multiplications, shown under the result. No hidden benchmarks or made-up conversion data.",
      art: "feat-leads",
    },
    {
      title: "Input checks",
      text: "Views must be a whole number and rates must sit between 0 and 100%, so a typo cannot produce a silly estimate.",
      art: "card-dm",
    },
  ],
  guide: {
    title: "How to estimate an Instagram comment-to-DM campaign",
    intro:
      "A comment-to-DM campaign asks viewers to comment a keyword and sends each commenter a DM with a link. The result depends on how many people see the post, how many comment, how many DMs arrive and how many people tap the link. This calculator puts those steps in one place.",
    sections: [
      {
        title: "How the estimate works",
        body: (
          <>
            <p>The calculator uses four inputs and three multiplications:</p>
            <div className={t.example}>
              <p>Comments = views × (comment rate ÷ 100)</p>
              <p>DMs = comments × (DM delivery rate ÷ 100)</p>
              <p>Clicks = DMs × (link-click rate ÷ 100)</p>
            </div>
            <ul>
              <li><b>Comment rate</b> is applied to views, not followers or reach.</li>
              <li>
                <b>DM delivery rate</b> discounts comments that never become a delivered DM, for example because the
                keyword did not match, the person could not be messaged or a delivery rule paused the send.
              </li>
              <li><b>Link-click rate</b> is the share of delivered DMs where someone opens the link.</li>
              <li>Results are rounded to whole comments, DMs and clicks. The tool does not look at your account.</li>
            </ul>
          </>
        ),
      },
      {
        title: "Example: the default numbers",
        body: (
          <>
            <p>With the starting values of 10,000 views, a 2% comment rate, 90% DM delivery and a 30% link-click rate:</p>
            <div className={t.example}>
              <p>Comments: <b>200</b> · DMs delivered: <b>180</b> · Link clicks: <b>54</b></p>
            </div>
            <p>
              These defaults are placeholders for illustration, not benchmarks. Replace them with your own numbers: if
              your comment rate is 1%, every later step halves too.
            </p>
          </>
        ),
      },
      {
        title: "Where to find your own rates",
        body: (
          <ul>
            <li>
              <b>Comment rate:</b> in the app, divide a recent post&apos;s comments by its views and multiply by 100.
            </li>
            <li>
              <b>DM delivery rate:</b> after a test campaign, divide delivered DMs by keyword comments.
            </li>
            <li>
              <b>Link-click rate:</b> tag the link with the <Link href="/tools/instagram-utm-builder">UTM builder</Link>,
              then divide visits from it by delivered DMs.
            </li>
            <li>If you have no history, run a small test first and come back with real numbers.</li>
          </ul>
        ),
      },
      {
        title: "Best practices to improve each step",
        body: (
          <ul>
            <li><b>More comments:</b> state the keyword and the reward clearly in the caption and on screen in a Reel.</li>
            <li>
              <b>Better delivery:</b> pick a distinctive keyword and test it in the{" "}
              <Link href="/tools/instagram-comment-keyword-tester">comment keyword tester</Link> so real requests match.
            </li>
            <li><b>More clicks:</b> keep the DM short, say what the link is and send exactly what the post promised.</li>
            <li>
              <b>Automate it:</b> <Link href="/instagram-auto-dm">Instagram auto-DM</Link> answers every matching comment,
              even ones that arrive at night.
            </li>
          </ul>
        ),
      },
      {
        title: "Common estimation mistakes",
        body: (
          <ul>
            <li>Using follower count instead of views for the first input.</li>
            <li>Borrowing someone else&apos;s rates instead of measuring your own.</li>
            <li>Assuming every comment becomes a delivered DM.</li>
            <li>Treating the result as a forecast instead of a planning estimate.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Comment-to-DM calculator questions",
  faqs: [
    {
      q: "How does the comment-to-DM calculator work?",
      a: "It multiplies your post views by your comment rate to estimate comments, multiplies those comments by the DM delivery rate to estimate delivered DMs, then multiplies delivered DMs by the link-click rate to estimate clicks. Every formula is shown under the results.",
    },
    {
      q: "Are the results guaranteed?",
      a: "No. The numbers are estimates based on the rates you enter. Actual comments, DM delivery and clicks depend on your audience, offer, keyword, timing and Instagram's messaging rules.",
    },
    {
      q: "What comment rate should I use?",
      a: "Use a rate you have seen on your own recent posts: divide comments by views and multiply by 100. If you are planning a first campaign, run a small test and update the calculator with what you learn.",
    },
    {
      q: "Why is the DM delivery rate less than 100%?",
      a: "Not every comment becomes a delivered DM. A comment may not match your keyword, the person may have messaging restrictions, or a delivery rule may pause the send. The delivery rate accounts for that gap.",
    },
    {
      q: "Does this tool send DMs or connect to Instagram?",
      a: "No. The calculator runs entirely in your browser and only does arithmetic from the numbers you type. Nothing is uploaded, saved or sent to Instagram.",
    },
    {
      q: "How do I run a comment-to-DM campaign in Poskoo?",
      a: "Connect Instagram with Meta's official login, create a rule with your keyword and DM message, and attach it to a post. When someone comments the keyword, Poskoo sends your DM if the rule is active and delivery rules allow it.",
    },
  ],
  related: [
    "/tools/instagram-comment-keyword-tester",
    "/tools/instagram-comment-to-dm-preview",
    "/tools/instagram-engagement-rate-calculator",
    "/tools/instagram-utm-builder",
    "/tools/instagram-dm-link-generator",
  ],
  schema: {
    features: [
      "Estimates comments, delivered DMs and link clicks",
      "Editable views and conversion rates",
      "Formulas shown with the result",
      "Input validation for rates and views",
      "Runs in the browser, no signup",
    ],
  },
  cta: {
    title: "The numbers add up.",
    mark: "Now send the DMs automatically.",
    text: "Set up a Poskoo auto-DM rule for your keyword and every matching comment gets your link through the official Meta API.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramCommentToDmCalculatorPage() {
  return (
    <ToolPageTemplate config={config}>
      <CampaignCalculator />
    </ToolPageTemplate>
  );
}
