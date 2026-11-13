import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import XCharCounter from "./XCharCounter";

const limitRows: [string, string][] = [
  ["Standard post", "280 weighted characters"],
  ["X Premium post", "25,000 weighted characters"],
  ["Link of any length", "23 weighted characters"],
  ["Emoji", "2 weighted characters"],
  ["CJK character", "2 weighted characters"],
  ["Username", "15 characters"],
  ["Display name", "50 characters"],
];

const config: ToolPageConfig = {
  path: "/tools/x-character-counter",
  name: "X (Twitter) character counter",
  crumb: "X character counter",
  title: "X (Twitter) Character Counter: 280 Limit Checker Tool",
  description: "Free X (Twitter) character counter: see how many of your 280 characters are left, with links counted as 23 and emoji as 2, exactly like X counts them.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "X (Twitter) character counter", after: "with the real 280 limit" },
  lede: "X allows 280 characters per post (25,000 with Premium); links always count as 23 and emoji as 2.",
  art: "writing",
  artLabel: "A creator writes an X post beside a character meter, a flying link and floating emoji",
  heroPoints: ["280-character standard limit", "Links count as 23", "No signup"],
  toolTitle: "Count your X post",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the X character counter",
  steps: [
    {
      title: "Choose your post limit",
      text: "Select Standard (280) for a regular X post or Premium (25,000) if your account has X Premium.",
      art: "analytics",
    },
    {
      title: "Write or paste your post",
      text: "Type in Your post. The weighted count updates as you type, with every link counted as 23 and each emoji or CJK character as 2.",
      art: "writing",
    },
    {
      title: "Check what is left and copy",
      text: "Watch the remaining count, URL, hashtag and mention totals. Trim anything over the limit, then press Copy to use your post.",
      art: "visual",
    },
  ],
  featuresTitle: "Count your post the way X does",
  features: [
    {
      title: "Links always count as 23",
      text: "A full https:// link or a bare domain counts as 23 weighted characters, however long the address is.",
      art: "analytics",
    },
    {
      title: "Emoji and CJK handled",
      text: "Emoji are read as graphemes and count as 2. Chinese, Japanese and Korean characters also count as 2 each.",
      art: "writing",
    },
    {
      title: "Private, instant checks",
      text: "See weighted characters, remaining space, URLs, hashtags and mentions together. Your text stays in your browser.",
      art: "visual",
    },
  ],
  guide: {
    title: "X character limits and weighted counting",
    intro: "The standard X post limit is 280 weighted characters, not necessarily 280 visible symbols. X Premium raises the limit to 25,000, while links, emoji and many non-Latin characters use special weights.",
    sections: [
      {
        title: "Why an X character count can look different",
        body: (
          <>
            <p>
              X uses <b>weighted characters</b>. Most Latin letters, numbers, spaces and punctuation count as 1, but
              emoji, CJK characters and other characters outside X&apos;s lighter ranges count as 2. That means a post
              with 140 emoji reaches the standard 280-character limit.
            </p>
            <p>
              This counter also reads combined emoji as one grapheme, so a skin-tone variant or family emoji counts as
              2 for the whole grapheme rather than charging separately for every code point.
            </p>
          </>
        ),
      },
      {
        title: "X post, profile and media text limits",
        body: (
          <>
            <div className={t.tableWrap}>
              <table className={t.table}>
                <thead>
                  <tr><th scope="col">Item</th><th scope="col">Limit or weight</th></tr>
                </thead>
                <tbody>
                  {limitRows.map(([label, value]) => (
                    <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              The weighting follows X&apos;s published rules in the{" "}
              <a href="https://docs.x.com/resources/fundamentals/counting-characters" target="_blank" rel="noopener noreferrer">
                X character-counting documentation
              </a>. Links count as 23 whether you paste a short domain or a long URL with a path and query.
            </p>
          </>
        ),
      },
      {
        title: "What counts toward the 280-character limit?",
        body: (
          <ul>
            <li><b>Spaces and line breaks count.</b> They use the same weight as other light characters.</li>
            <li><b>Hashtags and mentions count as text.</b> The # and @ symbols, letters and numbers all contribute.</li>
            <li><b>Emoji count as 2.</b> A combined emoji is treated as one grapheme before its weight is applied.</li>
            <li><b>Links count as 23.</b> Shortening a long URL yourself does not reduce its weight further.</li>
          </ul>
        ),
      },
      {
        title: "Check the post, then put it on the calendar",
        body: (
          <p>
            Use the counter to finish your draft, then open the <Link href="/x-scheduler">X scheduler</Link> to connect
            through X&apos;s official sign-in and choose a publishing time. If you are setting up your first scheduled
            post, follow the <Link href="/help/schedule-x-posts">step-by-step X scheduling guide</Link>.
          </p>
        ),
      },
    ],
  },
  faqTitle: "X character counter questions",
  faqs: [
    {
      q: "Do spaces count on X?",
      a: "Yes. Spaces and line breaks count toward X's 280-character standard limit. Each one normally has a weight of 1, just like a Latin letter or number.",
    },
    {
      q: "How many characters is a link on X?",
      a: "Every http:// or https:// link and bare domain counts as 23 weighted characters on X, regardless of its actual length. This includes long paths and query strings.",
    },
    {
      q: "Do emojis count as 2 characters?",
      a: "Yes. A grapheme containing an emoji counts as 2 weighted characters. Combined emoji, such as a family or skin-tone variant, are read as one grapheme and also count as 2.",
    },
    {
      q: "What is the character limit with X Premium?",
      a: "X Premium allows posts up to 25,000 weighted characters. Select Premium (25,000) in the counter to check a longer post against that limit.",
    },
    {
      q: "Is my X post uploaded or saved?",
      a: "No. All counting happens in your browser. Your post is not uploaded or saved, and you do not need to sign in to use the counter.",
    },
  ],
  related: ["/tools/x-post-preview", "/tools/threads-post-preview", "/tools/instagram-caption-counter", "/tools/x-bio-generator"],
  schema: {
    features: [
      "X weighted character counting against 280 and 25,000 limits",
      "Full and bare URLs counted as 23 characters",
      "Grapheme-aware emoji counting and CJK weighting",
      "Remaining character, URL, hashtag and mention totals",
      "Standard and Premium modes with copy",
    ],
  },
  cta: {
    title: "Your X post fits.",
    mark: "Now schedule it.",
    text: "Connect X through its official sign-in, add your post to Poskoo's calendar and publish it at the time you choose.",
  },
};

export const metadata = toolMetadata(config);

export default function XCharacterCounterPage() {
  return (
    <ToolPageTemplate config={config}>
      <XCharCounter />
    </ToolPageTemplate>
  );
}
