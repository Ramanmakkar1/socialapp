import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import BestTimeFinder from "./BestTimeFinder";

const config: ToolPageConfig = {
  path: "/tools/best-time-to-post-on-bluesky",
  name: "Best time to post on Bluesky finder",
  crumb: "Best time to post on Bluesky",
  title: "Best Time to Post on Bluesky (2026) - Free Finder Tool",
  description:
    "Find the best time to post on Bluesky with a free finder. Pick your audience and time zone to get morning, lunch and evening slots to test. No signup.",
  pill: "Free · runs in your browser · nothing is saved",
  h1: { before: "Best time to post on", mark: "Bluesky" },
  lede: "The best time to post on Bluesky is weekday mornings around 8–10 am, lunch at 12–1 pm and evenings at 7–9 pm in your audience's local time, with lighter weekend posting. Bluesky's audience leans US/EU tech, journalism and creators, so these are starting points to test, not measured data — keep the slots your own analytics show working.",
  art: "card-schedule",
  artLabel: "A creator pins post cards onto a weekly calendar next to a smiling alarm clock",
  heroPoints: ["Your audience's time zone", "3 windows per day", "No signup"],
  toolTitle: "Find your starting post times",
  toolNote: "Free · nothing is uploaded or saved",
  stepsTitle: "How to use the best time finder",
  steps: [
    {
      title: "Pick your audience time zone",
      text: "The zone starts on your browser's setting. Change it to where most of your Bluesky followers live, so the slots are shown on their clock.",
      art: "card-schedule",
    },
    {
      title: "Choose your audience and posting days",
      text: "Your audience type sets the starting windows per day. Tick the days you can actually post, and the grid updates straight away.",
      art: "feat-calendar",
    },
    {
      title: "Test the slots for two weeks",
      text: "Press Copy plan, post at those times, then check your Bluesky analytics. Compare views, likes and replies for each slot and keep the strongest ones.",
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
      title: "Three windows, not one magic hour",
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
    title: "How to find the best time to post on Bluesky",
    intro:
      "The best time to post on Bluesky is when your own followers are most likely to see and reply to your posts, not a fixed hour that works for every account. Use the finder above for starting points, then let your Bluesky analytics decide which slots to keep. Because the audience leans US/EU tech, journalism and creators, weekday mornings, lunch and early evening are the most useful windows to test first.",
    sections: [
      {
        title: "How to find your own best time on Bluesky",
        body: (
          <>
            <p>
              Open a post in the Bluesky app and check its <b>likes, reposts and replies</b>, then compare posts that went
              out at different times. Bluesky does not publish an active-hours chart for your followers, so your own post
              history is the best signal you have.
            </p>
            <p>
              Group your posts by the slots you tested, then compare engagement per slot. If your account is new and the
              data is thin, start with the finder above and gather your own results as you post.
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
              <li>After two weeks, compare likes, reposts and replies for each slot.</li>
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
              These are general starting points to test, not measured data. Your own Bluesky results always beat a
              general rule.
            </p>
            <ul>
              <li>
                <b>Text posts and hot takes:</b> try a morning slot and a lunch slot, then compare replies for each time
                to see when your audience is most responsive.
              </li>
              <li>
                <b>Posts with images or video:</b> try lunch and early evening, when people may have more time to watch
                and respond. Compare likes and reposts per slot.
              </li>
              <li>
                <b>Replies and conversation starters:</b> test times when you can stay and join the discussion. Keep the
                slots that start the most useful conversations and earn replies.
              </li>
            </ul>
            <p>
              Use the <Link href="/tools/instagram-time-zone-converter">time zone converter</Link> when your audience is
              spread across countries, and the{" "}
              <Link href="/tools/bluesky-character-counter">Bluesky character counter</Link> to keep your posts within
              the platform limits.
            </p>
          </>
        ),
      },
      {
        title: "Turn your best time into a schedule",
        body: (
          <p>
            Once a slot works, <Link href="/bluesky-scheduler">schedule Bluesky posts automatically</Link> in Poskoo so
            they publish at that time without you opening the app. You can plan a week in the calendar, then let Poskoo
            publish at the right time. New here? <Link href="/signup">Create a free account</Link> and start with one
            post. Need help getting started? Read{" "}
            <Link href="/help/schedule-bluesky-posts">how to schedule Bluesky posts</Link>.
          </p>
        ),
      },
    ],
  },
  faqTitle: "Best time to post on Bluesky questions",
  faqs: [
    {
      q: "What is the best time to post on Bluesky?",
      a: "A good starting point is weekday mornings around 8–10 am, lunch at 12–1 pm and evenings at 7–9 pm in your audience's local time, with lighter weekend posting. There is no single best time for every account, so test these slots for two weeks and keep the ones your Bluesky analytics show working.",
    },
    {
      q: "What is the best day to post on Bluesky?",
      a: "Weekdays are a safe starting point because the audience leans US/EU tech, journalism and creators who check Bluesky during work breaks and the evening. Tuesday to Thursday often suit news and B2B accounts, while creators can test a weekend late-morning slot. Compare engagement per day before you commit.",
    },
    {
      q: "How often should I post on Bluesky?",
      a: "Start with one or two posts a day on the days you can sustain, then check your results after two weeks. Replies and reposts drive reach on Bluesky, so a smaller number of posts that start conversations usually beats posting many times with no follow-up.",
    },
    {
      q: "Can I schedule Bluesky posts?",
      a: "Yes. Poskoo schedules Bluesky posts through the official AT Protocol, so you can plan a week in the calendar and let it publish at the time you pick. Read how to schedule Bluesky posts in the guide, or open the Bluesky scheduler to start.",
    },
  ],
  related: [
    "/tools/best-time-to-post-on-social-media",
    "/tools/bluesky-character-counter",
    "/tools/instagram-time-zone-converter",
    "/bluesky-scheduler",
  ],
  schema: {
    features: [
      "Three starting post windows per day for your audience type",
      "Slots shown in your audience's time zone",
      "Your own local time shown under each slot",
      "Choose the days you can post",
      "Copy the whole plan as text",
    ],
  },
  cta: {
    title: "Found a slot to test?",
    mark: "Schedule the post.",
    text: "Pick the time in your audience's zone and Poskoo publishes your Bluesky post at that time.",
  },
};

export const metadata = toolMetadata(config);

export default function BestTimeToPostOnBlueskyPage() {
  return (
    <ToolPageTemplate config={config}>
      <BestTimeFinder platform="Bluesky" insightsName="Bluesky analytics" />
    </ToolPageTemplate>
  );
}
