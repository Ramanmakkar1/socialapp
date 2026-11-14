import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import CaptionGeneratorTool from "../instagram-caption-generator/CaptionGeneratorTool";

const config: ToolPageConfig = {
  path: "/tools/threads-caption-generator",
  name: "Threads caption generator",
  crumb: "Threads caption generator",
  title: "Threads Caption Generator: Free Post Ideas in 1 Click",
  description:
    "Free Threads caption generator: enter a topic, pick a goal and tone, and copy six Threads post drafts that fit the 500-character limit. No signup.",
  pill: "Free · no signup · no AI or scraping",
  h1: { before: "Threads caption generator:", mark: "post drafts", after: "ready to publish" },
  lede: "A Threads post can be up to 500 characters. This free generator turns your topic into six Threads post drafts with a hook, a short body and a call to action, all within that limit.",
  art: "writing",
  artLabel: "A creator writes Threads post drafts with a hook, a call to action and a feed preview",
  heroPoints: ["Six post drafts", "500-character limit", "Hook and call to action"],
  toolTitle: "Generate your Threads post drafts",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate Threads captions",
  steps: [
    {
      title: "Enter your topic",
      text: "Describe the post, product or idea you want to share. A specific topic gives the templates clearer wording and a sharper subject.",
      art: "writing",
    },
    {
      title: "Pick a goal and tone",
      text: "Choose what the post should achieve and how it should sound. You can include emojis or keep every draft plain.",
      art: "card-schedule",
    },
    {
      title: "Review, check the length and copy",
      text: "Compare the six drafts, preview one the way it appears in the Threads feed and check its character count. Edit as needed, then copy it into Threads.",
      art: "visual",
    },
  ],
  featuresTitle: "Drafts built for Threads",
  features: [
    {
      title: "Six directions to compare",
      text: "Each run gives you six Threads post drafts built around your topic, with a hook, supporting lines and a clear call to action.",
      art: "writing",
    },
    {
      title: "Conversational by default",
      text: "Threads rewards posts that read like a person talking, so the drafts open with a hook and invite a reply instead of sounding like an ad.",
      art: "visual",
    },
    {
      title: "The 500-character limit is built in",
      text: "Every draft is checked against Threads' 500-character limit, and longer drafts are shortened to a hook, one body line and the call to action.",
      art: "legal",
    },
  ],
  guide: {
    title: "A practical guide to writing Threads captions",
    intro:
      "A strong Threads post says one clear thing in the first line, keeps the body short and ends with a reason to reply. Use these drafts as a starting point, then add the details only you can supply.",
    sections: [
      {
        title: "What this Threads caption generator does",
        body: (
          <>
            <p>
              Enter a topic, choose a goal and tone, and the generator creates six Threads post drafts with a hook,
              body and call to action. Regenerate changes the template order, while the emoji switch lets you compare
              lighter and plainer versions.
            </p>
            <p>
              The drafts come from fixed writing templates in your browser. The tool does <b>not use AI</b>, upload
              your text or scrape Threads. When a draft is ready, plan it on the calendar with the{" "}
              <Link href="/threads-scheduler">Threads scheduler</Link>.
            </p>
          </>
        ),
      },
      {
        title: "How long can a Threads post be?",
        body: (
          <>
            <p>
              A Threads post can be up to <b>500 characters</b>, including spaces, punctuation, emojis and line breaks.
              That is a maximum, not a target: the first line matters most because it is what people see before they
              decide to read on or reply.
            </p>
            <p>
              Use the{" "}
              <Link href="/tools/threads-character-counter">Threads character counter</Link> to check a post you have
              already written, or the{" "}
              <Link href="/tools/threads-post-preview">Threads post preview</Link> to see how it looks in the feed.
            </p>
          </>
        ),
      },
      {
        title: "Should you use hashtags on Threads?",
        body: (
          <>
            <p>
              Threads allows <b>one topic tag per post</b>. A single relevant tag can help people find the post, but it
              does not replace a clear opening line. Pick the tag that best matches the topic and keep the rest of the
              post readable.
            </p>
            <p>
              Avoid stacking tags the way you might on Instagram. On Threads, a conversational post with one honest
              topic tag usually reads better than a wall of keywords.
            </p>
          </>
        ),
      },
      {
        title: "How many links can a Threads post have?",
        body: (
          <>
            <p>
              A Threads post can include up to <b>5 links</b>. That is plenty for a main link plus a couple of
              references, but more links rarely help. Put the most important link first and say what it is for.
            </p>
            <p>
              If the post is part of a longer idea, split it into numbered posts with the{" "}
              <Link href="/tools/threads-thread-maker">Threads thread maker</Link> and keep each part under the
              500-character limit.
            </p>
          </>
        ),
      },
      {
        title: "How to schedule Threads posts",
        body: (
          <>
            <p>
              Connect Threads with its official login, plan posts on one calendar and publish them automatically with
              Poskoo&apos;s <Link href="/threads-scheduler">Threads scheduler</Link>. You can edit, reschedule or delete
              a post before it goes live.
            </p>
            <p>
              Write the draft here, copy it into the composer, then choose a time when your audience is active. The
              scheduler handles the publishing so you do not have to be online at that moment.
            </p>
          </>
        ),
      },
      {
        title: "Common Threads caption mistakes",
        body: (
          <ul>
            <li>Burying the point below a long warm-up.</li>
            <li>Writing past the 500-character limit, so the ending is cut off.</li>
            <li>Using several hashtags when Threads allows one topic tag.</li>
            <li>Adding more than a few links to a single post.</li>
            <li>Ending without a question or a reason to reply.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Threads caption generator questions",
  faqs: [
    {
      q: "How long can a Threads post be?",
      a: "A Threads post can be up to 500 characters, including spaces, punctuation, emojis and line breaks. This generator checks every draft against that 500-character limit.",
    },
    {
      q: "Should I use hashtags on Threads?",
      a: "Threads allows one topic tag per post. A single relevant tag can help people find the post, but a clear opening line matters more. Avoid stacking tags the way you might on Instagram.",
    },
    {
      q: "How many links can I add to a Threads post?",
      a: "A Threads post can include up to 5 links. Put the most important link first and say what it is for; more links rarely help a post perform.",
    },
    {
      q: "How do I schedule Threads posts?",
      a: "Connect Threads with its official login, plan posts on one calendar and publish them automatically with Poskoo's Threads scheduler. You can edit, reschedule or delete a post before it goes live.",
    },
    {
      q: "Does this Threads caption generator use AI?",
      a: "No. The drafts come from fixed writing templates that run in your browser. Nothing is uploaded, and the tool does not scrape Threads or any other site.",
    },
    {
      q: "Can I preview a Threads post before publishing?",
      a: "Yes. Use the free Threads post preview to see how a draft looks in the feed, and the Threads character counter to check its length before you copy it.",
    },
  ],
  related: [
    "/tools/threads-character-counter",
    "/tools/threads-thread-maker",
    "/tools/threads-post-preview",
    "/tools/threads-post-generator",
    "/tools/best-time-to-post-on-threads",
    "/threads-scheduler",
  ],
  schema: {
    features: [
      "Six Threads post drafts for any topic",
      "Goal and tone selection",
      "Optional emojis",
      "Hooks, bodies and calls to action",
      "Character counts against the 500-character Threads limit",
      "One-click copy with no signup, AI or scraping",
    ],
  },
  cta: {
    title: "Your Threads drafts are ready.",
    mark: "Schedule the posts.",
    text: "Connect Threads with its official login, plan your posts on one calendar and publish them automatically with Poskoo's Threads scheduler.",
  },
};

export const metadata = toolMetadata(config);

export default function ThreadsCaptionGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <CaptionGeneratorTool platform="threads" />
    </ToolPageTemplate>
  );
}
