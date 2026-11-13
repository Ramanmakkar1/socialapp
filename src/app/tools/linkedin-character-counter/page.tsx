import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import LinkedInCharCounter from "./LinkedInCharCounter";

const limitRows: [string, string][] = [
  ["Post", "3,000 characters"],
  ["Comment", "1,250 characters"],
  ["Headline", "220 characters"],
  ["About section", "2,600 characters"],
  ["Article headline", "150 characters"],
];

const config: ToolPageConfig = {
  path: "/tools/linkedin-character-counter",
  name: "LinkedIn character counter",
  crumb: "LinkedIn character counter",
  title: "LinkedIn Character Counter: Free Post Limit Checker",
  description: "Free LinkedIn character counter for posts, comments, headlines and About sections. Check limits, word and line counts, and your preview before See more.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "LinkedIn character counter", after: "with real post limits" },
  lede: "LinkedIn posts can be up to 3,000 characters, but the feed shows only about the first 210 before See more.",
  art: "writing",
  artLabel: "A creator writes a LinkedIn post beside a character meter and a feed preview",
  heroPoints: ["3,000-character post limit", "See more preview", "No signup"],
  toolTitle: "Count your LinkedIn text",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the LinkedIn character counter",
  steps: [
    {
      title: "Choose your LinkedIn field",
      text: "Select Post, Comment, Headline or About to check your text against the matching LinkedIn character limit.",
      art: "analytics",
    },
    {
      title: "Write or paste your text",
      text: "The character, word and line counts update as you type. Emoji count by code point, so a single emoji such as 😀 counts as 1.",
      art: "writing",
    },
    {
      title: "Check the preview and copy",
      text: "Watch the remaining count and see what appears before See more. Trim anything over the limit, then press Copy to use your text.",
      art: "visual",
    },
  ],
  featuresTitle: "Check the limit and the feed preview",
  features: [
    {
      title: "Real LinkedIn limits",
      text: "Switch between the 3,000-character post, 1,250-character comment, 220-character headline and 2,600-character About limits.",
      art: "analytics",
    },
    {
      title: "See more preview",
      text: "Check the opening readers see before the feed cuts off at about 210 characters or the end of the third line, whichever comes first.",
      art: "writing",
    },
    {
      title: "Private, instant counts",
      text: "See characters, words, lines and remaining space together. Your text stays in your browser and is not uploaded or saved.",
      art: "visual",
    },
  ],
  guide: {
    title: "LinkedIn character limits and feed previews",
    intro: "A LinkedIn post can contain 3,000 characters, but only the opening appears in the feed before See more. Check both the full limit and the preview before publishing.",
    sections: [
      {
        title: "Where does LinkedIn cut off a post with See more?",
        body: (
          <p>
            The feed preview shows about the first <b>210 characters</b> or the first three lines, whichever ends first.
            Line breaks can therefore make See more appear sooner. Put the main idea or question in the opening lines so
            readers have a reason to expand the post.
          </p>
        ),
      },
      {
        title: "What are LinkedIn's character limits?",
        body: (
          <>
            <div className={t.tableWrap}>
              <table className={t.table}>
                <thead>
                  <tr><th scope="col">LinkedIn field</th><th scope="col">Character limit</th></tr>
                </thead>
                <tbody>
                  {limitRows.map(([label, value]) => (
                    <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Select a field in the counter to check its live limit. The article headline limit is included here as a
              reference when you title a LinkedIn article.
            </p>
          </>
        ),
      },
      {
        title: "What counts toward a LinkedIn character limit?",
        body: (
          <ul>
            <li><b>Letters, numbers and punctuation count.</b> Spaces and line breaks also occupy characters.</li>
            <li><b>Emoji count by code point.</b> A single emoji such as 😀 counts as 1 in this counter.</li>
            <li><b>Words are separated by whitespace.</b> The word total is a guide, not a LinkedIn limit.</li>
            <li><b>Every field has its own limit.</b> Choose Post, Comment, Headline or About before checking your draft.</li>
          </ul>
        ),
      },
      {
        title: "Check the post, then put it on the calendar",
        body: (
          <p>
            Use the counter to finish your draft, then open the <Link href="/linkedin-scheduler">LinkedIn scheduler</Link> to connect
            through LinkedIn&apos;s official sign-in and choose a publishing time. If you are setting up your first scheduled
            post, follow the <Link href="/help/schedule-linkedin-posts">step-by-step LinkedIn scheduling guide</Link>.
          </p>
        ),
      },
    ],
  },
  faqTitle: "LinkedIn character counter questions",
  faqs: [
    {
      q: "How many characters can a LinkedIn post have?",
      a: "A LinkedIn post can have up to 3,000 characters. Spaces, line breaks, punctuation and emoji all contribute to the total.",
    },
    {
      q: "How many characters show before See more on LinkedIn?",
      a: "The feed shows about 210 characters or the first three lines before See more, whichever comes first. Line breaks can shorten the visible opening.",
    },
    {
      q: "What is the LinkedIn headline character limit?",
      a: "A LinkedIn profile headline can contain up to 220 characters. Select Headline in the counter to see exactly how many characters remain.",
    },
    {
      q: "What is the LinkedIn About section character limit?",
      a: "The LinkedIn About section can contain up to 2,600 characters. Select About in the counter to check the full draft before pasting it into your profile.",
    },
    {
      q: "Is my LinkedIn draft uploaded or saved?",
      a: "No. All counting and previewing happens in your browser. Your draft is not uploaded or saved, and you do not need to sign in.",
    },
  ],
  related: ["/tools/linkedin-hashtag-generator", "/tools/linkedin-post-preview", "/tools/linkedin-text-formatter", "/tools/threads-post-preview"],
  schema: {
    features: [
      "LinkedIn post, comment, headline and About character limits",
      "Code-point character counting with word and line totals",
      "Feed preview before approximately 210 characters or three lines",
      "Live remaining count with an over-limit progress bar",
      "Copy and clear controls with no text upload",
    ],
  },
  cta: {
    title: "Your LinkedIn post fits.",
    mark: "Now schedule it.",
    text: "Connect LinkedIn through its official sign-in, add your post to Poskoo's calendar and publish it at the time you choose.",
  },
};

export const metadata = toolMetadata(config);

export default function LinkedInCharacterCounterPage() {
  return (
    <ToolPageTemplate config={config}>
      <LinkedInCharCounter />
    </ToolPageTemplate>
  );
}
