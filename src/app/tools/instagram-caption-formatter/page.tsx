import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import CaptionFormatter from "./CaptionFormatter";

const config: ToolPageConfig = {
  path: "/tools/instagram-caption-formatter",
  name: "Instagram caption formatter",
  crumb: "Caption formatter",
  title: "Instagram Caption Formatter: Check Spacing Before You Post",
  description:
    "Free Instagram caption formatter: paste a caption, check its spacing in a live feed preview, count characters and hashtags, then copy it to post.",
  pill: "Free · no signup · live preview",
  h1: { before: "Instagram caption formatter:", mark: "see your spacing", after: "before you post" },
  lede: "Paste or write your caption and see it in a feed mockup exactly as typed, blank lines and all. Check the character and hashtag counts, then copy it into Instagram or your scheduler.",
  art: "writing",
  artLabel: "A creator writes with a giant pencil on a phone-shaped card full of caption lines and emoji",
  heroPoints: ["Live feed preview", "2,200-char counter", "One-click copy"],
  toolTitle: "Format your caption",
  toolNote: "Free · counts and preview run in your browser",
  stepsTitle: "How to use the Instagram caption formatter",
  steps: [
    {
      title: "Paste your caption",
      text: "Replace the sample in Your caption with your own text. Add blank lines between paragraphs where you want space.",
      art: "writing",
    },
    {
      title: "Check the live preview",
      text: "The Live preview shows the caption under a post mockup exactly as typed. The Characters and Hashtags meters warn you if you pass 2,200 characters or 30 hashtags.",
      art: "visual",
    },
    {
      title: "Copy and schedule",
      text: "Press Copy (or Copy caption in the scheduler box), then paste it into Instagram or a scheduled post.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Write, check and copy in one place",
  features: [
    {
      title: "What you type is what you copy",
      text: "The formatter never rewrites your text. The preview and the copied caption match the textarea character for character.",
      art: "writing",
    },
    {
      title: "Limits as you type",
      text: "Character and hashtag meters track Instagram's 2,200-character and 30-hashtag limits, with a warning when you go over.",
      art: "analytics",
    },
    {
      title: "Straight to scheduling",
      text: "Copy the finished caption and continue to sign up, then paste it into your first scheduled post.",
      art: "feat-calendar",
    },
  ],
  guide: {
    title: "How to format Instagram captions for easy reading",
    intro:
      "Most people read captions on a phone, so layout matters as much as wording. This formatter lets you see your layout before it goes live. The guide covers what it does, how to lay out a caption and what to do when spacing does not survive.",
    sections: [
      {
        title: "What this caption formatter does",
        body: (
          <>
            <p>
              The formatter is a writing space with a preview. It keeps your caption exactly as you type it and shows it
              under a post mockup, so you can judge paragraph length, blank lines and where hashtags sit.
            </p>
            <ul>
              <li>
                <b>Characters</b> counts every visible character, including spaces, line breaks and emoji (one emoji counts
                as one).
              </li>
              <li>
                <b>Hashtags</b> counts tags that contain at least one letter, against the 30-hashtag maximum.
              </li>
              <li>
                <b>Copy</b> copies the text unchanged. It does not add invisible characters; for that, use the{" "}
                <Link href="/tools/instagram-line-break-generator">line break generator</Link>.
              </li>
            </ul>
          </>
        ),
      },
      {
        title: "Caption layout best practices in 2026",
        body: (
          <ul>
            <li>
              <b>Hook first.</b> The feed shows about the first 125 characters or two lines before &ldquo;more&rdquo;.
            </li>
            <li>
              <b>One idea per paragraph.</b> Two or three short lines per block are easier to scan than one long block.
            </li>
            <li>
              <b>Call to action on its own line.</b> A separate line such as &ldquo;Comment GUIDE for the link&rdquo; is
              harder to miss.
            </li>
            <li>
              <b>Hashtags at the end.</b> Keep them after the message, or move them to a{" "}
              <Link href="/instagram-scheduler">scheduled first comment</Link>.
            </li>
            <li>
              <b>Emoji as markers, not decoration.</b> One emoji at the start of a line can work like a bullet point.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: a launch caption laid out for mobile",
        body: (
          <>
            <p>The sample caption in the tool uses one short line per idea with a blank line between each:</p>
            <div className={t.example}>
              <p>New drop is live ✨</p>
              <p>Comment GUIDE and we&apos;ll DM you the styling guide.</p>
              <p>Thanks @studio.north!</p>
              <p>#fashion #ootd #smallbusiness</p>
            </div>
            <p>
              The meters show 3 hashtags and well under 2,200 characters, and the preview shows four separate blocks: the
              news, the call to action, the credit and the tags. If you promise a DM for a keyword like this, set it up with{" "}
              <Link href="/instagram-auto-dm">Instagram auto DM</Link> before the post goes live.
            </p>
          </>
        ),
      },
      {
        title: "When blank lines disappear",
        body: (
          <>
            <p>
              Instagram can drop empty lines and trailing spaces when a caption is saved, especially in the mobile app, so a
              layout that looks right here may collapse after posting. If that happens:
            </p>
            <ul>
              <li>Remove spaces at the end of each line before copying.</li>
              <li>
                Put a character on each blank line, such as an invisible Braille blank or a dot. The{" "}
                <Link href="/tools/instagram-line-break-generator">line break generator</Link> does this for you.
              </li>
              <li>Check the published post and edit the caption if the spacing is still wrong.</li>
            </ul>
          </>
        ),
      },
      {
        title: "Common caption formatting mistakes",
        body: (
          <ul>
            <li>Writing in a notes app with formatting that does not paste as plain text.</li>
            <li>Using bold or script Unicode fonts for whole paragraphs, which is hard to read and to search.</li>
            <li>Putting hashtags in the first line, where the hook should be.</li>
            <li>Going over 2,200 characters and having Instagram reject the caption.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram caption formatter questions",
  faqs: [
    {
      q: "Does this formatter change my caption?",
      a: "No. It shows your caption exactly as you typed it, with blank lines and spacing preserved, and Copy copies that same text. It does not add invisible characters.",
    },
    {
      q: "Will Instagram collapse my blank lines?",
      a: "It can. Instagram may drop trailing spaces and empty lines when you save a caption. If your spacing collapses, use the line break generator, which puts an invisible character or a dot on each blank line.",
    },
    {
      q: "How are characters and hashtags counted?",
      a: "Every letter, emoji, space and line break counts as one character. Hashtags are words starting with # that contain at least one letter. Instagram allows up to 2,200 characters and 30 hashtags per post.",
    },
    {
      q: "Is my caption uploaded?",
      a: "Counting, preview and Copy all happen in your browser. Only if you click Continue to sign up is the caption added to the signup link as a draft.",
    },
    {
      q: "Can I schedule this caption?",
      a: "Yes. Copy the caption and paste it into a new post in Poskoo's Instagram scheduler, or straight into Instagram.",
    },
  ],
  related: [
    "/tools/instagram-line-break-generator",
    "/tools/instagram-caption-counter",
    "/tools/instagram-post-preview",
    "/tools/instagram-caption-generator",
    "/tools/instagram-font-generator",
  ],
  schema: {
    features: [
      "Live feed preview of the caption as typed",
      "Character count against 2,200",
      "Hashtag count against 30",
      "One-click copy",
    ],
  },
  cta: {
    title: "Caption looks right?",
    mark: "Schedule it.",
    text: "Paste it into Poskoo, schedule the post and auto-DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramCaptionFormatterPage() {
  return (
    <ToolPageTemplate config={config}>
      <CaptionFormatter />
    </ToolPageTemplate>
  );
}
