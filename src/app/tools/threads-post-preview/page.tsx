import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import ThreadsPostPreview from "./ThreadsPostPreview";

const config: ToolPageConfig = {
  path: "/tools/threads-post-preview",
  name: "Threads post preview",
  crumb: "Threads post preview",
  title: "Threads Post Preview & 500-Character Counter",
  description:
    "Free Threads post preview: write your post, watch the 500-character counter and see it in a phone mockup, then copy the text. Runs in your browser.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "Threads post preview", after: "and 500-character counter" },
  lede: "A Threads post can be up to 500 characters. Write your post here, watch the 500-character count update as you type, and see how it reads on a phone before you publish.",
  art: "visual",
  artLabel: "A creator measures a photo frame with a ruler next to phone screens of different shapes",
  heroPoints: ["500-char limit", "Live phone mockup", "No signup"],
  toolTitle: "Preview your Threads post",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Threads post preview",
  steps: [
    {
      title: "Write or paste your post",
      text: "Type in the Your Threads post box. A sample post is loaded so you can see the layout; press Reset to clear it.",
      art: "writing",
    },
    {
      title: "Watch the counter",
      text: "The count and bar update as you type. The remaining count turns coral within 50 characters of 500 and shows how far over you are past it.",
      art: "analytics",
    },
    {
      title: "Check the preview and copy",
      text: "Read the post in the Mobile preview, fix any awkward line breaks, then press Copy and paste it into Threads or your scheduler.",
      art: "visual",
    },
  ],
  featuresTitle: "Know it fits before you hit post",
  features: [
    {
      title: "Counts what you see",
      text: "Characters are counted as visible symbols, so an emoji with a skin tone or a combined emoji counts once, and spaces and line breaks count too.",
      art: "analytics",
    },
    {
      title: "A quick phone check",
      text: "The mockup keeps your line breaks and wraps long words, so you can spot a wall of text or a stray blank line at a glance.",
      art: "visual",
    },
    {
      title: "Private and instant",
      text: "Everything runs in your browser. Your text is not uploaded or saved, and there is nothing to log in to.",
      art: "writing",
    },
  ],
  guide: {
    title: "A practical guide to writing Threads posts in 2026",
    intro:
      "Threads is built for short, conversational text. The 500-character limit is generous for a single thought but tight for a full story, so it helps to see the length and shape of a post before it goes live.",
    sections: [
      {
        title: "What the Threads post preview does",
        body: (
          <>
            <p>
              The tool counts your text against the 500-character limit Meta documents for Threads posts and shows the
              result two ways: a running count with characters left, and a progress bar. Next to it, a simple phone
              mockup shows the text under a placeholder account name with like, reply, repost and share icons.
            </p>
            <p>
              The mockup is a guide, not the real app. Fonts and line wrapping in Threads can differ slightly, and the
              tool does not preview images, links or polls.
            </p>
          </>
        ),
      },
      {
        title: "How the Threads character limit works",
        body: (
          <>
            <p>
              A Threads post can be up to <b>500 characters</b>. That includes letters, numbers, spaces, line breaks,
              emoji and hashtags. If you paste a longer draft, the counter shows how far over you are; trim until the
              remaining count is zero or higher.
            </p>
            <ul>
              <li>Emoji count as one character each in this tool, even combined ones.</li>
              <li>Each line break counts as a character, so double spacing adds up.</li>
              <li>If a thought needs more than 500 characters, split it into a short series of posts.</li>
            </ul>
          </>
        ),
      },
      {
        title: "Best practices for Threads posts",
        body: (
          <ul>
            <li>
              <b>Lead with the point.</b> The first line does the most work in a fast-moving feed.
            </li>
            <li>
              <b>Write like you talk.</b> Threads rewards conversation, so a direct question often works better than a
              polished announcement.
            </li>
            <li>
              <b>Use space on purpose.</b> One blank line between ideas helps; three in a row just pushes the post down.
            </li>
            <li>
              <b>Plan, then post.</b> Draft a few posts at once and{" "}
              <Link href="/threads-scheduler">schedule them on Threads</Link> instead of writing every post live.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: the sample post",
        body: (
          <>
            <p>The tool loads this sample so you can see how it behaves:</p>
            <div className={t.example}>
              <p>We just shipped a faster way to plan your week 🎉</p>
              <p>What is one small thing you are proud of today?</p>
            </div>
            <p>
              It has one announcement line, a blank line and a question. That is 97 characters, so the counter shows 403
              left: plenty of room to add a detail or a link without crowding the question.
            </p>
          </>
        ),
      },
      {
        title: "Common Threads posting mistakes",
        body: (
          <ul>
            <li>Pasting an Instagram caption written for 2,200 characters and cutting it off mid-sentence.</li>
            <li>Ending with several hashtags; Threads posts usually read better with one topic or none.</li>
            <li>Posting long announcements with no question or hook for replies.</li>
            <li>
              Not checking length on cross-posts. If the same text goes to Instagram, check it with the{" "}
              <Link href="/tools/instagram-caption-counter">caption counter</Link> too.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Threads post questions",
  faqs: [
    {
      q: "How many characters can a Threads post have?",
      a: "A Threads post can be up to 500 characters. Emoji, spaces and line breaks all count toward the limit. The counter shows your total and how many characters you have left as you type.",
    },
    {
      q: "What happens if I go over 500 characters?",
      a: "The counter shows how many characters you are over. Threads will not publish a post longer than 500 characters, so trim the text until the remaining count is zero or higher.",
    },
    {
      q: "Is this Threads preview the real app?",
      a: "No. It is a simple mobile mockup that shows how your text reads on a phone. Fonts, line wrapping and spacing can differ slightly in the real Threads app, so check the final post there before publishing.",
    },
    {
      q: "Does this tool post to Threads for me?",
      a: "No. This free tool only counts characters, previews your text and copies it to your clipboard. To schedule Threads posts, connect your account in Poskoo and add the post to your calendar.",
    },
    {
      q: "Is my Threads post saved or uploaded?",
      a: "No. The text stays in your browser tab and is not sent anywhere. Refreshing the page brings back the sample post, so copy your draft before you leave.",
    },
  ],
  related: [
    "/tools/instagram-caption-counter",
    "/tools/instagram-post-preview",
    "/tools/instagram-hook-generator",
    "/tools/instagram-line-break-generator",
    "/tools/social-media-content-calendar",
  ],
  schema: {
    features: [
      "Live 500-character Threads counter",
      "Emoji-aware character counting",
      "Mobile phone mockup preview",
      "Copy and reset buttons",
      "Runs in the browser, no signup",
    ],
  },
  cta: {
    title: "Your post fits.",
    mark: "Schedule it on Threads.",
    text: "Plan Threads, Instagram, Facebook and YouTube posts in one calendar with Poskoo, free to start.",
  },
};

export const metadata = toolMetadata(config);

export default function ThreadsPostPreviewPage() {
  return (
    <ToolPageTemplate config={config}>
      <ThreadsPostPreview />
    </ToolPageTemplate>
  );
}
