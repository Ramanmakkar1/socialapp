import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import { PLATFORM_LIMITS } from "@/lib/captionLimits";
import LineBreakTool from "./LineBreakTool";

const ig = PLATFORM_LIMITS.instagram;
const n = (v: number | null) => (v === null ? "No published limit" : v.toLocaleString("en-US"));

const config: ToolPageConfig = {
  path: "/tools/instagram-line-break-generator",
  name: "Instagram line break generator",
  crumb: "Line break generator",
  title: "Instagram Line Break Generator: Add Spaces to Captions",
  description:
    "Free Instagram line break generator: add an invisible character or a dot to blank lines so caption paragraphs stay apart. Live preview, counter and copy.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Instagram line break generator:", mark: "keep your spacing" },
  lede: "Stop caption paragraphs collapsing into one block. The tool puts an invisible character or a dot on every blank line, so the spacing you write is the spacing people see.",
  art: "writing",
  artLabel: "A creator writes with a giant pencil on a phone-shaped card with neatly spaced caption lines",
  heroPoints: ["Invisible or dot spacer", "Live preview", "No signup"],
  toolTitle: "Add line breaks to your caption",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Instagram line break generator",
  steps: [
    {
      title: "Paste your caption",
      text: "Paste or type into Your caption, with an empty line wherever you want space between paragraphs.",
      art: "writing",
    },
    {
      title: "Pick a blank line style",
      text: "Choose Invisible (Braille blank) for clean gaps or Dot (.) for a visible spacer, and check the Instagram preview.",
      art: "visual",
    },
    {
      title: "Copy and post",
      text: "Press Copy above the preview and paste the formatted caption into Instagram or your scheduler.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Spacing that survives the Instagram app",
  features: [
    {
      title: "Fills every blank line",
      text: "Each empty line gets a Braille blank (U+2800) or a dot, so Instagram has no empty line to drop.",
      art: "writing",
    },
    {
      title: "Removes trailing spaces",
      text: "Spaces at the end of a line are stripped, since Instagram tends to remove them anyway, and line endings are normalised.",
      art: "feat-ai",
    },
    {
      title: "Counts the result",
      text: `The character counter checks the formatted caption, spacers included, against the ${n(ig.max)}-character limit.`,
      art: "analytics",
    },
  ],
  guide: {
    title: "Instagram line breaks: why spacing disappears and how to fix it",
    intro:
      "You write a caption with tidy paragraphs, post it and it appears as one dense block. Here is why that happens, what this generator changes and how to lay out captions so they stay readable.",
    sections: [
      {
        title: "Why Instagram removes spacing",
        body: (
          <>
            <p>
              When you edit a caption in the Instagram app, trailing spaces at the end of a line are stripped. If you
              relied on spaces or completely empty lines to separate paragraphs, those gaps often disappear after you tap
              Done. The caption still has line breaks, but without a character on the blank line the feed can look like
              one dense paragraph.
            </p>
            <p>Behaviour can differ between the app, the website and scheduling tools, so check the published post.</p>
          </>
        ),
      },
      {
        title: "What this line break generator does",
        body: (
          <ul>
            <li>Converts Windows and old Mac line endings to standard line breaks.</li>
            <li>Removes spaces at the end of every line.</li>
            <li>
              Replaces every empty line with a <b>Braille Pattern Blank</b> (<code>U+2800</code>), which looks empty, or a{" "}
              <b>dot</b>.
            </li>
            <li>Leaves the rest of your text exactly as written.</li>
          </ul>
        ),
      },
      {
        title: "Example: a caption before and after",
        body: (
          <>
            <p>With the Dot style, this input (with spaces after &ldquo;Line one&rdquo;):</p>
            <div className={t.example}>
              <p>Line one&nbsp;&nbsp;&nbsp;</p>
              <p>&nbsp;</p>
              <p>Line two</p>
              <p>&nbsp;</p>
              <p>#coffee</p>
            </div>
            <p>becomes:</p>
            <div className={t.example}>
              <p>Line one</p>
              <p>.</p>
              <p>Line two</p>
              <p>.</p>
              <p>#coffee</p>
            </div>
            <p>
              With the Invisible style the dots become a Braille blank, so the gaps look empty but are not. Each spacer
              adds one character to the count.
            </p>
          </>
        ),
      },
      {
        title: "Line break best practices for 2026",
        body: (
          <ul>
            <li>
              <b>Short paragraphs.</b> Two or three lines per block reads well on a phone.
            </li>
            <li>
              <b>Hook in the first lines.</b> The feed shows about the first {n(ig.foldAt)} characters or two lines, so a
              blank first line wastes the space before &ldquo;more&rdquo;.
            </li>
            <li>
              <b>Space out the call to action.</b> Give a line like &ldquo;Comment GUIDE&rdquo; its own paragraph. If it
              promises a DM, send it automatically with <Link href="/instagram-auto-dm">Instagram auto DM</Link>.
            </li>
            <li>
              <b>Check the length.</b> Spacers count as characters; use the{" "}
              <Link href="/tools/instagram-caption-counter">caption counter</Link> to check hashtags and mentions too.
            </li>
          </ul>
        ),
      },
      {
        title: "Common line break mistakes",
        body: (
          <ul>
            <li>Typing several spaces to fake a gap: Instagram strips them.</li>
            <li>Stacking many spacer lines, which pushes the message below the fold.</li>
            <li>Editing the caption again in the app after pasting, which can undo the spacing.</li>
            <li>Mixing invisible spacers and dots in one caption, which looks inconsistent.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram line break questions",
  faqs: [
    {
      q: "Why does Instagram remove line breaks in captions?",
      a: "The Instagram app trims trailing spaces on each line when you save a caption. Empty lines and lines that were only spaces can collapse, so paragraphs look like one block of text. Adding a visible or invisible character on blank lines keeps the spacing you intended.",
    },
    {
      q: "What is the invisible character for Instagram line breaks?",
      a: "Many creators use Unicode U+2800 (Braille Pattern Blank). It looks empty in the caption but stops Instagram from merging blank lines. This tool inserts it on every empty line, or you can choose a single dot instead.",
    },
    {
      q: "Does the spacer count toward the Instagram caption character limit?",
      a: `Yes. Every character in the formatted caption counts toward Instagram's ${n(ig.max)}-character limit, including the Braille blank or dot on each empty line. The counter in the tool counts the formatted result.`,
    },
    {
      q: "Is my caption uploaded?",
      a: "No. Formatting, counting and copying all happen in your browser.",
    },
    {
      q: "Can I schedule a caption after formatting it?",
      a: "Yes. Copy the formatted text and paste it into a new post in Poskoo's Instagram scheduler, or straight into Instagram.",
    },
  ],
  related: [
    "/tools/instagram-caption-formatter",
    "/tools/instagram-caption-counter",
    "/tools/instagram-font-generator",
    "/tools/instagram-bio-generator",
    "/tools/instagram-post-preview",
  ],
  schema: {
    features: [
      "Invisible Braille blank or dot on empty lines",
      "Trailing space removal",
      "Live Instagram caption preview",
      "Character count against 2,200",
      "One-click copy",
    ],
  },
  cta: {
    title: "Spacing fixed.",
    mark: "Now schedule the post.",
    text: "Paste the caption into Poskoo, schedule it and auto-DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramLineBreakGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <LineBreakTool />
    </ToolPageTemplate>
  );
}
