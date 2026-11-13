import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import HashtagGenerator from "../instagram-hashtag-generator/HashtagGenerator";

const config: ToolPageConfig = {
  path: "/tools/facebook-hashtag-generator",
  name: "Facebook hashtag generator",
  crumb: "Facebook hashtag generator",
  title: "Facebook Hashtag Generator: Free Hashtags for Posts & Reels",
  description:
    "Free Facebook hashtag generator: pick your niche, mix broad and specific tags and copy 1 to 5 hashtags for your Facebook posts, Reels and Page updates.",
  pill: "Free · no signup · no AI or scraping",
  h1: { before: "Facebook hashtag generator:", mark: "free hashtags", after: "for posts & Reels" },
  lede: "Use 1 to 3 relevant hashtags on Facebook and put them at the end of the post. Pick your niche, choose how broad or specific the mix should be, and copy a clean set of 1 to 5 hashtags for your Facebook posts, Reels and Page updates. Hand-curated tags, generated in your browser.",
  art: "hashtag",
  artLabel: "A creator juggles colourful hashtag balloons above a laptop showing a Facebook post",
  heroPoints: ["15 niches", "1–5 tags", "Copy, caption block or CSV"],
  toolTitle: "Generate your Facebook hashtag set",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate Facebook hashtags",
  steps: [
    {
      title: "Pick your niche",
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
    title: "A practical guide to Facebook hashtags in 2026",
    intro:
      "Hashtags are labels. They tell Facebook and people searching a tag what a post is about. Used well they add context to a good post; they do not rescue a weak one. Here is how this generator works and how to use its sets well.",
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
              estimated bands, not live Facebook data, so popularity is an estimate based on the tier (broad tags are shown
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
        title: "How many hashtags should I use on Facebook?",
        body: (
          <>
            <p>
              Facebook has no hashtag cap, but 1 to 3 relevant hashtags per post works best. A few tags that describe the
              post exactly beat a long wall of loosely related ones, which can look spammy.
            </p>
            <ul>
              <li>Start with 1 to 3 tags that describe the post exactly.</li>
              <li>Add more only when each one is still relevant to this post.</li>
              <li>A long hashtag block reads as filler and can dilute the ones that matter.</li>
            </ul>
          </>
        ),
      },
      {
        title: "Do hashtags work on Facebook?",
        body: (
          <>
            <p>
              Yes, as context. Facebook search reads post text first, so name the topic in plain words and use a few
              relevant hashtags to add context. Hashtags do not rescue a weak post, but they help the right people find
              it when they search a tag, and they make the post discoverable in Reels and public Pages.
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
        title: "Where should hashtags go in a Facebook post?",
        body: (
          <p>
            Put hashtags at the end of the post, after your main message. Facebook has no first-comment discovery the way
            Instagram does, and the post text is what search reads. Keeping the tags at the end leaves the opening lines
            clean for the feed preview, which is what most readers see before tapping See more.
          </p>
        ),
      },
      {
        title: "Facebook vs Instagram hashtags",
        body: (
          <>
            <p>
              The two platforms reward different lengths. Instagram allows up to 30 hashtags per post and many creators
              use a full block, while Facebook works best with 1 to 3 relevant tags, since long blocks look spammy in the
              feed. The same niche set can be used on both: copy the full set for Instagram and the top 1 to 3 for
              Facebook.
            </p>
            <ul>
              <li>For Facebook, keep it to 1 to 3 tags at the end of the post.</li>
              <li>For Instagram, a larger mixed set is acceptable; build it with the{" "}
                <Link href="/tools/instagram-hashtag-generator">Instagram hashtag generator</Link>.</li>
              <li>Keep the tags relevant to the post on both platforms; reach comes from the content, not the count.</li>
            </ul>
          </>
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
    ],
  },
  faqTitle: "Facebook hashtag questions",
  faqs: [
    {
      q: "How many hashtags should I use on Facebook?",
      a: "Facebook has no hashtag cap, but 1 to 3 relevant hashtags per post works best; long blocks can look spammy. Start with tags that describe the post exactly and add more only when each one is still relevant. This generator lets you copy between 1 and 5 hashtags at once.",
    },
    {
      q: "Where do hashtags go in a Facebook post?",
      a: "Put them in the post text, at the end after your main message. Facebook has no first-comment discovery the way Instagram does, and the post text is what search reads. Keeping them at the end leaves the opening lines clean for the feed preview.",
    },
    {
      q: "Do Facebook hashtags still help reach?",
      a: "Yes, as context. Facebook search reads post text first, so name the topic in plain words and use a few relevant hashtags to add context. Hashtags do not rescue a weak post, but they help the right people find it when they search a tag.",
    },
    {
      q: "Are the popularity numbers real Facebook counts?",
      a: "No. This tool runs in your browser and uses estimated bands, not live Facebook data, so popularity is an estimated range based on each tag's size tier (for example 1M+ for broad tags). The tool also does not check live trends; read the set before you post it.",
    },
    {
      q: "Does this generator work offline in my browser?",
      a: "Yes. The generator builds your set and copies it in your browser without uploading your keyword, using AI or scraping Facebook. Choose Copy selected to copy the set, or select the plain text if clipboard access is unavailable.",
    },
    {
      q: "How do I find the best time to post on Facebook?",
      a: "Use the <Link href=\"/tools/best-time-to-post-on-facebook\">best time to post on Facebook</Link> finder to get three starting slots for your audience and time zone, then test them for two weeks and keep what works.",
    },
  ],
  related: [
    "/tools/facebook-character-counter",
    "/tools/facebook-post-preview",
    "/tools/instagram-hashtag-generator",
    "/tools/best-time-to-post-on-facebook",
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
    text: "Connect Facebook with its official login, plan your posts on one calendar and publish them automatically with Poskoo's <Link href=\"/facebook-scheduler\">Facebook scheduler</Link>.",
  },
};

export const metadata = toolMetadata(config);

export default function FacebookHashtagGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <HashtagGenerator platform="facebook" />
    </ToolPageTemplate>
  );
}
