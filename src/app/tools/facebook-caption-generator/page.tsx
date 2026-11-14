import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import CaptionGeneratorTool from "../instagram-caption-generator/CaptionGeneratorTool";

const config: ToolPageConfig = {
  path: "/tools/facebook-caption-generator",
  name: "Facebook caption generator",
  crumb: "Facebook caption generator",
  title: "Facebook Caption Generator: Free Post Captions Online",
  description:
    "Free Facebook caption generator: enter your topic, pick a goal and tone and copy six post captions with a hook and call to action. No signup or login.",
  pill: "Free · no signup · no AI or scraping",
  h1: { before: "Facebook caption generator:", mark: "free post captions", after: "in seconds" },
  lede: "Generate six Facebook caption drafts from your topic, goal and tone. Each one has a short hook and a call to action, runs in your browser and is ready to copy.",
  art: "writing",
  artLabel: "A Page owner writes Facebook captions with a hook, call to action and feed preview",
  heroPoints: ["Six caption drafts", "63,206-character limit", "Hooks and calls to action"],
  toolTitle: "Generate your Facebook captions",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate Facebook captions",
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
      text: "Compare the six drafts, select one for the feed preview and check its length. Edit the idea as needed, then copy it into Facebook.",
      art: "visual",
    },
  ],
  featuresTitle: "A useful first draft, ready for your Page",
  features: [
    {
      title: "Six directions to compare",
      text: "Each run gives you six caption options built around your topic, with a hook, supporting lines and a call to action.",
      art: "writing",
    },
    {
      title: "The opening comes first",
      text: "See which hooks fit before the approximate fold and preview the opening people can read before tapping See more.",
      art: "visual",
    },
    {
      title: "Private and repeatable",
      text: "Fixed templates build the captions in your browser. Your topic is not uploaded, and the tool uses no AI or Facebook scraping.",
      art: "legal",
    },
  ],
  guide: {
    title: "A practical guide to writing Facebook captions",
    intro:
      "A strong Facebook caption names the post's topic, gives readers a clear opening and ends with a relevant next step. Use these drafts as a starting point, then add the details only your post can supply.",
    sections: [
      {
        title: "What this Facebook caption generator does",
        body: (
          <>
            <p>
              Enter a topic, choose a goal and tone, and the generator creates six drafts with a hook, body and call to
              action. Regenerate changes the template order, while the emoji switch lets you compare lighter and plainer
              versions.
            </p>
            <p>
              The captions come from fixed writing templates in your browser. The tool does <b>not use AI</b>, upload
              your text or scrape Facebook. It also does not check live trends, so review every draft against what
              actually happens in your post.
            </p>
          </>
        ),
      },
      {
        title: "How long should a Facebook caption be?",
        body: (
          <>
            <p>
              A Facebook post can be up to <b>63,206 characters</b>, including spaces, hashtags, mentions and line
              breaks. That is a maximum, not a target: short posts with a question are easier to read and reply to, so
              use enough words to explain the post and give readers a next step.
            </p>
            <p>
              On mobile, only about the first <b>125 characters</b> show before <b>See more</b>. Put the topic or hook
              first and keep it short. The preview uses a 125-character fold to help you check the opening; the exact
              cutoff varies by device and layout.
            </p>
          </>
        ),
      },
      {
        title: "How does Facebook search read captions?",
        body: (
          <>
            <p>
              Say the topic in plain words. If the post is about a beginner sourdough recipe, use the words
              &ldquo;beginner sourdough recipe&rdquo; rather than a vague phrase such as &ldquo;watch this.&rdquo; Clear
              caption text gives Facebook and readers useful context about the subject.
            </p>
            <p>
              Hashtags can add more context, but they do not replace a descriptive sentence. Use <b>1-3 hashtags</b> that
              fit the post. Build a small, relevant set with the{" "}
              <Link href="/tools/facebook-hashtag-generator">Facebook hashtag generator</Link>, and remove anything that
              does not describe the post.
            </p>
          </>
        ),
      },
      {
        title: "Example Facebook caption",
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
        title: "Common Facebook caption mistakes",
        body: (
          <ul>
            <li>Hiding the real topic behind a vague hook such as &ldquo;You need to see this.&rdquo;</li>
            <li>Putting the useful opening after several lines of introductions or hashtags.</li>
            <li>Adding popular tags that have nothing to do with the post.</li>
            <li>Publishing without checking the total length or how the opening looks in the feed.</li>
            <li>
              Publishing without checking the total length. Use the <Link href="/tools/facebook-character-counter">Facebook
              character counter</Link> to check the 63,206-character limit, and build a relevant tag set with the{" "}
              <Link href="/tools/facebook-hashtag-generator">Facebook hashtag generator</Link>.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Facebook caption generator questions",
  faqs: [
    {
      q: "How long can a Facebook caption be?",
      a: "A Facebook post can be up to 63,206 characters. Spaces, punctuation, line breaks, hashtags and mentions all count. This generator shows each draft's character count against that limit.",
    },
    {
      q: "Should Facebook captions include hashtags?",
      a: "They can, but hashtags are optional. Start with a caption that names the topic in plain words, then add a small set of relevant hashtags. Avoid tags that do not describe the post.",
    },
    {
      q: "Does this Facebook caption generator use AI?",
      a: "No. It combines fixed caption templates in your browser using your topic, goal, tone and emoji choice. It does not upload your text, call an AI service or scrape Facebook.",
    },
    {
      q: "Is there a Facebook post generator too?",
      a: "Yes. This tool writes full Facebook post captions: give it a topic, goal and tone and it creates six drafts with a hook, body and call to action, ready to copy or edit before you publish.",
    },
    {
      q: "When is the best time to post on Facebook?",
      a: "Post when your audience is most active, then test a few slots and keep what works. Use the best time to post on Facebook finder for three starting slots for your time zone.",
    },
  ],
  related: [
    "/tools/facebook-character-counter",
    "/tools/facebook-post-preview",
    "/tools/facebook-hashtag-generator",
    "/tools/best-time-to-post-on-facebook",
    "/tools/facebook-cover-photo-size-checker",
  ],
  schema: {
    features: [
      "Six Facebook caption drafts for any topic",
      "Goal and tone selection",
      "Optional emojis",
      "Short hooks and calls to action",
      "Character counts against the 63,206-character Facebook limit",
      "Approximate feed-fold preview",
      "One-click copy with no signup, AI or scraping",
    ],
  },
  cta: {
    title: "Your captions are ready.",
    mark: "Schedule the post.",
    text: "Connect your Facebook Page with its official login, plan your posts on one calendar and publish them automatically with Poskoo's Facebook scheduler.",
  },
};

export const metadata = toolMetadata(config);

export default function FacebookCaptionGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <CaptionGeneratorTool platform="facebook" />
    </ToolPageTemplate>
  );
}
