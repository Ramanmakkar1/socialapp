import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import FacebookCharCounter from "./FacebookCharCounter";

const limitRows: [string, string][] = [
  ["Post", "63,206 characters"],
  ["Post before See more", "About 477 characters or five lines"],
  ["Comment", "8,000 characters"],
  ["Ad primary text visible", "About 125 characters"],
  ["Ad headline", "40 characters"],
  ["Page bio", "255 characters"],
];

const config: ToolPageConfig = {
  path: "/tools/facebook-character-counter",
  name: "Facebook character counter",
  crumb: "Facebook character counter",
  title: "Facebook Character Counter: Free Post Limit Checker",
  description: "Free Facebook character counter for posts, comments, ads and Page bios. Check real limits, remaining characters and the preview shown before See more.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "Facebook character counter", after: "with real post limits" },
  lede: "Facebook posts can be up to 63,206 characters, but the feed shows about the first 477 before See more. Check posts, comments, ad text and Page bios free, with no signup.",
  art: "writing",
  artLabel: "A creator writes a Facebook post beside a character meter and a feed preview",
  heroPoints: ["63,206-character post limit", "See more preview", "No signup"],
  toolTitle: "Count your Facebook text",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Facebook character counter",
  steps: [
    {
      title: "Choose your Facebook field",
      text: "Select Post, Comment, Ad primary text, Ad headline or Page bio to check your text against the matching limit or visibility guide.",
      art: "analytics",
    },
    {
      title: "Write or paste your text",
      text: "The character, word and line counts update as you type. Emoji count by code point, so a single emoji such as 😀 counts as 1.",
      art: "writing",
    },
    {
      title: "Check the preview and copy",
      text: "Watch the remaining count and see what appears before See more. Trim anything over a hard limit, then press Copy to use your text.",
      art: "visual",
    },
  ],
  featuresTitle: "Check the limit and the Facebook feed preview",
  features: [
    {
      title: "Post, ad and Page limits",
      text: "Switch between the 63,206-character post, 8,000-character comment, 40-character ad headline and 255-character Page bio limits.",
      art: "analytics",
    },
    {
      title: "See more and ad previews",
      text: "Check the opening before a post reaches about 477 characters or five lines, and preview the roughly 125 characters of ad primary text shown first.",
      art: "writing",
    },
    {
      title: "Private, instant counts",
      text: "See characters, words, lines and remaining space together. Your text stays in your browser and is not uploaded or saved.",
      art: "visual",
    },
  ],
  guide: {
    title: "Facebook character limits and feed previews",
    intro: "A Facebook post can contain 63,206 characters, but only its opening appears before See more. Check both the full limit and the visible preview before publishing.",
    sections: [
      {
        title: "What are Facebook's character limits?",
        body: (
          <>
            <div className={t.tableWrap}>
              <table className={t.table}>
                <thead>
                  <tr><th scope="col">Facebook field</th><th scope="col">Limit or visible length</th></tr>
                </thead>
                <tbody>
                  {limitRows.map(([label, value]) => (
                    <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              The See more and ad primary text figures are approximate display lengths, not separate publishing caps.
              Facebook&apos;s exact cut-off can vary by device, placement, font and layout.
            </p>
          </>
        ),
      },
      {
        title: "Where does Facebook cut off a post with See more?",
        body: (
          <p>
            The feed preview shows about the first <b>477 characters</b> or the end of the first five lines, whichever
            comes first. Line breaks can therefore make See more appear sooner. Put the main idea or question in the
            opening lines so readers have a reason to expand the post.
          </p>
        ),
      },
      {
        title: "What counts toward a Facebook character limit?",
        body: (
          <ul>
            <li><b>Letters, numbers and punctuation count.</b> Spaces and line breaks also occupy characters.</li>
            <li><b>Emoji count by code point.</b> A single emoji such as 😀 counts as 1 in this counter.</li>
            <li><b>Words are separated by whitespace.</b> The word total is a guide, not a Facebook limit.</li>
            <li><b>Every field has its own target.</b> Choose the right field before checking your draft.</li>
          </ul>
        ),
      },
      {
        title: "Check the post, then put it on the calendar",
        body: (
          <p>
            Use the counter to finish your draft, then open the <Link href="/facebook-scheduler">Facebook scheduler</Link> to connect
            through Meta&apos;s official login and choose a publishing time. If you are setting up your first scheduled
            post, follow the <Link href="/help/schedule-facebook-posts">step-by-step Facebook scheduling guide</Link>. To add a
            few relevant tags to the draft, use the <Link href="/tools/facebook-hashtag-generator">Facebook hashtag generator</Link>.
          </p>
        ),
      },
    ],
  },
  faqTitle: "Facebook character counter questions",
  faqs: [
    {
      q: "How many characters can a Facebook post have?",
      a: "A Facebook post can have up to 63,206 characters. Spaces, line breaks, punctuation and emoji all contribute to the total.",
    },
    {
      q: "How many characters show before See more on Facebook?",
      a: "Facebook shows about 477 characters or the first five lines before See more, whichever comes first. Line breaks can shorten the visible opening, and exact display cuts vary by device.",
    },
    {
      q: "How much Facebook ad primary text is visible?",
      a: "About the first 125 characters of ad primary text are commonly shown before the rest is cut off. This is an approximate visibility guide, not a total text limit, and it varies by ad placement.",
    },
    {
      q: "What is the Facebook Page bio character limit?",
      a: "A Facebook Page bio can contain up to 255 characters. Select Page bio in the counter to see exactly how many characters remain before you paste it into your Page.",
    },
  ],
  related: ["/tools/facebook-post-preview", "/tools/linkedin-character-counter", "/tools/threads-character-counter", "/tools/youtube-title-counter"],
  schema: {
    features: [
      "Facebook post, comment, ad headline and Page bio character limits",
      "Code-point character counting with word and line totals",
      "Feed preview before approximately 477 characters or five lines",
      "Ad primary text preview at approximately 125 visible characters",
      "Live remaining count, progress bar and copy controls",
    ],
  },
  cta: {
    title: "Your Facebook post fits.",
    mark: "Now schedule it.",
    text: "Connect your Facebook Page through Meta's official login, add your post to Poskoo's calendar and publish it at the time you choose.",
  },
};

export const metadata = toolMetadata(config);

export default function FacebookCharacterCounterPage() {
  return (
    <ToolPageTemplate config={config}>
      <FacebookCharCounter />
    </ToolPageTemplate>
  );
}
