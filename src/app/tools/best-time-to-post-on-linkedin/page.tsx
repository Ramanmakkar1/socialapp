import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import BestTimeFinder from "../best-time-to-post-on-instagram/BestTimeFinder";

const config: ToolPageConfig = {
  path: "/tools/best-time-to-post-on-linkedin",
  name: "Best time to post on LinkedIn finder",
  crumb: "Best time to post on LinkedIn",
  title: "Best Time to Post on LinkedIn: Free Finder Tool 2026",
  description:
    "Find the best time to post on LinkedIn with a free finder. Pick your audience time zone and workdays to get three starting slots to test for two weeks.",
  pill: "Free · runs in your browser · nothing is saved",
  h1: { before: "Best time to post on", mark: "LinkedIn" },
  lede: "There is no single best time to post on LinkedIn. Most professional audiences scroll around the workday, so test a morning, lunchtime and late-afternoon slot for two weeks and keep the winners.",
  art: "card-schedule",
  artLabel: "A creator pins post cards onto a weekly calendar next to a smiling alarm clock",
  heroPoints: ["Your audience's time zone", "3 slots per day", "No signup"],
  toolTitle: "Find your starting post times",
  toolNote: "Free · nothing is uploaded or saved",
  stepsTitle: "How to use the best time finder",
  steps: [
    {
      title: "Pick your audience time zone",
      text: "The zone starts on your browser's setting. Change it to where most of your professional audience lives, so the slots are shown on their clock.",
      art: "card-schedule",
    },
    {
      title: "Choose your audience and posting days",
      text: "Your audience type sets three starting slots per day. Tick the days you can actually post, and the grid updates straight away.",
      art: "feat-calendar",
    },
    {
      title: "Test the slots for two weeks",
      text: "Press Copy plan, post at those times, then check LinkedIn analytics. Keep the slots that reach more of your audience and drop the rest.",
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
      text: "You get a morning, lunchtime and late-afternoon option for each day, so you can test a small set instead of guessing a single perfect minute.",
      art: "card-schedule",
    },
    {
      title: "Copy the plan in one tap",
      text: "The Copy plan button turns the grid into plain text you can paste into your notes, a calendar or a scheduler.",
      art: "writing",
    },
  ],
  guide: {
    title: "How to find the best time to post on LinkedIn",
    intro:
      "The best time to post on LinkedIn is when your own professional audience is active, not a fixed hour that works for every profile or Page. Use the finder above for starting points, then let your LinkedIn analytics decide which slots to keep.",
    sections: [
      {
        title: "How to find your own best time",
        body: (
          <>
            <p>
              LinkedIn shows your audience&apos;s activity in <b>LinkedIn analytics</b>. For a personal profile, open
              <b> Analytics</b> from your profile to see post impressions and engagement by day and hour. For a company
              Page, open the Page&apos;s <b>Analytics</b> section to compare post impressions and engagement across your
              posting times.
            </p>
            <p>
              Read the charts for the days you can post. If the busiest window is a range, pick two or three times inside
              it and test them. If your profile or Page is new and the data is thin, start with the finder above and
              gather your own results as you post.
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
              <li>After two weeks, compare post impressions and engagement for each slot in LinkedIn analytics.</li>
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
        title: "Weekdays versus weekends for a B2B audience",
        body: (
          <>
            <p>
              These are general starting points to test, not measured data. Your own LinkedIn analytics always beat a
              general rule.
            </p>
            <ul>
              <li>
                <b>Weekdays:</b> professional audiences usually scroll LinkedIn during the workday, so test a morning
                slot, a lunchtime slot and a late-afternoon slot. Keep the one that gets the most impressions and
                engagement.
              </li>
              <li>
                <b>Weekends:</b> some B2B readers check LinkedIn on Saturday or Sunday, but activity is often lower. Test
                a weekend slot only if your audience includes people who plan or read outside the workday.
              </li>
              <li>
                <b>Personal profile vs company Page:</b> a personal profile often reaches a wider network, while a
                company Page reaches followers of the brand. Test the same slots on both and compare post impressions
                and engagement in LinkedIn analytics.
              </li>
            </ul>
            <p>
              Use the <Link href="/tools/linkedin-character-counter">LinkedIn character counter</Link> to keep your posts
              within the platform limits, and the <Link href="/tools/linkedin-text-formatter">LinkedIn text formatter</Link>{" "}
              to add emphasis and bullets before you schedule.
            </p>
          </>
        ),
      },
      {
        title: "Turn your best time into a schedule",
        body: (
          <p>
            Once a slot works, <Link href="/linkedin-scheduler">schedule LinkedIn posts</Link> in Poskoo so they publish
            at that time without you opening the app. You can plan a week in the calendar, then let Poskoo publish at the
            scheduled time. New here? <Link href="/signup">Create a free account</Link> and start with one post. Posting
            on more than LinkedIn?{" "}
            <Link href="/tools/best-time-to-post-on-social-media">See the best time to post on every platform</Link>.
          </p>
        ),
      },
    ],
  },
  faqTitle: "Best time to post on LinkedIn questions",
  faqs: [
    {
      q: "What is the best time to post on LinkedIn?",
      a: "There is no single best time for every profile or Page. The best time is when your own professional audience is active, which you can see in LinkedIn analytics through post impressions and engagement. Test a morning, lunchtime and late-afternoon slot for two weeks and keep the ones that perform best.",
    },
    {
      q: "How do I see when my LinkedIn audience is most active?",
      a: "Open LinkedIn analytics. For a personal profile, use the Analytics section on your profile; for a company Page, use the Page's Analytics. Compare post impressions and engagement by day and hour to find the slots where your audience is most active.",
    },
    {
      q: "Should I post on LinkedIn on weekends?",
      a: "It depends on your audience. Many B2B readers are less active on weekends, so weekdays are a safer starting point. If your audience includes people who read LinkedIn outside the workday, test a weekend slot for two weeks and compare post impressions and engagement with your weekday slots.",
    },
    {
      q: "Does the best time differ for a personal profile versus a company Page?",
      a: "It can. A personal profile reaches your individual network, while a company Page reaches the brand's followers. Test the same slots on both and compare post impressions and engagement in LinkedIn analytics, then keep the slots that perform best for each account.",
    },
  ],
  related: [
    "/tools/best-time-to-post-on-instagram",
    "/tools/linkedin-character-counter",
    "/tools/linkedin-text-formatter",
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
    text: "Pick the time in your audience's zone and Poskoo publishes your LinkedIn post at that time.",
  },
};

export const metadata = toolMetadata(config);

export default function BestTimeToPostOnLinkedInPage() {
  return (
    <ToolPageTemplate config={config}>
      <BestTimeFinder platform="LinkedIn" insightsName="LinkedIn analytics" />
    </ToolPageTemplate>
  );
}
