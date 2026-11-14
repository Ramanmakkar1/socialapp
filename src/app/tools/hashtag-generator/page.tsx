import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import HashtagPicker from "./HashtagPicker";
import { HASHTAG_PLATFORMS, PLATFORM, type HashtagPlatform } from "../instagram-hashtag-generator/platforms";

type Row = { key: HashtagPlatform; label: string; href: string; recommended: string };

// Pinterest is included only when the shared generator actually supports it.
const ALL_ROWS: Row[] = [
  { key: "instagram", label: "Instagram", href: "/tools/instagram-hashtag-generator", recommended: "Up to 30; start with 5–10" },
  { key: "tiktok", label: "TikTok", href: "/tools/tiktok-hashtag-generator", recommended: "3–5" },
  { key: "linkedin", label: "LinkedIn", href: "/tools/linkedin-hashtag-generator", recommended: "3–5" },
  { key: "youtube", label: "YouTube", href: "/tools/youtube-hashtag-generator", recommended: "3–5 (first 3 shown)" },
  { key: "facebook", label: "Facebook", href: "/tools/facebook-hashtag-generator", recommended: "1–3" },
  { key: "x", label: "X (Twitter)", href: "/tools/x-hashtag-generator", recommended: "1–2" },
  { key: "threads", label: "Threads", href: "/tools/threads-hashtag-generator", recommended: "1 topic tag" },
  { key: "pinterest", label: "Pinterest", href: "/tools/pinterest-hashtag-generator", recommended: "2–5" },
];

const ROWS = ALL_ROWS.filter((row) => HASHTAG_PLATFORMS.includes(row.key));
const PLATFORM_NAMES = ROWS.map((row) => row.label).join(", ").replace(/, ([^,]*)$/, " and $1");

