import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import HashtagGenerator from "./HashtagGenerator";

const config: ToolPageConfig = {
  path: "/tools/instagram-hashtag-generator",
  name: "Instagram hashtag generator",
  crumb: "Hashtag generator",
  title: "Instagram Hashtag Generator: Free Niche Hashtag Sets",
  description:
    "Free Instagram hashtag generator: pick one of 15 hand-curated niches, mix broad and specific tags, add your own keyword and copy 5 to 30 hashtags at once.",
  pill: "Free · no signup · no AI or scraping",
  h1: { before: "Instagram hashtag generator:", mark: "free hashtag sets", after: "by niche" },
  lede: "Pick your niche, choose how broad or specific the mix should be, and copy a clean set of hashtags for your next post. Hand-curated tags, generated in your browser.",
  art: "hashtag",
  artLabel: "A creator juggles colourful hashtag balloons above a phone showing an Instagram post",
  heroPoints: ["15 niches", "5–30 tags", "Copy, caption block or CSV"],
  toolTitle: "Generate your hashtag set",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate Instagram hashtags",
  steps: [
    {
      title: "Pick your niche",
      text: "Choose the niche closest to your post, from fitness and food to real estate, weddings or tech. Each niche has its own hand-picked tag list.",
      art: "hashtag",
    },
    {
      title: "Set the count and mix",
      text: "Slide between 5 and 30 tags, then choose Balanced, More broad or More specific. Add an optional keyword such as your city or brand.",
      art: "writing",
    },
    {
      title: "Review, copy and post",
      text: "Untick anything that does not describe the post, then copy the selection, copy it as a caption block or download a CSV.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Hashtags that describe the post, not filler",
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
    title: "A practical guide to Instagram hashtags in 2026",
    intro:
      "Hashtags are labels. They tell Instagram and people browsing a tag what a post is about. Used well they add context to a good post; they do not rescue a weak one. Here is how this generator works and how to use its sets well.",
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
              <b> estimated popularity range</b> and a competition level. Instagram has no public API for hashtag post
              counts and this tool never scrapes Instagram, so popularity is an estimate based on the tier (broad tags are
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
        title: "How many hashtags to use",
        body: (
          <>
            <p>
              Instagram&apos;s publishing API documents a maximum of 30 hashtags per post, and Instagram has tested lower
              limits in the app, so treat 30 as a ceiling and never as a target. A short set where every tag fits the post
              is easier to review and reads better than a wall of tags.
            </p>
            <ul>
              <li>Start with 5 to 10 tags that describe the post exactly.</li>
              <li>Add more only when each one is still relevant to this post.</li>
              <li>If the app rejects a caption, trim the set before anything else.</li>
            </ul>
          </>
        ),
      },
      {
        title: "Best practices for hashtags in 2026",
        body: (
          <ul>
            <li>
              <b>Relevance over reach.</b> A tag that matches the post brings viewers who care about the topic. A popular
              tag that does not match brings nobody useful.
            </li>
            <li>
              <b>Write a searchable caption.</b> Instagram search reads captions too, so name the topic in plain words in
              the first lines and let hashtags add context.
            </li>
            <li>
              <b>Mix the tiers.</b> Combine a few broad tags with mid-level and specific ones, and add a location or brand
              tag when it fits.
            </li>
            <li>
              <b>Rotate sets.</b> Copying the identical block onto every post makes tags less descriptive. Keep two or three
              sets per topic and tweak them per post with the{" "}
              <Link href="/tools/instagram-hashtag-strategy">hashtag strategy worksheet</Link>.
            </li>
            <li>
              <b>Caption or first comment.</b> Both work. A{" "}
              <Link href="/instagram-scheduler">scheduled first comment</Link> keeps the caption clean.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: a balanced set for a fitness post",
        body: (
          <>
            <p>
              For a Reel showing a home dumbbell routine, the Fitness niche with 10 tags, a Balanced mix and the extra
              keyword &ldquo;Denver fitness&rdquo; gives a starting point like this:
            </p>
            <div className={t.example}>
              <p>#denverfitness #denver #health #workoutideas #deadliftpractice #exercise #strengthtraining #dumbbellroutine #sport #personaltraining</p>
            </div>
            <p>
              Before posting, drop any tag the Reel does not show. There is no deadlift in a dumbbell routine, so{" "}
              <code>#deadliftpractice</code> goes, and a broad tag like <code>#sport</code> adds little to a home workout.
              What is left is a short set that describes the video.
            </p>
          </>
        ),
      },
      {
        title: "Common hashtag mistakes",
        body: (
          <ul>
            <li>Filling every slot because the limit allows it.</li>
            <li>Using tags that do not describe the post, just because they are popular.</li>
            <li>Pasting the exact same block on every post for months.</li>
            <li>Never checking a tag page: some tags are restricted or full of unrelated content.</li>
            <li>
              Hiding the real topic in hashtags only, instead of saying it in the caption. Check length and tag count with
              the <Link href="/tools/instagram-caption-counter">caption counter</Link>.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram hashtag questions",
  faqs: [
    {
      q: "How does this Instagram hashtag generator work?",
      a: "Choose one of 15 niches, a count and a mix. The tool selects from hand-curated broad, mid-level and specific tag sets in a repeatable order. You can add an optional keyword and copy the finished set.",
    },
    {
      q: "How many hashtags should I use on an Instagram post?",
      a: "Use only tags that describe your post; 30 is the documented maximum, not a target. This generator lets you choose and copy between 5 and 30 hashtags at once, so you can start with a smaller, relevant set instead of filling every slot.",
    },
    {
      q: "Are my hashtags generated and copied in the browser?",
      a: "Yes. The generator builds your set and copies it in your browser without uploading your keyword, using AI or scraping Instagram. Choose Copy all to copy the full set, or select the plain text if clipboard access is unavailable.",
    },
    {
      q: "How should I group broad, niche and branded hashtags?",
      a: "Use broad tags for general topics, specific tags for your niche and a branded or location keyword when it fits. Choose Balanced, More broad or More specific, then use Extra keyword to add your brand or city. Review the finished set for relevance before posting.",
    },
    {
      q: "Are the popularity numbers real Instagram post counts?",
      a: "No. Instagram has no public API for hashtag post counts and this tool never scrapes Instagram, so popularity is an estimated range based on each tag's size tier (for example 1M+ for broad tags). The tool also does not check whether a hashtag is restricted; open a tag's page on Instagram if you are unsure about it.",
    },
    {
      q: "Should hashtags go in the caption or the first comment?",
      a: "Either works. Many creators keep the caption clean and add hashtags as a first comment. Poskoo's Instagram scheduler can publish that first comment right after the post goes live.",
    },
  ],
  related: [
    "/tools/instagram-hashtag-strategy",
    "/tools/instagram-caption-generator",
    "/tools/instagram-caption-counter",
    "/tools/instagram-hook-generator",
    "/tools/instagram-post-ideas-generator",
    "/tools/instagram-comment-keyword-tester",
  ],
  schema: {
    features: [
      "Hand-curated hashtag sets for 15 niches",
      "Broad, mid-level and specific tag tiers",
      "Choose 5 to 30 hashtags",
      "Optional custom keyword tag",
      "Estimated popularity range, tier and competition per tag",
      "Copy selected tags, copy as a caption block or download CSV",
      "One-click copy, no signup",
    ],
  },
  cta: {
    title: "Your hashtags are ready.",
    mark: "Schedule the post.",
    text: "Save the set as a first comment, schedule the post with Poskoo, and DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramHashtagGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <HashtagGenerator />
    </ToolPageTemplate>
  );
}
