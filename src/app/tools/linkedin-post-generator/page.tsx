import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import CaptionGeneratorTool from "../instagram-caption-generator/CaptionGeneratorTool";

const config: ToolPageConfig = {
  path: "/tools/linkedin-post-generator",
  name: "LinkedIn post generator",
  crumb: "LinkedIn post generator",
  title: "LinkedIn Post Generator: Free Post Drafts with Hooks",
  description:
    "Free LinkedIn post generator: enter a topic, pick a goal and tone, and copy six post drafts with a hook and call to action. Fits LinkedIn's 3,000 limit.",
  pill: "Free · no signup · no AI or scraping",
  h1: { before: "LinkedIn post generator:", mark: "free post drafts", after: "with hooks" },
  lede: "Generate six LinkedIn post drafts from your topic, goal and tone. Each one has a hook, a short body and a call to action, runs in your browser and is ready to copy.",
  art: "writing",
  artLabel: "A professional writes LinkedIn posts with a hook, call to action and feed preview",
  heroPoints: ["Six post drafts", "3,000-character limit", "Hooks and calls to action"],
  toolTitle: "Generate your LinkedIn posts",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate LinkedIn posts",
  steps: [
    {
      title: "Enter your topic",
      text: "Describe the idea, lesson or product you are posting about. A specific topic gives the post templates a clearer subject to work with.",
      art: "writing",
    },
    {
      title: "Pick a goal and tone",
      text: "Choose what the post should achieve and how it should sound. You can include emojis or keep every draft plain.",
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
      text: "Each run gives you six post options built around your topic, with a hook, supporting lines and a call to action.",
      art: "writing",
    },
    {
      title: "The opening comes first",
      text: "See which hooks fit before the approximate fold and preview the opening people can read before tapping see more.",
      art: "visual",
    },
    {
      title: "Private and repeatable",
      text: "Fixed templates build the posts in your browser. Your topic is not uploaded, and the tool uses no AI or LinkedIn scraping.",
      art: "legal",
    },
  ],
  guide: {
    title: "A practical guide to writing LinkedIn posts",
    intro:
      "A strong LinkedIn post names the idea in the first line, gives readers a clear reason to keep reading and ends with a relevant next step. Keep paragraphs short, add 3–5 relevant hashtags and finish with a question that invites replies. Use these drafts as a starting point, then add the details only you can supply. What will you write about first?",
    sections: [
      {
        title: "What this LinkedIn post generator does",
        body: (
          <>
            <p>
              Enter a topic, choose a goal and tone, and the generator creates six drafts with a hook, body and call to
              action. Regenerate changes the template order, while the emoji switch lets you compare lighter and plainer
              versions.
            </p>
            <p>
              The posts come from fixed writing templates in your browser. The tool does <b>not use AI</b>, upload your
              text or scrape LinkedIn. It also does not check live trends, so review every draft against what actually
              happened in your work. When a draft is ready, plan it on the calendar with the{" "}
              <Link href="/linkedin-scheduler">LinkedIn scheduler</Link>.
            </p>
          </>
        ),
      },
      {
        title: "How long should a LinkedIn post be?",
        body: (
          <>
            <p>
              A LinkedIn post can be up to <b>3,000 characters</b>, including spaces, hashtags, mentions and line breaks.
              That is a maximum, not a target: use enough words to make the point and give readers a next step.
            </p>
            <p>
              Only about the first <b>210 characters</b> show in the feed before <b>…see more</b>. Put the idea or hook
              first and keep it short. The preview uses an approximate fold to help you check the opening; the exact
              cutoff varies by device and layout.
            </p>
          </>
        ),
      },
      {
        title: "How do you write a good LinkedIn hook?",
        body: (
          <>
            <p>
              Start with the specific result, mistake or question your reader cares about. &ldquo;We cut our reporting
              time from two days to two hours&rdquo; gives people a reason to read on; &ldquo;Some thoughts on
              productivity&rdquo; does not.
            </p>
            <p>
              Keep the first line short enough to sit above the see more cut-off, then use the body to explain what
              changed and why. Avoid vague teases that hide the point until the end.
            </p>
          </>
        ),
      },
      {
        title: "Should you put links in LinkedIn posts?",
        body: (
          <>
            <p>
              Links are fine, but many creators put the link in the first comment and ask readers to open it there. That
              keeps the post itself focused on the idea. This generator uses &ldquo;link in the comments&rdquo; wording
              for LinkedIn instead of Instagram&rsquo;s &ldquo;link in bio&rdquo;.
            </p>
            <p>
              Whichever you choose, say what the link leads to and why it is worth the click. A bare &ldquo;link
              below&rdquo; gives readers no reason to follow it.
            </p>
          </>
        ),
      },
      {
        title: "Common LinkedIn post mistakes",
        body: (
          <ul>
            <li>Hiding the real point behind a vague hook such as &ldquo;You need to see this.&rdquo;</li>
            <li>Putting the useful opening after several lines of introductions or hashtags.</li>
            <li>Adding popular tags that have nothing to do with the post.</li>
            <li>Writing a wall of text with no line breaks or clear next step.</li>
            <li>
              Publishing without checking the total length. Use the <Link href="/tools/linkedin-character-counter">LinkedIn
              character counter</Link> to check the 3,000-character limit and preview the opening.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "LinkedIn post generator questions",
  faqs: [
    {
      q: "How long can a LinkedIn post be?",
      a: "A LinkedIn post can be up to 3,000 characters. Spaces, punctuation, line breaks, hashtags and mentions all count. This generator shows each draft's character count against that limit.",
    },
    {
      q: "How many hashtags should I use on LinkedIn?",
      a: "Use 3–5 relevant hashtags per post. Start with a post that names the idea in plain words, then add a small set of tags that describe the topic. Avoid tags that do not describe the post.",
    },
    {
      q: "Does this LinkedIn post generator use AI?",
      a: "No. It combines fixed post templates in your browser using your topic, goal, tone and emoji choice. It does not upload your text, call an AI service or scrape LinkedIn.",
    },
    {
      q: "Can I use Instagram captions on LinkedIn?",
      a: "You can reuse the idea, but adapt the hook and call to action to a professional audience. LinkedIn allows 3,000 characters, and this version uses link in the comments wording instead of Instagram's link in bio.",
    },
    {
      q: "When is the best time to post on LinkedIn?",
      a: "Use Poskoo's free best time to post on LinkedIn finder to get three starting slots for your audience and time zone, then test them and keep what works.",
    },
  ],
  related: [
    "/tools/linkedin-character-counter",
    "/tools/linkedin-text-formatter",
    "/tools/linkedin-hashtag-generator",
    "/tools/linkedin-headline-generator",
    "/tools/linkedin-post-preview",
  ],
  schema: {
    features: [
      "Six LinkedIn post drafts for any topic",
      "Goal and tone selection",
      "Optional emojis",
      "Hooks, bodies and calls to action",
      "Character counts against the 3,000-character LinkedIn limit",
      "Approximate feed-fold preview before see more",
      "One-click copy with no signup, AI or scraping",
    ],
  },
  cta: {
    title: "Your posts are ready.",
    mark: "Schedule them.",
    text: "Connect LinkedIn with its official login, plan your posts on one calendar and publish them automatically with Poskoo's LinkedIn scheduler.",
  },
};

export const metadata = toolMetadata(config);

export default function LinkedInPostGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <CaptionGeneratorTool platform="linkedin" />
    </ToolPageTemplate>
  );
}
