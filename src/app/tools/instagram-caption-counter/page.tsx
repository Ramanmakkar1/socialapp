import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import { PLATFORM_LIMITS } from "@/lib/captionLimits";
import CaptionCounter from "./CaptionCounter";

const ig = PLATFORM_LIMITS.instagram;
const threads = PLATFORM_LIMITS.threads;
const n = (v: number | null) => (v === null ? "No published limit" : v.toLocaleString("en-US"));

const limitRows: [string, string][] = [
  ["Caption length", `${n(ig.max)} characters`],
  ["Hashtags per post", n(ig.hashtags)],
  ["@mentions per caption", n(ig.mentions)],
  ["Feed cut-off (\"more\")", `About ${n(ig.foldAt)} characters or two lines`],
  ["Threads post length", `${n(threads.max)} characters`],
];

const config: ToolPageConfig = {
  path: "/tools/instagram-caption-counter",
  name: "Instagram caption counter",
  crumb: "Caption counter",
  title: `Instagram Caption Counter (${n(ig.max)} Limit) + Hashtag Checker`,
  description: `Free Instagram caption counter: count characters, hashtags and @mentions as you type, check the ${n(ig.max)} limit and see where the feed cuts your caption off.`,
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Instagram caption counter:", mark: "characters, hashtags", after: "and mentions" },
  lede: `Count characters, hashtags and @mentions as you type, check the ${n(ig.max)}-character limit and see roughly where Instagram cuts your caption with "more".`,
  art: "writing",
  artLabel: "A creator writes with a giant pencil on a phone-shaped card full of caption lines and emoji",
  heroPoints: [`${n(ig.max)}-char limit`, `${n(ig.hashtags)} hashtags, ${n(ig.mentions)} mentions`, "Runs in your browser"],
  toolTitle: "Count your caption",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Instagram caption counter",
  steps: [
    {
      title: "Choose the platform",
      text: "Pick the Instagram, Facebook or Threads tab. Each tab checks the caption against that platform's published limits.",
      art: "analytics",
    },
    {
      title: "Paste your caption",
      text: "Paste or type into Your caption. The Characters, Hashtags and Mentions meters update as you type, and every tag and mention found is listed below.",
      art: "writing",
    },
    {
      title: "Check the fold, then copy",
      text: "Read the Feed preview to see what shows before \"more\", fix any warnings, then press Copy or Preview this caption to see it in a post mockup.",
      art: "visual",
    },
  ],
  featuresTitle: "Every caption limit in one place",
  features: [
    {
      title: "Counts like a person reads",
      text: "Each emoji counts as one character, even skin-tone and combined emoji, and spaces and line breaks count too.",
      art: "writing",
    },
    {
      title: "Hashtag and mention checks",
      text: `Lists every #hashtag and @mention it finds and warns you when you pass ${n(ig.hashtags)} hashtags or ${n(ig.mentions)} mentions.`,
      art: "hashtag",
    },
    {
      title: "See the fold before you post",
      text: "The feed preview cuts the caption about where Instagram adds \"more\", so you can check that your hook is visible.",
      art: "visual",
    },
  ],
  guide: {
    title: "Instagram caption length: limits and how to use them",
    intro:
      "Instagram enforces a few hard limits on captions, and the feed shows only a small part of each one. Here is what the counter checks, the limits it uses and how to write within them.",
    sections: [
      {
        title: "What this caption counter checks",
        body: (
          <>
            <p>
              The counter reads your caption in your browser and reports three numbers against the selected
              platform&apos;s limits:
            </p>
            <ul>
              <li>
                <b>Characters</b>: every visible character, including spaces, line breaks and emoji. A combined emoji such
                as a family or a skin-tone variant counts as one.
              </li>
              <li>
                <b>Hashtags</b>: a <code>#</code> followed by a word with at least one letter, so <code>#123</code> is not
                counted.
              </li>
              <li>
                <b>Mentions</b>: an <code>@</code> followed by a valid username. Email addresses are skipped.
              </li>
            </ul>
            <p>
              The meters turn coral at 90% of a limit and a warning appears when you go over. Facebook has no published
              caption limit, so that tab only counts.
            </p>
          </>
        ),
      },
      {
        title: "Instagram caption limits",
        body: (
          <>
            <div className={t.tableWrap}>
              <table className={t.table}>
                <tbody>
                  {limitRows.map(([label, value]) => (
                    <tr key={label}>
                      <th scope="row">{label}</th>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Length, hashtag and mention limits come from the{" "}
              <a href={ig.source} target="_blank" rel="noopener noreferrer">
                Meta Instagram API docs
              </a>
              . The feed cut-off is an estimate and varies by device and text size.
            </p>
          </>
        ),
      },
      {
        title: "Best practices for caption length in 2026",
        body: (
          <ul>
            <li>
              <b>Write the first line for the fold.</b> Put your hook or call to action in the first two lines; everything
              after that is hidden until someone taps &ldquo;more&rdquo;.
            </li>
            <li>
              <b>Use the length you need.</b> {n(ig.max)} characters is a ceiling. A short caption on a Reel and a longer,
              useful one on a carousel can both work.
            </li>
            <li>
              <b>Keep paragraphs short.</b> Break long captions into short blocks. If blank lines collapse in the app, use
              the <Link href="/tools/instagram-line-break-generator">line break generator</Link>.
            </li>
            <li>
              <b>Hashtags only where they fit.</b> {n(ig.hashtags)} is the maximum, not a target.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: checking a product caption",
        body: (
          <>
            <p>Paste this caption into the Instagram tab:</p>
            <div className={t.example}>
              <p>Fresh batch of cold brew is ready ☕ Comment BREW and we&apos;ll DM you the recipe.</p>
              <p>Shot by @lena.makes</p>
              <p>#coldbrew #coffeeathome #123</p>
            </div>
            <p>
              The counter shows <b>127</b> characters, <b>2</b> hashtags (<code>#coldbrew</code> and{" "}
              <code>#coffeeathome</code>; <code>#123</code> has no letters, so it is not counted) and <b>1</b> mention
              (<code>@lena.makes</code>). The feed preview stops after &ldquo;Shot by @lena.makes&rdquo;, so the offer and
              the keyword are visible before &ldquo;more&rdquo; while the hashtags sit below it. To send that recipe
              automatically, set up <Link href="/instagram-auto-dm">Instagram auto DM</Link> for the keyword BREW.
            </p>
          </>
        ),
      },
      {
        title: "Common caption length mistakes",
        body: (
          <ul>
            <li>Counting with a word processor, which may count emoji or line breaks differently.</li>
            <li>Leaving the hook for the third line, where it is hidden behind &ldquo;more&rdquo;.</li>
            <li>Pasting a full block of 30 hashtags into every caption without checking each one.</li>
            <li>Writing a Threads post at Instagram length: Threads stops at {n(threads.max)} characters.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram caption counter questions",
  faqs: [
    {
      q: "How long can an Instagram caption be?",
      a: `An Instagram caption can be up to ${n(ig.max)} characters. Emoji, spaces and line breaks all count. Paste your caption into the counter to see how many characters you have left.`,
    },
    {
      q: "How many hashtags can you use on Instagram?",
      a: `You can add up to ${n(ig.hashtags)} hashtags to one Instagram post. The counter lists every hashtag it finds and warns you when you go over ${n(ig.hashtags)}. Tags made only of numbers, like #123, are not counted.`,
    },
    {
      q: "How many @mentions can an Instagram caption have?",
      a: `Meta's Instagram API documents a maximum of ${n(ig.mentions)} @ tags per caption. The counter lists each mention and warns you when you pass ${n(ig.mentions)}.`,
    },
    {
      q: "Does the first line of an Instagram caption matter?",
      a: `Yes. In the feed, Instagram shows only about the first ${n(ig.foldAt)} characters or two lines, then hides the rest behind "more". Put your hook or call to action there. The preview shows roughly where the cut falls; the exact point varies by device.`,
    },
    {
      q: "What is the difference between Threads and Instagram caption limits?",
      a: `A Threads post can be up to ${n(threads.max)} characters, while an Instagram caption can be up to ${n(ig.max)}. Switch to the Threads tab in the counter to check a post against the ${n(threads.max)}-character limit.`,
    },
    {
      q: "Is my caption uploaded anywhere?",
      a: "No. Counting happens in your browser. If you press Preview this caption, the text is stored in this browser tab's session storage so the post preview tool can open it.",
    },
  ],
  related: [
    "/tools/instagram-caption-formatter",
    "/tools/instagram-line-break-generator",
    "/tools/instagram-post-preview",
    "/tools/instagram-caption-generator",
    "/tools/instagram-hashtag-generator",
    "/tools/threads-post-preview",
  ],
  schema: {
    features: [
      "Character count with emoji counted as one",
      "Hashtag and @mention counts with limit warnings",
      "Instagram, Facebook and Threads limits",
      "Feed preview of the \"more\" cut-off",
      "Copy and send to the post preview",
    ],
  },
  cta: {
    title: "Caption checked.",
    mark: "Schedule it and DM every commenter.",
    text: "Schedule the post with Poskoo and send your link to everyone who comments your keyword, on the official Meta API.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramCaptionCounterPage() {
  return (
    <ToolPageTemplate config={config}>
      <CaptionCounter />
    </ToolPageTemplate>
  );
}
