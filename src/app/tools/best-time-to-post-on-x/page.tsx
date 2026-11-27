import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import BestTimeFinder from "./BestTimeFinder";
import t from "@/components/tools/tools.module.css";
import { networkAvailability, availabilityPhrase } from "@/components/ChannelStatusNote";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const config: ToolPageConfig = {
  path: "/tools/best-time-to-post-on-x",
  name: "Best time to post on X finder",
  crumb: "Best time to post on X",
  title: "Best Time to Post on X (Twitter): Free Finder | Poskoo",
  description:
    "Find the best time to post on X (Twitter) with a free finder. Pick your audience and time zone to get weekday and weekend slots to test. No signup.",
  pill: "Free · runs in your browser · nothing is saved",
  h1: { before: "Best time to post on", mark: "X (Twitter)" },
  lede: "The best time to post on X (Twitter) is when your own followers are most active: for most accounts that is weekdays around 8–10 am and 12 pm in your audience's local time, with an early-evening test. Use these as starting points, then let your X audience analytics refine them into the slots that work for you.",
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
        title: "Best weekday and weekend times on X",
        body: (
          <>
            <p>
              Weekdays are where most X activity happens. A safe first test is <b>Monday to Friday, 8–10 am and 12 pm</b>
              in your audience&apos;s local time, with an early-evening post (around 5–7 pm) for news and creator accounts.
              B2B and SaaS audiences tend to respond to the 8–10 am workday window; creators and ecommerce audiences
              often do better with a midday and an evening slot.
            </p>
            <p>
              <b>Weekends are quieter on X</b>, so a single later slot around 10 am is usually enough. Post on the days
              you can sustain, and compare weekend results with your weekday slots in your X analytics before adding
              more.
            </p>
          </>
        ),
      },
      {
        title: "Posting across time zones",
        body: (
          <>
            <p>
              The slots below are <b>local times in each audience zone</b> — the same 8–10 am, 12 pm and 5–7 pm windows,
              on each zone&apos;s own clock. They are not converted from US Eastern time. Pick the zone where most of your
              followers live, and post at those local times.
            </p>
            <div className={t.tableWrap}>
              <table className={t.table}>
                <caption className="sr-only">
                  Starting post times as local times in each audience time zone
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Audience zone</th>
                    <th scope="col">Morning slot (local)</th>
                    <th scope="col">Midday slot (local)</th>
                    <th scope="col">Evening slot (local)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>US East (New York, EDT/EST)</td>
                    <td>8–10 am</td>
                    <td>12 pm</td>
                    <td>5–7 pm</td>
                  </tr>
                  <tr>
                    <td>US West (Los Angeles, PDT/PST)</td>
                    <td>8–10 am</td>
                    <td>12 pm</td>
                    <td>5–7 pm</td>
                  </tr>
                  <tr>
                    <td>UK (London, GMT/BST)</td>
                    <td>8–10 am</td>
                    <td>12 pm</td>
                    <td>5–7 pm</td>
                  </tr>
                  <tr>
                    <td>India (Mumbai, IST)</td>
                    <td>8–10 am</td>
                    <td>12 pm</td>
                    <td>5–7 pm</td>
                  </tr>
                  <tr>
                    <td>Europe (Berlin, CET/CEST)</td>
                    <td>8–10 am</td>
                    <td>12 pm</td>
                    <td>5–7 pm</td>
                  </tr>
                  <tr>
                    <td>Singapore (SGT)</td>
                    <td>8–10 am</td>
                    <td>12 pm</td>
                    <td>5–7 pm</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              If you post to several zones at once, use the{" "}
              <Link href="/tools/instagram-time-zone-converter">time zone converter</Link> to convert a single slot into
              each zone&apos;s local time, then post once per zone at those times. The{" "}
              <Link href="/x-scheduler">X scheduler</Link> page shows when X scheduling is available in Poskoo.
            </p>
          </>
        ),
      },
      {
        title: "Measuring your results",
        body: (
          <>
            <p>
              The only way to know your best time is to measure it. In the <b>Analytics view on x.com</b>, compare
              impressions, engagement rate and replies for posts at each slot you tested.
            </p>
            <ul>
              <li>
                <b>Track per slot, not per day:</b> group your posts by the time slot you used, so a slow day does not
                look like a bad time.
              </li>
              <li>
                <b>Give it two weeks:</b> a single post is noise; two weeks of slots shows a pattern.
              </li>
              <li>
                <b>Keep the winner, drop the weakest,</b> then test one new time. Change one thing at a time so you
                know what made the difference.
              </li>
            </ul>
            <p>
              Your own X post analytics always beat a general rule — the tables above are starting points, not
              measurements of your account.
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
      q: "What is the best time to post on X (Twitter)?",
      a: "A good starting point is weekdays around 8–10 am and 12 pm in your audience's local time, with an early-evening test. There is no single best time for every account, though: compare impressions and engagement rate per slot in your X analytics, test two or three for two weeks, and keep the ones that work for you.",
    },
    {
      q: "Is it better to post on X in the morning?",
      a: "Mornings often work for news and B2B audiences because people check X before work and at the start of the day. Treat it as a starting point to test, not a rule. Compare impressions and engagement for your morning posts with other slots in your X analytics before you commit.",
    },
    {
      q: "Should you post on X on weekends?",
      a: "Weekends can be quieter on X, but they still work for some accounts, especially creators and news. Try a later weekend slot such as 10 am and compare it with your weekday results. Post on the days you can sustain, and let your X analytics decide.",
    },
    {
      q: "What time should I post on X if my audience is in a different time zone?",
      a: "Post at the slot in your audience's local time, not yours. For example, 8–10 am for a UK audience means 8–10 am London time (GMT/BST), and 8–10 am for an India audience means 8–10 am IST — the same windows on each zone's own clock. Use the time zone converter to translate a slot into each zone, and your X analytics to see which zone's slots perform best.",
    },
    {
      q: "How often should you post on X?",
      a: "A few times a day is common on X, but start with what you can sustain and test it. Pick two or three slots from the finder, keep the quality high, and check your X analytics after two weeks before adding more.",
    },
  ],
  related: [
    "/tools/x-character-counter",
    "/tools/social-media-content-calendar",
    "/tools/best-time-to-post-on-linkedin",
    "/tools/best-time-to-post-on-facebook",
    "/tools/best-time-to-post-on-instagram",
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
  const state = networkAvailability("x");
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
                        Once a slot works, post at that time from the X app. X publishing in Poskoo is{" "}
                        {availabilityPhrase(state, "X")}; see{" "}
                        <Link href="/help/schedule-x-posts">how to schedule X posts</Link> for the setup once it is live.
                      </p>
                    ),
                  }
                : section
            ),
          },
        };
  return (
    <ToolPageTemplate config={pageConfig}>
      <BestTimeFinder platform="X" insightsName="X post analytics" />
    </ToolPageTemplate>
  );
}
