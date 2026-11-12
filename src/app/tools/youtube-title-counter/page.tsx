import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import YouTubeCounter from "./YouTubeCounter";

const limitRows: [string, string][] = [
  ["Title", "100 characters"],
  ["Title shown in search", "About 70 characters"],
  ["Description", "5,000 characters"],
  ["Description above the fold", "About 157 characters"],
  ["Tags", "500 characters in total"],
];

const config: ToolPageConfig = {
  path: "/tools/youtube-title-counter",
  name: "YouTube title and description character counter",
  crumb: "YouTube title counter",
  title: "YouTube Title Counter: Free Title & Description Checker",
  description: "Free YouTube title and description counter with real limits, search previews, tag totals and warnings. Check your video details before you publish.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "YouTube title & description counter", after: "with real limits" },
  lede: "YouTube titles can be up to 100 characters, but search shows about the first 70. Descriptions allow 5,000 characters, with about 157 visible above the fold; tags have a 500-character total limit.",
  art: "writing",
  artLabel: "A creator writes YouTube video details beside a character meter and search preview",
  heroPoints: ["100-character title limit", "5,000-character description", "500-character tag total"],
  toolTitle: "Check your YouTube video details",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the YouTube character counter",
  steps: [
    {
      title: "Choose title, description or tags",
      text: "Select the field you want to check. Each tab keeps its own draft while you move between your video details.",
      art: "writing",
    },
    {
      title: "Review the live limits and preview",
      text: "Watch the character count and bar, check the search or above-the-fold preview, and remove any angle brackets from your title.",
      art: "visual",
    },
    {
      title: "Trim, copy and schedule",
      text: "Keep the opening clear, bring any over-limit field back within its limit, then copy the finished text into your YouTube upload.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Check every YouTube text field before publishing",
  features: [
    {
      title: "Real limits in one place",
      text: "Check the 100-character title, 5,000-character description and 500-character combined tag limit without switching tools.",
      art: "analytics",
    },
    {
      title: "See the visible opening",
      text: "Preview roughly 70 title characters in search and 157 description characters above Show more, so the important words come first.",
      art: "visual",
    },
    {
      title: "Catch titles YouTube rejects",
      text: "Get a clear warning for < and > in titles. Tags are trimmed and counted with commas and the quotes used for multi-word tags.",
      art: "writing",
    },
  ],
  guide: {
    title: "YouTube title, description and tag limits",
    intro: "YouTube allows 100 characters in a title, 5,000 in a description and 500 across all tags. Search and watch pages show only the opening, so front-load the useful information.",
    sections: [
      {
        title: "What are YouTube's text limits?",
        body: (
          <div className={t.tableWrap}>
            <table className={t.table}>
              <thead>
                <tr><th scope="col">YouTube field</th><th scope="col">Limit or visible length</th></tr>
              </thead>
              <tbody>
                {limitRows.map(([label, value]) => (
                  <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      },
      {
        title: "How much of a YouTube title and description is visible?",
        body: (
          <p>
            Search results typically show about the first <b>70 characters</b> of a title, while a watch page shows about
            the first <b>157 characters</b> of a description above Show more. These are approximate display lengths, not
            separate publishing limits. The exact cut-off can vary by device, layout and search result.
          </p>
        ),
      },
      {
        title: "How does YouTube count tags and invalid title characters?",
        body: (
          <ul>
            <li><b>Tags are comma-separated.</b> Empty items are ignored, and each comma between tags counts as one character.</li>
            <li><b>Multi-word tags count quotes.</b> Add two characters for tags containing whitespace, such as &quot;video marketing&quot;.</li>
            <li><b>Titles cannot contain angle brackets.</b> YouTube rejects titles containing &lt; or &gt;, so the tool warns you immediately.</li>
            <li><b>Characters count by code point.</b> A standalone emoji such as 😀 counts as one character in this tool.</li>
          </ul>
        ),
      },
      {
        title: "How do I schedule a checked YouTube video?",
        body: (
          <p>
            Finish your video details here, then open the <Link href="/youtube-scheduler">YouTube scheduler</Link> to connect
            through Google and choose a publishing time. For setup help, follow the{" "}
            <Link href="/help/schedule-youtube-videos">step-by-step YouTube scheduling guide</Link>.
          </p>
        ),
      },
    ],
  },
  faqTitle: "YouTube character limit questions",
  faqs: [
    {
      q: "What is the YouTube title character limit?",
      a: "A YouTube title can contain up to 100 characters. YouTube also rejects titles containing < or >. Keep the main topic near the beginning so it remains visible in search.",
    },
    {
      q: "What is the YouTube description character limit?",
      a: "A YouTube description can contain up to 5,000 characters, including spaces, links and line breaks. Put the key information first because only the opening is visible before Show more.",
    },
    {
      q: "What is the YouTube tag character limit?",
      a: "YouTube tags have a combined limit of 500 characters. Commas between tags count, and multi-word tags add two characters for the quotes YouTube uses around them.",
    },
    {
      q: "How much of a YouTube title and description shows in search?",
      a: "Search usually shows about 70 title characters. On the watch page, about 157 description characters appear above Show more. Exact display lengths vary by device and layout.",
    },
  ],
  related: ["/tools/tiktok-caption-counter", "/tools/linkedin-character-counter", "/tools/threads-character-counter"],
  schema: {
    features: [
      "YouTube title counting against the 100-character limit",
      "Description counting against the 5,000-character limit",
      "Combined tag counting with commas and multi-word quote characters",
      "Approximate 70-character search and 157-character description previews",
      "Invalid angle-bracket warnings and copy controls",
    ],
  },
  cta: {
    title: "Your YouTube details fit.",
    mark: "Now schedule the video.",
    text: "Connect YouTube through Google's official sign-in, add your checked title, description and tags, and publish at the time you choose.",
  },
};

export const metadata = toolMetadata(config);

export default function YouTubeTitleCounterPage() {
  return (
    <ToolPageTemplate config={config}>
      <YouTubeCounter />
    </ToolPageTemplate>
  );
}
