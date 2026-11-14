import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import CaptionGeneratorTool from "../instagram-caption-generator/CaptionGeneratorTool";

const config: ToolPageConfig = {
  path: "/tools/threads-post-generator",
  name: "Threads post generator",
  crumb: "Threads post generator",
  title: "Threads Post Generator: Free Drafts Under 500 Characters",
  description:
    "Free Threads post generator: enter your topic, pick a goal and tone, and copy six drafts with a hook and a question, each under the 500-character limit.",
  pill: "Free · no signup · no AI or scraping",
  h1: { before: "Threads post generator:", mark: "free drafts", after: "under 500 characters" },
  lede: "Generate six Threads post drafts from your topic, goal and tone. Each one has a hook and a conversation-starting question, runs in your browser and is ready to copy.",
  art: "writing",
  artLabel: "A creator writes a Threads post with a hook, a question and a phone preview",
  heroPoints: ["Six post drafts", "500-character limit", "Hooks and questions"],
  toolTitle: "Generate your Threads posts",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate Threads posts",
  steps: [
    {
      title: "Enter your topic",
      text: "Describe the idea, product or question you want to post about. A specific topic gives the templates a clearer subject to work with.",
      art: "writing",
    },
    {
      title: "Pick a goal and tone",
      text: "Choose what the post should achieve and how it should sound. You can include emojis or keep every draft plain.",
      art: "card-schedule",
    },
    {
      title: "Review and copy",
      text: "Compare the six drafts, select one for the feed preview and check its length. Edit the idea as needed, then copy it into Threads.",
      art: "visual",
    },
  ],
  featuresTitle: "A useful first draft, ready for Threads",
  features: [
    {
      title: "Six directions to compare",
      text: "Each run gives you six post options built around your topic, with a hook, supporting lines and a call to action.",
      art: "writing",
    },
    {
      title: "Built for conversation",
      text: "Threads rewards posts that start a discussion. The drafts end with a question or a clear next step to invite replies.",
      art: "visual",
    },
    {
      title: "Private and repeatable",
      text: "Fixed templates build the posts in your browser. Your topic is not uploaded, and the tool uses no AI or Threads scraping.",
      art: "legal",
    },
  ],
  guide: {
    title: "A practical guide to writing Threads posts",
    intro:
      "A strong Threads post makes one point, says it in plain words and gives people a reason to reply. Use these drafts as a starting point, then add the details only your post can supply.",
    sections: [
      {
        title: "What this Threads post generator does",
        body: (
          <>
            <p>
              Enter a topic, choose a goal and tone, and the generator creates six drafts with a hook, body and call to
              action. Regenerate changes the template order, while the emoji switch lets you compare lighter and plainer
              versions.
            </p>
            <p>
              The posts come from fixed writing templates in your browser. The tool does <b>not use AI</b>, upload your
              text or scrape Threads. It also does not check live trends, so review every draft against what you actually
              want to say.
            </p>
          </>
        ),
      },
      {
        title: "How long can a Threads post be?",
        body: (
          <>
            <p>
              A Threads post can be up to <b>500 characters</b>, including spaces, line breaks, links and topic tags. That
              is a maximum, not a target: use enough words to make the point and invite a reply.
            </p>
            <p>
              Threads also allows up to <b>5 links</b> in a post. Keep the most important link near the top, and check the
              total length with the <Link href="/tools/threads-character-counter">Threads character counter</Link> before
              you publish.
            </p>
          </>
        ),
      },
      {
        title: "How do topic tags work on Threads?",
        body: (
          <>
            <p>
              Threads uses a single <b>topic tag</b> per post rather than a long hashtag list. Pick the one tag that best
              describes the conversation, and let the post text do the rest.
            </p>
            <p>
              A clear question often works better than extra tags. Ask something people can answer from their own
              experience, then reply to the first few comments to keep the thread moving.
            </p>
          </>
        ),
      },
      {
        title: "Example Threads post",
        body: (
          <>
            <p>For a post about three simple Sunday meal-prep ideas, a clear draft could look like this:</p>
            <div className={t.example}>
              <p>Three Sunday meal-prep ideas for busy weekdays ✨</p>
              <p>Prep the ingredients once, then mix and match them for quick lunches all week.</p>
              <p>Which one would you actually make? Tell me below and I&apos;ll share the full list.</p>
            </div>
            <p>
              The first line names the subject, the body adds a useful detail and the question invites replies. Replace
              the example details with your own before posting.
            </p>
          </>
        ),
      },
      {
        title: "Common Threads post mistakes",
        body: (
          <ul>
            <li>Hiding the real topic behind a vague hook such as &ldquo;You need to see this.&rdquo;</li>
            <li>Packing in several topic tags when Threads expects one per post.</li>
            <li>Adding more than the 5 links a post allows.</li>
            <li>Ending without a question or a clear next step.</li>
            <li>
              Publishing without checking the total length. Use the{" "}
              <Link href="/tools/threads-post-preview">Threads post preview</Link> to see how the post looks on mobile.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Threads post generator questions",
  faqs: [
    {
      q: "How long can a Threads post be?",
      a: "A Threads post can be up to 500 characters. Spaces, punctuation, line breaks, links and topic tags all count. This generator shows each draft's character count against that limit.",
    },
    {
      q: "Can I use hashtags on Threads?",
      a: "Threads uses one topic tag per post rather than a long hashtag list. Pick the single tag that best describes the conversation and keep the post text clear.",
    },
    {
      q: "Is the Threads post generator free?",
      a: "Yes. It is free, needs no signup and runs entirely in your browser. Generate as many drafts as you like, then copy the one that fits.",
    },
    {
      q: "Can I schedule Threads posts?",
      a: "Yes. Copy a draft into Poskoo's Threads scheduler, connect your account with its official login and plan the post on your calendar.",
      aNode: (
        <>
          Yes. Copy a draft into Poskoo&apos;s{" "}
          <Link href="/threads-scheduler">Threads scheduler</Link>, connect your account with its official login and plan
          the post on your calendar.
        </>
      ),
    },
    {
      q: "When is the best time to post on Threads?",
      a: "Use the best time to post on Threads finder to get three starting slots for your audience and time zone, then test them and keep what works.",
      aNode: (
        <>
          Use the{" "}
          <Link href="/tools/best-time-to-post-on-threads">best time to post on Threads</Link> finder to get three
          starting slots for your audience and time zone, then test them and keep what works.
        </>
      ),
    },
  ],
  related: [
    "/tools/social-media-post-generator",
    "/tools/threads-character-counter",
    "/tools/threads-post-preview",
    "/tools/threads-bio-generator",
    "/tools/best-time-to-post-on-threads",
  ],
  schema: {
    features: [
      "Six Threads post drafts for any topic",
      "Goal and tone selection",
      "Optional emojis",
      "Hooks and conversation-starting questions",
      "Character counts against the 500-character Threads limit",
      "Approximate feed preview",
      "One-click copy with no signup, AI or scraping",
    ],
  },
  cta: {
    title: "Your posts are ready.",
    mark: "Schedule them.",
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
