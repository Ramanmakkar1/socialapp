import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import SchedulingChecklist from "./SchedulingChecklist";

const config: ToolPageConfig = {
  path: "/tools/instagram-scheduling-checklist",
  name: "Instagram scheduling checklist",
  crumb: "Scheduling checklist",
  title: "Instagram Scheduling Checklist: Preflight Before You Post",
  description:
    "Free Instagram scheduling checklist: confirm caption limits, media format, channel, time zone, connected account and publish status before you queue posts.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Instagram scheduling", mark: "checklist", after: "before you post" },
  lede: "Tick off six preflight checks before you schedule: caption, media format, channel, time zone, connected account and publishing status. Then queue the post with confidence.",
  art: "card-schedule",
  artLabel: "A creator pins post cards onto a weekly calendar next to a smiling alarm clock",
  heroPoints: ["6 preflight checks", "Copy as plain text", "No signup"],
  toolTitle: "Run your preflight checklist",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Instagram scheduling checklist",
  steps: [
    {
      title: "Read each check",
      text: "Go through Caption, Media format, Channel selection, Scheduled time & timezone, Confirm the connected account and Review publishing status.",
      art: "writing",
    },
    {
      title: "Tick what you have confirmed",
      text: "Tick a box once that part of the post is ready. The counter and progress bar show how many of the six checks are done; Reset clears them.",
      art: "card-schedule",
    },
    {
      title: "Copy and schedule",
      text: "Press Copy checklist to paste the list with [x] and [ ] marks into notes or a team chat, then schedule the post.",
      art: "feat-calendar",
    },
  ],
  featuresTitle: "Catch the problems that make scheduled posts fail",
  features: [
    {
      title: "Limits in one place",
      text: "The caption check lists Instagram's 2,200 characters and 30 hashtags, with a link to the caption counter to test your text.",
      art: "writing",
    },
    {
      title: "Format rules spelled out",
      text: "Which media becomes a feed post, Reel, carousel or Story, so you choose the right files before you open the scheduler.",
      art: "visual",
    },
    {
      title: "Shareable with a team",
      text: "Copy checklist gives a plain-text list with tick marks, ready to paste into a handover or approval message.",
      art: "card-dm",
    },
  ],
  guide: {
    title: "How to schedule Instagram posts without surprises",
    intro:
      "Most scheduled posts that fail do so for boring reasons: a caption over the limit, the wrong file type, a disconnected account or a time in the wrong time zone. A short preflight catches these before they matter. Here is what this checklist covers and how to use it.",
    sections: [
      {
        title: "What this scheduling checklist does",
        body: (
          <>
            <p>
              The checklist holds six items, each with a short explanation and links to the relevant guide or tool. You tick
              items as you confirm them, and a counter and progress bar track how many are done. When all six are ticked, a
              confirmation message appears.
            </p>
            <p>
              Nothing is saved: ticks reset when you reload the page. <b>Copy checklist</b> puts the whole list on your
              clipboard, with <code>[x]</code> for confirmed items and <code>[ ]</code> for open ones.
            </p>
          </>
        ),
      },
      {
        title: "The six checks explained",
        body: (
          <ul>
            <li>
              <b>Caption.</b> Instagram allows 2,200 characters and 30 hashtags per caption. Put the hook in the first line,
              before the &ldquo;more&rdquo; cut. Test it with the{" "}
              <Link href="/tools/instagram-caption-counter">caption counter</Link>.
            </li>
            <li>
              <b>Media format.</b> In Poskoo, one image posts as a feed post, one .mp4 as a Reel, 2 to 10 images as a
              carousel and one image or video as a Story. Carousels are images only.
            </li>
            <li>
              <b>Channel selection.</b> Pick at least one connected channel. Instagram publishing needs a professional
              (Business or Creator) account.
            </li>
            <li>
              <b>Scheduled time and time zone.</b> The time you pick is your local time and must be at least a minute in
              the future.
            </li>
            <li>
              <b>Connected account.</b> If access has expired, reconnect through Meta&apos;s login before the post is due.
            </li>
            <li>
              <b>Publishing status.</b> After the scheduled time, check that the post shows as published, or read the error
              on a failed post and retry.
            </li>
          </ul>
        ),
      },
      {
        title: "Scheduling best practices in 2026",
        body: (
          <ul>
            <li>
              <b>Check sizes before you upload.</b> Use the <Link href="/tools/instagram-image-size">image size guide</Link>{" "}
              so feed images, Reels and Stories are not cropped badly.
            </li>
            <li>
              <b>Schedule for your audience&apos;s time zone.</b> If your followers live elsewhere, convert the time first
              with the <Link href="/tools/instagram-time-zone-converter">time zone converter</Link>.
            </li>
            <li>
              <b>Schedule in batches.</b> Plan a week at a time, then run the checklist once per post.
            </li>
            <li>
              <b>Look after publishing.</b> A quick check after the scheduled time lets you fix a failed post the same day.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: a Friday Reel",
        body: (
          <>
            <p>
              You plan a Reel for Friday at 6 pm. The caption is 410 characters with 5 hashtags, the video is one vertical
              .mp4, Instagram is selected and the account shows as connected. You tick the first five items and press{" "}
              <b>Copy checklist</b>. The pasted text starts:
            </p>
            <div className={t.example}>
              <p>
                Instagram scheduling preflight checklist
                <br />
                [x] Caption ...
                <br />
                [x] Media format ...
              </p>
            </div>
            <p>
              Each line continues with that item&apos;s full explanation, and the last item, Review publishing status, stays{" "}
              <code>[ ]</code> until you check the post after 6 pm on Friday.
            </p>
          </>
        ),
      },
      {
        title: "Common scheduling mistakes",
        body: (
          <ul>
            <li>Writing one long caption for every channel without checking each channel&apos;s limit.</li>
            <li>Uploading a horizontal video as a Reel, or mixing videos into a carousel that only takes images.</li>
            <li>Scheduling in your own time zone when your audience is in another one.</li>
            <li>Letting the connected account expire and only noticing when posts fail.</li>
            <li>Never checking whether the post actually went live.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram scheduling checklist questions",
  faqs: [
    {
      q: "Is this scheduling checklist free?",
      a: "Yes. The checklist runs entirely in your browser. Tick the items, copy the list and go schedule your post. Nothing is uploaded and no account is needed.",
    },
    {
      q: "What caption limit should I check before scheduling?",
      a: "Instagram allows 2,200 characters and 30 hashtags per caption, and Threads posts are limited to 500 characters. The caption counter tool checks your text against these limits as you type.",
    },
    {
      q: "Which media formats can I schedule on Instagram with Poskoo?",
      a: "Public https links to .jpg or .png images and .mp4 videos. One image posts as a feed post, one .mp4 as a Reel, 2 to 10 images as a carousel, and one image or video as a Story. Carousels are images only.",
    },
    {
      q: "How does the scheduled time and time zone work?",
      a: "You pick the date and time in your own time zone, which the composer shows under the field, and the post publishes at that local time. It must be at least one minute in the future.",
    },
    {
      q: "How do I know if my scheduled post actually published?",
      a: "Open the Calendar after the scheduled time. The post shows as published when it went live, or as failed with the error message and a Retry option if publishing hit a problem.",
    },
    {
      q: "Does the checklist save my ticks?",
      a: "No. Ticks only last while the page is open. Use Copy checklist to keep a plain-text record of what you confirmed.",
    },
  ],
  related: [
    "/tools/social-media-content-calendar",
    "/tools/instagram-time-zone-converter",
    "/tools/instagram-caption-counter",
    "/tools/instagram-image-size",
    "/tools/instagram-post-preview",
    "/tools/instagram-safe-zone-checker",
  ],
  schema: {
    features: [
      "Six-item Instagram scheduling preflight",
      "Caption, media format and time zone checks",
      "Progress counter and reset",
      "Copy the checklist as plain text",
      "Runs in the browser, no signup",
    ],
  },
  cta: {
    title: "Checklist all green?",
    mark: "Schedule the post.",
    text: "Queue it in Poskoo, see whether it published, and auto-DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramSchedulingChecklistPage() {
  return (
    <ToolPageTemplate config={config}>
      <SchedulingChecklist />
    </ToolPageTemplate>
  );
}
