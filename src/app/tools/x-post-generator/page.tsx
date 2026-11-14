import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import CaptionGeneratorTool from "../instagram-caption-generator/CaptionGeneratorTool";

const config: ToolPageConfig = {
  path: "/tools/x-post-generator",
  name: "X post generator",
  crumb: "X post generator",
  title: "X Post Generator: Free 280-Character Post Drafts to Copy",
  description:
    "Free X post generator: enter a topic, choose a goal and tone, and copy six post drafts trimmed to X's 280-character limit, all in your browser.",
  pill: "Free · no signup · no AI or scraping",
  h1: { before: "X post generator:", mark: "six drafts", after: "under 280 characters" },
  lede: "An X (Twitter) post is limited to 280 characters. Type your topic, choose a goal and tone, and get six ready-to-copy drafts trimmed to fit that limit.",
  art: "writing",
  artLabel: "A creator writes short X posts with a hook, a call to action and a 280-character counter",
  heroPoints: ["Six post drafts", "280-character limit", "Hook and call to action"],
  toolTitle: "Generate your X posts",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate X posts",
  steps: [
    {
      title: "Enter your topic",
      text: "Describe what the post is about, for example a launch, a lesson or a quick opinion. A specific topic gives the templates a sharper hook.",
      art: "writing",
    },
    {
      title: "Pick a goal and tone",
      text: "Choose whether the post should engage, sell, announce, educate or show behind the scenes, then pick a tone that fits your account.",
      art: "card-schedule",
    },
    {
      title: "Review the limit and copy",
      text: "Compare the six drafts, check each against the 280-character limit and copy the one you like into X or your scheduler.",
      art: "visual",
    },
  ],
  featuresTitle: "Short posts with a clear point",
  features: [
    {
      title: "Fit to 280 characters",
      text: "Long templates are trimmed on a word boundary and marked with an ellipsis, so every draft stays inside X's 280-character limit.",
      art: "writing",
    },
    {
      title: "Six directions to compare",
      text: "Each run gives you six options built around your topic, with a hook, supporting lines and a call to action.",
      art: "visual",
    },
    {
      title: "Private and repeatable",
      text: "Fixed templates build the posts in your browser. Your topic is not uploaded, and the tool uses no AI or platform scraping.",
      art: "legal",
    },
  ],
  guide: {
    title: "A practical guide to writing X posts",
    intro:
      "X gives you 280 characters per post. That limit forces a clear point, a short hook and a reason to reply or click. Use these drafts as a starting point, then rewrite them in your own voice.",
    sections: [
      {
        title: "How long can an X post be?",
        body: (
          <>
            <p>
              An X post can be up to <b>280 characters</b>, including spaces, punctuation, links and line breaks. Links
              may be shortened in the timeline, but the text you write still counts against the limit.
            </p>
            <p>
              Longer ideas can go in a thread. Use the free{" "}
              <Link href="/tools/x-thread-maker">X thread maker</Link> to split one idea into connected posts, or the{" "}
              <Link href="/tools/x-character-counter">X character counter</Link> to check text you have already written.
            </p>
          </>
        ),
      },
      {
        title: "What makes an X post get read?",
        body: (
          <>
            <p>
              Put the point in the first line. A short, specific hook works better than a long introduction, because
              readers decide in a second whether to stop scrolling. One idea per post beats three half-made points.
            </p>
            <p>
              End with a clear next step: a question, a repost request or a link. The drafts on this page follow that
              hook, body and call-to-action structure.
            </p>
          </>
        ),
      },
      {
        title: "Common X post mistakes",
        body: (
          <ul>
            <li>Burying the point under context nobody needs.</li>
            <li>Using all 280 characters when 120 would be clearer.</li>
            <li>Posting the same caption you used on Instagram or LinkedIn.</li>
            <li>Adding many hashtags; one or two relevant ones is usually enough.</li>
            <li>Ending without a reason to reply, repost or click.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "X post generator questions",
  faqs: [
    {
      q: "Is the X post generator free?",
      a: "Yes. It is free, needs no signup and runs entirely in your browser. Generate as many drafts as you like, then copy the one that fits.",
    },
    {
      q: "Does it use AI?",
      a: "No. It combines fixed post templates in your browser using your topic, goal, tone and emoji choice. It does not upload your text, call an AI service or scrape any social platform.",
    },
    {
      q: "How long can an X post be?",
      a: "An X post can be up to 280 characters, including spaces, punctuation and links. This generator trims longer drafts to that limit and shows a character count on every card.",
    },
    {
      q: "Can I schedule X posts with Poskoo?",
      a: "Yes. Copy a draft into Poskoo's scheduler, connect your X account with its official login and plan the post on your calendar.",
    },
  ],
  related: [
    "/tools/social-media-post-generator",
    "/tools/x-character-counter",
    "/tools/x-thread-maker",
    "/tools/x-hashtag-generator",
    "/tools/best-time-to-post-on-x",
  ],
  schema: {
    features: [
      "Six X post drafts for any topic",
      "Drafts trimmed to the 280-character limit",
      "Goal and tone selection",
      "Optional emojis",
      "Hooks, bodies and calls to action",
      "Character counts against the X limit",
      "One-click copy with no signup, AI or scraping",
    ],
  },
  cta: {
    title: "Your posts are ready.",
    mark: "Schedule them.",
    text: "Connect your accounts with their official login, plan every post on one calendar and publish automatically with Poskoo's social media scheduler.",
  },
};

export const metadata = toolMetadata(config);

export default function XPostGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <CaptionGeneratorTool platform="x" />
    </ToolPageTemplate>
  );
}
