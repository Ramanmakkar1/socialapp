import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import HashtagGenerator from "../instagram-hashtag-generator/HashtagGenerator";

const config: ToolPageConfig = {
  path: "/tools/linkedin-hashtag-generator",
  name: "LinkedIn hashtag generator",
  crumb: "LinkedIn hashtag generator",
  title: "LinkedIn Hashtag Generator: Free Hashtag Sets for Posts",
  description:
    "Free LinkedIn hashtag generator: pick your industry, mix broad and specific tags, add your own keyword and copy 1 to 5 hashtags for your next post.",
  pill: "Free · no signup · no AI or scraping",
  h1: { before: "LinkedIn hashtag generator:", mark: "free hashtag sets", after: "for posts" },
  lede: "LinkedIn posts do best with about 3 to 5 relevant hashtags. Pick your industry, choose how broad or specific the mix should be, and copy a clean set of 1 to 5 hashtags for your next post. Hand-curated tags, generated in your browser.",
  art: "hashtag",
  artLabel: "A professional juggles colourful hashtag balloons above a laptop showing a LinkedIn post",
  heroPoints: ["15 niches", "1–5 tags", "Copy, caption block or CSV"],
  toolTitle: "Generate your LinkedIn hashtag set",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate LinkedIn hashtags",
  steps: [
    {
      title: "Pick your industry",
      text: "Choose the niche closest to your post, from small business and coaching to tech, real estate or local services. Each niche has its own hand-picked tag list.",
      art: "hashtag",
    },
    {
      title: "Set the count and mix",
      text: "Slide between 1 and 5 tags, then choose Balanced, More broad or More specific. Add an optional keyword such as your company name or city.",
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
      text: "Type a company, product or city and the tool adds it as one combined tag, plus the first word of a phrase.",
      art: "writing",
    },
    {
      title: "Private and repeatable",
      text: "Sets are built from a fixed list in your browser. Nothing is uploaded, no AI is used and the same settings give the same set.",
      art: "legal",
    },
  ],
  guide: {
    title: "A practical guide to LinkedIn hashtags in 2026",
    intro:
      "Hashtags are labels. They tell LinkedIn and people searching a tag what a post is about. Used well they add context to a good post; they do not rescue a weak one. Here is how this generator works and how to use its sets well.",
    sections: [
      {
        title: "What this hashtag generator does",
        body: (
          <>
            <p>
              The generator holds a hand-curated list for 15 niches. Each list is split into three editorial tiers:
              <b> broad</b> (general topics such as <code>#smallbusiness</code>), <b>mid-level</b> (a clear sub-topic such as{" "}
              <code>#contentmarketing</code>) and <b>specific</b> (a focused subject such as <code>#emailmarketingtips</code>).
            </p>
            <p>
              Your count and mix decide how many tags come from each tier. The results table shows each tag&apos;s tier, an
              <b> estimated popularity range</b> and a competition level. LinkedIn has no public API for hashtag post
              counts and this tool never scrapes LinkedIn, so popularity is an estimate based on the tier (broad tags are
              shown as 1M+, mid-level as 100K–1M, specific as 10K–100K, with a few obviously huge tags such as{" "}
              <code>#marketing</code> shown as 100M+). Treat the ranges as a guide to the mix, not as exact counts.
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
        title: "How many hashtags to use on LinkedIn",
        body: (
          <>
            <p>
              LinkedIn has no hard hashtag cap, but 3 to 5 relevant hashtags per post works best; more can look spammy.
              A few tags that describe the post exactly beat a long wall of loosely related ones.
            </p>
            <ul>
              <li>Start with 3 to 5 tags that describe the post exactly.</li>
              <li>Add more only when each one is still relevant to this post.</li>
              <li>A wall of 10+ tags reads as filler and can dilute the ones that matter.</li>
            </ul>
          </>
        ),
      },
      {
        title: "How LinkedIn search finds your post",
        body: (
          <ul>
            <li>
              <b>Name the topic in words.</b> LinkedIn search reads post text, so say what the post is about in plain
              words and let hashtags add context.
            </li>
            <li>
              <b>Relevance over reach.</b> A tag that matches the post reaches people who care about the topic. A popular
              tag that does not match brings nobody useful.
            </li>
            <li>
              <b>Mix the tiers.</b> Combine a broad tag with mid-level and specific ones, and add a company, city or
              industry tag when it fits.
            </li>
            <li>
              <b>Rotate sets.</b> Copying the identical block onto every post makes tags less descriptive. Keep two or
              three sets per topic and tweak them per post.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: a small set for a small-business post",
        body: (
          <>
            <p>
              For a post about a simple email marketing setup, the Small business niche with 3 tags, a Balanced mix and
              the extra keyword &ldquo;email marketing&rdquo; gives a starting point like this:
            </p>
            <div className={t.example}>
              <p>#emailmarketing #smallbusiness #marketingtips</p>
            </div>
            <p>
              Before posting, drop any tag the post does not cover. What is left is a short set that describes the post,
              and the text says the topic in plain words.
            </p>
          </>
        ),
      },
      {
        title: "Common LinkedIn hashtag mistakes",
        body: (
          <ul>
            <li>Pasting 10+ tags because the post allows it.</li>
            <li>Using tags that do not describe the post, just because they are popular.</li>
            <li>Pasting the exact same block on every post for months.</li>
            <li>
              Hiding the real topic in hashtags only, instead of saying it in the post text. Check length with the{" "}
              <Link href="/tools/linkedin-character-counter">LinkedIn character counter</Link>.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "LinkedIn hashtag questions",
  faqs: [
    {
      q: "How many hashtags should I use on LinkedIn?",
      a: "LinkedIn has no hard cap, but 3 to 5 relevant hashtags per post works best; more can look spammy. Start with tags that describe the post exactly and add more only when each one is still relevant. This generator lets you copy between 1 and 5 hashtags at once.",
    },
    {
      q: "Where do hashtags go in a LinkedIn post?",
      a: "Put them in the post text, usually at the end after your main message. LinkedIn has no first-comment discovery the way Instagram does, and the post text is what search reads. Keep them after your hook so the first lines stay clean.",
    },
    {
      q: "Do LinkedIn hashtags still help reach?",
      a: "Yes, as context. LinkedIn search reads post text first, so name the topic in plain words and use a few relevant hashtags to add context. Hashtags do not rescue a weak post, but they help the right people find it when they search a tag.",
    },
    {
      q: "Are the popularity numbers real LinkedIn counts?",
      a: "No. LinkedIn has no public API for hashtag post counts and this tool never scrapes LinkedIn, so popularity is an estimated range based on each tag's size tier (for example 1M+ for broad tags). The tool also does not check live trends; read the set before you post it.",
    },
    {
      q: "Does this generator work offline in my browser?",
      a: "Yes. The generator builds your set and copies it in your browser without uploading your keyword, using AI or scraping LinkedIn. Choose Copy selected to copy the set, or select the plain text if clipboard access is unavailable.",
    },
    {
      q: "How do I find the best time to post on LinkedIn?",
      a: "Use the <Link href=\"/tools/best-time-to-post-on-linkedin\">best time to post on LinkedIn</Link> finder to get three starting slots for your audience and time zone, then test them for two weeks and keep what works.",
    },
  ],
  related: [
    "/tools/linkedin-character-counter",
    "/tools/linkedin-post-preview",
    "/tools/linkedin-text-formatter",
    "/tools/best-time-to-post-on-linkedin",
  ],
  schema: {
    features: [
      "Hand-curated hashtag sets for 15 niches",
      "Broad, mid-level and specific tag tiers",
      "Choose 1 to 5 hashtags",
      "Optional custom keyword tag",
      "Estimated popularity range, tier and competition per tag",
      "Copy selected tags, copy as a caption block or download CSV",
      "One-click copy, no signup",
    ],
  },
  cta: {
    title: "Your hashtags are ready.",
    mark: "Schedule the post.",
    text: "Connect LinkedIn with its official login, plan your posts on one calendar and publish them automatically with Poskoo's <Link href=\"/linkedin-scheduler\">LinkedIn scheduler</Link>.",
  },
};

export const metadata = toolMetadata(config);

export default function LinkedInHashtagGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <HashtagGenerator platform="linkedin" />
    </ToolPageTemplate>
  );
}
