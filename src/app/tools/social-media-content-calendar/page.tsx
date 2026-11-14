import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import CalendarTemplate from "./CalendarTemplate";

const config: ToolPageConfig = {
  path: "/tools/social-media-content-calendar",
  name: "Social media content calendar template",
  crumb: "Content calendar template",
  title: "Social Media Content Calendar Template: Free CSV Planner",
  description:
    "Free social media content calendar template: edit a sample week of days, platforms, formats and post ideas, then download a CSV for Google Sheets or Excel.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Social media content", mark: "calendar template", after: "with CSV download" },
  lede: "Plan what you post each day, on which platform, in which format and with what idea. Start from the sample week, edit it for your brand, then download a CSV for Google Sheets or Excel.",
  art: "card-schedule",
  artLabel: "A creator pins post cards onto a weekly calendar next to a smiling alarm clock",
  heroPoints: ["8 platforms, 8 formats", "CSV download", "No signup"],
  toolTitle: "Plan your week of posts",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the social media content calendar template",
  steps: [
    {
      title: "Edit the sample week",
      text: "Seven sample rows are filled in. Change the Day text, pick a Platform and Format from the dropdowns, and write your own Post idea in each row.",
      art: "writing",
    },
    {
      title: "Add or remove posts",
      text: "Use Add row for extra posts and the bin icon to delete rows you do not need. The counter shows how many posts you have planned.",
      art: "card-schedule",
    },
    {
      title: "Approve and download",
      text: "Tick the Post approval checklist for a post and copy or print its summary, then press Download CSV to save the week as a spreadsheet.",
      art: "feat-calendar",
    },
  ],
  featuresTitle: "A simple weekly plan you can take anywhere",
  features: [
    {
      title: "Works for every channel",
      text: "Choose from Instagram, Facebook, Threads, TikTok, LinkedIn, YouTube, Pinterest and X, with formats from Reel and Carousel to Link post and Live.",
      art: "feat-calendar",
    },
    {
      title: "Opens in any spreadsheet",
      text: "Download CSV saves social-media-content-calendar.csv with Day, Platform, Format and Post idea columns for Google Sheets, Excel or Numbers.",
      art: "analytics",
    },
    {
      title: "Built-in approval checklist",
      text: "Six checks cover copy, media, links, formatting, approver and publish time, with a plain-text summary to copy or print.",
      art: "card-leads",
    },
  ],
  guide: {
    title: "How to build a social media content calendar that you keep using",
    intro:
      "A content calendar is a plan of what goes out, where and when. It does not need to be complicated: a day, a platform, a format and one sentence about the idea is enough to stop last-minute posting. Here is how this template works and how to plan a week well.",
    sections: [
      {
        title: "What this content calendar template does",
        body: (
          <>
            <p>
              The template is an editable table with four columns: <b>Day</b> (free text, so you can write a weekday or a
              date), <b>Platform</b> (8 options), <b>Format</b> (8 options) and <b>Post idea</b>. It opens with a sample
              week mixing Instagram, Facebook and Threads posts.
            </p>
            <p>
              Below the table, a <b>Post approval checklist</b> lets you label one post, tick six review steps and copy or
              print a plain-text summary. Everything runs in your browser and nothing is saved between visits, so download
              the CSV before you close the page.
            </p>
          </>
        ),
      },
      {
        title: "Content calendar best practices in 2026",
        body: (
          <ul>
            <li>
              <b>Pick a pace you can keep.</b> Consistency over several weeks matters more than a burst of daily posts. The{" "}
              <Link href="/tools/instagram-posting-frequency-calculator">posting frequency calculator</Link> helps you
              choose one.
            </li>
            <li>
              <b>Match format to platform.</b> A Reel or Carousel on Instagram, a link post on Facebook, a short text post on
              Threads.
            </li>
            <li>
              <b>Mix content types.</b> Rotate tips, behind-the-scenes, questions and offers instead of selling in every
              post.
            </li>
            <li>
              <b>Plan in batches.</b> Fill a week or two at once, then schedule it so posting does not depend on remembering
              each day.
            </li>
            <li>
              <b>Review before it goes live.</b> Use the approval checklist so links, sizes and times are checked once,
              not after publishing.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: the downloaded CSV",
        body: (
          <>
            <p>With the first three sample rows, the downloaded file starts like this:</p>
            <div className={t.example}>
              <p>
                <code>&quot;Day&quot;,&quot;Platform&quot;,&quot;Format&quot;,&quot;Post idea&quot;</code>
                <br />
                <code>
                  &quot;Monday&quot;,&quot;Instagram&quot;,&quot;Reel&quot;,&quot;Behind the scenes of how we make our
                  best-selling product&quot;
                </code>
                <br />
                <code>
                  &quot;Tuesday&quot;,&quot;Instagram&quot;,&quot;Carousel&quot;,&quot;5 mistakes to avoid when choosing a
                  product like ours&quot;
                </code>
                <br />
                <code>
                  &quot;Wednesday&quot;,&quot;Facebook&quot;,&quot;Image post&quot;,&quot;Customer question of the week,
                  answered in one image&quot;
                </code>
              </p>
            </div>
            <p>
              Every cell is quoted, so commas inside a post idea stay in one column when you open the file in Google Sheets
              or Excel.
            </p>
          </>
        ),
      },
      {
        title: "From calendar to scheduled posts",
        body: (
          <p>
            A plan only helps if the posts go out. Once the week is set, add each post to Poskoo with its date, time and
            media: the <Link href="/instagram-scheduler">Instagram scheduler</Link> handles feed posts, Reels, carousels and
            Stories, and Poskoo also schedules Facebook Page, Threads, YouTube, LinkedIn, Bluesky and Mastodon posts.
            TikTok, Pinterest and X rows in the template are for planning only for now.
          </p>
        ),
      },
      {
        title: "Common content calendar mistakes",
        body: (
          <ul>
            <li>Planning more posts than you can actually produce, then abandoning the calendar.</li>
            <li>Writing vague ideas such as &ldquo;product post&rdquo; that need rethinking on the day.</li>
            <li>Posting the same format every day on every platform.</li>
            <li>Closing the page without downloading: the template does not save your rows.</li>
            <li>Skipping a final check of links and publish times before posts go live.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Content calendar template questions",
  faqs: [
    {
      q: "What is a social media content calendar template?",
      a: "It is a plan that lists what you will post each day, on which platform, in which format and with what idea. This one starts with a sample week you can edit, then download as a CSV.",
    },
    {
      q: "Is this content calendar template free?",
      a: "Yes. The planner runs entirely in your browser, needs no account and uploads nothing. Edit the rows and download the CSV as often as you like.",
    },
    {
      q: "How do I download the calendar as a CSV?",
      a: "Click Download CSV. Your browser saves a file named social-media-content-calendar.csv with the columns Day, Platform, Format and Post idea, ready to open in Google Sheets, Excel or Numbers.",
    },
    {
      q: "Can I change the sample week?",
      a: "Yes. Every day, platform, format and post idea is editable, and you can add or remove rows. Replace the sample posts with your own plan before you download.",
    },
    {
      q: "Does the template save my plan?",
      a: "No. Your rows live only in the open browser tab and are reset when you reload or leave the page, so download the CSV to keep your plan.",
    },
    {
      q: "How do I schedule the posts after planning them?",
      a: "Connect your Instagram, Facebook Page, Threads or YouTube account in Poskoo, then add each planned post with its date, time and media. Poskoo publishes it at the scheduled time and shows whether it went live or failed.",
    },
  ],
  related: [
    "/tools/instagram-scheduling-checklist",
    "/tools/instagram-posting-frequency-calculator",
    "/tools/instagram-post-ideas-generator",
    "/tools/instagram-time-zone-converter",
    "/tools/social-media-analytics-report",
  ],
  schema: {
    features: [
      "Editable weekly content calendar with sample week",
      "8 platforms and 8 post formats",
      "CSV download for Google Sheets or Excel",
      "Six-step post approval checklist with copy and print",
      "Runs in the browser, no signup",
    ],
  },
  cta: {
    title: "Your week is planned.",
    mark: "Now schedule it.",
    text: "Add each post to Poskoo with its date and time, and auto-DM everyone who comments your keyword on Instagram.",
  },
};

export const metadata = toolMetadata(config);

export default function SocialMediaContentCalendarPage() {
  return (
    <ToolPageTemplate config={config}>
      <CalendarTemplate />
    </ToolPageTemplate>
  );
}
