import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import PostIdeasGenerator from "../instagram-post-ideas-generator/PostIdeasGenerator";

const config: ToolPageConfig = {
  path: "/tools/youtube-video-ideas-generator",
  name: "YouTube video ideas generator",
  crumb: "YouTube video ideas generator",
  title: "YouTube Video Ideas Generator: Free Ideas by Niche (2026)",
  description:
    "Get six YouTube video ideas for your niche, each with a format, hook and description starter. Long videos and Shorts, free, no sign-up, nothing uploaded.",
  pill: "Free · no signup · nothing is uploaded",
  h1: { mark: "YouTube Video Ideas Generator" },
  lede: "A free tool that gives you six YouTube video ideas for your niche, each with a title, format, hook and description starter, with no sign-up.",
  art: "writing",
  artLabel: "A creator writes YouTube video ideas on a phone-shaped card with a giant pencil",
  heroPoints: ["8 niches", "Long videos, Shorts, tutorials and lists", "One-click copy"],
  toolTitle: "Get YouTube video ideas",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the YouTube video ideas generator",
  steps: [
    {
      title: "Choose your niche",
      text: "Pick Coach, E-commerce, Restaurant, Fitness, Beauty, Real estate, Creator or Agency in Your niche. Six YouTube video ideas for that niche appear.",
      art: "writing",
    },
    {
      title: "Filter by format",
      text: "Leave All selected, or tap Long video, Tutorial, Short or List video to see only that format. New ideas reshuffles the order.",
      art: "visual",
    },
    {
      title: "Copy and plan",
      text: "Press Copy on a card or Copy all for the whole set, then film the video in your own words and add it to your calendar.",
      art: "feat-calendar",
    },
  ],
  featuresTitle: "YouTube ideas you can start on today",
  features: [
    {
      title: "Format, hook and description",
      text: "Every idea comes with a suggested format, a first line to open with and a description starter, not just a one-word topic.",
      art: "writing",
    },
    {
      title: "A mix of formats",
      text: "Each niche covers long videos, tutorials, Shorts and list videos, so one session gives you a varied upload schedule.",
      art: "visual",
    },
    {
      title: "Private and free",
      text: "Ideas are hand-written and picked in your browser. No AI, no account and nothing you choose is uploaded.",
      art: "analytics",
    },
  ],
  guide: {
    title: "How to turn YouTube video ideas into a week of uploads",
    intro:
      "Running out of ideas is usually a planning problem, not a creativity problem. This generator gives you starting points by niche; the guide covers how it works and how to turn an idea into a finished YouTube video.",
    sections: [
      {
        title: "What this YouTube video ideas generator does",
        body: (
          <>
            <p>
              The tool holds 48 hand-written ideas: six for each of eight niches. Each idea has a <b>title</b>, a{" "}
              <b>format</b> (Long video, Tutorial, Short or List video), a <b>hook</b> and a <b>description starter</b>.
            </p>
            <ul>
              <li>With All selected you see the niche&apos;s six ideas; a format filter shows only the matching ones.</li>
              <li><b>New ideas</b> shuffles the order of the ideas for that niche; it does not add new ones.</li>
              <li><b>Copy</b> copies one idea as four labelled lines; <b>Copy all</b> copies every visible idea.</li>
            </ul>
            <p>
              If your niche is not listed, pick the closest one. Most ideas, such as a day in the life or a common mistake,
              carry over to other niches.
            </p>
          </>
        ),
      },
      {
        title: "How do you find YouTube video ideas?",
        body: (
          <>
            <p>
              Start with the questions your audience already asks, then match each one to a format. This generator gives you
              six hand-written starting points per niche, so you can compare angles before you commit to filming.
            </p>
            <ul>
              <li>
                <b>Look at search intent.</b> Tutorials and list videos answer people who are actively looking, while
                opinion and behind-the-scenes videos build a returning audience.
              </li>
              <li>
                <b>Reuse what works.</b> A popular Short can become a longer tutorial, and a long video can be cut into
                several Shorts.
              </li>
              <li>
                <b>Draft the title early.</b> Once you pick an idea, turn it into a clickable title with the{" "}
                <Link href="/tools/youtube-title-generator">YouTube title generator</Link> before you film.
              </li>
            </ul>
          </>
        ),
      },
      {
        title: "Should you make Shorts or long videos?",
        body: (
          <>
            <p>
              Use both, but for different jobs. <b>Shorts</b> are fast to make and reach new viewers, while <b>long
              videos</b> and tutorials build trust and watch time with people who already found you.
            </p>
            <p>
              A practical split is a few Shorts a week plus one longer video, then adjust based on what your audience
              watches and subscribes for. Check the exact dimensions for each format with the{" "}
              <Link href="/tools/youtube-shorts-size-checker">YouTube Shorts size checker</Link>, and file the clips neatly
              into a schedule using the guide on{" "}
              <Link href="/help/schedule-youtube-videos">how to schedule YouTube Shorts</Link>.
            </p>
          </>
        ),
      },
      {
        title: "How do you turn an idea into a title and thumbnail?",
        body: (
          <>
            <p>
              The title and thumbnail are seen together, so give each one a single clear promise. Draft the title with the{" "}
              <Link href="/tools/youtube-title-generator">YouTube title generator</Link>, then check your image fits the
              16:9 frame with the{" "}
              <Link href="/tools/youtube-thumbnail-size-checker">YouTube thumbnail size checker</Link> before you upload.
            </p>
            <p>
              When the title, thumbnail and <Link href="/tools/youtube-description-generator">description</Link> are ready, add tags with the{" "}
              <Link href="/tools/youtube-tag-generator">YouTube tag generator</Link> and queue the upload with the{" "}
              <Link href="/youtube-scheduler">YouTube scheduler</Link> so it publishes at the time you choose.
            </p>
          </>
        ),
      },
      {
        title: "Example: a fitness YouTube video idea",
        body: (
          <>
            <p>
              Choose Fitness with All formats and the first card is a video idea. Pressing <b>Copy</b> on it gives:
            </p>
            <div className={t.example}>
              <p>Form check: squat deep-dive</p>
              <p>Format: Long video</p>
              <p>Hook: Send us your squat and we will break it down</p>
              <p>
                Description starter: Use the question sticker to send a clip. We will pick three to review in
                tomorrow&apos;s video.
              </p>
            </div>
            <p>
              To make it yours, name the exercise you coach best, say when the reviews will go up and follow through the
              next day. The same set also includes ideas such as &ldquo;5 mobility moves for desk workers&rdquo; (tutorial)
              and &ldquo;What I eat in a day as a trainer&rdquo; (long video), enough for a varied week.
            </p>
          </>
        ),
      },
      {
        title: "Common YouTube content planning mistakes",
        body: (
          <ul>
            <li>Copying a description starter word for word, so it sounds like every other channel.</li>
            <li>Uploading only one format for weeks.</li>
            <li>Planning ideas but never putting them on a calendar.</li>
            <li>
              Asking people to comment a keyword and not replying. Set up{" "}
              <Link href="/instagram-auto-dm">Instagram auto DM</Link> so every commenter gets the message.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "YouTube video ideas questions",
  faqs: [
    {
      q: "Is this YouTube video ideas generator free?",
      a: "Yes. The tool runs entirely in your browser. Pick a niche, see six YouTube video ideas with hooks and description starters, and copy them. Nothing is uploaded and no account is needed.",
    },
    {
      q: "Which niches does it cover?",
      a: "Eight: coach, e-commerce, restaurant, fitness, beauty, real estate, creator and agency, with six ideas each. If your niche is close to one of these, the formats and hooks usually transfer.",
    },
    {
      q: "What does the New ideas button do?",
      a: "It reshuffles the order of the ideas for your niche and format. Each niche has six ideas in total, so switch niche to see different ones.",
    },
    {
      q: "How do I use these YouTube video ideas?",
      a: "Copy the idea you like, use the hook as your first line or on-screen text, and expand the description starter in your own voice. Then write the title with the YouTube title generator, check the image with the YouTube thumbnail size checker, add tags with the YouTube tag generator, and schedule the upload in the YouTube scheduler.",
      aNode: (
        <>
          Copy the idea you like, use the hook as your first line or on-screen text, and expand the description starter in
          your own voice. Then write the title with the{" "}
          <Link href="/tools/youtube-title-generator">YouTube title generator</Link>, check the image with the{" "}
          <Link href="/tools/youtube-thumbnail-size-checker">YouTube thumbnail size checker</Link>, add tags with the{" "}
          <Link href="/tools/youtube-tag-generator">YouTube tag generator</Link>, and schedule the upload in the{" "}
          <Link href="/youtube-scheduler">YouTube scheduler</Link>.
        </>
      ),
    },
    {
      q: "Should I make YouTube Shorts or long videos from these ideas?",
      a: "Both. Turn quick tips into Shorts and expand bigger topics into long videos or tutorials. Plan Shorts with the guide to scheduling YouTube Shorts and check the frame with the YouTube Shorts size checker before you export.",
      aNode: (
        <>
          Both. Turn quick tips into Shorts and expand bigger topics into long videos or tutorials. Plan Shorts with the{" "}
          <Link href="/help/schedule-youtube-videos">guide to scheduling YouTube Shorts</Link> and check the frame
          with the{" "}
          <Link href="/tools/youtube-shorts-size-checker">YouTube Shorts size checker</Link> before you export.
        </>
      ),
    },
    {
      q: "Can I schedule these YouTube videos automatically?",
      a: "Yes. Poskoo lets you schedule YouTube videos from a calendar, so you can plan a week of uploads in one sitting and publish them on your schedule.",
    },
  ],
  related: [
    "/tools/youtube-title-generator",
    "/tools/youtube-description-generator",
    "/tools/youtube-tag-generator",
    "/tools/best-time-to-post-on-youtube",
    "/tools/youtube-shorts-size-checker",
  ],
  schema: {
    features: [
      "48 YouTube video ideas across eight niches",
      "Format filter for long videos, tutorials, Shorts and list videos",
      "Hook and description starter for every idea",
      "Copy one idea or all of them",
    ],
  },
  cta: {
    title: "Ideas picked.",
    mark: "Put them on the calendar.",
    text: "Schedule a week of YouTube videos with Poskoo and publish them through YouTube's official API at the time you choose.",
  },
};

export const metadata = toolMetadata(config);

export default function YouTubeVideoIdeasGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <PostIdeasGenerator platform="youtube" />
    </ToolPageTemplate>
  );
}
