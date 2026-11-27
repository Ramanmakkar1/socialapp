import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import BestTimeFinder from "./BestTimeFinder";
import { networkAvailability, availabilityPhrase } from "@/components/ChannelStatusNote";

const config: ToolPageConfig = {
  path: "/tools/best-time-to-post-on-tiktok",
  name: "Best time to post on TikTok finder",
  crumb: "Best time to post on TikTok",
  title: "Best Time to Post on TikTok: Free Time Finder | Poskoo",
  description:
    "Find the best time to post on TikTok with a free finder. Pick your audience time zone and days to get starting slots to test for two weeks, no signup.",
  pill: "Free · runs in your browser · nothing is saved",
  h1: { before: "Best time to post on", mark: "TikTok" },
  lede: "A good starting point for TikTok is weekday evenings around 7–10 pm, plus 6–9 am and lunchtime, in your audience's local time. Test these slots for two weeks and keep the ones your TikTok analytics show working.",
  art: "card-schedule",
  artLabel: "A creator pins post cards onto a weekly calendar next to a smiling alarm clock",
  heroPoints: ["Your audience's time zone", "3 slots per day", "No signup"],
  toolTitle: "Find your starting post times",
  toolNote: "Free · nothing is uploaded or saved",
  stepsTitle: "How to use the best time finder",
  steps: [
    {
      title: "Pick your audience time zone",
      text: "The zone starts on your browser's setting. Change it to where most of your TikTok audience lives, so the slots are shown on their clock.",
      art: "card-schedule",
    },
    {
      title: "Choose your audience and posting days",
      text: "Your audience type sets three starting slots per day. All seven days are selected by default, so tick off any day you cannot post and the grid updates straight away.",
      art: "feat-calendar",
    },
    {
      title: "Test the slots for two weeks",
      text: "Press Copy plan, post at those times, then check TikTok analytics. Keep the slots that reach more of your audience and drop the rest.",
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
      text: "You get an evening, morning and lunchtime option for each weekday, plus weekend windows, so you can test a small set instead of guessing a single perfect minute.",
      art: "card-schedule",
    },
    {
      title: "Copy the plan in one tap",
      text: "The Copy plan button turns the grid into plain text you can paste into your notes, a calendar or a scheduler.",
      art: "writing",
    },
  ],
  guide: {
    title: "How to find the best time to post on TikTok",
    intro:
      "The best time to post on TikTok is when your own audience is active, not a fixed hour that works for every account. Use the finder above for starting points, then let your TikTok analytics decide which slots to keep.",
    sections: [
      {
        title: "Is it better to post on TikTok in the morning or evening?",
        body: (
          <>
            <p>
              For most accounts, evening is the safer starting point: test a slot between 7 and 10 pm in your audience&apos;s
              local time. Morning and lunchtime can work just as well for some audiences, so test a 6–9 am and a 12–2 pm
              slot alongside the evening one.
            </p>
            <p>
              TikTok analytics shows when your viewers are active. Open <b>Analytics</b> in the TikTok app or on the web,
              then look at follower activity and the performance of your recent posts by time of day. If the busiest
              window is a range, pick two or three times inside it and test them.
            </p>
          </>
        ),
      },
      {
        title: "Which days should you test first?",
        body: (
          <>
            <p>
              Start with the days you can actually post consistently. All seven days are selected in the finder by
              default, because TikTok audiences use the app throughout the week, but a steady weekday schedule beats an
              irregular one.
            </p>
            <ol>
              <li>Choose the days you can post and copy the plan.</li>
              <li>Post at the same slots for 14 days, without changing your content style.</li>
              <li>After two weeks, compare views, watch time and engagement for each slot in TikTok analytics.</li>
              <li>Keep the best slot, drop the weakest, and test one new time next.</li>
            </ol>
            <p>
              Two weeks is long enough to see a pattern without waiting a month. Change one thing at a time so you know
              what made the difference.
            </p>
          </>
        ),
      },
      {
        title: "Should you post on TikTok on weekends?",
        body: (
          <>
            <p>
              Yes, weekends are worth testing on TikTok. Many viewers have more free time on Saturday and Sunday, so the
              finder offers weekend windows such as 9–11 am and 7–9 pm in your audience&apos;s local time.
            </p>
            <p>
              These are general starting points to test, not measured data. Your own TikTok analytics always beat a
              general rule. If weekend posts underperform for two weeks, drop them and put the effort into your weekday
              slots.
            </p>
            <p>
              Use the <Link href="/tools/tiktok-caption-counter">TikTok caption character counter</Link> to keep your
              captions within the platform limit before you schedule.
            </p>
          </>
        ),
      },
      {
        title: "How do you turn a test slot into a schedule?",
        body: (
          <p>
            Once a slot works, <Link href="/tiktok-scheduler">schedule TikTok posts</Link> in Poskoo so they publish at
            that time without you opening the app. You can plan a week in the calendar, then let Poskoo publish at the
            scheduled time. New here? <Link href="/signup">Create a free account</Link> and start with one post. Posting
            on more than TikTok?{" "}
            <Link href="/tools/best-time-to-post-on-social-media">See the best time to post on every platform</Link>.
          </p>
        ),
      },
    ],
  },
  faqTitle: "Best time to post on TikTok questions",
  faqs: [
    {
      q: "What is the best time to post on TikTok?",
      a: "There is no single best time for every account. A good starting point is weekday evenings around 7–10 pm, plus 6–9 am and lunchtime, in your audience's local time. Test those slots for two weeks and keep the ones your TikTok analytics show working.",
    },
    {
      q: "Is it better to post on TikTok in the morning or evening?",
      a: "Evening is a safer starting point for most accounts, so test a slot between 7 and 10 pm first. Morning and lunchtime can work for some audiences, so test a 6–9 am and a 12–2 pm slot alongside it and compare views, watch time and engagement in TikTok analytics.",
    },
    {
      q: "Should I post on TikTok on weekends?",
      a: "Yes, weekends are worth testing. Many viewers have more free time on Saturday and Sunday, so try a 9–11 am and a 7–9 pm window in your audience's local time. If weekend posts underperform for two weeks, drop them and focus on your weekday slots.",
    },
    {
      q: "Does the best time to post on TikTok depend on my time zone?",
      a: "Yes. TikTok shows your post to viewers on their own clock, so the best time depends on where your audience lives. Set the finder to your audience's time zone, not your own, and it shows each slot in their local time with your time underneath.",
    },
  ],
  related: [
    "/tools/tiktok-caption-counter",
    "/tools/instagram-safe-zone-checker",
    "/tools/social-media-content-calendar",
    "/tools/best-time-to-post-on-instagram",
    "/tools/best-time-to-post-on-linkedin",
  ],
  schema: {
    features: [
      "Three starting post times per day for your audience type",
      "Slots shown in your audience's time zone",
      "Your own local time shown under each slot",
      "All seven days selected by default, with weekend windows",
      "Copy the whole plan as text",
    ],
  },
  cta: {
    title: "Found a slot to test?",
    mark: "Schedule the post.",
    text: "Pick the time in your audience's zone and Poskoo publishes your TikTok post at that time.",
  },
};

export const metadata = toolMetadata(config);

export default function BestTimeToPostOnTikTokPage() {
  const state = networkAvailability("tiktok");
  const pageConfig =
    state === "live"
      ? config
      : {
          ...config,
          guide: {
            ...config.guide,
            sections: config.guide.sections.map((section) =>
              section.title === "How do you turn a test slot into a schedule?"
                ? {
                    ...section,
                    body: (
                      <p>
                        Once a slot works, post at that time from the TikTok app. TikTok publishing in Poskoo is{" "}
                        {availabilityPhrase(state, "TikTok")}; see{" "}
                        <Link href="/help/schedule-tiktok-posts">how to schedule TikTok posts</Link> for the setup
                        once it is live. Posting on more than TikTok?{" "}
                        <Link href="/tools/best-time-to-post-on-social-media">See the best time to post on every
                        platform</Link>.
                      </p>
                    ),
                  }
                : section
            ),
          },
        };
  return (
    <ToolPageTemplate config={pageConfig}>
      <BestTimeFinder platform="TikTok" insightsName="TikTok analytics" />
    </ToolPageTemplate>
  );
}
