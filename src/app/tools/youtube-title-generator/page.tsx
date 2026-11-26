import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import YouTubeTitleGenerator from "./YouTubeTitleGenerator";

const config: ToolPageConfig = {
  path: "/tools/youtube-title-generator",
  name: "YouTube title generator",
  crumb: "YouTube title generator",
  title: "YouTube Title Generator: Free Video Title Ideas 2026",
  description:
    "Free YouTube title generator: enter your video topic to get how-to, list, question and beginner title ideas, with a 100-character and search cut-off check.",
  pill: "Free · runs in your browser · no AI",
  h1: { mark: "YouTube title generator", after: "for titles that fit" },
  lede: "A YouTube title can be up to 100 characters, but only about the first 70 show in search, so put the main keyword first. Enter your video topic to get ready-to-copy title ideas in six styles, each checked against both limits.",
  art: "writing",
  artLabel: "A creator drafts YouTube video titles beside a character meter and a search result preview",
  heroPoints: ["6 title styles", "100-character limit check", "70-character search warning"],
  toolTitle: "Generate your YouTube titles",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate YouTube titles",
  steps: [
    {
      title: "Enter your video topic",
      text: "Type the main subject of your video, such as home workouts or sourdough. The title ideas update as you type, using a fixed set of templates.",
      art: "writing",
    },
    {
      title: "Pick a title style",
      text: "Leave All selected to compare every style, or choose How-to, List, Question, Beginner, Mistakes or Vs / review to focus on one angle.",
      art: "visual",
    },
    {
      title: "Check the length and copy",
      text: "Each card shows its character count and flags titles over 70 or 100 characters. Copy the one that fits, then paste it into YouTube Studio.",
      art: "writing",
    },
  ],
  featuresTitle: "Title ideas that respect YouTube's limits",
  features: [
    {
      title: "Six proven angles",
      text: "How-to, list, question, beginner, mistakes and vs / review templates cover tutorials, explainers, comparisons and opinion videos.",
      art: "writing",
    },
    {
      title: "The 70 and 100 checks",
      text: "Every title shows its character count, with a warning when it may be cut off in search and a clear flag when it passes YouTube's 100-character limit.",
      art: "analytics",
    },
    {
      title: "Private and repeatable",
      text: "Titles come from fixed templates in your browser. No AI is called, nothing is uploaded, and the same topic always gives the same list.",
      art: "visual",
    },
  ],
  guide: {
    title: "How to write a YouTube title that fits search",
    intro:
      "A good title tells viewers what the video is and gives search a clear keyword to match. Use the generated ideas as a starting point, then edit them to sound like your channel.",
    sections: [
      {
        title: "How long should a YouTube title be?",
        body: (
          <p>
            YouTube allows up to <b>100 characters</b> in a title. Search results and many mobile views show only about
            the first <b>70 characters</b>, so treat 70 as your practical target and keep the most important words at the
            front. Any title over 100 characters is rejected by YouTube. Check a finished title with the{" "}
            <Link href="/tools/youtube-title-counter">free YouTube title counter</Link> before you publish. Need a topic
            first? Try the <Link href="/tools/youtube-video-ideas-generator">YouTube video ideas generator</Link>.
          </p>
        ),
      },
      {
        title: "Where should the keyword go?",
        body: (
          <p>
            Put the main keyword or topic in the first few words, because that is the part viewers and search see before
            any cut-off. A title like &ldquo;Home Workouts for Beginners: Full Guide&rdquo; leads with the topic, while
            &ldquo;The Full Guide to Home Workouts for Beginners&rdquo; buries it. Use natural wording, not a list of
            keywords. When the title is set, build supporting tags with the{" "}
            <Link href="/tools/youtube-tag-generator">free YouTube tag generator</Link>.
          </p>
        ),
      },
      {
        title: "Should titles match the thumbnail?",
        body: (
          <p>
            Yes. The title and thumbnail are seen together, so they should tell one clear story rather than repeat each
            other word for word. Let the thumbnail carry the visual hook and use the title for the specific promise. A
            mismatch gets clicks but loses viewers in the first seconds, which hurts the video. Once the title and{" "}
            <Link href="/tools/youtube-thumbnail-size-checker">thumbnail</Link> are ready, queue the upload with the{" "}
            <Link href="/youtube-scheduler">YouTube scheduler</Link>.
          </p>
        ),
      },
    ],
  },
  faqTitle: "YouTube title generator questions",
  faqs: [
    {
      q: "Is this YouTube title generator free?",
      a: "Yes. The tool runs entirely in your browser: type a topic, pick a style and copy a title. Nothing is uploaded, no account is needed and there is no AI call behind it.",
    },
    {
      q: "How many title ideas does it generate?",
      a: "Five templates for each of six styles, so up to 30 title ideas per topic when All is selected. Selecting one style shows its five titles.",
    },
    {
      q: "What happens if my title is too long?",
      a: "Titles over 70 characters get a 'may be cut off in search' warning, and titles over 100 characters are marked 'too long'. YouTube rejects titles over 100 characters, so shorten those before publishing.",
    },
    {
      q: "Does the tool use AI?",
      a: "No. It fills a fixed set of title templates with your topic, so the results are deterministic and no data leaves your browser.",
    },
  ],
  related: [
    "/tools/youtube-title-counter",
    "/tools/youtube-video-ideas-generator",
    "/tools/youtube-tag-generator",
    "/tools/youtube-description-generator",
    "/tools/best-time-to-post-on-youtube",
  ],
  schema: {
    features: [
      "Six YouTube title styles: how-to, list, question, beginner, mistakes and vs / review",
      "Up to 30 deterministic title ideas from one topic",
      "Character count on every title",
      "Warnings for titles over 70 characters and errors over 100 characters",
      "Copy one title or all titles with no topic upload",
    ],
  },
  cta: {
    title: "Your title is ready.",
    mark: "Schedule the video.",
    text: "Connect YouTube through Google's official sign-in, add your title and thumbnail, and publish at the time you choose with Poskoo.",
  },
};

export const metadata = toolMetadata(config);

export default function YouTubeTitleGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <YouTubeTitleGenerator />
    </ToolPageTemplate>
  );
}
