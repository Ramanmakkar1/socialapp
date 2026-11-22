import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import CaptionGeneratorTool from "../instagram-caption-generator/CaptionGeneratorTool";

const config: ToolPageConfig = {
  path: "/tools/tiktok-caption-generator",
  name: "TikTok caption generator",
  crumb: "TikTok caption generator",
  title: "TikTok Caption Generator: Free Hooks and Captions Online",
  description:
    "Free TikTok caption generator: enter your topic, pick a goal and tone, copy six captions with a short hook and call to action. Under TikTok's 4,000 limit.",
  pill: "Free · no signup · no AI or scraping",
  h1: { before: "TikTok caption generator:", mark: "free captions", after: "with hooks" },
  lede: "Generate six TikTok caption drafts from your topic, goal and tone. Each one has a short hook and a call to action, runs in your browser and is ready to copy.",
  art: "writing",
  artLabel: "A creator writes TikTok captions with a hook, call to action and phone preview",
  heroPoints: ["Six caption drafts", "4,000-character limit", "Hooks and calls to action"],
  toolTitle: "Generate your TikTok captions",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate TikTok captions",
  steps: [
    {
      title: "Enter your topic",
      text: "Describe the video, product or idea you are posting. A specific topic gives the caption templates a clearer subject to work with.",
      art: "writing",
    },
    {
      title: "Pick a goal and tone",
      text: "Choose what the caption should achieve and how it should sound. You can include emojis or keep every draft plain.",
      art: "card-schedule",
    },
    {
      title: "Review and copy",
      text: "Compare the six drafts, select one for the feed preview and check its length. Edit the idea as needed, then copy it into TikTok.",
      art: "visual",
    },
  ],
  featuresTitle: "A useful first draft, ready for your video",
  features: [
    {
      title: "Six directions to compare",
      text: "Each run gives you six caption options built around your topic, with a hook, supporting lines and a call to action.",
      art: "writing",
    },
    {
      title: "The opening comes first",
      text: "See which hooks fit before the approximate fold and preview the opening viewers can read over your video before tapping more.",
      art: "visual",
    },
    {
      title: "Private and repeatable",
      text: "Fixed templates build the captions in your browser. Your topic is not uploaded, and the tool uses no AI or TikTok scraping.",
      art: "legal",
    },
  ],
  guide: {
    title: "A practical guide to writing TikTok captions",
    intro:
      "A strong TikTok caption names the video's topic, gives viewers a clear opening and ends with a relevant next step. Use these drafts as a starting point, then add the details only your video can supply.",
    sections: [
      {
        title: "What this TikTok caption generator does",
        body: (
          <>
            <p>
              Enter a topic, choose a goal and tone, and the generator creates six drafts with a hook, body and call to
              action. Regenerate changes the template order, while the emoji switch lets you compare lighter and plainer
              versions.
            </p>
            <p>
              The captions come from fixed writing templates in your browser. The tool does <b>not use AI</b>, upload
              your text or scrape TikTok. It also does not check live trends, so review every draft against what actually
              happens in your video.
            </p>
          </>
        ),
      },
      {
        title: "How long should a TikTok caption be?",
        body: (
          <>
            <p>
              A TikTok caption can be up to <b>4,000 characters</b>, including spaces, hashtags, mentions and line breaks.
              That is a maximum, not a target: use enough words to explain the video and give viewers a next step.
            </p>
            <p>
              Only the first line or so usually shows over the video before <b>more</b>. Put the topic or hook first and
              keep it short. The preview uses an approximate fold to help you check the opening; the exact cutoff varies
              by device and layout.
            </p>
          </>
        ),
      },
      {
        title: "How does TikTok search read captions?",
        body: (
          <>
            <p>
              Say the topic in plain words. If the video shows a beginner sourdough recipe, use the words
              &ldquo;beginner sourdough recipe&rdquo; rather than a vague phrase such as &ldquo;watch this.&rdquo; Clear
              caption text gives TikTok and viewers useful context about the subject.
            </p>
            <p>
              Hashtags can add more context, but they do not replace a descriptive sentence. Build a small, relevant set
              with the <Link href="/tools/tiktok-hashtag-generator">TikTok hashtag generator</Link>, and remove anything
              that does not describe the video.
            </p>
          </>
        ),
      },
      {
        title: "Example TikTok caption",
        body: (
          <>
            <p>For a video about three simple Sunday meal-prep ideas, a clear caption could look like this:</p>
            <div className={t.example}>
              <p>Three Sunday meal-prep ideas for busy weekdays ✨</p>
              <p>Prep the ingredients once, then mix and match them for quick lunches all week.</p>
              <p>Save this for Sunday and comment with the lunch you want to prep first.</p>
            </div>
            <p>
              The first line names the subject, the body adds a useful detail and the call to action relates directly to
              the video. Replace the example details with your own before posting.
            </p>
          </>
        ),
      },
      {
        title: "Common TikTok caption mistakes",
        body: (
          <ul>
            <li>Hiding the real topic behind a vague hook such as &ldquo;You need to see this.&rdquo;</li>
            <li>Putting the useful opening after several lines of introductions or hashtags.</li>
            <li>Adding popular tags that have nothing to do with the video.</li>
            <li>Promising a comment-to-DM automation that is not available for the TikTok post.</li>
            <li>
              Publishing without checking the total length. Use the <Link href="/tools/tiktok-caption-counter">TikTok
              caption counter</Link> to check the 4,000-character limit and preview the opening.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "TikTok caption generator questions",
  faqs: [
    {
      q: "How long can a TikTok caption be?",
      a: "A TikTok caption can be up to 4,000 characters. Spaces, punctuation, line breaks, hashtags and mentions all count. This generator shows each draft's character count against that limit.",
    },
    {
      q: "Should TikTok captions include hashtags?",
      a: "They can, but hashtags are optional. Start with a caption that names the topic in plain words, then add a small set of relevant hashtags. Avoid tags that do not describe the video.",
    },
    {
      q: "Does this TikTok caption generator use AI?",
      a: "No. It combines fixed caption templates in your browser using your topic, goal, tone and emoji choice. It does not upload your text, call an AI service or scrape TikTok.",
    },
    {
      q: "Can I use Instagram captions on TikTok?",
      a: "You can reuse the idea, but adapt the hook and call to action to the TikTok video. TikTok allows 4,000 characters, and this version omits Instagram's comment-keyword auto-DM option.",
    },
    {
      q: "When is the best time to post my TikTok caption and video?",
      a: "Use the best time to post on TikTok finder to get three starting slots for your audience and time zone, then test them and keep what works.",
      aNode: (
        <>
          Use the <Link href="/tools/best-time-to-post-on-tiktok">best time to post on TikTok</Link> finder to get three
          starting slots for your audience and time zone, then test them and keep what works.
        </>
      ),
    },
  ],
  related: [
    "/tools/social-media-post-generator",
    "/tools/tiktok-caption-counter",
    "/tools/tiktok-hashtag-generator",
    "/tools/best-time-to-post-on-tiktok",
    "/tools/instagram-caption-generator",
  ],
  schema: {
    features: [
      "Six TikTok caption drafts for any topic",
      "Goal and tone selection",
      "Optional emojis",
      "Short hooks and calls to action",
      "Character counts against the 4,000-character TikTok limit",
      "Approximate feed-fold preview",
      "One-click copy with no signup, AI or scraping",
    ],
  },
  cta: {
    title: "Your captions are ready.",
    mark: "Schedule the video.",
    text: "Connect TikTok with its official login, plan your videos on one calendar and publish them automatically with Poskoo's TikTok scheduler.",
  },
};

export const metadata = toolMetadata(config);

export default function TikTokCaptionGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <CaptionGeneratorTool platform="tiktok" />
    </ToolPageTemplate>
  );
}
