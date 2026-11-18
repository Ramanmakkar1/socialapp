import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import BestTimeFinder from "./BestTimeFinder";
import t from "@/components/tools/tools.module.css";

export const dynamic = "force-static";
export const revalidate = 3600;

const config: ToolPageConfig = {
  path: "/tools/best-time-to-post-on-youtube",
  name: "Best time to post on YouTube finder",
  crumb: "Best time to post on YouTube",
  title: "Best Time to Post on YouTube: Free Time Finder | Poskoo",
  description:
    "Find the best time to post on YouTube with a free finder. Pick your audience and time zone to get weekday and weekend upload slots to test. No signup.",
  pill: "Free · runs in your browser · nothing is saved",
  h1: { before: "Best time to post on", mark: "YouTube" },
  lede: "A good starting point for YouTube is to publish on weekdays around 2–4 pm in your audience's local time, a few hours before evening viewing, with weekend slots in the morning. Test them for a few weeks and keep the ones YouTube Studio analytics show working.",
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
      text: "Your audience type sets weekday and weekend starting slots. Tick the days you can actually upload, and the grid updates straight away.",
      art: "feat-calendar",
    },
    {
      title: "Test the slots for a few weeks",
      text: "Press Copy plan, publish at those times, then check YouTube Studio analytics. Keep the slots that get more views and drop the rest.",
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
      title: "Publish before the peak",
      text: "Times are publish times, a couple of hours before evening viewing, so the video is processed and indexed by the time your viewers arrive.",
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
      "A good starting point for YouTube is to publish on weekdays around 2–4 pm in your audience's local time, a few hours before evening viewing. Use the finder above for starting points, then let YouTube Studio analytics decide which upload slots to keep.",
    sections: [
      {
        title: "What is the best time to post on YouTube?",
        body: (
          <>
            <p>
              There is no single best time for every channel. The best time is a little before your own viewers are most
              active, which you can see in <b>YouTube Studio analytics</b> &gt; <b>Audience</b> &gt; the{" "}
              <b>When your viewers are on YouTube</b> report. It shows the days and hours when your viewers are on
              YouTube.
            </p>
            <p>
              Read the report for the days you can upload. If the busiest window is a range, pick two or three times just
              before it and test them. If your channel is new and the report is thin, start with the finder above and
              gather your own data as you publish.
            </p>
          </>
        ),
      },
      {
        title: "Starting YouTube upload times by channel type",
        body: (
          <>
            <p>
              Starting points in your audience&apos;s local time, not measured data; test them in YouTube Studio
              analytics.
            </p>
            <div className={t.tableWrap}>
              <table className={t.table}>
                <caption className="sr-only">
                  Starting YouTube upload times by channel type, in your audience&apos;s local time
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Channel type</th>
                    <th scope="col">Weekdays</th>
                    <th scope="col">Weekends</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Gaming &amp; entertainment</th>
                    <td>2 pm, 4 pm, 6 pm</td>
                    <td>10 am, 2 pm</td>
                  </tr>
                  <tr>
                    <th scope="row">Education &amp; how-to</th>
                    <td>12 pm, 3 pm, 5 pm</td>
                    <td>10 am</td>
                  </tr>
                  <tr>
                    <th scope="row">Vlogs &amp; lifestyle</th>
                    <td>2 pm, 5 pm, 7 pm</td>
                    <td>9 am, 11 am</td>
                  </tr>
                  <tr>
                    <th scope="row">B2B &amp; product demos</th>
                    <td>9 am, 11 am, 2 pm</td>
                    <td>10 am</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ),
      },
      {
        title: "Should you publish before your audience is online?",
        body: (
          <p>
            Yes. Publish about 1–3 hours before your peak so the video is processed and indexed by the time viewers
            arrive. If you upload at the exact peak, the first people to check your channel may find the video is not
            ready yet. Use the When your viewers are on YouTube report to find that peak, then work backwards.
          </p>
        ),
      },
      {
        title: "Should you post YouTube videos on weekends?",
        body: (
          <p>
            It is worth testing. Weekend viewing often starts later and lasts longer, so morning and early afternoon
            slots can work well. The finder gives you weekend slots to try, but compare them with your weekday results
            in YouTube Studio analytics before you change your whole schedule.
          </p>
        ),
      },
      {
        title: "Does the best time differ for YouTube Shorts?",
        body: (
          <p>
            Shorts are discovered over a longer window, so consistency matters more than the exact hour. Test the same
            slots you use for long videos, then check whether Shorts views build in the first hours or over several
            days. Keep the slots that suit your workflow and your audience.
          </p>
        ),
      },
      {
        title: "Turn your best time into a schedule",
        body: (
          <p>
            Once a slot works, <Link href="/youtube-scheduler">schedule YouTube videos</Link> in Poskoo so they publish
            at that time without you opening the app. You can plan a week in the calendar, then let Poskoo publish at the
            right time. New here? <Link href="/signup">Create a free account</Link> and start with one video.
          </p>
        ),
      },
    ],
  },
  faqTitle: "Best time to post on YouTube questions",
  faqs: [
    {
      q: "What is the best time to post on YouTube?",
      a: "A good starting point is to publish on weekdays around 2–4 pm in your audience's local time, a few hours before evening viewing, with weekend slots in the morning. The real best time is before your own viewers are most active, which you can see in YouTube Studio analytics and the When your viewers are on YouTube report. Test a few slots for a few weeks and keep the ones that work.",
    },
    {
      q: "Should you publish before your audience is online?",
      a: "Yes. Publish about 1–3 hours before your peak so the video is processed and indexed by the time viewers arrive. Uploading at the exact peak can mean the first people to check your channel find the video is not ready yet.",
    },
    {
      q: "Should you post YouTube videos on weekends?",
      a: "It is worth testing. Weekend viewing often starts later and lasts longer, so morning and early afternoon slots can work well. Compare weekend and weekday results in YouTube Studio analytics before you change your whole schedule.",
    },
    {
      q: "Does the best time differ for YouTube Shorts?",
      a: "Shorts are discovered over a longer window, so consistency matters more than the exact hour. Test the same slots you use for long videos and keep the ones that suit your workflow and your audience.",
    },
  ],
  related: [
    "/tools/youtube-title-counter",
    "/tools/social-media-content-calendar",
    "/tools/best-time-to-post-on-tiktok",
    "/tools/best-time-to-post-on-instagram",
    "/tools/best-time-to-post-on-facebook",
  ],
  schema: {
    features: [
      "Weekday and weekend starting upload times for your audience type",
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
      <BestTimeFinder platform="YouTube" insightsName="YouTube Studio analytics" />
    </ToolPageTemplate>
  );
}
