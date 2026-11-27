import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import HashtagGenerator from "../instagram-hashtag-generator/HashtagGenerator";

const config: ToolPageConfig = {
  path: "/tools/tiktok-hashtag-generator",
  name: "TikTok hashtag generator",
  crumb: "TikTok hashtag generator",
  title: "TikTok Hashtag Generator: Free Niche Hashtag Sets for Videos",
  description:
    "Free TikTok hashtag generator: pick one of 15 niches, mix broad and specific tags, add your own keyword and copy 3 to 15 hashtags for your next video.",
  pill: "Free · no signup · no AI or scraping",
  h1: { before: "TikTok hashtag generator:", mark: "free hashtag sets", after: "by niche" },
  lede: "Pick your niche, choose how broad or specific the mix should be, and copy a clean set of 3 to 15 hashtags for your next TikTok video. Hand-curated tags, generated in your browser.",
  art: "hashtag",
  artLabel: "A creator juggles colourful hashtag balloons above a phone showing a TikTok video",
  heroPoints: ["15 niches", "3–15 tags", "Copy, caption block or CSV"],
  toolTitle: "Generate your TikTok hashtag set",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate TikTok hashtags",
  steps: [
    {
      title: "Pick your niche",
      text: "Choose the niche closest to your video, from fitness and food to real estate, weddings or tech. Each niche has its own hand-picked tag list.",
      art: "hashtag",
    },
    {
      title: "Set the count and mix",
      text: "Slide between 3 and 15 tags, then choose Balanced, More broad or More specific. Add an optional keyword such as your city or brand.",
      art: "writing",
    },
    {
      title: "Review, copy and post",
      text: "Untick anything that does not describe the video, then copy the selection, copy it as a caption block or download a CSV.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Hashtags that describe the video, not filler",
  features: [
    {
      title: "A planner, not a plain list",
      text: "Every tag shows its tier, an estimated popularity range and competition, so you can see the mix before you copy it.",
      art: "hashtag",
    },
    {
      title: "Your keyword, added cleanly",
      text: "Type a city, product or brand and the tool adds it as one combined tag, plus the first word of a phrase.",
      art: "writing",
    },
    {
      title: "Private and repeatable",
      text: "Sets are built from a fixed list in your browser. Nothing is uploaded, no AI is used and the same settings give the same set.",
      art: "legal",
    },
  ],
  guide: {
    title: "A practical guide to TikTok hashtags in 2026",
    intro:
      "Hashtags are labels. They tell TikTok and people searching a tag what a video is about. Used well they add context to a good video; they do not rescue a weak one. Here is how this generator works and how to use its sets well.",
    sections: [
      {
        title: "What this hashtag generator does",
        body: (
          <>
            <p>
              The generator holds a hand-curated list for 15 niches. Each list is split into three editorial tiers:
              <b> broad</b> (general topics such as <code>#fitness</code>), <b>mid-level</b> (a clear sub-topic such as{" "}
              <code>#homeworkout</code>) and <b>specific</b> (a focused subject such as <code>#kettlebellworkout</code>).
            </p>
            <p>
              Your count and mix decide how many tags come from each tier. The results table shows each tag&apos;s tier, an
              <b> estimated popularity range</b> and a competition level. TikTok has no public API for hashtag post
              counts and this tool never scrapes TikTok, so popularity is an estimate based on the tier (broad tags are
              shown as 1M+, mid-level as 100K–1M, specific as 10K–100K, with a few obviously huge tags such as{" "}
              <code>#fitness</code> shown as 100M+). Treat the ranges as a guide to the mix, not as exact counts.
            </p>
            <p>
              Untick any tag you do not want, then copy the selection as one line, copy it as a caption block with spacer
              lines above it, or download a CSV. The tool does not check live trends or whether a tag is restricted, so
              always read the set before you post it.
            </p>
          </>
        ),
      },
      {
        title: "How many hashtags to use on TikTok",
        body: (
          <>
            <p>
              TikTok has no fixed hashtag cap, and captions allow up to 4,000 characters, so you are not forced to fill
              a limit. A few relevant tags beat many: start with 3 to 5 tags that describe the video exactly, and add
              more only when each one still fits.
            </p>
            <ul>
              <li>Start with 3 to 5 tags that describe the video exactly.</li>
              <li>Add more only when each one is still relevant to this video.</li>
              <li>A wall of 20+ tags reads as filler and can dilute the ones that matter.</li>
            </ul>
          </>
        ),
      },
      {
        title: "How TikTok search finds your video",
        body: (
          <ul>
            <li>
              <b>Name the topic in words.</b> TikTok search reads captions and on-screen text, so say what the video is
              about in plain words in the <Link href="/tools/tiktok-caption-generator">caption</Link> and as text on the video, and let hashtags add context.
            </li>
            <li>
              <b>Relevance over reach.</b> A tag that matches the video brings viewers who care about the topic. A popular
              tag that does not match brings nobody useful.
            </li>
            <li>
              <b>Mix the tiers.</b> Combine a broad tag with mid-level and specific ones, and add a location or brand
              tag when it fits.
            </li>
            <li>
              <b>Rotate sets.</b> Copying the identical block onto every video makes tags less descriptive. Keep two or
              three sets per topic and tweak them per video.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: a small set for a fitness video",
        body: (
          <>
            <p>
              For a video showing a home dumbbell routine, the Fitness niche with 5 tags, a Balanced mix and the extra
              keyword &ldquo;Denver fitness&rdquo; gives a starting point like this:
            </p>
            <div className={t.example}>
              <p>#denverfitness #denver #workoutideas #dumbbellroutine #strengthtraining</p>
            </div>
            <p>
              Before posting, drop any tag the video does not show. What is left is a short set that describes the
              video, and the caption says the topic in plain words.
            </p>
          </>
        ),
      },
      {
        title: "Common TikTok hashtag mistakes",
        body: (
          <ul>
            <li>Pasting 20+ tags because the caption allows it.</li>
            <li>Using tags that do not describe the video, just because they are popular.</li>
            <li>Pasting the exact same block on every video for months.</li>
            <li>
              Hiding the real topic in hashtags only, instead of saying it in the caption or on-screen text. Check
              length with the <Link href="/tools/tiktok-caption-counter">TikTok caption counter</Link>.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "TikTok hashtag questions",
  faqs: [
    {
      q: "How many hashtags should I use on a TikTok video?",
      a: "TikTok has no fixed hashtag cap and captions allow 4,000 characters, so start with 3 to 5 tags that describe the video exactly and add more only when each one is still relevant. This generator lets you copy between 3 and 15 hashtags at once.",
    },
    {
      q: "Do hashtags still help on TikTok?",
      a: "Yes, as context. TikTok search reads captions and on-screen text first, so name the topic in plain words and use a few relevant hashtags to add context. Hashtags do not rescue a weak video.",
    },
    {
      q: "Should hashtags go in the caption or the first comment?",
      a: "On TikTok, put them in the caption. TikTok has no first-comment discovery the way Instagram does, and the caption is what search reads. Keep them after the hook line so the first line stays clean.",
    },
    {
      q: "Are the popularity numbers real TikTok counts?",
      a: "No. TikTok has no public API for hashtag post counts and this tool never scrapes TikTok, so popularity is an estimated range based on each tag's size tier (for example 1M+ for broad tags). The tool also does not check live trends; read the set before you post it.",
    },
    {
      q: "Does this generator upload my keyword or scrape TikTok?",
      a: "No. The generator builds your set and copies it in your browser without uploading your keyword, using AI or scraping TikTok. Choose Copy all to copy the full set, or select the plain text if clipboard access is unavailable.",
    },
    {
      q: "How do I find the best time to post my TikTok?",
      a: "Use the best time to post on TikTok finder to get three starting slots for your audience and time zone, then test them for two weeks and keep what works.",
      aNode: (
        <>
          Use the{" "}
          <Link href="/tools/best-time-to-post-on-tiktok">best time to post on TikTok</Link> finder to get three starting
          slots for your audience and time zone, then test them for two weeks and keep what works.
        </>
      ),
    },
  ],
  related: [
    "/tools/tiktok-caption-generator",
    "/tools/tiktok-caption-counter",
    "/tools/best-time-to-post-on-tiktok",
    "/tools/instagram-hashtag-generator",
    "/tools/instagram-caption-generator",
  ],
  schema: {
    features: [
      "Hand-curated hashtag sets for 15 niches",
      "Broad, mid-level and specific tag tiers",
      "Choose 3 to 15 hashtags",
      "Optional custom keyword tag",
      "Estimated popularity range, tier and competition per tag",
      "Copy selected tags, copy as a caption block or download CSV",
      "One-click copy, no signup",
    ],
  },
  cta: {
    title: "Your hashtags are ready.",
    mark: "Schedule the video.",
    text: "Connect TikTok with its official login, plan your videos on one calendar and publish them automatically with Poskoo's TikTok scheduler.",
  },
};

export const metadata = toolMetadata(config);

export default function TikTokHashtagGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <HashtagGenerator platform="tiktok" />
    </ToolPageTemplate>
  );
}
