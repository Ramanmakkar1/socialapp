import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import CaptionGeneratorTool from "../instagram-caption-generator/CaptionGeneratorTool";

const config: ToolPageConfig = {
  path: "/tools/linkedin-caption-generator",
  name: "LinkedIn caption generator",
  crumb: "LinkedIn caption generator",
  title: "LinkedIn Caption Generator: Free Post Captions in 1 Click",
  description:
    "Free LinkedIn caption generator: enter your topic, pick a goal and tone, and copy six post captions with a hook and call to action. No signup or AI.",
  pill: "Free · no signup · no AI or scraping",
  h1: { before: "LinkedIn caption generator:", mark: "free post captions", after: "in seconds" },
  lede: "Generate six LinkedIn caption drafts from your topic, goal and tone. Each one has a short hook and a call to action, runs in your browser and is ready to copy.",
  art: "writing",
  artLabel: "A professional writes LinkedIn captions with a hook, call to action and feed preview",
  heroPoints: ["Six caption drafts", "3,000-character limit", "Hook before see more"],
  toolTitle: "Generate your LinkedIn captions",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate LinkedIn captions",
  steps: [
    {
      title: "Enter your topic",
      text: "Describe the post, product or idea you are sharing. A specific topic gives the caption templates a clearer subject to work with.",
      art: "writing",
    },
    {
      title: "Pick a goal and tone",
      text: "Choose what the caption should achieve and how it should sound. You can include emojis or keep every draft plain.",
      art: "card-schedule",
    },
    {
      title: "Review and copy",
      text: "Compare the six drafts, select one for the feed preview and check its length. Edit the idea as needed, then copy it into LinkedIn.",
      art: "visual",
    },
  ],
  featuresTitle: "A useful first draft, ready for your feed",
  features: [
    {
      title: "Six directions to compare",
      text: "Each run gives you six caption options built around your topic, with a hook, supporting lines and a call to action.",
      art: "writing",
    },
    {
      title: "The opening comes first",
      text: "See which hooks fit before the approximate fold and preview the opening people can read before tapping see more.",
      art: "visual",
    },
    {
      title: "Private and repeatable",
      text: "Fixed templates build the captions in your browser. Your topic is not uploaded, and the tool uses no AI or LinkedIn scraping.",
      art: "legal",
    },
  ],
  guide: {
    title: "A practical guide to writing LinkedIn captions",
    intro:
      "A strong LinkedIn caption names the post's topic, gives readers a clear opening and ends with a relevant next step. Use these drafts as a starting point, then add the details only your post can supply.",
    sections: [
      {
        title: "What this LinkedIn caption generator does",
        body: (
          <>
            <p>
              Enter a topic, choose a goal and tone, and the generator creates six drafts with a hook, body and call to
              action. Regenerate changes the template order, while the emoji switch lets you compare lighter and plainer
              versions.
            </p>
            <p>
              The captions come from fixed writing templates in your browser. The tool does <b>not use AI</b>, upload
              your text or scrape LinkedIn. It also does not check live trends, so review every draft against what
              actually happens in your post.
            </p>
          </>
        ),
      },
      {
        title: "How long should a LinkedIn post be?",
        body: (
          <>
            <p>
              A LinkedIn post can be up to <b>3,000 characters</b>, including spaces, hashtags, mentions and line
              breaks. That is a maximum, not a target: short posts with a clear point are easier to read and reply to, so
              use enough words to explain the post and give readers a next step.
            </p>
            <p>
              In the feed, only about the first <b>210 characters</b> show before <b>...see more</b>. Put the topic or
              hook first and keep it short. The preview uses a 210-character fold to help you check the opening; the
              exact cutoff varies by device and layout.
            </p>
          </>
        ),
      },
      {
        title: "How many hashtags should a LinkedIn post use?",
        body: (
          <>
            <p>
              Use a few relevant hashtags, not a long list. Say the topic in plain words first, then add a small set of
              tags that describe the post. If the post is about a beginner sourdough recipe, use the words
              &ldquo;beginner sourdough recipe&rdquo; rather than a vague phrase such as &ldquo;watch this.&rdquo;
            </p>
            <p>
              Hashtags can add more context, but they do not replace a descriptive sentence. Build a small, relevant set
              with the <Link href="/tools/linkedin-hashtag-generator">LinkedIn hashtag generator</Link>, and remove
              anything that does not describe the post.
            </p>
          </>
        ),
      },
      {
        title: "Example LinkedIn caption",
        body: (
          <>
            <p>For a post about three simple Sunday meal-prep ideas, a clear caption could look like this:</p>
            <div className={t.example}>
              <p>Three Sunday meal-prep ideas for busy weekdays ✨</p>
              <p>Prep the ingredients once, then mix and match them for quick lunches all week.</p>
              <p>Save this for Sunday and comment with the lunch you want to prep first.</p>
            </div>
            <p>
              The first line names the subject, the body adds a useful detail and the call to action relates directly to
              the post. Replace the example details with your own before publishing.
            </p>
          </>
        ),
      },
      {
        title: "Common LinkedIn caption mistakes",
        body: (
          <ul>
            <li>Hiding the real topic behind a vague hook such as &ldquo;You need to see this.&rdquo;</li>
            <li>Putting the useful opening after several lines of introductions or hashtags.</li>
            <li>Adding popular tags that have nothing to do with the post.</li>
            <li>
              Publishing without checking the total length or how the opening looks in the feed. Use the{" "}
              <Link href="/tools/linkedin-character-counter">LinkedIn character counter</Link> to check the
              3,000-character limit, then see the opening with the{" "}
              <Link href="/tools/linkedin-post-preview">LinkedIn post preview</Link> and tidy the formatting with the{" "}
              <Link href="/tools/linkedin-text-formatter">LinkedIn text formatter</Link>.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "LinkedIn caption generator questions",
  faqs: [
    {
      q: "How long can a LinkedIn caption be?",
      a: "A LinkedIn post can be up to 3,000 characters. Spaces, punctuation, line breaks, hashtags and mentions all count. This generator shows each draft's character count against that limit.",
    },
    {
      q: "Should LinkedIn captions include hashtags?",
      a: "They can, but hashtags are optional. Start with a caption that names the topic in plain words, then add a few relevant hashtags. Avoid tags that do not describe the post.",
    },
    {
      q: "Does this LinkedIn caption generator use AI?",
      a: "No. It combines fixed caption templates in your browser using your topic, goal, tone and emoji choice. It does not upload your text, call an AI service or scrape LinkedIn.",
    },
    {
      q: "Can I reuse Instagram captions on LinkedIn?",
      a: "You can, but rewrite them first. Instagram captions often rely on hashtag blocks and 'link in bio', which do not fit LinkedIn. This tool swaps those phrases and builds a hook that works before see more.",
    },
  ],
  related: [
    "/tools/linkedin-character-counter",
    "/tools/linkedin-hashtag-generator",
    "/tools/linkedin-post-preview",
    "/tools/linkedin-text-formatter",
    "/tools/best-time-to-post-on-linkedin",
  ],
  schema: {
    features: [
      "Six LinkedIn caption drafts for any topic",
      "Goal and tone selection",
      "Optional emojis",
      "Short hooks and calls to action",
      "Character counts against the 3,000-character LinkedIn limit",
      "Approximate feed-fold preview",
      "One-click copy with no signup, AI or scraping",
    ],
  },
  cta: {
    title: "Your captions are ready.",
    mark: "Schedule the post.",
    text: "Connect LinkedIn with its official login, plan your posts on one calendar and publish them automatically with Poskoo's LinkedIn scheduler.",
  },
};

export const metadata = toolMetadata(config);

export default function LinkedInCaptionGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <CaptionGeneratorTool platform="linkedin" />
    </ToolPageTemplate>
  );
}
