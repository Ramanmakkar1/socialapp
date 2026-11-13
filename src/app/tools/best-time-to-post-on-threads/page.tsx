import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import BestTimeFinder from "./BestTimeFinder";

const config: ToolPageConfig = {
  path: "/tools/best-time-to-post-on-threads",
  name: "Best time to post on Threads finder",
  crumb: "Best time to post on Threads",
  title: "Best Time to Post on Threads: Free Finder | Poskoo",
  description:
    "Find the best time to post on Threads with a free finder. Choose your audience and time zone to get morning, lunch and evening slots to test. No signup.",
  pill: "Free · runs in your browser · nothing is saved",
  h1: { before: "Best time to post on", mark: "Threads" },
  lede: "A good starting point for Threads is weekdays around 7–9 am, at lunch and 6–8 pm in your audience's local time, because many people check Threads alongside Instagram. Test these slots for two weeks and keep what your Threads insights show working.",
  art: "card-schedule",
  artLabel: "A creator pins post cards onto a weekly calendar next to a smiling alarm clock",
  heroPoints: ["Your audience's time zone", "3 slots per day", "No signup"],
  toolTitle: "Find your starting post times",
  toolNote: "Free · nothing is uploaded or saved",
  stepsTitle: "How to use the best time finder",
  steps: [
    {
      title: "Pick your audience time zone",
      text: "The zone starts on your browser's setting. Change it to where most of your Threads followers live, so the slots are shown on their clock.",
      art: "card-schedule",
    },
    {
      title: "Choose your audience and posting days",
      text: "Your audience type sets three starting slots per day. Tick the days you can actually post, and the grid updates straight away.",
      art: "feat-calendar",
    },
    {
      title: "Test the slots for two weeks",
      text: "Press Copy plan, post at those times, then check Threads Insights in the app. Compare views and replies for each slot and keep the strongest ones.",
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
    title: "How to find the best time to post on Threads",
    intro:
      "The best time to post on Threads is when your own followers are most likely to see and reply to your posts, not a fixed hour that works for every account. Use the finder above for starting points, then let your Threads Insights decide which slots to keep. Because many people check Threads alongside Instagram, content you cross-post from Instagram can ride the same morning, lunch and evening habits.",
    sections: [
      {
        title: "How to find your own best time",
        body: (
          <>
            <p>
              Open the Threads app and go to your <b>profile &gt; Insights</b>. Threads Insights shows views and
              interactions, so you can review how individual posts performed at different times. It does not show an
              active hours chart for your followers.
            </p>
            <p>
              Group your posts by the slots you tested, then compare views and replies per slot. If your account is new
              and the data is thin, start with the finder above and gather your own results as you post.
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
              <li>After two weeks, compare views and replies for each slot in Threads Insights.</li>
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
              These are general starting points to test, not measured data. Your own Threads Insights always beat a
              general rule.
            </p>
            <ul>
              <li>
                <b>Text posts:</b> try a morning slot and a midday slot, then compare views and replies for each time to
                see when your audience is most responsive.
              </li>
              <li>
                <b>Posts with photos or video:</b> try midday and early evening, when people may have more time to watch
                and respond. Compare views and replies per slot.
              </li>
              <li>
                <b>Replies or conversation starters:</b> test times when you can stay and join the discussion. Keep the
                slots that start the most useful conversations and earn replies.
              </li>
            </ul>
            <p>
              Use the <Link href="/tools/instagram-time-zone-converter">time zone converter</Link> when your audience is
              spread across countries, and the{" "}
              <Link href="/tools/threads-character-counter">Threads character counter</Link> to keep your posts within
              the platform limits.
            </p>
          </>
        ),
      },
      {
        title: "Turn your best time into a schedule",
        body: (
          <p>
            Once a slot works, <Link href="/threads-scheduler">schedule Threads posts</Link> in Poskoo so they publish at
            that time without you opening the app. You can plan a week in the calendar, then let Poskoo publish at the
            right time. New here? <Link href="/signup">Create a free account</Link> and start with one post. Need help
            getting started? Read <Link href="/help/schedule-threads-posts">how to schedule Threads posts</Link>.
          </p>
        ),
      },
    ],
  },
  faqTitle: "Best time to post on Threads questions",
  faqs: [
    {
      q: "What is the best time to post on Threads?",
      a: "A good starting point is weekdays around 7–9 am, at lunch and 6–8 pm in your audience's local time, because many people check Threads alongside Instagram. There is no single best time for every account, so test these slots for two weeks and keep the ones your Threads insights show working.",
    },
    {
      q: "What is the best day to post on Threads?",
      a: "Weekdays are a safe starting point because people check Threads during commutes, lunch breaks and the evening. Tuesday to Thursday often suit B2B and SaaS accounts, while creators and local businesses can test a weekend late-morning slot. Compare views and replies per day in Threads insights before you commit.",
    },
    {
      q: "How often should I post on Threads?",
      a: "Start with one or two posts a day on the days you can sustain, then check your Threads insights after two weeks. Replies drive reach on Threads, so a smaller number of posts that start conversations usually beats posting many times with no follow-up.",
    },
    {
      q: "Can I schedule Threads posts?",
      a: "Yes. Poskoo schedules Threads posts through Meta's official API, so you can plan a week in the calendar and let it publish at the time you pick. Read how to schedule Threads posts in the help guide, or open the Threads scheduler to start.",
    },
  ],
  related: [
    "/tools/best-time-to-post-on-social-media",
    "/tools/threads-character-counter",
    "/tools/threads-post-preview",
    "/tools/instagram-time-zone-converter",
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
    text: "Pick the time in your audience's zone and Poskoo publishes your Threads post at that time.",
  },
};

export const metadata = toolMetadata(config);

export default function BestTimeToPostOnThreadsPage() {
  return (
    <ToolPageTemplate config={config}>
      <BestTimeFinder platform="Threads" insightsName="Threads Insights" />
    </ToolPageTemplate>
  );
}
