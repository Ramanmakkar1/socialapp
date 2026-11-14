import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import HashtagGenerator from "../instagram-hashtag-generator/HashtagGenerator";

const config: ToolPageConfig = {
  path: "/tools/x-hashtag-generator",
  name: "X (Twitter) hashtag generator",
  crumb: "X (Twitter) hashtag generator",
  title: "X Hashtag Generator: Free Twitter Hashtags for Posts",
  description:
    "Free X (Twitter) hashtag generator: pick your niche, add your keyword and copy 1 to 3 relevant hashtags that fit the 280-character limit. No signup.",
  pill: "Free · no signup · no AI or scraping",
  h1: { before: "X (Twitter) hashtag generator:", mark: "copy 1 to 3 tags", after: "that fit 280 characters" },
  lede: "Use 1 to 2 relevant hashtags per X post; each one counts toward the 280-character limit. Pick your niche, choose how broad or specific the mix should be, and copy a clean set of 1 to 3 hashtags for your X posts. Hand-curated tags, generated in your browser.",
  art: "hashtag",
  artLabel: "A creator juggles colourful hashtag balloons above a laptop showing an X post",
  heroPoints: ["15 niches", "1–3 tags", "Copy, caption block or CSV"],
  toolTitle: "Generate your X hashtag set",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate X hashtags",
  steps: [
    {
      title: "Pick your niche",
      text: "Choose the niche closest to your post, from small business and coaching to tech, real estate or local services. Each niche has its own hand-picked tag list.",
      art: "hashtag",
    },
    {
      title: "Set the count and mix",
      text: "Slide between 1 and 3 tags, then choose Balanced, More broad or More specific. Add an optional keyword such as your company name or city.",
      art: "writing",
    },
    {
      title: "Review, copy and post",
      text: "Untick anything that does not describe the post, then copy the selection, copy it as a caption block or download a CSV. Check the total against the 280-character limit before you post.",
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
    title: "A practical guide to X hashtags in 2026",
    intro:
      "Hashtags are labels. They tell X and people searching a tag what a post is about. Used well they add context to a good post; they do not rescue a weak one. Here is how this generator works and how to use its sets well.",
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
              <b> estimated popularity range</b> and a competition level. This tool runs entirely in your browser and uses
              estimated bands, not live X data, so popularity is an estimate based on the tier (broad tags are shown
              as 1M+, mid-level as 100K–1M, specific as 10K–100K, with a few obviously huge tags shown as 100M+). Treat
              the ranges as a guide to the mix, not as exact counts.
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
        title: "How many hashtags should I use on X?",
        body: (
          <>
            <p>
              X has no official hashtag cap, but 1 to 2 relevant hashtags per post works best. Every hashtag counts toward
              the 280-character limit, so each tag you add takes room from your message.
            </p>
            <ul>
              <li>Start with 1 to 2 tags that describe the post exactly.</li>
              <li>Add a third only when it is clearly relevant and the post still fits in 280 characters.</li>
              <li>A long hashtag block reads as filler and eats characters you need for the message.</li>
            </ul>
          </>
        ),
      },
      {
        title: "Do hashtags work on X?",
        body: (
          <>
            <p>
              Yes, as context. X search reads post text first, so name the topic in plain words and use a few relevant
              hashtags to add context. Hashtags do not rescue a weak post, but they help the right people find it when
              they search a tag, and they make the post discoverable in topic feeds.
            </p>
            <ul>
              <li>Use tags that match the post, not just popular ones.</li>
              <li>Keep the post text strong; hashtags are the supporting detail.</li>
              <li>Rotate sets per topic so the same block is not on every post.</li>
            </ul>
          </>
        ),
      },
      {
        title: "Where should hashtags go in an X post?",
        body: (
          <p>
            Put hashtags at the end of the post, after your main message. X has no first-comment discovery the way
            Instagram does, and the post text is what search reads. Keeping the tags at the end leaves the opening lines
            clean for the feed preview, which is what most readers see before tapping the post.
          </p>
        ),
      },
      {
        title: "X vs Instagram hashtags",
        body: (
          <>
            <p>
              The two platforms reward different lengths. Instagram allows up to 30 hashtags per post and many creators
              use a full block, while X works best with 1 to 2 relevant tags, since every hashtag counts toward the
              280-character limit. The same niche set can be used on both: copy the full set for Instagram and the top
              1 to 2 for X.
            </p>
            <ul>
              <li>For X, keep it to 1 to 2 tags at the end of the post.</li>
              <li>For Instagram, a larger mixed set is acceptable; build it with the{" "}
                <Link href="/tools/instagram-hashtag-generator">Instagram hashtag generator</Link>.</li>
              <li>Keep the tags relevant to the post on both platforms; reach comes from the content, not the count.</li>
            </ul>
          </>
        ),
      },
      {
        title: "Check the post before you schedule it",
        body: (
          <>
            <p>
              Hashtags are only one part of an X post. Before you publish, check the whole post with the{" "}
              <Link href="/tools/x-character-counter">X character counter</Link> and see how it looks in the feed with the{" "}
              <Link href="/tools/x-post-preview">X post preview</Link>. If you are planning ahead, the{" "}
              <Link href="/tools/best-time-to-post-on-x">best time to post on X</Link> finder gives you three starting
              slots, and the <Link href="/x-scheduler">X scheduler</Link> publishes the post for you at the time you pick.
            </p>
          </>
        ),
      },
      {
        title: "Example: a small set for a small-business post",
        body: (
          <>
            <p>
              For a post about a simple email marketing setup, the Small business niche with 2 tags, a Balanced mix and
              the extra keyword &ldquo;email marketing&rdquo; gives a starting point like this:
            </p>
            <div className={t.example}>
              <p>#emailmarketing #smallbusiness</p>
            </div>
            <p>
              Before posting, drop any tag the post does not cover and check the total against 280 characters with the{" "}
              <Link href="/tools/x-character-counter">X character counter</Link>. What is left is a short set that
              describes the post, and the text says the topic in plain words.
            </p>
          </>
        ),
      },
    ],
  },
  faqTitle: "X hashtag questions",
  faqs: [
    {
      q: "How many hashtags should I use on X?",
      a: "X has no official hashtag cap, but 1 to 2 relevant hashtags per post works best; every hashtag counts toward the 280-character limit. Start with tags that describe the post exactly and add a third only when it is clearly relevant and the post still fits. This generator lets you copy between 1 and 3 hashtags at once.",
    },
    {
      q: "Where do hashtags go in an X post?",
      a: "Put them in the post text, at the end after your main message. X has no first-comment discovery the way Instagram does, and the post text is what search reads. Keeping them at the end leaves the opening lines clean for the feed preview.",
    },
    {
      q: "Do X hashtags still help reach?",
      a: "Yes, as context. X search reads post text first, so name the topic in plain words and use a few relevant hashtags to add context. Hashtags do not rescue a weak post, but they help the right people find it when they search a tag.",
    },
    {
      q: "Are the popularity numbers real X counts?",
      a: "No. This tool runs in your browser and uses estimated bands, not live X data, so popularity is an estimated range based on each tag's size tier (for example 1M+ for broad tags). The tool also does not check live trends; read the set before you post it.",
    },
    {
      q: "Does this generator work offline in my browser?",
      a: "Yes. The generator builds your set and copies it in your browser without uploading your keyword, using AI or scraping X. Choose Copy selected to copy the set, or select the plain text if clipboard access is unavailable.",
    },
    {
      q: "Do hashtags count toward the 280-character limit?",
      a: "Yes. Every hashtag, including the # symbol, counts toward the 280-character limit on a free X account. A short tag such as #smallbusiness uses 14 characters, so 1 to 2 tags leave most of the post for your message. Check the total with the X character counter before you post.",
    },
    {
      q: "How do I find the best time to post on X?",
      a: "Use the best time to post on X finder to get three starting slots for your audience and time zone, then test them for two weeks and keep what works.",
    },
  ],
  related: [
    "/tools/x-character-counter",
    "/tools/x-post-preview",
    "/tools/best-time-to-post-on-x",
  ],
  schema: {
    features: [
      "Hand-curated hashtag sets for 15 niches",
      "Broad, mid-level and specific tag tiers",
      "Choose 1 to 3 hashtags",
      "Optional custom keyword tag",
      "Estimated popularity range, tier and competition per tag",
      "Copy selected tags, copy as a caption block or download CSV",
      "One-click copy, no signup",
    ],
  },
  cta: {
    title: "Your hashtags are ready.",
    mark: "Schedule the post.",
    text: "Connect X with its official login, plan your posts on one calendar and publish them automatically with Poskoo's X scheduler.",
  },
};

export const metadata = toolMetadata(config);

export default function XHashtagGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <HashtagGenerator platform="x" />
    </ToolPageTemplate>
  );
}
