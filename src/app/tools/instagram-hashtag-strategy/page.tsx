import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import HashtagStrategyWorksheet from "./HashtagStrategyWorksheet";

const config: ToolPageConfig = {
  path: "/tools/instagram-hashtag-strategy",
  name: "Instagram hashtag strategy worksheet",
  crumb: "Hashtag strategy worksheet",
  title: "Instagram Hashtag Strategy Worksheet: Plan Tag Sets",
  description:
    "Free Instagram hashtag strategy worksheet: sort tags into broad, niche and branded tiers, save named sets in your browser and copy one into any caption.",
  pill: "Free · no signup · saved in your browser",
  h1: { before: "Instagram hashtag strategy", mark: "worksheet", after: "for reusable tag sets" },
  lede: "Sort your hashtags into broad, niche and branded tiers, save each mix under a name, and copy the right set when you are ready to post.",
  art: "hashtag",
  artLabel: "A creator juggles colourful hashtag balloons above a phone showing an Instagram post",
  heroPoints: ["3 tag tiers", "Named, saved sets", "No signup"],
  toolTitle: "Build and save your hashtag sets",
  toolNote: "Free · sets stay in this browser",
  stepsTitle: "How to use the Instagram hashtag strategy worksheet",
  steps: [
    {
      title: "Fill the three tiers",
      text: "Type or paste tags into Broad tags, Niche tags and Branded tags. Separate them with spaces, commas or new lines; the # is optional.",
      art: "hashtag",
    },
    {
      title: "Name and save the set",
      text: "Give the mix a name in Set name, such as \"Bakery: weekend specials\", and press Save set. It appears under Saved sets in this browser.",
      art: "writing",
    },
    {
      title: "Select, copy and post",
      text: "Click a saved set to see every tag with a # added, press Copy selected, then paste it into your caption or a scheduled first comment.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "A hashtag plan you can reuse, not retype",
  features: [
    {
      title: "Three tiers keep sets balanced",
      text: "Separate fields for broad, niche and branded tags make it obvious when a set leans too heavily on huge generic hashtags.",
      art: "hashtag",
    },
    {
      title: "Named sets for every topic",
      text: "Save as many sets as you need, one per content pillar, product or location, and see the tag count for each at a glance.",
      art: "feat-calendar",
    },
    {
      title: "Private by design",
      text: "Sets are stored in your browser's local storage on this device. Nothing is uploaded and there is no account to create.",
      art: "analytics",
    },
  ],
  guide: {
    title: "How to build an Instagram hashtag strategy in 2026",
    intro:
      "A hashtag strategy is simply a short list of tag sets you trust, matched to the kinds of posts you make. This worksheet helps you write those sets down once, keep them organised and reuse them without copying from old captions.",
    sections: [
      {
        title: "What the worksheet does",
        body: (
          <>
            <p>
              The worksheet has three inputs: <b>Broad tags</b>, <b>Niche tags</b> and <b>Branded tags</b>. It cleans
              what you type (splitting on spaces, commas and new lines and removing extra # signs), counts the tags in your
              draft, and saves the three tiers together under the name you choose.
            </p>
            <p>
              When you select a saved set, it shows the tags in order (broad, then niche, then branded) with a # in front
              of each, ready to copy. Sets live in your browser&apos;s local storage, so they are still there next visit on
              the same device, but clearing site data or switching browsers removes them. The worksheet does not check
              popularity or whether a tag is restricted.
            </p>
          </>
        ),
      },
      {
        title: "The three tiers explained",
        body: (
          <ul>
            <li>
              <b>Broad tags</b> name the general topic, such as <code>#fitness</code> or <code>#smallbusiness</code>.
              They describe the subject but are crowded, so keep them few.
            </li>
            <li>
              <b>Niche tags</b> name a specific audience, location or product, such as{" "}
              <code>#denverpersonaltrainer</code>. These are usually the most useful part of a set because they match what
              a smaller, interested audience follows or searches.
            </li>
            <li>
              <b>Branded tags</b> are your own campaign or community tags. Use them to collect posts from customers or
              group a launch, not to chase reach.
            </li>
          </ul>
        ),
      },
      {
        title: "Hashtag best practices for 2026",
        body: (
          <>
            <ul>
              <li>
                <b>Relevance first.</b> Every tag should describe the post it sits on. A popular tag that does not match
                brings nobody useful.
              </li>
              <li>
                <b>Fewer, better tags.</b> Instagram&apos;s publishing API documents a maximum of 30 hashtags per post.
                Treat that as a ceiling; a focused set of a handful of tags is easier to review and keeps the caption
                readable.
              </li>
              <li>
                <b>Say the topic in words too.</b> Instagram search reads captions, so name the subject plainly in the
                first lines instead of hiding it in hashtags.
              </li>
              <li>
                <b>Rotate and tweak.</b> Keep two or three sets per topic and swap a few tags per post rather than pasting
                an identical block for months.
              </li>
            </ul>
            <p>
              Need ideas to fill a tier? Start with the{" "}
              <Link href="/tools/instagram-hashtag-generator">hashtag generator</Link>, then keep only the tags that fit.
            </p>
          </>
        ),
      },
      {
        title: "Example: a saved set for a local bakery",
        body: (
          <>
            <p>
              A bakery might type <code>bakery, pastry</code> into Broad tags, <code>#austinbakery #austinfood
              sourdoughaustin</code> into Niche tags and <code>#crumbandcoaustin</code> into Branded tags, then save it as
              &ldquo;Austin bakery: weekend&rdquo;. Selecting the set shows:
            </p>
            <div className={t.example}>
              <p>#bakery #pastry #austinbakery #austinfood #sourdoughaustin #crumbandcoaustin</p>
            </div>
            <p>
              Six tags: two broad, three niche and one branded. Before each post, drop any tag the photo does not show and
              add one that does, for example a specific product.
            </p>
          </>
        ),
      },
      {
        title: "Common hashtag strategy mistakes",
        body: (
          <ul>
            <li>Filling all 30 slots because the limit allows it.</li>
            <li>Only using broad tags, with no niche or location tags at all.</li>
            <li>Never opening a tag&apos;s page to check it is active and on-topic.</li>
            <li>Keeping sets only in this browser and losing them when site data is cleared. Copy important sets somewhere safe too.</li>
            <li>
              Forgetting the rest of the caption. Check length and tag count with the{" "}
              <Link href="/tools/instagram-caption-counter">caption counter</Link>, then{" "}
              <Link href="/instagram-scheduler">schedule the post</Link> with the set as a first comment.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram hashtag strategy questions",
  faqs: [
    {
      q: "How many hashtags should I use on Instagram?",
      a: "Use only tags that genuinely describe the post. Instagram's publishing API documents a maximum of 30 hashtags per post, but that is a ceiling, not a target. A smaller, focused set is easier to review and keeps the caption readable.",
    },
    {
      q: "How should I organize Instagram hashtag sets?",
      a: "Group tags into three tiers: broad tags for the general topic, niche tags for your specific audience or location, and branded tags for your own campaign or community. Save each mix as a named set, then swap a few tags for each new post instead of starting from scratch.",
    },
    {
      q: "Does this worksheet guarantee hashtag reach?",
      a: "No. Hashtag reach is not guaranteed. Tags help people who follow or search a topic find a post, but Instagram decides what to show. The worksheet does not check tag popularity or restrictions, so review every tag before posting.",
    },
    {
      q: "Where are my saved hashtag sets stored?",
      a: "Saved sets are stored in your browser's local storage on this device. They are not uploaded to a server. Clearing your browser's site data removes them, and they do not sync to other browsers or devices.",
    },
    {
      q: "Can I copy a saved set into a caption?",
      a: "Yes. Select a saved set and press Copy selected to put the tags on your clipboard with a # in front of each. If clipboard access is blocked, the tags are shown on screen so you can select and copy them manually.",
    },
  ],
  related: [
    "/tools/instagram-hashtag-generator",
    "/tools/instagram-caption-counter",
    "/tools/instagram-caption-formatter",
    "/tools/instagram-caption-generator",
    "/tools/instagram-post-ideas-generator",
  ],
  schema: {
    features: [
      "Broad, niche and branded hashtag tiers",
      "Save named hashtag sets in the browser",
      "Live tag count per set",
      "Copy a set with # added to each tag",
      "No signup, nothing uploaded",
    ],
  },
  cta: {
    title: "Your tag sets are planned.",
    mark: "Schedule the post.",
    text: "Paste a set as a first comment, schedule the post with Poskoo, and DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramHashtagStrategyPage() {
  return (
    <ToolPageTemplate config={config}>
      <HashtagStrategyWorksheet />
    </ToolPageTemplate>
  );
}
