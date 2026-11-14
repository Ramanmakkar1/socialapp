import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import HashtagGenerator from "../instagram-hashtag-generator/HashtagGenerator";

const config: ToolPageConfig = {
  path: "/tools/threads-hashtag-generator",
  name: "Threads hashtag generator",
  crumb: "Threads hashtag generator",
  title: "Threads Hashtag Generator: Free Topic Tag Ideas for Posts",
  description:
    "Free Threads hashtag generator: pick a niche and copy one relevant topic tag for your post, chosen from hand-curated lists in your browser, no signup.",
  pill: "Free · no signup · no AI or scraping",
  h1: { before: "Threads hashtag generator:", mark: "copy one topic tag", after: "for your post" },
  lede: "Threads uses one topic tag per post, not a long hashtag block. Pick your niche, choose the single tag that best describes the conversation, and copy it in one click. Hand-curated tags, generated in your browser.",
  art: "hashtag",
  artLabel: "A creator picks one colourful topic tag above a phone showing a Threads post",
  heroPoints: ["15 niches", "One topic tag", "Copy or CSV"],
  toolTitle: "Generate your Threads topic tag",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate a Threads topic tag",
  steps: [
    {
      title: "Pick your niche",
      text: "Choose the niche closest to your post, from small business and coaching to tech, real estate or local services. Each niche has its own hand-picked tag list.",
      art: "hashtag",
    },
    {
      title: "Choose the one tag",
      text: "Threads allows a single topic tag per post, so the generator returns one tag. Add an optional keyword such as your company name or city to make it specific.",
      art: "writing",
    },
    {
      title: "Review, copy and post",
      text: "Read the tag against your post, then copy it or download a CSV. Paste it into the topic tag field in Threads, or into your Poskoo Threads post.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "One clear topic tag, not a hashtag block",
  features: [
    {
      title: "Built for how Threads works",
      text: "Threads shows one clickable topic tag per post. The generator returns exactly one tag so you never paste a block that Threads will not treat as topics.",
      art: "hashtag",
    },
    {
      title: "Your keyword, added cleanly",
      text: "Type a company, product or city and the tool adds it as one combined tag, plus the first word of a phrase.",
      art: "writing",
    },
    {
      title: "Private and repeatable",
      text: "Sets are built from a fixed list in your browser. Nothing is uploaded, no AI is used and the same settings give the same tag.",
      art: "legal",
    },
  ],
  guide: {
    title: "A practical guide to Threads topic tags in 2026",
    intro:
      "A topic tag is a label that tells Threads and the people browsing that topic what a post is about. Threads allows one per post, so choose the tag that matches the conversation rather than a long list. Here is how this generator works and how to use it well.",
    sections: [
      {
        title: "What this Threads hashtag generator does",
        body: (
          <>
            <p>
              The generator holds a hand-curated list for 15 niches. Each list is split into three editorial tiers:
              <b> broad</b> (general topics such as <code>#smallbusiness</code>), <b>mid-level</b> (a clear sub-topic such as{" "}
              <code>#contentmarketing</code>) and <b>specific</b> (a focused subject such as <code>#emailmarketingtips</code>).
            </p>
            <p>
              Because Threads allows one topic tag per post, the tool returns a single tag. The results table still shows
              that tag&apos;s tier, an <b>estimated popularity range</b> and a competition level. This tool runs entirely in
              your browser and uses estimated bands, not live Threads data, so treat the range as a guide to the tag&apos;s
              size, not an exact count.
            </p>
            <p>
              Copy the tag, copy it as a caption block with spacer lines above it, or download a CSV. The tool does not
              check live trends or whether a tag is restricted, so always read it before you post.
            </p>
          </>
        ),
      },
      {
        title: "How many hashtags should I use on Threads?",
        body: (
          <>
            <p>
              One. Threads uses a single <b>topic tag</b> per post rather than a long hashtag list. Pick the one tag that
              best describes the conversation and let the post text do the rest.
            </p>
            <ul>
              <li>Choose the tag that matches the post exactly, not the most popular one.</li>
              <li>Keep the post text clear; the tag adds context, it does not replace the message.</li>
              <li>Rotate tags per topic so the same tag is not on every post.</li>
            </ul>
          </>
        ),
      },
      {
        title: "Do hashtags work on Threads?",
        body: (
          <>
            <p>
              Yes, as a topic tag. Threads search and topic feeds read the post text first, so name the subject in plain
              words and add one relevant tag. A tag does not rescue a weak post, but it helps the right people find it
              when they browse that topic.
            </p>
            <p>
              A clear question often works better than extra tags. Ask something people can answer from their own
              experience, then reply to the first few comments to keep the thread moving.
            </p>
          </>
        ),
      },
      {
        title: "Where should the topic tag go in a Threads post?",
        body: (
          <p>
            Add the topic tag in the tag field when you compose the post, not buried in the middle of the text. Threads
            keeps the tag separate from the message, so the opening lines stay clean for the feed preview and the tag
            still links to the topic. Check the total length with the{" "}
            <Link href="/tools/threads-character-counter">Threads character counter</Link> before you publish.
          </p>
        ),
      },
      {
        title: "Threads vs Instagram hashtags",
        body: (
          <>
            <p>
              The two platforms reward different lengths. Instagram allows up to 30 hashtags per post and many creators
              use a full block, while Threads uses one topic tag per post. The same niche list can be used on both: copy
              the full set for Instagram and the single best tag for Threads.
            </p>
            <ul>
              <li>For Threads, keep it to one tag that describes the conversation.</li>
              <li>For Instagram, a larger mixed set is acceptable; build it with the{" "}
                <Link href="/tools/instagram-hashtag-generator">Instagram hashtag generator</Link>.</li>
              <li>Keep the tag relevant to the post on both platforms; reach comes from the content, not the count.</li>
            </ul>
          </>
        ),
      },
      {
        title: "Check the post before you schedule it",
        body: (
          <>
            <p>
              A topic tag is only one part of a Threads post. Before you publish, check the whole post with the{" "}
              <Link href="/tools/threads-character-counter">Threads character counter</Link> and see how it looks in the
              feed with the <Link href="/tools/threads-post-preview">Threads post preview</Link>. If you are planning
              ahead, the <Link href="/tools/best-time-to-post-on-threads">best time to post on Threads</Link> finder gives
              you three starting slots, and the <Link href="/threads-scheduler">Threads scheduler</Link> publishes the post
              for you at the time you pick.
            </p>
          </>
        ),
      },
      {
        title: "Example: a topic tag for a small-business post",
        body: (
          <>
            <p>
              For a post about a simple email marketing setup, the Small business niche with a Balanced mix and the extra
              keyword &ldquo;email marketing&rdquo; gives a starting point like this:
            </p>
            <div className={t.example}>
              <p>#emailmarketing</p>
            </div>
            <p>
              Before posting, check the tag still describes the post and that the text says the topic in plain words.
              What is left is one clear tag that fits the conversation.
            </p>
          </>
        ),
      },
    ],
  },
  faqTitle: "Threads hashtag questions",
  faqs: [
    {
      q: "How many hashtags should I use on Threads?",
      a: "One. Threads uses a single topic tag per post rather than a long hashtag list. Pick the one tag that best describes the conversation and let the post text do the rest. This generator returns exactly one tag for that reason.",
    },
    {
      q: "Do hashtags work on Threads?",
      a: "Yes, as a topic tag. Threads search and topic feeds read the post text first, so name the subject in plain words and add one relevant tag. A tag does not rescue a weak post, but it helps the right people find it when they browse that topic.",
    },
    {
      q: "Where does the topic tag go in a Threads post?",
      a: "Add it in the topic tag field when you compose the post, not buried in the middle of the text. Threads keeps the tag separate from the message, so the opening lines stay clean for the feed preview and the tag still links to the topic.",
    },
    {
      q: "Are the popularity numbers real Threads counts?",
      a: "No. This tool runs in your browser and uses estimated bands, not live Threads data, so popularity is an estimated range based on each tag's size tier. The tool also does not check live trends; read the tag before you post it.",
    },
    {
      q: "Does this generator work offline in my browser?",
      a: "Yes. The generator builds your tag and copies it in your browser without uploading your keyword, using AI or scraping Threads. Choose Copy selected to copy the tag, or select the plain text if clipboard access is unavailable.",
    },
    {
      q: "How long can a Threads post be?",
      a: "A Threads post can be up to 500 characters, including spaces, line breaks, links and the topic tag. Check the total with the Threads character counter before you publish.",
    },
    {
      q: "How do I find the best time to post on Threads?",
      a: "Use the best time to post on Threads finder to get three starting slots for your audience and time zone, then test them for two weeks and keep what works.",
    },
  ],
  related: [
    "/tools/threads-character-counter",
    "/tools/threads-post-preview",
    "/tools/best-time-to-post-on-threads",
    "/tools/threads-post-generator",
  ],
  schema: {
    features: [
      "Hand-curated hashtag sets for 15 niches",
      "One topic tag per post, matching how Threads works",
      "Broad, mid-level and specific tag tiers",
      "Optional custom keyword tag",
      "Estimated popularity range, tier and competition",
      "Copy the tag, copy as a caption block or download CSV",
      "One-click copy, no signup",
    ],
  },
  cta: {
    title: "Your topic tag is ready.",
    mark: "Schedule the post.",
    text: "Connect Threads with its official login, plan your posts on one calendar and publish them automatically with Poskoo's Threads scheduler.",
  },
};

export const metadata = toolMetadata(config);

export default function ThreadsHashtagGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <HashtagGenerator platform="threads" />
    </ToolPageTemplate>
  );
}
