import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import PostIdeasGenerator from "./PostIdeasGenerator";

const config: ToolPageConfig = {
  path: "/tools/instagram-post-ideas-generator",
  name: "Instagram post ideas generator",
  crumb: "Post ideas generator",
  title: "Instagram Post Ideas Generator: 48 Ideas by Niche (Free)",
  description:
    "Free Instagram post ideas generator: 48 ideas across eight niches, each with a format, hook and caption starter. Filter by Reel, carousel, Story or post.",
  pill: "Free · no signup · nothing is uploaded",
  h1: { before: "Instagram post ideas generator:", mark: "48 ideas", after: "by niche" },
  lede: "Pick your niche and get six post ideas, each with a format, an opening hook and a caption starter. Copy the ones you like and make them your own.",
  art: "writing",
  artLabel: "A creator writes with a giant pencil on a phone-shaped card full of post idea notes",
  heroPoints: ["8 niches", "Reels, carousels, Stories, posts", "One-click copy"],
  toolTitle: "Get post ideas",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Instagram post ideas generator",
  steps: [
    {
      title: "Choose your niche",
      text: "Pick Coach, E-commerce, Restaurant, Fitness, Beauty, Real estate, Creator or Agency in Your niche. Six ideas for that niche appear.",
      art: "writing",
    },
    {
      title: "Filter by format",
      text: "Leave All selected, or tap Reel, Carousel, Story or Post to see only that format. New ideas reshuffles the order.",
      art: "visual",
    },
    {
      title: "Copy and plan",
      text: "Press Copy on a card or Copy all for the whole set, then write the post in your own words and add it to your calendar.",
      art: "feat-calendar",
    },
  ],
  featuresTitle: "Ideas you can start on today",
  features: [
    {
      title: "Format, hook and caption",
      text: "Every idea comes with a suggested format, a first line to open with and a caption starter, not just a one-word topic.",
      art: "writing",
    },
    {
      title: "A mix of formats",
      text: "Each niche covers Reels, carousels, a Story and a feed post, so one session gives you a varied week.",
      art: "visual",
    },
    {
      title: "Private and free",
      text: "Ideas are hand-written and picked in your browser. No AI, no account and nothing you choose is uploaded.",
      art: "analytics",
    },
  ],
  guide: {
    title: "How to turn post ideas into a week of Instagram content",
    intro:
      "Running out of ideas is usually a planning problem, not a creativity problem. This generator gives you starting points by niche; the guide covers how it works and how to turn an idea into a finished post.",
    sections: [
      {
        title: "What this post ideas generator does",
        body: (
          <>
            <p>
              The tool holds 48 hand-written ideas: six for each of eight niches. Each idea has a <b>title</b>, a{" "}
              <b>format</b> (Reel, Carousel, Story or Post), a <b>hook</b> and a <b>caption starter</b>.
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
        title: "Content planning best practices for 2026",
        body: (
          <ul>
            <li>
              <b>Mix formats.</b> Reels can reach people who do not follow you yet, carousels suit tips people save and
              Stories suit questions and behind-the-scenes moments.
            </li>
            <li>
              <b>Batch the work.</b> Pick a week of ideas in one sitting, film and write in another, then schedule
              everything with the <Link href="/instagram-scheduler">Instagram scheduler</Link>.
            </li>
            <li>
              <b>Use the hook as written, then improve it.</b> Generate more openers for the same topic with the{" "}
              <Link href="/tools/instagram-hook-generator">hook generator</Link>.
            </li>
            <li>
              <b>Add proof.</b> Your own numbers, photos and examples are what make a generic idea worth following.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: a fitness Story idea",
        body: (
          <>
            <p>
              Choose Fitness with All formats and the first card is a Story idea. Pressing <b>Copy</b> on it gives:
            </p>
            <div className={t.example}>
              <p>Form check: squat deep-dive</p>
              <p>Format: Story</p>
              <p>Hook: Send us your squat and we will break it down</p>
              <p>
                Caption starter: Use the question sticker to send a clip. We will pick three to review in tomorrow&apos;s
                story.
              </p>
            </div>
            <p>
              To make it yours, name the exercise you coach best, say when the reviews will go up and follow through the
              next day. The same set also includes ideas such as &ldquo;5 mobility moves for desk workers&rdquo; (carousel)
              and &ldquo;What I eat in a day as a trainer&rdquo; (Reel), enough for a varied week.
            </p>
          </>
        ),
      },
      {
        title: "Common content planning mistakes",
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
  faqTitle: "Instagram post ideas questions",
  faqs: [
    {
      q: "Is this Instagram post ideas generator free?",
      a: "Yes. The tool runs entirely in your browser. Pick a niche, see six post ideas with hooks and caption starters, and copy them. Nothing is uploaded and no account is needed.",
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
      q: "How do I use these post ideas?",
      a: "Copy the idea you like, use the hook as your first line or on-screen text, and expand the caption starter in your own voice with your own examples. Then schedule the post.",
    },
    {
      q: "Can I schedule these posts automatically?",
      a: "Yes. Poskoo lets you schedule Instagram posts from a calendar, so you can plan a week of content in one sitting and publish it on your schedule.",
    },
  ],
  related: [
    "/tools/instagram-hook-generator",
    "/tools/instagram-caption-generator",
    "/tools/social-media-content-calendar",
    "/tools/instagram-hashtag-generator",
    "/tools/instagram-carousel-maker",
    "/tools/instagram-posting-frequency-calculator",
  ],
  schema: {
    features: [
      "48 post ideas across eight niches",
      "Format filter for Reels, carousels, Stories and posts",
      "Hook and caption starter for every idea",
      "Copy one idea or all of them",
    ],
  },
  cta: {
    title: "Ideas picked.",
    mark: "Put them on the calendar.",
    text: "Schedule a week of Instagram posts with Poskoo and DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramPostIdeasGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <PostIdeasGenerator />
    </ToolPageTemplate>
  );
}
