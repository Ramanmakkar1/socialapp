import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import YouTubeDescriptionGenerator from "./YouTubeDescriptionGenerator";

const config: ToolPageConfig = {
  path: "/tools/youtube-description-generator",
  name: "YouTube description generator",
  crumb: "YouTube description generator",
  title: "YouTube Description Generator: Free Template Builder",
  description:
    "Free YouTube description generator: build a hook, summary, chapters, links and hashtags into one description within the 5,000-character limit, then copy.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "YouTube description generator", after: "within the 5,000-character limit" },
  lede: "A YouTube description can be up to 5,000 characters, but only the first line or two show before “Show more”, so lead with what the video delivers. Fill in the blocks below to build a full description you can paste into YouTube Studio.",
  art: "writing",
  artLabel: "A creator assembles a YouTube description from hook, summary, chapters and hashtag blocks",
  heroPoints: ["5,000-character limit", "Chapters and hashtag checks", "No signup"],
  toolTitle: "Build your YouTube description",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate a YouTube description",
  steps: [
    {
      title: "Enter your video details",
      text: "Add the title or topic and a short summary of what viewers learn. The first-line hook is built from these and kept under 150 characters.",
      art: "writing",
    },
    {
      title: "Add optional blocks",
      text: "Add chapters as “mm:ss Title” lines, links as “Label - URL” lines, a call to action and up to 3 hashtags. Empty blocks are left out.",
      art: "hashtag",
    },
    {
      title: "Check the limits and copy",
      text: "Watch the total stay under 5,000 characters and the first line under 150, then copy the finished description into YouTube Studio.",
      art: "visual",
    },
  ],
  featuresTitle: "A complete description without crossing YouTube's limits",
  features: [
    {
      title: "A first-line hook that fits",
      text: "The hook is built from your title and summary and kept under 150 characters, because that is the part shown above “Show more” in search and under the video.",
      art: "writing",
    },
    {
      title: "Chapters that YouTube accepts",
      text: "Chapter lines are kept only when they match “mm:ss Title”, and a warning appears if the first timestamp is not 0:00 or you have fewer than 3 chapters.",
      art: "analytics",
    },
    {
      title: "Links, CTA and hashtags in order",
      text: "Links, your call to action and up to 3 lowercased hashtags are added in a clean order, with empty sections left out of the final text.",
      art: "hashtag",
    },
  ],
  guide: {
    title: "A practical guide to YouTube descriptions",
    intro:
      "The description is the second most important text field on a video after the title. Lead with the payoff, then use the rest for chapters, links and context.",
    sections: [
      {
        title: "What should a YouTube description include?",
        body: (
          <p>
            Start with a first line that says what the video delivers, because only the first line or two show before “Show more”. Then add a short
            summary, chapters for longer videos, links to the things you mention, a call to action and a few hashtags. Keep the total under 5,000
            characters. You can check a title&apos;s length with the <Link href="/tools/youtube-title-counter">YouTube title and description counter</Link> and
            build tags with the <Link href="/tools/youtube-tag-generator">YouTube tag generator</Link>.
          </p>
        ),
      },
      {
        title: "How do YouTube chapters work?",
        body: (
          <>
            <p>
              Chapters let YouTube split a long video into timestamped sections in the progress bar and the description. For them to work, the first
              timestamp must be 0:00, you need at least 3 chapters, and each chapter should be at least 10 seconds long.
            </p>
            <ul>
              <li>
                <b>First line:</b> must start at 0:00.
              </li>
              <li>
                <b>Minimum:</b> at least 3 chapters, each at least 10 seconds.
              </li>
              <li>
                <b>Format:</b> “mm:ss” or “h:mm:ss” followed by a title, one per line.
              </li>
            </ul>
            <p>This generator keeps only lines that match that format and warns you when the first timestamp is not 0:00.</p>
          </>
        ),
      },
      {
        title: "How many hashtags should a YouTube description have?",
        body: (
          <p>
            The first 3 hashtags in a description can show above the video title, so use at most 3 and keep them relevant. If you add too many
            hashtags, YouTube may ignore them all, so a small, accurate set is better than a long list. When you are ready to publish, schedule the
            upload with the <Link href="/youtube-scheduler">YouTube scheduler</Link>.
          </p>
        ),
      },
    ],
  },
  faqTitle: "YouTube description questions",
  faqs: [
    {
      q: "How long can a YouTube description be?",
      a: "A YouTube description can be up to 5,000 characters. Only the first line or two show before “Show more”, so put the most important sentence first.",
    },
    {
      q: "Where do I paste the description?",
      a: "In YouTube Studio, open the video's Details and paste the generated text into the Description field. The chapters, links and hashtags are already in the right order.",
    },
    {
      q: "Do chapters need to start at 0:00?",
      a: "Yes. For chapters to appear, the first timestamp must be 0:00, you need at least 3 chapters, and each chapter should be at least 10 seconds long.",
    },
    {
      q: "Does this generator upload my text?",
      a: "No. It builds, counts and copies the description entirely in your browser. Your title, summary, chapters, links and hashtags are not uploaded or saved.",
    },
  ],
  related: [
    "/tools/youtube-tag-generator",
    "/tools/youtube-title-counter",
    "/tools/best-time-to-post-on-youtube",
  ],
  schema: {
    features: [
      "First-line hook built from title and summary, kept under 150 characters",
      "Summary, chapters, links, call to action and up to 3 hashtags in order",
      "Chapter lines validated against the mm:ss Title format with a 0:00 warning",
      "Live total against the 5,000-character limit with a coral over-limit state",
      "Read-only preview and clipboard copy with no upload",
    ],
  },
  cta: {
    title: "Your YouTube description is ready.",
    mark: "Schedule the video.",
    text: "Connect YouTube through Google's official sign-in, add your video details and publish at the time you choose with Poskoo.",
  },
};

export const metadata = toolMetadata(config);

export default function YouTubeDescriptionGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <YouTubeDescriptionGenerator />
    </ToolPageTemplate>
  );
}
