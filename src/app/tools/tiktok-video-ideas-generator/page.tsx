import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import PostIdeasGenerator from "../instagram-post-ideas-generator/PostIdeasGenerator";
import { networkAvailability, availabilityPhrase } from "@/components/ChannelStatusNote";

export const revalidate = 600;

const config: ToolPageConfig = {
  path: "/tools/tiktok-video-ideas-generator",
  name: "TikTok video ideas generator",
  crumb: "TikTok video ideas generator",
  title: "TikTok Video Ideas Generator - Free Content Ideas | Poskoo",
  description:
    "Free TikTok video ideas generator: pick your niche and get six TikTok video ideas, each with a hook and caption starter. No sign-up, nothing uploaded.",
  pill: "Free · no signup · nothing is uploaded",
  h1: { mark: "TikTok Video Ideas Generator" },
  lede: "A free tool that gives you six TikTok video ideas for your niche, each with a hook and a caption starter, with no sign-up.",
  art: "writing",
  artLabel: "A creator writes TikTok video ideas on a phone-shaped card with a giant pencil",
  heroPoints: ["8 niches", "Videos, photo carousels, Stories, photo posts", "One-click copy"],
  toolTitle: "Get TikTok video ideas",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the TikTok video ideas generator",
  steps: [
    {
      title: "Choose your niche",
      text: "Pick Coach, E-commerce, Restaurant, Fitness, Beauty, Real estate, Creator or Agency in Your niche. Six TikTok video ideas for that niche appear.",
      art: "writing",
    },
    {
      title: "Filter by format",
      text: "Leave All selected, or tap Video, Photo carousel, Story or Photo post to see only that format. New ideas reshuffles the order.",
      art: "visual",
    },
    {
      title: "Copy and plan",
      text: "Press Copy on a card or Copy all for the whole set, then film the video in your own words and add it to your calendar.",
      art: "feat-calendar",
    },
  ],
  featuresTitle: "TikTok ideas you can start on today",
  features: [
    {
      title: "Format, hook and caption",
      text: "Every idea comes with a suggested format, a first line to open with and a caption starter, not just a one-word topic.",
      art: "writing",
    },
    {
      title: "A mix of formats",
      text: "Each niche covers videos, photo carousels, a Story and a photo post, so one session gives you a varied week.",
      art: "visual",
    },
    {
      title: "Private and free",
      text: "Ideas are hand-written and picked in your browser. No AI, no account and nothing you choose is uploaded.",
      art: "analytics",
    },
  ],
  guide: {
    title: "How to turn TikTok video ideas into a week of content",
    intro:
      "Running out of ideas is usually a planning problem, not a creativity problem. This generator gives you starting points by niche; the guide covers how it works and how to turn an idea into a finished TikTok video.",
    sections: [
      {
        title: "What this TikTok video ideas generator does",
        body: (
          <>
            <p>
              The tool holds 48 hand-written ideas: six for each of eight niches. Each idea has a <b>title</b>, a{" "}
              <b>format</b> (Video, Photo carousel, Story or Photo post), a <b>hook</b> and a <b>caption starter</b>.
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
        title: "What makes a good TikTok idea",
        body: (
          <ul>
            <li>
              <b>Start with a strong hook.</b> The first second decides whether people keep watching, so open with a
              clear promise, question or surprise. Get more openers with the{" "}
              <Link href="/tools/tiktok-hook-generator">TikTok hook generator</Link>.
            </li>
            <li>
              <b>Make one point per video.</b> A single tip, story or before-and-after is easier to follow and easier to
              film than a list of unrelated ideas.
            </li>
            <li>
              <b>Show, do not just tell.</b> Film the process, the result or the mistake on screen instead of reading a
              script to camera.
            </li>
            <li>
              <b>Match the format to the idea.</b> Use a video for a demonstration, a photo carousel for a step-by-step
              list and a Story for a quick question or behind-the-scenes moment.
            </li>
            <li>
              <b>Add a caption and a few tags.</b> Draft the caption with the{" "}
              <Link href="/tools/tiktok-caption-generator">TikTok caption generator</Link> and pick a small set of tags
              with the <Link href="/tools/tiktok-hashtag-generator">TikTok hashtag generator</Link>.
            </li>
          </ul>
        ),
      },
      {
        title: "How often should you post on TikTok?",
        body: (
          <>
            <p>
              There is no single number that works for every account. A practical starting point is <b>three to five
              videos a week</b>, posted consistently, then adjust based on what your audience watches and saves.
            </p>
            <p>
              Consistency matters more than volume: a steady schedule you can keep beats a burst of posts followed by a
              quiet month. Pick a few days that fit your filming time, then use the{" "}
              <Link href="/tools/best-time-to-post-on-tiktok">best time to post on TikTok</Link> finder to choose a
              starting time and the <Link href="/tiktok-scheduler">TikTok scheduler</Link> to queue each video.
            </p>
          </>
        ),
      },
      {
        title: "Example: a fitness TikTok video idea",
        body: (
          <>
            <p>
              Choose Fitness with All formats and the first card is a video idea. Pressing <b>Copy</b> on it gives:
            </p>
            <div className={t.example}>
              <p>Form check: squat deep-dive</p>
              <p>Format: Video</p>
              <p>Hook: Send us your squat and we will break it down</p>
              <p>
                Caption starter: Use the question sticker to send a clip. We will pick three to review in tomorrow&apos;s
                video.
              </p>
            </div>
            <p>
              To make it yours, name the exercise you coach best, say when the reviews will go up and follow through the
              next day. The same set also includes ideas such as &ldquo;5 mobility moves for desk workers&rdquo; (photo
              carousel) and &ldquo;What I eat in a day as a trainer&rdquo; (video), enough for a varied week.
            </p>
          </>
        ),
      },
      {
        title: "Common TikTok content planning mistakes",
        body: (
          <ul>
            <li>Copying a caption starter word for word, so it sounds like every other account.</li>
            <li>Posting only one format for weeks.</li>
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
  faqTitle: "TikTok video ideas questions",
  faqs: [
    {
      q: "Is this TikTok video ideas generator free?",
      a: "Yes. The tool runs entirely in your browser. Pick a niche, see six TikTok video ideas with hooks and caption starters, and copy them. Nothing is uploaded and no account is needed.",
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
      q: "How do I use these TikTok video ideas?",
      a: "Copy the idea you like, use the hook as your first line or on-screen text, and expand the caption starter in your own voice with your own examples. Then film and schedule the video.",
    },
    {
      q: "Can I schedule these TikTok videos automatically?",
      a: "Yes. Poskoo lets you schedule TikTok videos and photo posts from a calendar, so you can plan a week of content in one sitting and publish it on your schedule.",
    },
  ],
  related: [
    "/tools/tiktok-hook-generator",
    "/tools/tiktok-caption-generator",
    "/tools/tiktok-hashtag-generator",
    "/tools/best-time-to-post-on-tiktok",
    "/tiktok-scheduler",
  ],
  schema: {
    features: [
      "48 TikTok video ideas across eight niches",
      "Format filter for videos, photo carousels, Stories and photo posts",
      "Hook and caption starter for every idea",
      "Copy one idea or all of them",
    ],
  },
  cta: {
    title: "Ideas picked.",
    mark: "Put them on the calendar.",
    text: "Schedule a week of TikTok videos with Poskoo and publish them through TikTok's official API at the time you choose.",
  },
};

export const metadata = toolMetadata(config);

export default function TikTokVideoIdeasGeneratorPage() {
  const state = networkAvailability("tiktok");
  const pageConfig =
    state === "live"
      ? config
      : {
          ...config,
          faqs: config.faqs.map((f) =>
            f.q === "Can I schedule these TikTok videos automatically?"
              ? {
                  ...f,
                  a: `Not yet. TikTok publishing in Poskoo is ${availabilityPhrase(state, "TikTok")}. Until then, copy an idea, film the video and post it from the TikTok app.`,
                }
              : f,
          ),
        };
  return (
    <ToolPageTemplate config={pageConfig}>
      <PostIdeasGenerator platform="tiktok" />
    </ToolPageTemplate>
  );
}
