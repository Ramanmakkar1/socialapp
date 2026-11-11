import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import TimeZoneConverter from "./TimeZoneConverter";

const config: ToolPageConfig = {
  path: "/tools/instagram-time-zone-converter",
  name: "Instagram time zone converter",
  crumb: "Time zone converter",
  title: "Instagram Time Zone Converter: Convert Post Times",
  description:
    "Free Instagram time zone converter: turn a posting time into any audience's local date and time, with daylight saving handled, before you schedule a post.",
  pill: "Free · runs in your browser · nothing is saved",
  h1: { before: "Instagram", mark: "time zone converter", after: "for post times" },
  lede: "Planning a post for followers in another country? Enter the date and time, pick both time zones, and see the exact local time there, with daylight saving handled on that date.",
  art: "card-schedule",
  artLabel: "A creator pins post cards onto a weekly calendar next to a smiling alarm clock",
  heroPoints: ["Every IANA time zone", "Daylight saving aware", "No signup"],
  toolTitle: "Convert your post time",
  toolNote: "Free · nothing is uploaded or saved",
  stepsTitle: "How to use the Instagram time zone converter",
  steps: [
    {
      title: "Enter the date and time",
      text: "Pick the Date and Time you plan to post. The date matters, because daylight saving can change the gap between two places.",
      art: "card-schedule",
    },
    {
      title: "Choose both time zones",
      text: "From time zone starts on your browser's zone; set To time zone to where your audience lives, such as Europe/London or Australia/Sydney.",
      art: "feat-calendar",
    },
    {
      title: "Read and copy the result",
      text: "The local time and full date appear at once. Press Copy result to copy a line such as \"2:00 PM GMT on Friday, November 20, 2026 (Europe/London)\".",
      art: "writing",
    },
  ],
  featuresTitle: "Post times you can trust across borders",
  features: [
    {
      title: "Real daylight saving rules",
      text: "Conversions use the IANA time zone data built into your browser, so each region's actual clock-change dates are applied, not a fixed offset.",
      art: "feat-calendar",
    },
    {
      title: "Shows the date, not just the hour",
      text: "When a post lands on the next or previous day for your audience, the full weekday and date make it obvious.",
      art: "card-schedule",
    },
    {
      title: "Flags times that never happen",
      text: "On a spring-forward night some local times are skipped. The converter warns you instead of quietly showing a wrong answer.",
      art: "analytics",
    },
  ],
  guide: {
    title: "A practical guide to Instagram posting times across time zones",
    intro:
      "Instagram shows each post's timestamp in the viewer's own time zone, so one scheduled moment is morning for one follower and late evening for another. If your audience is spread across countries, check their clock before you commit. Here is how this converter works and how to use it when scheduling.",
    sections: [
      {
        title: "What this time zone converter does",
        body: (
          <>
            <p>
              You enter a wall-clock date and time in one time zone and the tool works out the same moment in another. It
              lists every time zone your browser supports (with a shorter fallback list on older browsers) and defaults the
              From zone to your own.
            </p>
            <p>
              The result shows the local time with a short zone name, the full weekday and date, and a <b>Copy result</b>{" "}
              button. Everything is calculated in your browser and nothing is saved.
            </p>
          </>
        ),
      },
      {
        title: "Best practices for posting times in 2026",
        body: (
          <ul>
            <li>
              <b>Start from your own insights.</b> Instagram&apos;s professional dashboard shows where your followers are
              and when they are active. Use that, not a generic &ldquo;best time&rdquo; list.
            </li>
            <li>
              <b>Pick one main audience zone.</b> If most followers are in one region, post for that region&apos;s day and
              convert from there.
            </li>
            <li>
              <b>Check dates around clock changes.</b> Regions change clocks on different dates, and some never do, so the
              gap between two cities can shift by an hour for a few weeks.
            </li>
            <li>
              <b>Be consistent.</b> A steady schedule is easier to keep than chasing a perfect minute. The{" "}
              <Link href="/tools/instagram-posting-frequency-calculator">posting frequency calculator</Link> helps you set
              a pace.
            </li>
          </ul>
        ),
      },
      {
        title: "Examples: New York to London and Los Angeles to Sydney",
        body: (
          <>
            <p>These are the converter&apos;s real results for three posting plans:</p>
            <div className={t.example}>
              <p>
                9:00 AM, November 20, 2026, America/New_York to Europe/London:
                <br />
                <b>2:00 PM GMT</b>, Friday, November 20, 2026
              </p>
              <p>
                9:00 AM, March 20, 2026, America/New_York to Europe/London:
                <br />
                <b>1:00 PM GMT</b>, Friday, March 20, 2026
              </p>
              <p>
                6:00 PM, November 20, 2026, America/Los_Angeles to Australia/Sydney:
                <br />
                <b>1:00 PM GMT+11</b>, Saturday, November 21, 2026
              </p>
            </div>
            <p>
              The usual five-hour gap between New York and London shrinks to four in March, because the United States moves
              its clocks forward a few weeks before the UK does. The Sydney example lands on the next day, which is easy to
              miss if you only compare hours.
            </p>
          </>
        ),
      },
      {
        title: "From a time check to a scheduled post",
        body: (
          <p>
            Once the time looks right, run the{" "}
            <Link href="/tools/instagram-scheduling-checklist">Instagram scheduling checklist</Link> for caption, media and
            account checks, then schedule it in the <Link href="/instagram-scheduler">Instagram scheduler</Link>. In Poskoo
            you pick the date and time in your own time zone, which is shown under the field, and the post publishes at
            that moment.
          </p>
        ),
      },
      {
        title: "Common time zone mistakes",
        body: (
          <ul>
            <li>Using a fixed offset such as &ldquo;London is 5 hours ahead&rdquo; all year.</li>
            <li>Forgetting that a late-evening post in one place lands on the next day somewhere else.</li>
            <li>Scheduling a post at a time that does not exist on a spring-forward night.</li>
            <li>Converting to a city where only a small share of your followers live.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram time zone questions",
  faqs: [
    {
      q: "How do I convert an Instagram post time to another time zone?",
      a: "Enter the date and time you want to post, choose your time zone under From time zone and your audience's zone under To time zone, and the converter shows the matching local time and date straight away.",
    },
    {
      q: "Does the converter handle daylight saving time?",
      a: "Yes. It reads the time zone rules from your browser, so it uses the offset in force on that date. A 9 AM post in New York is 2 PM in London for most of the year, and 1 PM for a few weeks when the two cities change clocks on different dates.",
    },
    {
      q: "What if the time I enter does not exist because the clocks spring forward?",
      a: "Clocks skip an hour on the spring-forward night, so some times never happen. The converter flags the gap and its result matches one hour earlier on the local clock, for example 1:30 AM for 2:30 AM. Pick a time after the jump for an exact answer.",
    },
    {
      q: "Which time zone should I use when scheduling an Instagram post?",
      a: "Schedule in the time zone you actually think in, and check the audience's time here first. Poskoo's scheduler publishes at the local time you pick and shows your time zone under the field, so you do not have to work out UTC yourself.",
    },
    {
      q: "Is anything I enter saved or uploaded?",
      a: "No. The conversion runs in your browser using its built-in time zone data. Nothing is sent to a server or kept after you leave the page.",
    },
  ],
  related: [
    "/tools/instagram-scheduling-checklist",
    "/tools/social-media-content-calendar",
    "/tools/instagram-posting-frequency-calculator",
    "/tools/instagram-caption-counter",
    "/tools/instagram-engagement-rate-calculator",
  ],
  schema: {
    features: [
      "Convert a post time between any two IANA time zones",
      "Daylight saving handled for the chosen date",
      "Full local date and weekday in the result",
      "Spring-forward gap warning",
      "Copy the converted time",
    ],
  },
  cta: {
    title: "Found the right time?",
    mark: "Schedule the post.",
    text: "Pick the time in your own zone and Poskoo publishes it, then auto-DMs everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramTimeZoneConverterPage() {
  return (
    <ToolPageTemplate config={config}>
      <TimeZoneConverter />
    </ToolPageTemplate>
  );
}