const config: ToolPageConfig = {
  path: "/tools/hashtag-generator",
  name: "Hashtag generator",
  crumb: "Hashtag generator",
  title: "Free Hashtag Generator for Instagram, TikTok and More",
  description:
    "Free hashtag generator for Instagram, TikTok, LinkedIn, YouTube, Facebook and X: pick a niche, choose the right count and copy your hashtags in one click.",
  pill: "Free · no signup · no AI or scraping",
  h1: { before: "Free", mark: "hashtag generator", after: "for every platform" },
  lede: "The free hashtag generator builds a relevant set of hashtags for your post on any platform and copies it in one click. Pick Instagram, TikTok, LinkedIn, YouTube, Facebook, X or Pinterest, set a count and mix, and review the tags before you paste them.",
  art: "hashtag",
  artLabel: "A creator juggles colourful hashtag balloons above a phone showing a social post",
  heroPoints: [`${ROWS.length} platforms`, "Right count per network", "Copy, caption block or CSV"],
  toolTitle: "Generate hashtags for any platform",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate hashtags for any platform",
  steps: [
    {
      title: "Pick the platform",
      text: "Choose the network you are posting to. The generator adjusts the allowed count and the recommended range for that platform.",
      art: "hashtag",
    },
    {
      title: "Choose a niche, count and mix",
      text: "Pick the closest niche, slide to the number of tags you want and choose Balanced, More broad or More specific. Add your city, product or brand as an optional keyword.",
      art: "writing",
    },
    {
      title: "Review, copy and post",
      text: "Untick anything that does not describe the post, then copy the selection, copy it as a caption block or download a CSV.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "One generator, the right count for every network",
  features: [
    {
      title: "Platform-aware limits",
      text: "Instagram allows up to 30 tags, TikTok and LinkedIn work best at 3 to 5 and X counts every tag toward 280 characters. Switching platform changes the range for you.",
      art: "hashtag",
    },
    {
      title: "A planner, not a plain list",
      text: "Every tag shows its tier, an estimated popularity range and competition, so you can see the mix before you copy it.",
      art: "writing",
    },
    {
      title: "Private and repeatable",
      text: "Sets are built from fixed, hand-curated lists in your browser. Nothing is uploaded, no AI is used and the same settings give the same set.",
      art: "legal",
    },
  ],
  guide: {
    title: "How to use the all-platform hashtag generator",
    intro:
      "Hashtags are labels: they tell a platform and the people browsing a tag what a post is about. Used well they add context to a good post; they do not rescue a weak one. Here is how this generator works and how many tags to use on each network.",
    sections: [
      {
        title: "How many hashtags to use on each platform",
        body: (
          <>
            <p>
              There is no single right number. Each network treats hashtags differently, so the generator changes its
              range when you switch platform. This table sums up the limits and the working range for each one.
            </p>
            <div className="my-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">Recommended hashtag count and notes for each platform</caption>
                <thead>
                  <tr className="border-b border-[var(--poskoo-line)] text-xs uppercase tracking-wide text-[#5f5873]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Platform</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">How many to use</th>
                    <th scope="col" className="py-2 font-semibold">What to know</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => (
                    <tr key={row.key} className="border-b border-[var(--poskoo-line)] align-top">
                      <th scope="row" className="whitespace-nowrap py-3 pr-3 font-semibold">
                        <Link href={row.href} className="text-[var(--poskoo-violet)] underline underline-offset-2">{row.label}</Link>
                      </th>
                      <td className="whitespace-nowrap py-3 pr-3 font-medium tabular-nums">{row.recommended}</td>
                      <td className="py-3 text-[#3d3450]">{PLATFORM[row.key].note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Start with a short set where every tag fits the post, then add more only when each one is still relevant.
              For a deeper Instagram workflow, read the{" "}
              <Link href="/tools/instagram-hashtag-strategy">Instagram hashtag strategy worksheet</Link>.
            </p>
          </>
        ),
      },
      {
        title: "What this hashtag generator does",
        body: (
          <>
            <p>
              The generator holds hand-curated lists for 15 niches, split into three editorial tiers: <b>broad</b> (general
              topics such as <code>#fitness</code>), <b>mid-level</b> (a clear sub-topic such as <code>#homeworkout</code>)
              and <b>specific</b> (a focused subject such as <code>#kettlebellworkout</code>). Your count and mix decide how
              many tags come from each tier.
            </p>
            <p>
              The results table shows each tag&apos;s tier, an <b>estimated popularity range</b> and a competition level.
              Instagram and the other networks have no public API for hashtag post counts and this tool never scrapes
              them, so popularity is an estimate based on the tier. Treat the ranges as a guide to the mix, not as exact
              counts.
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
        title: "Best practices for hashtags in 2026",
        body: (
          <ul>
            <li>
              <b>Relevance over reach.</b> A tag that matches the post brings viewers who care about the topic. A popular
              tag that does not match brings nobody useful.
            </li>
            <li>
              <b>Use the platform&apos;s own range.</b> A 30-tag Instagram set, a 4-tag TikTok caption and a 2-tag X post
              are all normal. Copying an Instagram block onto LinkedIn or X usually looks spammy.
            </li>
            <li>
              <b>Mix the tiers.</b> Combine a few broad tags with mid-level and specific ones, and add a location or brand
              tag when it fits.
            </li>
            <li>
              <b>Rotate sets.</b> Copying the identical block onto every post makes tags less descriptive. Keep two or
              three sets per topic and tweak them per post with the{" "}
              <Link href="/tools/instagram-hashtag-strategy">hashtag strategy worksheet</Link>.
            </li>
            <li>
              <b>Write a searchable caption.</b> Most networks read captions and descriptions too, so name the topic in
              plain words and let hashtags add context.
            </li>
          </ul>
        ),
      },
      {
        title: "Common hashtag mistakes",
        body: (
          <ul>
            <li>Filling every slot because the limit allows it.</li>
            <li>Using the same count on every network instead of the range each one favours.</li>
            <li>Using tags that do not describe the post, just because they are popular.</li>
            <li>Pasting the exact same block on every post for months.</li>
            <li>Never checking a tag page: some tags are restricted or full of unrelated content.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Hashtag generator questions",
  faqs: [
    {
      q: "How does this hashtag generator work?",
      a: "Pick a platform, then a niche, a count and a mix. The tool selects from hand-curated broad, mid-level and specific tag lists in a repeatable order. Add an optional keyword such as your city or brand and copy the finished set in one click.",
    },
    {
      q: "How many hashtags should I use?",
      a: "It depends on the platform: Instagram allows up to 30 per post, TikTok and LinkedIn work best with 3 to 5, Facebook with 1 to 3, and X with 1 to 2 because every tag counts toward 280 characters. YouTube shows the first 3 and ignores all hashtags on a video with more than 60. The generator sets the right range when you switch platform.",
    },
    {
      q: "Are the hashtags AI-generated?",
      a: "No. The generator picks from fixed, hand-curated niche lists in your browser. No AI is used, nothing is uploaded, and the same settings always produce the same set, so you can review every tag.",
    },
    {
      q: "Are the popularity numbers real post counts?",
      a: "No. The networks do not offer a public API for hashtag post counts and this tool never scrapes them, so popularity is an estimated range based on each tag's size tier. The tool also does not check whether a hashtag is restricted; open the tag on the platform if you are unsure.",
    },
    {
      q: "Can I use the same hashtags on every platform?",
      a: "You can, but the count should change. A set that reads well on Instagram is usually too long for LinkedIn or X. Generate the set once, then switch platform and copy a smaller, focused version for each network.",
    },
  ],
  related: ["/tools/instagram-hashtag-strategy", ...ROWS.map((row) => row.href)],
  schema: {
    features: [
      `Hashtag sets for ${PLATFORM_NAMES}`,
      "Platform-aware count and recommended range",
      "Hand-curated hashtag sets for 15 niches",
      "Broad, mid-level and specific tag tiers",
      "Optional custom keyword tag",
      "Copy selected tags, copy as a caption block or download CSV",
      "One-click copy, no signup",
    ],
  },
  cta: {
    title: "Your hashtags are ready.",
    mark: "Schedule the post.",
    text: "Copy the set, schedule the post across your accounts with Poskoo, and DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function HashtagGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <HashtagPicker />
    </ToolPageTemplate>
  );
}
