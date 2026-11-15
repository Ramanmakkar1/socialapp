import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import { planReadiness } from "@/lib/featureReadiness";
import PlanFitCalculator from "./PlanFitCalculator";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const config: ToolPageConfig = {
  path: "/tools/social-media-scheduler-plan-calculator",
  name: "Poskoo plan-fit calculator",
  crumb: "Plan-fit calculator",
  title: "Free Poskoo Plan-Fit Calculator: Which Plan Do I Need?",
  description:
    "Free plan-fit calculator: enter accounts, scheduled posts and auto-DMs to find the smallest Poskoo plan that fits, plus the exact upgrade trigger.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Which Poskoo plan", mark: "do I need?" },
  lede: "Enter your connected accounts, scheduled posts and auto-DMs. The calculator picks the smallest plan that covers all three and tells you exactly which input rules out the cheaper plan.",
  art: "analytics",
  artLabel: "A creator compares three plan cards while a calculator ticks the right one",
  heroPoints: ["Free, Pro and Agency limits", "Boundary checks included", "No signup"],
  toolTitle: "Find your smallest matching plan",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the plan-fit calculator",
  steps: [
    {
      title: "Enter your monthly numbers",
      text: "Add the connected accounts you manage, the posts you schedule in a typical month and the auto-DMs your comment rules send.",
      art: "card-schedule",
    },
    {
      title: "Compare against every plan",
      text: "The table shows the Free, Pro and Agency limits side by side, and marks the smallest plan that covers all three inputs.",
      art: "analytics",
    },
    {
      title: "See the exact upgrade trigger",
      text: "If a cheaper plan does not fit, the result names the input that exceeds it, such as 3 accounts against Free's 2, so the upgrade is never a guess.",
      art: "writing",
    },
  ],
  featuresTitle: "A plan recommendation you can check",
  features: [
    {
      title: "Smallest plan first",
      text: "The calculator tests Free before Pro and Pro before Agency, so it never pushes a bigger plan than you need.",
      art: "feat-calendar",
    },
    {
      title: "Boundary-aware",
      text: "Exactly 2 accounts, 10 posts and 500 auto-DMs fit Free. One more on any of them moves you to Pro.",
      art: "analytics",
    },
    {
      title: "Honest about launch",
      text: "While paid checkout is off, the button starts you on the Free plan instead of pretending Pro or Agency can be bought.",
      art: "card-dm",
    },
  ],
  guide: {
    title: "How Poskoo plan limits are evaluated",
    intro:
      "The calculator recommends the smallest Poskoo plan that covers all three limits at once: connected accounts, scheduled posts per month and auto-DMs per month. If any single input is over a plan's limit, that plan is ruled out and the next one is tested.",
    sections: [
      {
        title: "The three limits, in plain words",
        body: (
          <>
            <p>
              Every Poskoo plan sets a cap on each of these. The plan you need is the first one where <b>all three</b>{" "}
              inputs are inside the cap.
            </p>
            <ul>
              <li>
                <b>Connected accounts</b>: the Instagram, Facebook and Threads accounts you connect to schedule posts
                and run comment-to-DM rules. Free allows 2, Pro 5 and Agency 25.
              </li>
              <li>
                <b>Scheduled posts per month</b>: posts you queue in a typical month. Free allows 10. Pro and Agency
                include unlimited scheduling, so they never reject a positive post count.
              </li>
              <li>
                <b>Auto-DMs per month</b>: replies your keyword rules send. Free allows 500, Pro 2,500 and Agency
                10,000.
              </li>
            </ul>
            <p>
              The recommendation is the smallest plan that fits, not the plan with the most features. If you only need
              more accounts, the calculator will not suggest Agency while Pro already covers you.
            </p>
          </>
        ),
      },
      {
        title: "The upgrade trigger is the first limit you cross",
        body: (
          <>
            <p>
              When a cheaper plan is ruled out, the result names the input that crossed its limit. For example, 2
              accounts, 10 posts and 500 auto-DMs all fit Free. Change any one of them to 3 accounts, 11 posts or 501
              auto-DMs and Free fails on that input, so Pro becomes the smallest matching plan.
            </p>
            <p>
              The trigger is calculated against the plan just below the recommendation. If you need Pro, the result tells
              you which Free limit you exceeded. If you need Agency, it tells you which Pro limit you exceeded.
            </p>
          </>
        ),
      },
      {
        title: "What happens above the Agency limits",
        body: (
          <p>
            Agency allows 25 accounts, unlimited scheduling and 10,000 auto-DMs a month. If an input is higher, no
            standard plan fits. The calculator says so and points you to support instead of showing a purchase button
            for a plan that would not cover you.
          </p>
        ),
      },
      {
        title: "Why the paid-plan state matters",
        body: (
          <p>
            Poskoo only shows a purchase path when paid checkout is actually switched on. While Pro and Agency are
            launching soon, the calculator still shows their limits, but the call to action starts you on the Free plan.
            You will never be sent to a checkout that cannot take your payment. See the{" "}
            <Link href="/pricing">Poskoo pricing page</Link> for the current plan state.
          </p>
        ),
      },
      {
        title: "Check your content plan next",
        body: (
          <p>
            Once you know the plan, plan the posts. Use the{" "}
            <Link href="/tools/social-media-content-calendar">social media content calendar</Link> to lay out a month,
            the <Link href="/tools/instagram-posting-frequency-calculator">posting frequency calculator</Link> to check
            the workload, and the{" "}
            <Link href="/tools/instagram-comment-to-dm-calculator">comment-to-DM calculator</Link> to estimate how many
            DMs your rules will send.
          </p>
        ),
      },
    ],
  },
  faqTitle: "Plan-fit questions",
  faqs: [
    {
      q: "Which Poskoo plan do I need?",
      a: "You need the smallest plan that covers all three limits. Free fits 2 connected accounts, 10 scheduled posts a month and 500 auto-DMs. Pro fits 5 accounts, unlimited scheduling and 2,500 auto-DMs. Agency fits 25 accounts, unlimited scheduling and 10,000 auto-DMs. Enter your numbers in the calculator to see which one fits.",
    },
    {
      q: "Is the calculator free?",
      a: "Yes. The plan-fit calculator is completely free, needs no signup and runs in your browser. It does not connect to your accounts or read any data from them.",
    },
    {
      q: "Can I change plans later?",
      a: "Yes. You can change plans at any time from Settings. Pro and Agency are month to month (or yearly) with no contract, and the Free plan has nothing to cancel.",
    },
  ],
  related: [
    "/tools/social-media-content-calendar",
    "/tools/instagram-posting-frequency-calculator",
    "/tools/instagram-comment-to-dm-calculator",
    "/tools/instagram-scheduling-checklist",
    "/tools/instagram-time-zone-converter",
  ],
  schema: {
    features: [
      "Recommends the smallest Poskoo plan that fits",
      "Checks connected accounts, scheduled posts and auto-DMs",
      "Names the exact input that triggers an upgrade",
      "Reads the live paid-plan readiness state",
      "Runs in the browser, no signup",
    ],
  },
  cta: {
    title: "Your plan is set.",
    mark: "Start scheduling free.",
    text: "Connect your accounts, queue your first posts and turn comments into DMs on the Free plan. Upgrade only when your numbers say so.",
  },
};

export const metadata = toolMetadata(config);

export default function SocialMediaSchedulerPlanCalculatorPage() {
  // Checkout readiness decides the CTA: never point at a paid checkout that is switched off.
  const { paidPlans } = planReadiness();
  return (
    <ToolPageTemplate config={config}>
      <PlanFitCalculator paidPlans={paidPlans} />
    </ToolPageTemplate>
  );
}
