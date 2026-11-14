import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import HashtagGenerator from "../instagram-hashtag-generator/HashtagGenerator";

const config: ToolPageConfig = {
  path: "/tools/pinterest-hashtag-generator",
  name: "Pinterest hashtag generator",
  crumb: "Pinterest hashtag generator",
  title: "Pinterest Hashtag Generator: Free Tags for Pins (2026)",
  description:
    "Free Pinterest hashtag generator: pick your niche and get 2-5 relevant hashtags for Pin descriptions, with a 500-character limit note. No signup needed.",
  pill: "Free · no signup · no AI or scraping",
  h1: { before: "Pinterest hashtag generator:", mark: "free hashtags", after: "for your Pins" },
  lede: "Pinterest hashtags still work, but they are optional: keywords in your Pin title and description matter most, and 2 to 5 specific tags at the end of the description are plenty. Pick your niche, choose how broad or specific the mix should be, and copy a clean set of 1 to 10 hashtags for your Pin descriptions. Hand-curated tags, generated in your browser.",
  art: "hashtag",
  artLabel: "A creator pins colourful hashtag cards to a board above a laptop showing a Pinterest Pin",
  heroPoints: ["15 niches", "1–10 tags", "Copy, caption block or CSV"],
  toolTitle: "Generate your Pinterest hashtag set",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate Pinterest hashtags",
  steps: [
    {
      title: "Pick your niche",
      text: "Choose the niche closest to your Pin, from food and travel to fashion, home and small business. Each niche has its own hand-picked tag list.",
      art: "hashtag",
    },
    {
      title: "Set the count and mix",
      text: "Slide between 1 and 10 tags, then choose Balanced, More broad or More specific. Add an optional keyword such as your brand or city.",
      art: "writing",
    },
    {
      title: "Review, copy and pin",
      text: "Untick anything that does not describe the Pin, then copy the selection, copy it as a caption block or download a CSV.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Hashtags that describe the Pin, not filler",
  features: [
    {
      title: "A planner, not a plain list",
      text: "Every tag shows its tier, an estimated popularity range and competition, so you can see the mix before you copy it.",
      art: "hashtag",
    },
    {
      title: "Your keyword, added cleanly",
      text: "Type a brand, product or city and the tool adds it as one combined tag, plus the first word of a phrase.",
      art: "writing",
    },
    {
      title: "Private and repeatable",
      text: "Sets are built from a fixed list in your browser. Nothing is uploaded, no AI is used and the same settings give the same set.",
      art: "legal",
    },
  ],
  guide: {
    title: "A practical guide to Pinterest hashtags in 2026",
    intro:
      "Hashtags are labels. On Pinterest they add context to a Pin description, but they are not the main way people find Pins. Here is how this generator works and how to use its sets well.",
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
              estimated bands, not live Pinterest data, so popularity is an estimate based on the tier (broad tags are shown
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
        title: "How many hashtags should I use on Pinterest?",
        body: (
          <>
            <p>
              Pinterest descriptions allow 500 characters, and hashtags are optional. Use 2 to 5 specific tags at the end
              of the description; Pinterest search mostly uses your title and description keywords, so the words in your
              Pin do more work than the tags. This generator lets you copy between 1 and 10 tags at once.
            </p>
            <ul>
              <li>Start with 2 to 5 tags that describe the Pin exactly.</li>
              <li>Add more only when each one is still relevant to this Pin.</li>
              <li>A long hashtag block reads as filler and can dilute the ones that matter.</li>
            </ul>
          </>
        ),
      },
      {
        title: "Do hashtags work on Pinterest?",
        body: (
          <>
            <p>
              Yes, as context. Pinterest search reads the Pin title and description first, so name the topic in plain words
              and use a few relevant hashtags to add context. Hashtags do not rescue a weak Pin, but they help the right
              people find it when they search a tag.
            </p>
            <ul>
              <li>Use tags that match the Pin, not just popular ones.</li>
              <li>Keep the title and description strong; hashtags are the supporting detail.</li>
              <li>Rotate sets per topic so the same block is not on every Pin.</li>
            </ul>
          </>
        ),
      },
      {
        title: "Where should hashtags go in a Pin description?",
        body: (
          <p>
            Put hashtags at the end of the Pin description, after your main message and call to action. Pinterest shows the
            first lines of the description in the feed, so keeping the tags at the end leaves the opening clean for readers
            and keeps the keywords near the top where search reads them.
          </p>
        ),
      },
      {
        title: "Pinterest vs Instagram hashtags",
        body: (
          <>
            <p>
              The two platforms reward different lengths. Instagram allows up to 30 hashtags per post and many creators
              use a full block, while Pinterest works best with 2 to 5 relevant tags, since the title and description carry
              the search weight. The same niche set can be used on both: copy the full set for Instagram and the top 2 to 5
              for Pinterest.
            </p>
            <ul>
              <li>For Pinterest, keep it to 2 to 5 tags at the end of the description.</li>
              <li>For Instagram, a larger mixed set is acceptable; build it with the{" "}
                <Link href="/tools/instagram-hashtag-generator">Instagram hashtag generator</Link>.</li>
              <li>Keep the tags relevant to the Pin on both platforms; reach comes from the content, not the count.</li>
            </ul>
          </>
        ),
      },
      {
        title: "Check the Pin before you schedule it",
        body: (
          <>
            <p>
              Hashtags are only one part of a Pin. Write the description with the{" "}
              <Link href="/tools/pinterest-description-generator">Pinterest description generator</Link>, check the
              title, description and alt text limits with the{" "}
              <Link href="/tools/pinterest-character-counter">Pinterest character counter</Link>, and make sure the
              image fits the feed with the{" "}
              <Link href="/tools/pinterest-pin-size-checker">Pinterest pin size checker</Link>. When the Pin is ready,
              the <Link href="/pinterest-scheduler">Pinterest scheduler</Link> publishes it at the time you pick.
            </p>
          </>
        ),
      },
      {
        title: "Example: a small set for a recipe Pin",
        body: (
          <>
            <p>
              For a Pin about a simple weeknight pasta recipe, the Food niche with 5 tags, a Balanced mix and the extra
              keyword &ldquo;easy pasta&rdquo; gives a starting point like this:
            </p>
            <div className={t.example}>
              <p>#easypasta #food #recipe #pasta #weeknightdinner</p>
            </div>
            <p>
              Before posting, drop any tag the Pin does not cover. What is left is a short set that describes the Pin,
              and the title and description say the topic in plain words.
            </p>
          </>
        ),
      },
    ],
  },
  faqTitle: "Pinterest hashtag questions",
  faqs: [
    {
      q: "How many hashtags should I use on Pinterest?",
      a: "Pinterest descriptions allow 500 characters, and hashtags are optional. Use 2 to 5 specific tags at the end of the description; Pinterest search mostly uses your title and description keywords, so start with tags that describe the Pin exactly and add more only when each one is still relevant. This generator lets you copy between 1 and 10 hashtags at once.",
    },
    {
      q: "Where do hashtags go in a Pin description?",
      a: "Put them at the end of the description, after your main message and call to action. Pinterest shows the first lines of the description in the feed, so keeping the tags at the end leaves the opening clean for readers and keeps the keywords near the top where search reads them.",
    },
    {
      q: "Do Pinterest hashtags still help reach?",
      a: "Yes, as context. Pinterest search reads the Pin title and description first, so name the topic in plain words and use a few relevant hashtags to add context. Hashtags do not rescue a weak Pin, but they help the right people find it when they search a tag.",
    },
    {
      q: "Are the popularity numbers real Pinterest counts?",
      a: "No. This tool runs in your browser and uses estimated bands, not live Pinterest data, so popularity is an estimated range based on each tag's size tier (for example 1M+ for broad tags). The tool also does not check live trends; read the set before you post it.",
    },
    {
      q: "Does this generator work offline in my browser?",
      a: "Yes. The generator builds your set and copies it in your browser without uploading your keyword, using AI or scraping Pinterest. Choose Copy selected to copy the set, or select the plain text if clipboard access is unavailable.",
    },
    {
      q: "How do I find the best time to post on Pinterest?",
      a: "Use the best time to post on Pinterest finder to get three starting slots for your audience and time zone, then test them for two weeks and keep what works.",
    },
  ],
  related: [
    "/tools/pinterest-description-generator",
    "/tools/pinterest-character-counter",
    "/tools/pinterest-pin-size-checker",
    "/pinterest-scheduler",
  ],
  schema: {
    features: [
      "Hand-curated hashtag sets for 15 niches",
      "Broad, mid-level and specific tag tiers",
      "Choose 1 to 10 hashtags",
      "Optional custom keyword tag",
      "Estimated popularity range, tier and competition per tag",
      "Copy selected tags, copy as a caption block or download CSV",
      "One-click copy, no signup",
    ],
  },
  cta: {
    title: "Your hashtags are ready.",
    mark: "Schedule the Pin.",
    text: "Connect Pinterest with its official login, plan your Pins on one calendar and publish them automatically with Poskoo's Pinterest scheduler.",
  },
};

export const metadata = toolMetadata(config);

export default function PinterestHashtagGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <HashtagGenerator platform="pinterest" />
    </ToolPageTemplate>
  );
}
