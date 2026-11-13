import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import BestTimeFinder from "./BestTimeFinder";

const config: ToolPageConfig = {
  path: "/tools/best-time-to-post-on-instagram",
  name: "Best time to post on Instagram finder",
  crumb: "Best time to post",
  title: "Best Time to Post on Instagram: Free Finder Tool 2026",
  description:
    "Find the best time to post on Instagram with a free finder. Pick your audience time zone and posting days to get three starting slots to test for 2 weeks.",
  pill: "Free · runs in your browser · nothing is saved",
  h1: { before: "Best time to post on", mark: "Instagram" },
  lede: "There is no single best time to post on Instagram. The best time is when your own followers are online, so test two or three slots for two weeks and keep the winners.",
  art: "card-schedule",
  artLabel: "A creator pins post cards onto a weekly calendar next to a smiling alarm clock",
  heroPoints: ["Your audience's time zone", "3 slots per day", "No signup"],
  toolTitle: "Find your starting post times",
  toolNote: "Free · nothing is uploaded or saved",
  stepsTitle: "How to use the best time finder",
  steps: [
    {
      title: "Pick your audience time zone",
      text: "The zone starts on your browser's setting. Change it to where most of your followers live, so the slots are shown on their clock.",
      art: "card-schedule",
    },
    {
      title: "Choose your audience and posting days",
      text: "Your audience type sets three starting slots per day. Tick the days you can actually post, and the grid updates straight away.",
      art: "feat-calendar",
    },
    {
      title: "Test the slots for two weeks",
      text: "Press Copy plan, post at those times, then check Instagram Insights. Keep the slots that reach more of your followers and drop the rest.",
      art: "analytics",
    },
  ],
  featuresTitle: "A starting point you can test",
  features: [
    {
      title: "Built around your audience",
      text: "Slots are shown in your audience's time zone, with your own local time underneath, so you never post at the wrong hour by accident.",
      art: "feat-calendar",
    },
    {
      title: "Three slots, not one magic hour",
      text: "You get a morning, midday and evening option for each day, so you can test a small set instead of guessing a single perfect minute.",
      art: "card-schedule",
    },
    {
      title: "Copy the plan in one tap",
      text: "The Copy plan button turns the grid into plain text you can paste into your notes, a calendar or a scheduler.",
      art: "writing",
    },
  ],
  guide: {
    title: "How to find the best time to post on Instagram",
    intro:
      "The best time to post on Instagram is when your own followers are most active, not a fixed hour that works for every account. Use the finder above for starting points, then let your Insights decide which slots to keep.",
    sections: [
      {
        title: "How to find your own best time",
        body: (
          <>
            <p>
              Instagram shows your audience&apos;s activity inside the app, but you need a professional account to see it.
              Switch to a professional account in Settings, then open <b>Insights</b> and go to <b>Total followers</b>.
              The <b>Most active times</b> chart shows the days and hours when your followers are on Instagram.
            </p>
            <p>
              Read the chart for the days you can post. If the busiest window is a range, pick two or three times inside it
              and test them. If your account is new and the chart is thin, start with the finder above and gather your own
              data as you post.
            </p>
          </>
        ),
      },
      {
        title: "A simple 2-week posting test",
        body: (
          <>
            <p>
              Pick two or three slots from the finder and keep everything else about your posting the same for two weeks.
              That way the time is the only thing that changes.
            </p>
            <ol>
              <li>Choose the days you can post and copy the plan.</li>
              <li>Post at the same slots for 14 days, without changing your content style.</li>
              <li>After two weeks, compare reach, saves and profile visits for each slot in Insights.</li>
              <li>Keep the best slot, drop the weakest, and test one new time next.</li>
            </ol>
            <p>
              Two weeks is long enough to see a pattern without waiting a whole month. Change one thing at a time so you
              know what made the difference.
            </p>
          </>
        ),
      },
      {
        title: "Best time by content type",
        body: (
          <>
            <p>
              These are general starting points to test, not measured data. Your own Insights always beat a general rule.
            </p>
            <ul>
              <li>
                <b>Reels:</b> try a morning slot and an evening slot, because Reels can keep getting views for days after
                posting. Test both and compare reach after a week.
              </li>
              <li>
                <b>Carousels:</b> try midday and early evening, when people tend to scroll for longer. Check saves and
                shares, not just likes.
              </li>
              <li>
                <b>Stories:</b> try a morning and an evening Story, since Stories disappear after 24 hours. Posting twice
                gives followers in different time zones a chance to see one.
              </li>
            </ul>
            <p>
              Use the <Link href="/tools/instagram-time-zone-converter">Instagram time zone converter</Link> when your
              audience is spread across countries, and the{" "}
              <Link href="/tools/instagram-posting-frequency-calculator">posting frequency calculator</Link> to set a pace
              you can keep.
            </p>
          </>
        ),
      },
      {
        title: "Turn your best time into a schedule",
        body: (
          <p>
            Once a slot works, <Link href="/instagram-scheduler">schedule Instagram posts</Link> in Poskoo so they publish
            at that time without you opening the app. You can plan a week in the calendar, then let Poskoo publish and
            auto-DM everyone who comments your keyword. New here?{" "}
            <Link href="/signup">Create a free account</Link> and start with one post. Posting on more than Instagram?{" "}
            <Link href="/tools/best-time-to-post-on-social-media">See the best time to post on every platform</Link>.
          </p>
        ),
      },
    ],
  },
  faqTitle: "Best time to post on Instagram questions",
  faqs: [
    {
      q: "What is the best time to post on Instagram?",
      a: "There is no single best time for every account. The best time is when your own followers are most active, which you can see in Instagram Insights under Total followers and Most active times. Test two or three slots for two weeks and keep the ones that perform best.",
    },
    {
      q: "How do I see when my followers are most active on Instagram?",
      a: "You need a professional account. Open Insights, go to Total followers, and look at the Most active times chart. It shows the days and hours when your followers use Instagram, so you can pick slots that match.",
    },
    {
      q: "How long should I test posting times before changing them?",
      a: "Give each slot about two weeks. That is long enough to see a pattern without waiting a month. Change one thing at a time, then compare reach, saves and profile visits for each slot before you keep or drop it.",
    },
    {
      q: "Does the best time to post change by content type?",
      a: "It can. Reels often keep getting views for days, carousels may suit longer scroll sessions, and Stories only last 24 hours. Treat the content-type suggestions as starting points to test, not fixed rules, and check your own Insights.",
    },
  ],
  related: [
    "/tools/instagram-time-zone-converter",
    "/tools/instagram-posting-frequency-calculator",
    "/tools/instagram-scheduling-checklist",
    "/tools/social-media-content-calendar",
    "/tools/instagram-engagement-rate-calculator",
  ],
  schema: {
    features: [
      "Three starting post times per day for your audience type",
      "Slots shown in your audience's time zone",
      "Your own local time shown under each slot",
      "Choose the days you can post",
      "Copy the whole plan as text",
    ],
  },
  cta: {
    title: "Found a slot to test?",
    mark: "Schedule the post.",
    text: "Pick the time in your audience's zone and Poskoo publishes it, then auto-DMs everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function BestTimeToPostOnInstagramPage() {
  return (
    <ToolPageTemplate config={config}>
      <BestTimeFinder />
    </ToolPageTemplate>
  );
}
