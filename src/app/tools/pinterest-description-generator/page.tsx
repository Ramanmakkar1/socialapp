import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import CaptionGeneratorTool from "../instagram-caption-generator/CaptionGeneratorTool";

const config: ToolPageConfig = {
  path: "/tools/pinterest-description-generator",
  name: "Pinterest description generator",
  crumb: "Pinterest description generator",
  title: "Pinterest Description Generator: Free Pin Descriptions",
  description:
    "Free Pinterest description generator: enter your topic, pick a goal and tone, and copy six Pin descriptions under 500 characters. No signup or AI.",
  pill: "Free · no signup · no AI or scraping",
  h1: { before: "Pinterest description generator:", mark: "Pin descriptions", after: "that get saved" },
  lede: "A Pinterest description is the up-to-500-character text under a Pin that helps Pinterest search understand it. This free tool writes six drafts from your topic.",
  art: "writing",
  artLabel: "A creator writes Pinterest Pin descriptions with keywords, a call to action and a feed preview",
  heroPoints: ["Six Pin descriptions", "500-character limit", "Keyword in first 50 characters"],
  toolTitle: "Generate your Pinterest descriptions",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate Pinterest descriptions",
  steps: [
    {
      title: "Enter your topic",
      text: "Describe the Pin, product or idea you are publishing. A specific topic gives the templates clearer keywords and a sharper subject.",
      art: "writing",
    },
    {
      title: "Pick a goal and tone",
      text: "Choose what the Pin should achieve and how it should sound. You can include emojis or keep every description plain.",
      art: "card-schedule",
    },
    {
      title: "Review, check the length and copy",
      text: "Compare the six descriptions, preview one the way it appears in the feed and check its character count. Edit as needed, then copy it into Pinterest.",
      art: "visual",
    },
  ],
  featuresTitle: "Descriptions built for Pinterest search",
  features: [
    {
      title: "Six directions to compare",
      text: "Each run gives you six Pin descriptions built around your topic, with a hook, supporting lines and a clear call to action.",
      art: "writing",
    },
    {
      title: "Keywords without stuffing",
      text: "The drafts describe what the Pin is about in plain words, so useful terms can sit naturally in the first lines instead of a tag pile.",
      art: "visual",
    },
    {
      title: "The 500-character limit is built in",
      text: "Every description is checked against Pinterest's 500-character description limit, and longer drafts are trimmed to fit.",
      art: "legal",
    },
  ],
  guide: {
    title: "A practical guide to writing Pinterest descriptions",
    intro:
      "A strong Pinterest description says what the Pin is about in the first sentence, uses the words people search for and ends with a reason to save or click. Use these drafts as a starting point, then add the details only you can supply.",
    sections: [
      {
        title: "What this Pinterest description generator does",
        body: (
          <>
            <p>
              Enter a topic, choose a goal and tone, and the generator creates six descriptions with a hook, body and
              call to action. Regenerate changes the template order, while the emoji switch lets you compare lighter and
              plainer versions.
            </p>
            <p>
              The descriptions come from fixed writing templates in your browser. The tool does <b>not use AI</b>,
              upload your text or scrape Pinterest. When a description is ready, plan the Pin on the calendar with the{" "}
              <Link href="/pinterest-scheduler">Pinterest scheduler</Link>.
            </p>
          </>
        ),
      },
      {
        title: "How long should a Pinterest description be?",
        body: (
          <>
            <p>
              A Pinterest Pin description can be up to <b>500 characters</b>, including spaces, punctuation, hashtags and
              line breaks. That is a maximum, not a target: the first sentence matters most because it tells Pinterest
              and readers what the Pin is about.
            </p>
            <p>
              Only the opening of a description shows in the feed before the Pin is opened. Put the main keyword and the
              point first, then add detail. Use the{" "}
              <Link href="/tools/pinterest-character-counter">Pinterest character counter</Link> to check a description
              you have already written.
            </p>
          </>
        ),
      },
      {
        title: "Where should keywords go in a Pin description?",
        body: (
          <>
            <p>
              Put the clearest keyword in the Pin title and use the description to explain the idea in natural language.
              Mention the topic once or twice in the first two sentences, then add related words that describe the
              result, audience or use case.
            </p>
            <p>
              Avoid repeating the same phrase for the sake of length. Pinterest reads the whole Pin, including the
              destination page, so a description that genuinely helps a reader is the safer long-term bet.
            </p>
          </>
        ),
      },
      {
        title: "Do hashtags help Pinterest descriptions?",
        body: (
          <>
            <p>
              Hashtags are optional on Pinterest. A small number of relevant tags can help categorise a Pin, but they do
              not replace a clear description. Keep the description readable first, then add a few tags if they fit
              naturally.
            </p>
            <p>
              Need ideas? Try the free <Link href="/tools/pinterest-hashtag-generator">Pinterest hashtag generator</Link>{" "}
              and choose tags that match the Pin&apos;s topic rather than popular but unrelated words.
            </p>
          </>
        ),
      },
      {
        title: "Common Pinterest description mistakes",
        body: (
          <ul>
            <li>Using a vague first sentence that does not say what the Pin is about.</li>
            <li>Filling the description with hashtags instead of useful words.</li>
            <li>Repeating the same keyword until the text reads like spam.</li>
            <li>Writing past the 500-character limit, so the ending is cut off.</li>
            <li>Publishing without a destination link or a reason to click.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Pinterest description generator questions",
  faqs: [
    {
      q: "How long can a Pinterest description be?",
      a: "A Pinterest Pin description can be up to 500 characters, including spaces, punctuation, hashtags and line breaks. This generator checks every draft against that 500-character limit.",
    },
    {
      q: "Do hashtags matter on Pinterest?",
      a: "They can help, but they are optional. Write a clear description first and add a few relevant hashtags only if they fit naturally; the Pinterest hashtag generator can build a small set for your niche. Unrelated tags do not make a Pin more useful.",
    },
    {
      q: "Do Pinterest descriptions help SEO?",
      a: "Yes. Pinterest search reads the Pin title and description to understand the topic, so describing the Pin in plain words with your main keyword early gives it a better chance of appearing in relevant searches. The description also helps people decide to save or click.",
    },
    {
      q: "What is the difference between a Pin title and a description?",
      a: "A Pin title is up to 100 characters and acts as the headline. The description is up to 500 characters of supporting text under it, where you explain the idea and add a call to action.",
    },
    {
      q: "Where do I add keywords on a Pin?",
      a: "Put the main keyword in the title, then use the first sentence of the description to say what the Pin is about in plain words. Related terms can follow naturally in the body.",
    },
    {
      q: "Can I schedule Pins with Poskoo?",
      a: "Yes. Connect Pinterest with its official login, plan Pins on one calendar and publish them automatically with Poskoo's Pinterest scheduler.",
    },
  ],
  related: [
    "/tools/social-media-post-generator",
    "/tools/pinterest-character-counter",
    "/tools/pinterest-pin-size-checker",
    "/tools/pinterest-hashtag-generator",
    "/tools/best-time-to-post-on-pinterest",
    "/pinterest-scheduler",
  ],
  schema: {
    features: [
      "Six Pinterest Pin descriptions for any topic",
      "Goal and tone selection",
      "Optional emojis",
      "Hooks, bodies and calls to action",
      "Character counts against the 500-character Pinterest limit",
      "One-click copy with no signup, AI or scraping",
    ],
  },
  cta: {
    title: "Your descriptions are ready.",
    mark: "Schedule the Pins.",
    text: "Connect Pinterest with its official login, plan your Pins on one calendar and publish them automatically with Poskoo's Pinterest scheduler.",
  },
};

export const metadata = toolMetadata(config);

export default function PinterestDescriptionGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <CaptionGeneratorTool platform="pinterest" />
    </ToolPageTemplate>
  );
}
