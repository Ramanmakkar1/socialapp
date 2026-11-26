import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import YouTubeTagGenerator from "./YouTubeTagGenerator";

const config: ToolPageConfig = {
  path: "/tools/youtube-tag-generator",
  name: "YouTube tag generator",
  crumb: "YouTube tag generator",
  title: "YouTube Tag Generator: Free Tags Within the 500 Limit",
  description: "Free YouTube tag generator: turn a topic and extra keywords into relevant tags, check the 500-character limit with commas and quotes, then copy your list.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "YouTube tag generator", after: "within the 500-character limit" },
  lede: "YouTube tags are optional keywords added in YouTube Studio, limited to 500 characters in total. They are mainly useful for misspellings and variations, while your title and description matter more. Enter a topic to build a clean, deduplicated list you can copy.",
  art: "hashtag",
  artLabel: "A creator organises YouTube tag bubbles beside a 500-character meter",
  heroPoints: ["500-character limit", "Lowercase and deduplicated", "No signup"],
  toolTitle: "Generate your YouTube tags",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate YouTube tags",
  steps: [
    {
      title: "Enter your video topic",
      text: "Add the main subject of your video, such as home workout. You can also add comma-separated keywords for details the video covers.",
      art: "writing",
    },
    {
      title: "Review the generated list",
      text: "Generate a deterministic set of topic variations, then remove any chip that does not accurately describe your video.",
      art: "hashtag",
    },
    {
      title: "Check the total and copy",
      text: "Watch the live count include commas and multi-word quote characters, then copy the tags into YouTube Studio within the 500-character limit.",
      art: "visual",
    },
  ],
  featuresTitle: "A useful tag list without crossing YouTube's limit",
  features: [
    {
      title: "Topic-led variations",
      text: "Start with your exact topic and optional keywords, then add practical tutorial, beginner, tips and format variations from a fixed list.",
      art: "hashtag",
    },
    {
      title: "An accurate combined count",
      text: "See the total across every tag, including commas and the two quote characters YouTube counts around each multi-word tag.",
      art: "analytics",
    },
    {
      title: "Editable, private and ready",
      text: "Remove irrelevant chips, stop automatically before the next tag would cross the limit, and copy the result without uploading your topic.",
      art: "writing",
    },
  ],
  guide: {
    title: "A practical guide to YouTube tags",
    intro: "Tags can add a little context in YouTube Studio, but they are not a substitute for a clear title, useful description and video that matches what viewers want.",
    sections: [
      {
        title: "Do YouTube tags still help?",
        body: (
          <p>
            YouTube says tags are mainly useful for common misspellings and variations of your topic. They play a minimal
            role compared with the title, <Link href="/tools/youtube-description-generator">description</Link> and the video itself, so use a few accurate variations rather than
            expecting tags to improve a weak video. Put the clearest wording in your title first; you can check its length
            with the <Link href="/tools/youtube-title-counter">YouTube title and description counter</Link>.
          </p>
        ),
      },
      {
        title: "How many tags should a YouTube video have?",
        body: (
          <p>
            There is no ideal number to reach and no reason to fill all 500 characters. Start with the exact topic, then
            add only close variations, common misspellings and specific terms the video genuinely covers. This generator
            gives you a starting list, not a requirement to use every suggestion. Remove irrelevant chips before copying.
            For the visible <code>#hashtags</code> that go in your description, use the{" "}
            <Link href="/tools/youtube-hashtag-generator">YouTube hashtag generator</Link>. When the details are ready,
            use the <Link href="/youtube-scheduler">YouTube scheduler</Link> to choose an upload time.
          </p>
        ),
      },
      {
        title: "How does YouTube count the 500-character limit?",
        body: (
          <>
            <p>
              The limit applies to all tags combined, not separately to each tag. Every letter, number, space and symbol
              counts. A comma between two tags counts as one character, and a multi-word tag adds two characters for the
              quotation marks YouTube uses around it.
            </p>
            <ul>
              <li><b>Single-word tags:</b> count the characters in the tag itself.</li>
              <li><b>Multi-word tags:</b> count the tag plus two quote characters.</li>
              <li><b>Between tags:</b> count one comma for every separator.</li>
            </ul>
            <p>The counter stops before adding a suggestion that would take the combined total above 500.</p>
          </>
        ),
      },
    ],
  },
  faqTitle: "YouTube tag questions",
  faqs: [
    {
      q: "Where do I add tags to a YouTube video?",
      a: "In YouTube Studio, open the video's Details, select Show more and enter your tags in the Tags field. Tags are separate from hashtags placed in a title or description.",
    },
    {
      q: "Are YouTube tags the same as hashtags?",
      a: "No. Tags are optional keywords entered in the Tags field in YouTube Studio. Hashtags are words beginning with # that you place in a video title or description.",
    },
    {
      q: "Why did the generator leave out some suggestions?",
      a: "The next suggestion would have taken the combined tag total above 500 characters, so the generator stopped. Remove a chip or shorten your topic or extra keywords to make room.",
    },
    {
      q: "Does this YouTube tag generator upload my topic?",
      a: "No. It creates, counts and copies tags entirely in your browser using a fixed modifier list. Your topic and extra keywords are not uploaded or saved.",
    },
  ],
  related: [
    "/tools/youtube-description-generator",
    "/tools/youtube-title-counter",
    "/tools/best-time-to-post-on-youtube",
    "/tools/social-media-image-sizes",
  ],
  schema: {
    features: [
      "Deterministic YouTube tag suggestions from a topic and optional keywords",
      "Lowercase deduplicated tags with removable chips",
      "Combined 500-character count including commas and multi-word quotes",
      "Automatic warning and cutoff before the limit is exceeded",
      "Comma-separated clipboard copy with no topic upload",
    ],
  },
  cta: {
    title: "Your YouTube tags are ready.",
    mark: "Schedule the video.",
    text: "Connect YouTube through Google's official sign-in, add your video details and publish at the time you choose with Poskoo.",
  },
};

export const metadata = toolMetadata(config);

export default function YouTubeTagGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <YouTubeTagGenerator />
    </ToolPageTemplate>
  );
}
