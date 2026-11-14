import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import CaptionGeneratorTool from "../instagram-caption-generator/CaptionGeneratorTool";

const config: ToolPageConfig = {
  path: "/tools/threads-post-generator",
  name: "Threads post generator",
  crumb: "Threads post generator",
  title: "Threads Post Generator: Free Threads Caption Ideas",
  description:
    "Free Threads post generator: enter a topic to get six ready-to-post Threads captions checked against the 500-character limit, all in your browser.",
  pill: "Free · no signup · no AI or scraping",
  h1: { before: "Threads post generator:", mark: "six ready-to-copy posts", after: "for any topic" },
  lede: "A Threads post can be up to 500 characters. Type your topic to get six ready-to-copy Threads posts with a hook and a call to action.",
  art: "writing",
  artLabel: "A creator writes Threads posts with a hook, a call to action and a feed preview",
  heroPoints: ["Six Threads post drafts", "500-character limit", "Hooks and calls to action"],
  toolTitle: "Generate your Threads posts",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate Threads posts",
  steps: [
    {
      title: "Enter your topic",
      text: "Describe the idea, product or question you want to post about. A specific topic gives the templates a clearer subject and a sharper hook.",
      art: "writing",
    },
    {
      title: "Pick a goal and tone",
      text: "Choose what the post should achieve and how it should sound. You can include emojis or keep every draft plain.",
      art: "card-schedule",
    },
    {
      title: "Review, check the length and copy",
      text: "Compare the six drafts, select one for the feed preview and check its character count. Edit as needed, then copy it into Threads.",
      art: "visual",
    },
  ],
  featuresTitle: "Threads posts built for conversation",
  features: [
    {
      title: "Six directions to compare",
      text: "Each run gives you six Threads posts built around your topic, with a hook, supporting lines and a clear call to action.",
      art: "writing",
    },
    {
      title: "A clear reason to reply",
      text: "The drafts make one point in plain words and end with a question or next step, giving readers a natural way to join the conversation.",
      art: "visual",
    },
    {
      title: "The 500-character limit is built in",
      text: "Every draft is checked against the Threads 500-character limit, and longer posts are trimmed to fit before you copy them.",
      art: "legal",
    },
  ],
  guide: {
    title: "A practical guide to writing Threads posts",
    intro:
      "A strong Threads post makes one point, says it in plain words and gives people a reason to reply. Use these drafts as a starting point, then add the details only you can supply.",
    sections: [
      {
        title: "How long can a Threads post be?",
        body: (
          <>
            <p>
              A Threads post can be up to <b>500 characters</b>, including spaces, punctuation and line breaks. Links are
              allowed, and you can add one topic tag to help place the post in the right conversation.
            </p>
            <p>
              Five hundred characters is a maximum, not a target. Lead with the main point and keep only the detail that
              helps the reader. Check a finished draft with the{" "}
              <Link href="/tools/threads-character-counter">Threads character counter</Link> before you publish.
            </p>
          </>
        ),
      },
      {
        title: "How to write a Threads post people reply to",
        body: (
          <>
            <p>
              Start with a specific observation, useful idea or genuine question. Give readers enough context to
              understand your point, then ask something they can answer from their own experience rather than a generic
              prompt for engagement.
            </p>
            <p>
              Keep one idea per post and use short paragraphs that are easy to scan. If the idea needs more room, split
              it into numbered posts with the <Link href="/tools/threads-thread-maker">Threads thread maker</Link> instead
              of squeezing too much into one draft.
            </p>
          </>
        ),
      },
      {
        title: "Do hashtags work on Threads?",
        body: (
          <>
            <p>
              Threads lets you add <b>one topic tag per post</b>, so a long hashtag list is not useful. Choose the single
              tag that best describes the subject, and let the words in the post provide the rest of the context.
            </p>
            <p>
              A relevant topic tag can help people find the conversation, but it does not replace a clear hook or a useful
              point. Skip the tag when none genuinely fits rather than adding an unrelated popular topic.
            </p>
          </>
        ),
      },
      {
        title: "Common Threads post mistakes",
        body: (
          <ul>
            <li>Hiding the subject behind a vague hook that could apply to any post.</li>
            <li>Trying to make several unrelated points in one 500-character post.</li>
            <li>Adding multiple topic tags instead of choosing the one most relevant tag.</li>
            <li>Writing beyond the character limit and losing the call to action.</li>
            <li>Ending without a genuine question or a clear next step for the reader.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Threads post generator questions",
  faqs: [
    {
      q: "How long can a Threads post be?",
      a: "A Threads post can be up to 500 characters, including spaces, punctuation and line breaks. Links are allowed and you can add one topic tag. This generator trims each draft to fit the 500-character limit.",
    },
    {
      q: "Do hashtags work on Threads?",
      a: "Threads allows one topic tag per post rather than a long list of hashtags. Pick the tag that best matches the conversation; a clear, useful post still matters more than the tag.",
    },
    {
      q: "Is this Threads post generator free?",
      a: "Yes. It is free, needs no signup and runs entirely in your browser. Enter a topic, choose a goal and tone, then copy any of the six drafts.",
    },
    {
      q: "Can I schedule a generated Threads post?",
      a: "Yes. Copy your draft into Poskoo's Threads scheduler, connect your account with its official login and choose when to publish.",
      aNode: (
        <>
          Yes. Copy your draft into Poskoo&apos;s <Link href="/threads-scheduler">Threads scheduler</Link>, connect your
          account with its official login and choose when to publish.
        </>
      ),
    },
    {
      q: "When should I post on Threads?",
      a: "Start with times when your audience is likely to be active, then compare replies and adjust. The best time to post on Threads finder suggests three slots for your audience and time zone.",
      aNode: (
        <>
          Start with times when your audience is likely to be active, then compare replies and adjust. The{" "}
          <Link href="/tools/best-time-to-post-on-threads">best time to post on Threads</Link> finder suggests three slots
          for your audience and time zone.
        </>
      ),
    },
  ],
  related: [
    "/tools/threads-character-counter",
    "/tools/threads-thread-maker",
    "/tools/best-time-to-post-on-threads",
    "/threads-scheduler",
  ],
  schema: {
    features: [
      "Six ready-to-post Threads captions for any topic",
      "Goal and tone selection",
      "Optional emojis",
      "Hooks, bodies and calls to action",
      "Character counts against the 500-character Threads limit",
      "One-click copy with no signup, AI or scraping",
    ],
  },
  cta: {
    title: "Your Threads posts are ready.",
    mark: "Schedule the conversation.",
    text: "Connect Threads with its official login, plan your posts on one calendar and publish them automatically with Poskoo's Threads scheduler.",
  },
};

export const metadata = toolMetadata(config);

export default function ThreadsPostGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <CaptionGeneratorTool platform="threads" />
    </ToolPageTemplate>
  );
}
