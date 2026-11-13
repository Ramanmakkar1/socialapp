import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import BestTimeFinder from "../best-time-to-post-on-instagram/BestTimeFinder";

const config: ToolPageConfig = {
  path: "/tools/best-time-to-post-on-pinterest",
  name: "Best time to post on Pinterest finder",
  crumb: "Best time to post on Pinterest",
  title: "Best Time to Post on Pinterest: Free Finder Tool 2026",
  description:
    "Find the best time to post on Pinterest with a free finder. Pick your audience time zone and posting days to get three Pin slots to test for two weeks.",
  pill: "Free · runs in your browser · nothing is saved",
  h1: { before: "Best time to post on", mark: "Pinterest" },
  lede: "There is no single best time to post on Pinterest. Pins keep getting found in search for months, so posting regularly matters more than the exact hour. Still, test two or three slots for two weeks and keep the ones that get the most impressions and saves.",
  art: "card-schedule",
  artLabel: "A creator pins post cards onto a weekly calendar next to a smiling alarm clock",
  heroPoints: ["Your audience's time zone", "3 slots per day", "No signup"],
  toolTitle: "Find your starting Pin times",
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
      text: "Press Copy plan, post at those times, then check Pinterest Analytics > Overview. Keep the slots that get more impressions and saves, and drop the rest.",
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
    title: "How to find the best time to post on Pinterest",
    intro:
      "The best time to post on Pinterest is when your own audience is browsing, not a fixed hour that works for every account. Use the finder above for starting points, then let your Pinterest Analytics decide which slots to keep.",
    sections: [
      {
        title: "How to find your own best time",
        body: (
          <>
            <p>
              Pinterest shows your audience&apos;s activity in <b>Pinterest Analytics</b>. Open your business account, go
              to <b>Analytics</b>, then <b>Overview</b>. It shows impressions, saves and outbound clicks per Pin, so you
              can see which days and hours your Pins actually get found.
            </p>
            <p>
              Read the numbers for the days you can post. If one window stands out, pick two or three times inside it and
              test them. If your account is new and the data is thin, start with the finder above and gather your own
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
              <li>After two weeks, compare impressions and saves for each slot in Pinterest Analytics.</li>
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
              These are general starting points to test, not measured data. Your own Pinterest Analytics always beat a
              general rule.
            </p>
            <ul>
              <li>
                <b>Standard image Pins:</b> try a morning slot and an evening slot, because image Pins keep getting found
                in search for months after posting. Test both and compare impressions after a week.
              </li>
              <li>
                <b>Video Pins:</b> try midday and early evening, when people tend to browse for longer. Check impressions
                and saves, not just outbound clicks.
              </li>
              <li>
                <b>Idea-style multi-image Pins:</b> try a morning and an evening Pin, since they save well when people are
                planning. Posting twice gives audiences in different time zones a chance to see one.
              </li>
            </ul>
            <p>
              Publish seasonal Pins weeks before the event, because people search Pinterest ahead of holidays and
              seasons. Use the <Link href="/tools/instagram-time-zone-converter">time zone converter</Link> when your
              audience is spread across countries, and the{" "}
              <Link href="/tools/social-media-image-sizes">social media image sizes guide</Link> to keep your Pins at the
              right dimensions.
            </p>
          </>
        ),
      },
      {
        title: "Turn your best time into a schedule",
        body: (
          <p>
            Once a slot works, <Link href="/pinterest-scheduler">schedule Pinterest Pins</Link> in Poskoo so they publish
            at that time without you opening the app. You can plan a week in the calendar, then let Poskoo publish at the
            right time. New here? <Link href="/signup">Create a free account</Link> and start with one Pin. Looking for
            more? See <Link href="/help/schedule-pinterest-posts">how to schedule Pinterest Pins</Link>.
          </p>
        ),
      },
    ],
  },
  faqTitle: "Best time to post on Pinterest questions",
  faqs: [
    {
      q: "What is the best time to post on Pinterest?",
      a: "There is no single best time for every account. Pins keep getting found in search for months, so posting regularly matters more than the exact hour. Test two or three slots for two weeks and keep the ones that get the most impressions and saves in Pinterest Analytics.",
    },
    {
      q: "How do I see when my audience is most active on Pinterest?",
      a: "Open your business account, go to Analytics, then Overview. It shows impressions, saves and outbound clicks per Pin, so you can pick posting slots that match when your Pins get found.",
    },
    {
      q: "How long should I test posting times before changing them?",
      a: "Give each slot about two weeks. That is long enough to see a pattern without waiting a month. Change one thing at a time, then compare impressions and saves for each slot in Pinterest Analytics before you keep or drop it.",
    },
    {
      q: "Does the best time to post change by content type on Pinterest?",
      a: "It can. Standard image Pins keep getting found in search for months, video Pins may suit longer browsing sessions, and idea-style multi-image Pins save well when people are planning. Seasonal Pins should go out weeks before the event. Treat the content-type suggestions as starting points to test, not fixed rules, and check your own Pinterest Analytics.",
    },
  ],
  related: [
    "/tools/best-time-to-post-on-social-media",
    "/tools/social-media-image-sizes",
    "/tools/instagram-time-zone-converter",
    "/tools/social-media-content-calendar",
  ],
  schema: {
    features: [
      "Three starting Pin times per day for your audience type",
      "Slots shown in your audience's time zone",
      "Your own local time shown under each slot",
      "Choose the days you can post",
      "Copy the whole plan as text",
    ],
  },
  cta: {
    title: "Found a slot to test?",
    mark: "Schedule the Pin.",
    text: "Pick the time in your audience's zone and Poskoo publishes your Pin at that time.",
  },
};

export const metadata = toolMetadata(config);

export default function BestTimeToPostOnPinterestPage() {
  return (
    <ToolPageTemplate config={config}>
      <BestTimeFinder platform="Pinterest" insightsName="Pinterest Analytics" />
    </ToolPageTemplate>
  );
}
