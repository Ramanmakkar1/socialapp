import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import BestTimeFinder from "../best-time-to-post-on-instagram/BestTimeFinder";

const config: ToolPageConfig = {
  path: "/tools/best-time-to-post-on-youtube",
  name: "Best time to post on YouTube finder",
  crumb: "Best time to post on YouTube",
  title: "Best Time to Post on YouTube: Free Finder Tool 2026",
  description:
    "Find the best time to post on YouTube with a free finder. Pick your audience time zone and upload days to get three starting slots to test for two weeks.",
  pill: "Free · runs in your browser · nothing is saved",
  h1: { before: "Best time to post on", mark: "YouTube" },
  lede: "There is no single best time to post on YouTube. The best time is a little before your own viewers are most active, so test two or three upload slots for two weeks and keep the ones that get the most views in the first 24 hours.",
  art: "card-schedule",
  artLabel: "A creator pins video cards onto a weekly calendar next to a smiling alarm clock",
  heroPoints: ["Your audience's time zone", "3 slots per day", "No signup"],
  toolTitle: "Find your starting upload times",
  toolNote: "Free · nothing is uploaded or saved",
  stepsTitle: "How to use the best time finder",
  steps: [
    {
      title: "Pick your audience time zone",
      text: "The zone starts on your browser's setting. Change it to where most of your viewers live, so the upload slots are shown on their clock.",
      art: "card-schedule",
    },
    {
      title: "Choose your audience and upload days",
      text: "Your audience type sets three starting slots per day. Tick the days you can actually upload, and the grid updates straight away.",
      art: "feat-calendar",
    },
    {
      title: "Test the slots for two weeks",
      text: "Press Copy plan, upload at those times, then check YouTube Studio > Analytics. Keep the slots that get more views in the first 24 hours and drop the rest.",
      art: "analytics",
    },
  ],
  featuresTitle: "A starting point you can test",
  features: [
    {
      title: "Built around your audience",
      text: "Slots are shown in your audience's time zone, with your own local time underneath, so you never upload at the wrong hour by accident.",
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
    title: "How to find the best time to post on YouTube",
    intro:
      "The best time to post on YouTube is a little before your own viewers are most active, not a fixed hour that works for every channel. Use the finder above for starting points, then let your YouTube Studio Analytics decide which upload slots to keep.",
    sections: [
      {
        title: "How to find your own best time",
        body: (
          <>
            <p>
              Open <b>YouTube Studio &gt; Analytics &gt; Audience tab</b> and find the{" "}
              <b>When your viewers are on YouTube</b> chart. It shows the days and hours when your viewers are on
              YouTube in your local time. Aim to upload a little before a busy window so your video is ready as viewers
              arrive.
            </p>
            <p>
              Read the chart for the days you can upload. If the busiest window is a range, pick two or three times just
              before it and test them. If your channel is new and the chart is thin, start with the finder above and
              gather your own data as you publish.
            </p>
          </>
        ),
      },
      {
        title: "A simple 2-week upload test",
        body: (
          <>
            <p>
              Pick two or three slots from the finder and keep everything else about your uploads the same for two weeks.
              That way the time is the only thing that changes.
            </p>
            <ol>
              <li>Choose the days you can upload and copy the plan.</li>
              <li>Publish at the same slots for 14 days, without changing your content style.</li>
              <li>After two weeks, compare views in the first 24 hours for each slot in YouTube Studio Analytics.</li>
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
              These are general starting points to test, not measured data. Your own YouTube Studio Analytics always
              beat a general rule.
            </p>
            <ul>
              <li>
                <b>Long videos:</b> try uploading an hour or two before a busy window, then compare views in the first
                24 hours for each slot.
              </li>
              <li>
                <b>Shorts:</b> try a midday slot and an evening slot, then compare views in the first 24 hours to see
                which time reaches more viewers.
              </li>
              <li>
                <b>Live streams:</b> schedule a premiere or a stream ahead so viewers can see when it starts. Pick a time
                just before your audience is most active and be ready to join the live chat.
              </li>
            </ul>
            <p>
              Use the <Link href="/tools/instagram-time-zone-converter">time zone converter</Link> when your audience is
              spread across countries, and the{" "}
              <Link href="/tools/youtube-title-counter">YouTube title and description counter</Link> to check your video
              details before you upload.
            </p>
          </>
        ),
      },
      {
        title: "Turn your best time into a schedule",
        body: (
          <p>
            Once a slot works, <Link href="/youtube-scheduler">schedule YouTube videos</Link> in Poskoo so they publish
            at that time without you opening the app. You can plan a week in the calendar, then let Poskoo publish at the
            right time. New here? <Link href="/signup">Create a free account</Link> and start with one video. Need help
            getting started? Read <Link href="/help/schedule-youtube-videos">how to schedule YouTube videos</Link>.
          </p>
        ),
      },
    ],
  },
  faqTitle: "Best time to post on YouTube questions",
  faqs: [
    {
      q: "What is the best time to post on YouTube?",
      a: "There is no single best time for every channel. The best time is a little before your own viewers are most active, which you can see in YouTube Studio under Analytics, Audience, and the When your viewers are on YouTube chart. Test two or three upload slots for two weeks and keep the ones that get the most views in the first 24 hours.",
    },
    {
      q: "How do I see when my viewers are most active on YouTube?",
      a: "Open YouTube Studio, go to Analytics, then the Audience tab, and look at the When your viewers are on YouTube chart. It shows the days and hours in your local time, so you can pick upload slots just before your viewers are most active.",
    },
    {
      q: "How long should I test upload times before changing them?",
      a: "Give each slot about two weeks. That is long enough to see a pattern without waiting a month. Change one thing at a time, then compare views in the first 24 hours for each slot in YouTube Studio Analytics before you keep or drop it.",
    },
    {
      q: "Does the best time to post change by content type on YouTube?",
      a: "It can. Long videos, Shorts, and live streams can earn different responses at different times. Schedule a premiere or a stream ahead, treat the content-type suggestions as starting points to test, not fixed rules, and check your own YouTube Studio Analytics.",
    },
  ],
  related: [
    "/tools/best-time-to-post-on-social-media",
    "/tools/youtube-title-counter",
    "/tools/instagram-time-zone-converter",
    "/tools/social-media-content-calendar",
  ],
  schema: {
    features: [
      "Three starting upload times per day for your audience type",
      "Slots shown in your audience's time zone",
      "Your own local time shown under each slot",
      "Choose the days you can upload",
      "Copy the whole plan as text",
    ],
  },
  cta: {
    title: "Found a slot to test?",
    mark: "Schedule the video.",
    text: "Pick the time in your audience's zone and Poskoo publishes your YouTube video at that time.",
  },
};

export const metadata = toolMetadata(config);

export default function BestTimeToPostOnYouTubePage() {
  return (
    <ToolPageTemplate config={config}>
      <BestTimeFinder platform="YouTube" insightsName="YouTube Studio Analytics" />
    </ToolPageTemplate>
  );
}
