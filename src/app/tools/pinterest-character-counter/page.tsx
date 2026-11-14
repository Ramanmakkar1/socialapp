import type { Metadata } from "next";
import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import { BRAND } from "@/lib/brand";
import { PINTEREST_LIMITS } from "@/lib/pinterestCharCount";
import PinterestCharCounter from "./PinterestCharCounter";

const limitRows: [string, string][] = [
  ["Pin title", `${PINTEREST_LIMITS.title.max} characters`],
  ["Pin description", `${PINTEREST_LIMITS.description.max} characters`],
  ["Image alt text", `${PINTEREST_LIMITS.altText.max} characters`],
  ["Board name", `${PINTEREST_LIMITS.boardName.max} characters`],
  ["Board description", "500 characters"],
  ["Profile About", "500 characters"],
];

const config: ToolPageConfig = {
  path: "/tools/pinterest-character-counter",
  name: "Pinterest character counter",
  crumb: "Pinterest character counter",
  title: "Pinterest Character Counter: Pin Title & Description",
  description: "Free Pinterest character counter for Pin titles (100), descriptions (500) and alt text (500). See characters left and your feed preview. No signup needed.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "Pinterest Pin title and description counter" },
  lede: "A Pinterest Pin title can be up to 100 characters and a Pin description up to 500 characters; this counter checks both as you type.",
  art: "writing",
  artLabel: "A creator writes a Pinterest Pin beside a character counter and feed preview",
  heroPoints: ["100-character Pin title limit", "500-character description limit", "No signup"],
  toolTitle: "Count your Pinterest text",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Pinterest character counter",
  steps: [
    {
      title: "Pick the field you are writing",
      text: "Choose Pin title, Pin description, image alt text, board name, board description or Profile About. Each field has its own limit, and the counter switches to it instantly.",
      art: "writing",
    },
    {
      title: "Write and watch the count",
      text: "Type your text and the live count, remaining characters and progress bar update as you go. The bar turns red when you pass the limit for that field.",
      art: "analytics",
    },
    {
      title: "Preview and copy",
      text: "For descriptions, see a feed preview of the first 50 characters, then press Copy to take your text straight into your Pin. Nothing is uploaded.",
      art: "visual",
    },
  ],
  featuresTitle: "Write Pinterest Pins that fit",
  features: [
    {
      title: "Every Pinterest limit in one tool",
      text: "Check Pin titles (100), descriptions (500), image alt text (500), board names (50), board descriptions (500) and Profile About (500) without switching pages.",
      art: "analytics",
    },
    {
      title: "Feed preview before truncation",
      text: "Pinterest feeds often show only the opening line of a description. The preview shows your first 50 characters so you know what people see first.",
      art: "writing",
    },
    {
      title: "Private, instant checks",
      text: "Your text is processed locally in your browser. Nothing is uploaded or saved, and you can copy the finished text with one click.",
      art: "visual",
    },
  ],
  guide: {
    title: "Pinterest character and profile limits",
    intro: "Pinterest gives each part of a Pin its own character limit. Check the relevant limit before you publish so nothing is cut off.",
    sections: [
      {
        title: "What are the Pinterest character limits?",
        body: (
          <>
            <div className={t.tableWrap}>
              <table className={t.table}>
                <thead>
                  <tr><th scope="col">Pinterest item</th><th scope="col">Limit</th></tr>
                </thead>
                <tbody>
                  {limitRows.map(([label, value]) => (
                    <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              This counter checks all six limits. Pin titles can contain up to 100 characters, Pin descriptions up to
              500 characters, and image alt text up to 500 characters per image.
            </p>
          </>
        ),
      },
      {
        title: "What counts toward the Pinterest limit?",
        body: (
          <ul>
            <li><b>Letters, numbers and punctuation count.</b> Spaces and line breaks also occupy characters.</li>
            <li><b>Hashtags count in full.</b> Every character in a hashtag, including the # symbol, counts toward the limit.</li>
            <li><b>Most emoji count as 1.</b> Grapheme counting keeps flags, skin-tone variations and combined emoji together.</li>
          </ul>
        ),
      },
      {
        title: "How long should a Pin description be?",
        body: (
          <p>
            You have up to 500 characters, but feeds often show only the opening line. Put your most useful words and
            your main keyword in the first sentence, then add detail, hashtags and a call to action after that.
          </p>
        ),
      },
      {
        title: "Check the text, then put it on the calendar",
        body: (
          <p>
            Use the counter to finish your draft, then open the <Link href="/pinterest-scheduler">Pinterest scheduler</Link> to
            connect your account and plan Pins. Find the <Link href="/tools/best-time-to-post-on-pinterest">best time to post on Pinterest</Link> and
            read <Link href="/help/schedule-pinterest-posts">how to schedule Pinterest Pins</Link> for a step-by-step setup.
          </p>
        ),
      },
    ],
  },
  faqTitle: "Pinterest character counter questions",
  faqs: [
    {
      q: "What is the Pinterest description character limit?",
      a: "A Pinterest Pin description can be up to 500 characters. The counter shows the current total and how many characters remain before it is cut off.",
    },
    {
      q: "How long should a Pin title be?",
      a: "A Pin title can be up to 100 characters. Keep it short and descriptive, with your main keyword near the front, since the title appears in search results and feeds.",
    },
    {
      q: "Do hashtags count toward the Pinterest limit?",
      a: "Yes. Every character in a hashtag, including the # symbol and spaces between hashtags, counts toward the 500-character description limit.",
    },
    {
      q: "Does Pinterest cut off long descriptions?",
      a: "Descriptions over 500 characters are truncated. In feeds, Pinterest often shows only the opening line, so put your best words in the first sentence.",
    },
  ],
  related: ["/tools/pinterest-hashtag-generator", "/tools/best-time-to-post-on-pinterest", "/tools/social-media-image-sizes", "/tools/social-media-content-calendar"],
  schema: {
    features: [
      "Pin title 100-character limit",
      "Pin description 500-character limit",
      "Image alt text 500-character limit",
      "Board name, board description and Profile About limits",
      "Feed preview of the first 50 description characters",
      "Live remaining count with an over-limit progress bar",
      "Copy and clear controls with no text upload",
    ],
  },
  cta: {
    title: "Your Pin text fits.",
    mark: "Now schedule it.",
    text: "Connect Pinterest, add your Pin to Poskoo's calendar and publish it at the time you choose.",
  },
};

export const metadata: Metadata = {
  ...toolMetadata(config),
  title: { absolute: "Pinterest Character Counter: Pin Title & Description" },
  alternates: { canonical: new URL("/tools/pinterest-character-counter", BRAND.url) },
};

export default function PinterestCharacterCounterPage() {
  return (
    <ToolPageTemplate config={config}>
      <PinterestCharCounter />
    </ToolPageTemplate>
  );
}
