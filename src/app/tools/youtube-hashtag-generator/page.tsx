import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import HashtagGenerator from "../instagram-hashtag-generator/HashtagGenerator";

const config: ToolPageConfig = {
  path: "/tools/youtube-hashtag-generator",
  name: "YouTube hashtag generator",
  crumb: "YouTube hashtag generator",
  title: "YouTube Hashtag Generator: Free Hashtags for Your Videos",
  description:
    "Free YouTube hashtag generator: pick your niche, mix broad and specific tags and copy 3 to 15 hashtags for your video description and Shorts in one click.",
  pill: "Free · no signup · no AI or scraping",
  h1: { before: "YouTube hashtag generator:", mark: "free hashtags", after: "for your videos" },
  lede: "Use 3 to 5 hashtags on a YouTube video. YouTube shows the first 3 from your description above or below the title, and a video with more than 60 hashtags has all of its hashtags ignored. Pick your niche, choose how broad or specific the mix should be, and copy a clean set of 3 to 15 hashtags for your video description and Shorts. Hand-curated tags, generated in your browser.",
  art: "hashtag",
  artLabel: "A creator juggles colourful hashtag balloons above a laptop showing a YouTube video",
  heroPoints: ["15 niches", "3–15 tags", "Copy, caption block or CSV"],
  toolTitle: "Generate your YouTube hashtag set",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate YouTube hashtags",
  steps: [
    {
      title: "Pick your niche",
      text: "Choose the niche closest to your video, from fitness and food to tech, real estate or local services. Each niche has its own hand-picked tag list.",
      art: "hashtag",
    },
    {
      title: "Set the count and mix",
      text: "Slide between 1 and 15 tags, then choose Balanced, More broad or More specific. Add an optional keyword such as your channel name or city.",
      art: "writing",
    },
    {
      title: "Review, copy and paste",
      text: "Untick anything that does not describe the video, then copy the selection, copy it as a caption block or download a CSV, and paste it into your description.",
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
      text: "Type a channel, product or city and the tool adds it as one combined tag, plus the first word of a phrase.",
      art: "writing",
    },
    {
      title: "Private and repeatable",
      text: "Sets are built from a fixed list in your browser. Nothing is uploaded, no AI is used and the same settings give the same set.",
      art: "legal",
    },
  ],
  guide: {
    title: "A practical guide to YouTube hashtags in 2026",
    intro:
      "Hashtags are labels. They tell YouTube and people searching a tag what a video is about. Used well they add context to a good video; they do not rescue a weak one. Here is how this generator works and how to use its sets well.",
    sections: [
      {
        title: "What this hashtag generator does",
        body: (
          <>
            <p>
              The generator holds a hand-curated list for 15 niches. Each list is split into three editorial tiers:
              <b> broad</b> (general topics such as <code>#fitness</code>), <b>mid-level</b> (a clear sub-topic such as{" "}
              <code>#homeworkout</code>) and <b>specific</b> (a focused subject such as <code>#kettlebellsworkout</code>).
            </p>
            <p>
              Your count and mix decide how many tags come from each tier. The results table shows each tag&apos;s tier, an
              <b> estimated popularity range</b> and a competition level. This tool runs entirely in your browser and uses
              estimated bands, not live YouTube data, so popularity is an estimate based on the tier (broad tags are shown
              as 1M+, mid-level as 100K–1M, specific as 10K–100K, with a few obviously huge tags shown as 100M+). Treat
              the ranges as a guide to the mix, not as exact counts.
            </p>
            <p>
              Untick any tag you do not want, then copy the selection as one line, copy it as a caption block with spacer
              lines above it, or download a CSV. The tool does not check live trends or whether a tag is restricted, so
              always read the set before you publish it.
            </p>
          </>
        ),
      },
      {
        title: "How many hashtags should I use on YouTube?",
        body: (
          <>
            <p>
              Use 3 to 5 hashtags on a YouTube video. YouTube shows the first 3 from your description above or below the
              title, and a video with more than 60 hashtags has all of its hashtags ignored, so there is no benefit to
              piling on more.
            </p>
            <ul>
              <li>Start with 3 to 5 tags that describe the video exactly.</li>
              <li>Keep the most important tags first, since only the first 3 surface near the title.</li>
              <li>Stop well below 60; past that, YouTube ignores every hashtag on the video.</li>
            </ul>
          </>
        ),
      },
      {
        title: "Where do hashtags go on YouTube?",
        body: (
          <>
            <p>
              Put hashtags in your <Link href="/tools/youtube-description-generator">video description</Link>, usually at the end after your summary and links. You can also add
              them to the title, but the description is the cleaner place. The first 3 hashtags from the description
              appear above or below the title, so put the tags you most want viewers to see in those first three slots.
            </p>
            <ul>
              <li>Keep the first 3 description hashtags the ones you want shown near the title.</li>
              <li>Add the rest after them for search context.</li>
              <li>Do not stuff the title with hashtags; it weakens the click.</li>
            </ul>
          </>
        ),
      },
      {
        title: "Hashtags vs tags on YouTube: what is the difference?",
        body: (
          <>
            <p>
              Hashtags are the <code>#words</code> you write in your title or description. Tags are the separate keyword
              field in YouTube Studio, limited to 500 characters, that YouTube says is mainly useful for common
              misspellings and variations. Hashtags are visible to viewers; tags are not.
            </p>
            <ul>
              <li>Use hashtags in the description for visible context and the first-3 display.</li>
              <li>
                Use the tag field for variations and misspellings of your topic, built with the{" "}
                <Link href="/tools/youtube-tag-generator">YouTube tag generator</Link>.
              </li>
              <li>Neither replaces a clear title and a video that matches what viewers search for.</li>
            </ul>
          </>
        ),
      },
      {
        title: "Do hashtags help YouTube Shorts?",
        body: (
          <>
            <p>
              Yes, in the same way as for regular videos. Put 3 to 5 relevant hashtags in the Shorts description; the
              first 3 from the description can appear near the title. The same 60-hashtag rule applies, so a wall of tags
              does not add reach. For Shorts, one or two highly specific tags plus a broad one usually describe the clip
              best.
            </p>
          </>
        ),
      },
      {
        title: "Example: a small set for a fitness video",
        body: (
          <>
            <p>
              For a video about a simple home workout, the Fitness niche with 3 tags, a Balanced mix and the extra
              keyword &ldquo;home workout&rdquo; gives a starting point like this:
            </p>
            <div className={t.example}>
              <p>#homeworkout #fitness #workout</p>
            </div>
            <p>
              Before publishing, drop any tag the video does not cover. What is left is a short set that describes the
              video, and the title and description say the topic in plain words.
            </p>
          </>
        ),
      },
    ],
  },
  faqTitle: "YouTube hashtag questions",
  faqs: [
    {
      q: "How many hashtags should I use on YouTube?",
      a: "Use 3 to 5 hashtags on a YouTube video. YouTube shows the first 3 from your description above or below the title, and a video with more than 60 hashtags has all of its hashtags ignored. This generator lets you copy between 1 and 15 hashtags at once.",
    },
    {
      q: "Where do hashtags go on YouTube?",
      a: "Put them in your video description, usually at the end after your summary and links. The first 3 hashtags from the description appear above or below the title, so put the tags you most want shown in those first three slots. You can also add them to the title, but the description is the cleaner place.",
    },
    {
      q: "Do hashtags help YouTube Shorts?",
      a: "Yes, in the same way as for regular videos. Put 3 to 5 relevant hashtags in the Shorts description; the first 3 from the description can appear near the title. The same 60-hashtag rule applies, so one or two highly specific tags plus a broad one usually describe a Short best.",
    },
    {
      q: "Are the popularity numbers real YouTube counts?",
      a: "No. This tool runs in your browser and uses estimated bands, not live YouTube data, so popularity is an estimated range based on each tag's size tier (for example 1M+ for broad tags). The tool also does not check live trends; read the set before you publish it.",
    },
    {
      q: "Does this generator work offline in my browser?",
      a: "Yes. The generator builds your set and copies it in your browser without uploading your keyword, using AI or scraping YouTube. Choose Copy selected to copy the set, or select the plain text if clipboard access is unavailable.",
    },
    {
      q: "What is the difference between hashtags and tags on YouTube?",
      a: "Hashtags are the #words you write in your title or description and are visible to viewers. Tags are the separate 500-character keyword field in YouTube Studio, which YouTube says is mainly useful for common misspellings and variations. Use hashtags in the description and build the tag field with the YouTube tag generator.",
    },
  ],
  related: [
    "/tools/youtube-tag-generator",
    "/tools/youtube-description-generator",
    "/tools/youtube-title-generator",
    "/tools/best-time-to-post-on-youtube",
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
    text: "Connect YouTube with its official login, plan your uploads on one calendar and publish them automatically with Poskoo's YouTube scheduler.",
  },
};

export const metadata = toolMetadata(config);

export default function YouTubeHashtagGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <HashtagGenerator platform="youtube" />
    </ToolPageTemplate>
  );
}
