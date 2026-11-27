import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import BestTimeFinder from "./BestTimeFinder";
import { networkAvailability, availabilityPhrase } from "@/components/ChannelStatusNote";

const config: ToolPageConfig = {
  path: "/tools/best-time-to-post-on-pinterest",
  name: "Best time to post on Pinterest finder",
  crumb: "Best time to post on Pinterest",
  title: "Best Time to Post on Pinterest: Free Finder | Poskoo",
  description:
    "Find the best time to post on Pinterest with a free finder. Pick your niche and time zone to get evening and weekend Pin slots to test. No signup needed.",
  pill: "Free · runs in your browser · nothing is saved",
  h1: { before: "Best time to post on", mark: "Pinterest" },
  lede: "A good starting point for Pinterest is evenings, around 8–11 pm on weekdays, plus Saturday mornings in your audience's local time. Pins have a long life, so steady weekly pinning matters more than the exact minute.",
  art: "card-schedule",
  artLabel: "A creator pins post cards onto a weekly calendar next to a smiling alarm clock",
  heroPoints: ["Your audience's time zone", "Evening and weekend slots", "No signup"],
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
      title: "Choose your niche and posting days",
      text: "Your niche sets the starting slots for each day. Tick the days you can actually pin, and the grid updates straight away.",
      art: "feat-calendar",
    },
    {
      title: "Test the slots for two weeks",
      text: "Press Copy plan, pin at those times, then check Pinterest Analytics for impressions and saves per Pin. Keep the slots that perform best and drop the rest.",
      art: "analytics",
    },
  ],
  featuresTitle: "A starting point you can test",
  features: [
    {
      title: "Built around your audience",
      text: "Slots are shown in your audience's time zone, with your own local time underneath, so you never pin at the wrong hour by accident.",
      art: "feat-calendar",
    },
    {
      title: "Evenings and weekends first",
      text: "Pinterest browsing peaks after work and on Saturday mornings, so the finder starts there and adds a niche-specific test slot.",
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
              Pinterest shows how your Pins perform in <b>Pinterest Analytics</b>. Open your business account, go to{" "}
              <b>Analytics</b>, then <b>Overview</b>. It shows impressions, saves and outbound clicks per Pin, so you can
              see which days and hours your Pins actually get found.
            </p>
            <p>
              Read the numbers for the days you can pin. If one window stands out, pick two or three times inside it and
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
              Pick two or three slots from the finder and keep everything else about your pinning the same for two weeks.
              That way the time is the only thing that changes.
            </p>
            <ol>
              <li>Choose the days you can pin and copy the plan.</li>
              <li>Pin at the same slots for 14 days, without changing your content style.</li>
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
        title: "Best time by Pin and board type",
        body: (
          <>
            <p>
              These are general starting points to test, not measured data. Your own Pinterest Analytics always beat a
              general rule.
            </p>
            <ul>
              <li>
                <b>Standard image Pins:</b> try an evening slot and a weekend morning, because image Pins keep getting
                found in search for months after posting. Test both and compare impressions after a week.
              </li>
              <li>
                <b>Video Pins:</b> try early evening, when people tend to browse for longer. Check impressions and saves,
                not just outbound clicks.
              </li>
              <li>
                <b>Seasonal Pins:</b> publish 30–45 days before the event, because people search Pinterest ahead of
                holidays and seasons. Save the Pin to the most relevant board so it keeps surfacing.
              </li>
            </ul>
            <p>
              Use the <Link href="/tools/instagram-time-zone-converter">time zone converter</Link> when your audience is
              spread across countries, and the{" "}
              <Link href="/tools/pinterest-character-counter">Pinterest character counter</Link> to keep Pin titles and
              descriptions within the platform limits.
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
      a: "A good starting point is evenings, around 8–11 pm on weekdays, plus Saturday mornings in your audience's local time. There is no single best time for every account, though: Pins keep getting found in search for months, so steady weekly pinning matters more than the exact minute. Test two or three slots for two weeks and keep the ones that get the most impressions and saves in Pinterest Analytics.",
    },
    {
      q: "What is the best day to post on Pinterest?",
      a: "Saturday and Sunday often work well because people browse and plan at the weekend, and weekday evenings are a strong starting point too. Treat the day as something to test: compare impressions and saves for each day in Pinterest Analytics before you commit to a fixed weekly plan.",
    },
    {
      q: "How often should I pin?",
      a: "Aim for a steady number of fresh Pins each week rather than a burst followed by silence. Start with one or two Pins a day on the days you can sustain, spread across your most relevant boards, then add more once your analytics show what is working.",
    },
    {
      q: "Does posting time matter on Pinterest?",
      a: "It matters less than on fast-moving feeds because Pins keep getting found in search for months. Posting at a time when your audience is browsing can help early impressions and saves, but consistent weekly pinning and strong Pin titles and descriptions usually matter more than the exact minute.",
    },
  ],
  related: [
    "/tools/pinterest-character-counter",
    "/tools/best-time-to-post-on-social-media",
    "/tools/social-media-content-calendar",
    "/tools/instagram-time-zone-converter",
  ],
  schema: {
    features: [
      "Starting Pin times per day for your niche",
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
  const state = networkAvailability("pinterest");
  const pageConfig =
    state === "live"
      ? config
      : {
          ...config,
          guide: {
            ...config.guide,
            sections: config.guide.sections.map((section) =>
              section.title === "Turn your best time into a schedule"
                ? {
                    ...section,
                    body: (
                      <p>
                        Once a slot works, pin at that time from the Pinterest app. Pinterest publishing in Poskoo is{" "}
                        {availabilityPhrase(state, "Pinterest")}; see{" "}
                        <Link href="/help/schedule-pinterest-posts">how to schedule Pinterest Pins</Link> for the setup
                        once it is switched on.
                      </p>
                    ),
                  }
                : section
            ),
          },
        };
  return (
    <ToolPageTemplate config={pageConfig}>
      <BestTimeFinder platform="Pinterest" insightsName="Pinterest Analytics" />
    </ToolPageTemplate>
  );
}
