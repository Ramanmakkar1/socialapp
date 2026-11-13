import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import BestTimeFinder from "../best-time-to-post-on-instagram/BestTimeFinder";

const config: ToolPageConfig = {
  path: "/tools/best-time-to-post-on-facebook",
  name: "Best time to post on Facebook finder",
  crumb: "Best time to post on Facebook",
  title: "Best Time to Post on Facebook: Free Finder Tool 2026",
  description:
    "Find the best time to post on Facebook with a free finder. Choose your audience time zone and posting days to get three slots to test for two weeks.",
  pill: "Free · runs in your browser · nothing is saved",
  h1: { before: "Best time to post on", mark: "Facebook" },
  lede: "There is no single best time to post on Facebook. The best time is when your own Page followers are online, so test two or three slots for two weeks and keep the ones that reach the most people.",
  art: "card-schedule",
  artLabel: "A creator pins post cards onto a weekly calendar next to a smiling alarm clock",
  heroPoints: ["Your audience's time zone", "3 slots per day", "No signup"],
  toolTitle: "Find your starting post times",
  toolNote: "Free · nothing is uploaded or saved",
  stepsTitle: "How to use the best time finder",
  steps: [
    {
      title: "Pick your audience time zone",
      text: "The zone starts on your browser's setting. Change it to where most of your Page followers live, so the slots are shown on their clock.",
      art: "card-schedule",
    },
    {
      title: "Choose your audience and posting days",
      text: "Your audience type sets three starting slots per day. Tick the days you can actually post, and the grid updates straight away.",
      art: "feat-calendar",
    },
    {
      title: "Test the slots for two weeks",
      text: "Press Copy plan, post at those times, then check Meta Business Suite > Insights. Keep the slots that reach more of your followers and drop the rest.",
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
    title: "How to find the best time to post on Facebook",
    intro:
      "The best time to post on Facebook is when your own Page followers are most active, not a fixed hour that works for every Page. Use the finder above for starting points, then let your Meta Business Suite insights decide which slots to keep.",
    sections: [
      {
        title: "How to find your own best time",
        body: (
          <>
            <p>
              Facebook shows your audience&apos;s activity in <b>Meta Business Suite &gt; Insights</b>. Open Meta Business
              Suite, go to <b>Insights</b>, and look at the <b>When your fans are online</b> chart. It shows the days and
              hours when your Page followers are active on Facebook.
            </p>
            <p>
              Read the chart for the days you can post. If the busiest window is a range, pick two or three times inside it
              and test them. If your Page is new and the chart is thin, start with the finder above and gather your own
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
              <li>After two weeks, compare reach and engagement for each slot in Meta Business Suite insights.</li>
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
              These are general starting points to test, not measured data. Your own Meta Business Suite insights always
              beat a general rule.
            </p>
            <ul>
              <li>
                <b>Reels:</b> try a morning slot and an evening slot, because Reels can keep getting views for days after
                posting. Test both and compare reach after a week.
              </li>
              <li>
                <b>Photo and link posts:</b> try midday and early evening, when people tend to scroll their feed for
                longer. Check reach and clicks, not just likes.
              </li>
              <li>
                <b>Stories:</b> try a morning and an evening Story, since Stories disappear after 24 hours. Posting twice
                gives followers in different time zones a chance to see one.
              </li>
            </ul>
            <p>
              Use the <Link href="/tools/instagram-time-zone-converter">time zone converter</Link> when your audience is
              spread across countries, and the{" "}
              <Link href="/tools/facebook-character-counter">Facebook character counter</Link> to keep your posts within
              the platform limits.
            </p>
          </>
        ),
      },
      {
        title: "Turn your best time into a schedule",
        body: (
          <p>
            Once a slot works, <Link href="/facebook-scheduler">schedule Facebook posts</Link> in Poskoo so they publish
            at that time without you opening the app. You can plan a week in the calendar, then let Poskoo publish at the
            right time. New here? <Link href="/signup">Create a free account</Link> and start with one post. Looking for
            more Meta tools? See the <Link href="/meta-business-suite-alternative">Meta Business Suite alternative</Link>.
          </p>
        ),
      },
    ],
  },
  faqTitle: "Best time to post on Facebook questions",
  faqs: [
    {
      q: "What is the best time to post on Facebook?",
      a: "There is no single best time for every Page. The best time is when your own Page followers are most active, which you can see in Meta Business Suite under Insights and the When your fans are online chart. Test two or three slots for two weeks and keep the ones that reach the most people.",
    },
    {
      q: "How do I see when my Page followers are most active on Facebook?",
      a: "Open Meta Business Suite, go to Insights, and look at the When your fans are online chart. It shows the days and hours when your Page followers are active on Facebook, so you can pick posting slots that match their activity.",
    },
    {
      q: "How long should I test posting times before changing them?",
      a: "Give each slot about two weeks. That is long enough to see a pattern without waiting a month. Change one thing at a time, then compare reach and engagement for each slot in Meta Business Suite insights before you keep or drop it.",
    },
    {
      q: "Does the best time to post change by content type on Facebook?",
      a: "It can. Reels often keep getting views for days after posting, photo and link posts may suit longer feed-scroll sessions, and Stories only last 24 hours. Treat the content-type suggestions as starting points to test, not fixed rules, and check your own Meta Business Suite insights.",
    },
  ],
  related: [
    "/tools/best-time-to-post-on-instagram",
    "/tools/facebook-character-counter",
    "/tools/instagram-time-zone-converter",
    "/tools/social-media-content-calendar",
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
    text: "Pick the time in your audience's zone and Poskoo publishes your Facebook Page post at that time.",
  },
};

export const metadata = toolMetadata(config);

export default function BestTimeToPostOnFacebookPage() {
  return (
    <ToolPageTemplate config={config}>
      <BestTimeFinder platform="Facebook" insightsName="Meta Business Suite insights" />
    </ToolPageTemplate>
  );
}
