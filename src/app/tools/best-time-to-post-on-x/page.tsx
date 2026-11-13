import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import BestTimeFinder from "../best-time-to-post-on-instagram/BestTimeFinder";

const config: ToolPageConfig = {
  path: "/tools/best-time-to-post-on-x",
  name: "Best time to post on X finder",
  crumb: "Best time to post on X",
  title: "Best Time to Post on X (Twitter): Free Finder 2026",
  description:
    "Find the best time to post on X (Twitter) with a free finder. Pick your audience time zone and posting days to get three slots to test for two weeks.",
  pill: "Free · runs in your browser · nothing is saved",
  h1: { before: "Best time to post on", mark: "X (Twitter)" },
  lede: "There is no single best time to post on X. The best time is when your own followers are online, so test two or three slots for two weeks and keep the ones that get the most impressions and replies.",
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
      text: "Press Copy plan, post at those times, then check the Analytics view on x.com for impressions and engagement per post. Keep the slots that perform best and drop the rest.",
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
    title: "How to find the best time to post on X",
    intro:
      "The best time to post on X is when your own followers are most active, not a fixed hour that works for every account. Use the finder above for starting points, then let your X post analytics decide which slots to keep.",
    sections: [
      {
        title: "How to find your own best time",
        body: (
          <>
            <p>
              X shows your post performance in the <b>Analytics view on x.com</b>, where available for your account.
              Open Analytics and look at the impressions, engagement and replies per post. Compare how posts at
              different times perform to find the slots that work for your audience.
            </p>
            <p>
              Read your analytics for the days you can post. If one window clearly outperforms the others, pick two or
              three times inside it and test them. If your account is new and the data is thin, start with the finder
              above and gather your own data as you post.
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
              <li>After two weeks, compare impressions and engagement rate for each slot in your X analytics.</li>
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
              These are general starting points to test, not measured data. Your own X post analytics always beat a
              general rule.
            </p>
            <ul>
              <li>
                <b>Text posts:</b> try a morning slot and an evening slot, since text posts can pick up replies and
                impressions well after posting. Test both and compare impressions after a week.
              </li>
              <li>
                <b>Threads:</b> try midday and early evening, when people tend to have longer reading sessions. Check
                impressions and engagement rate, not just likes.
              </li>
              <li>
                <b>Posts with images or video:</b> try a morning and an evening slot, since media posts can keep
                collecting views for days. Posting at two times gives followers in different time zones a chance to see
                one.
              </li>
            </ul>
            <p>
              Use the <Link href="/tools/instagram-time-zone-converter">time zone converter</Link> when your audience is
              spread across countries, and the <Link href="/tools/x-character-counter">X character counter</Link> to keep
              your posts within the platform limits.
            </p>
          </>
        ),
      },
      {
        title: "Turn your best time into a schedule",
        body: (
          <p>
            Once a slot works, <Link href="/x-scheduler">schedule X posts</Link> in Poskoo so they publish at that time
            without you opening the app. You can plan a week in the calendar, then let Poskoo publish at the right time.
            New here? <Link href="/signup">Create a free account</Link> and start with one post. Looking for more? See{" "}
            <Link href="/help/schedule-x-posts">how to schedule X posts</Link>.
          </p>
        ),
      },
    ],
  },
  faqTitle: "Best time to post on X questions",
  faqs: [
    {
      q: "What is the best time to post on X?",
      a: "There is no single best time for every account. The best time is when your own followers are most active. Compare impressions and engagement rate per time slot in the Analytics view on x.com, test two or three slots for two weeks, and keep the ones that get the most impressions and replies.",
    },
    {
      q: "How do I see when my followers are most active on X?",
      a: "X does not show a when-your-followers-are-online chart. Instead, use the Analytics view on x.com to compare impressions and engagement rate for posts at different times. The slots with the best numbers are when your audience is most active.",
    },
    {
      q: "How long should I test posting times before changing them?",
      a: "Give each slot about two weeks. That is long enough to see a pattern without waiting a month. Change one thing at a time, then compare impressions and engagement rate for each slot in your X analytics before you keep or drop it.",
    },
    {
      q: "Does the best time to post change by content type on X?",
      a: "It can. Text posts can keep getting replies for hours, threads may suit longer reading sessions, and posts with images or video can keep collecting views for days. Treat the content-type suggestions as starting points to test, not fixed rules, and check your own X post analytics.",
    },
  ],
  related: [
    "/tools/best-time-to-post-on-social-media",
    "/tools/x-character-counter",
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
    text: "Pick the time in your audience's zone and Poskoo publishes your X post at that time.",
  },
};

export const metadata = toolMetadata(config);

export default function BestTimeToPostOnXPage() {
  return (
    <ToolPageTemplate config={config}>
      <BestTimeFinder platform="X" insightsName="X post analytics" />
    </ToolPageTemplate>
  );
}
