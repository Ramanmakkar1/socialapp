import type { Metadata } from "next";
import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import { BRAND } from "@/lib/brand";
import BlueskyCharCounter from "./BlueskyCharCounter";

const limitRows: [string, string][] = [
  ["Post", "300 graphemes"],
  ["Image alt text", "2,000 characters per image"],
  ["Images per post", "4 images"],
  ["Display name", "64 characters"],
  ["Bio", "256 characters"],
];

const config: ToolPageConfig = {
  path: "/tools/bluesky-character-counter",
  name: "Bluesky character counter",
  crumb: "Bluesky character counter",
  title: "Bluesky Character Counter: Check the 300 Limit Free",
  description: "Free Bluesky character counter for the 300-character post limit. Count emoji as graphemes, see characters left, and copy your text. No signup needed.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "Bluesky character counter" },
  lede: "A Bluesky post can have up to 300 characters, counted as graphemes, so most emoji count as 1.",
  art: "writing",
  artLabel: "A creator writes a Bluesky post beside a grapheme counter and character meter",
  heroPoints: ["300-character post limit", "Emoji count as graphemes", "No signup"],
  toolTitle: "Count your Bluesky text",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Bluesky character counter",
  steps: [
    {
      title: "Write or paste your post",
      text: "Add your draft to the text box. The live character count updates immediately, and your text stays in your browser.",
      art: "writing",
    },
    {
      title: "Check the grapheme count",
      text: "Most emoji count as 1, including flags, skin-tone variations and family emoji. Spaces, line breaks and full link text also count.",
      art: "analytics",
    },
    {
      title: "Fix warnings and copy",
      text: "Watch the remaining count and progress bar. Trim text that is over the 300-character limit, then press Copy to use your post.",
      art: "visual",
    },
  ],
  featuresTitle: "Write a Bluesky post that fits",
  features: [
    {
      title: "Real grapheme counting",
      text: "See user-visible characters rather than UTF-16 code units, so flags, skin-tone emoji and combined family emoji count as 1.",
      art: "analytics",
    },
    {
      title: "Live remaining count",
      text: "The meter changes colour near the limit and turns red when your draft exceeds 300 graphemes, with the exact overage shown.",
      art: "writing",
    },
    {
      title: "Private, instant checks",
      text: "Your draft is processed locally in your browser. Nothing is uploaded or saved, and you can copy the finished post with one click.",
      art: "visual",
    },
  ],
  guide: {
    title: "Bluesky character and profile limits",
    intro: "Bluesky posts have a 300-grapheme limit, while profiles and images have their own limits. Check the relevant limit before publishing.",
    sections: [
      {
        title: "What are the Bluesky character limits?",
        body: (
          <>
            <div className={t.tableWrap}>
              <table className={t.table}>
                <thead>
                  <tr><th scope="col">Bluesky item</th><th scope="col">Limit</th></tr>
                </thead>
                <tbody>
                  {limitRows.map(([label, value]) => (
                    <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              This counter checks the 300-grapheme post limit. Display names can contain up to 64 characters, bios up to
              256 characters, and each image can have up to 2,000 characters of alt text.
            </p>
          </>
        ),
      },
      {
        title: "What counts toward the Bluesky post limit?",
        body: (
          <ul>
            <li><b>Letters, numbers and punctuation count.</b> Spaces and line breaks also occupy characters.</li>
            <li><b>Most emoji count as 1.</b> Grapheme counting keeps a flag, skin-tone variation or family emoji together.</li>
            <li><b>Links count in full.</b> Bluesky counts the full text of links you type; it does not shorten URLs to a fixed length like X.</li>
          </ul>
        ),
      },
      {
        title: "What are Bluesky's image limits?",
        body: (
          <p>
            A Bluesky post can include up to 4 images. Each image can have alt text of up to 2,000 characters, which is
            separate from the 300-grapheme limit for the post text.
          </p>
        ),
      },
      {
        title: "Check the post, then put it on the calendar",
        body: (
          <p>
            Use the counter to finish your draft, then open the <Link href="/bluesky-scheduler">Bluesky scheduler</Link> to
            connect with your handle and an app password and choose a publishing time. New to Poskoo? <Link href="/signup">Sign up free</Link> to
            plan Bluesky posts beside your other social channels from one calendar.
          </p>
        ),
      },
    ],
  },
  faqTitle: "Bluesky character counter questions",
  faqs: [
    {
      q: "How many characters can a Bluesky post have?",
      a: "A Bluesky post can have up to 300 characters, measured as graphemes. The counter shows the current total and how many characters remain.",
    },
    {
      q: "Do emoji count as one character on Bluesky?",
      a: "Most emoji count as 1 because Bluesky measures graphemes. This includes flags, emoji with skin tones and combined family emoji such as 👨‍👩‍👧.",
    },
    {
      q: "Do links count toward Bluesky's 300-character limit?",
      a: "Yes. Bluesky counts the full text of links you type. It does not shorten every URL to a fixed character length like X, so include the whole URL in your draft.",
    },
    {
      q: "What are Bluesky's image and alt-text limits?",
      a: "A Bluesky post can contain up to 4 images. Alt text can contain up to 2,000 characters per image, separately from the post's 300-grapheme limit.",
    },
  ],
  related: ["/tools/threads-character-counter", "/tools/x-character-counter", "/tools/linkedin-character-counter"],
  schema: {
    features: [
      "Bluesky 300-grapheme post limit",
      "Unicode grapheme counting for flags, skin-tone and combined emoji",
      "Full link text included in the character total",
      "Live remaining count with an over-limit progress bar",
      "Copy and clear controls with no text upload",
    ],
  },
  cta: {
    title: "Your Bluesky post fits.",
    mark: "Now schedule it.",
    text: "Connect Bluesky with your handle and an app password, add your post to Poskoo's calendar and publish it at the time you choose.",
  },
};

export const metadata: Metadata = {
  ...toolMetadata(config),
  title: { absolute: "Bluesky Character Counter: Check the 300 Limit Free" },
  alternates: { canonical: new URL("/tools/bluesky-character-counter", BRAND.url) },
};

export default function BlueskyCharacterCounterPage() {
  return (
    <ToolPageTemplate config={config}>
      <BlueskyCharCounter />
    </ToolPageTemplate>
  );
}
