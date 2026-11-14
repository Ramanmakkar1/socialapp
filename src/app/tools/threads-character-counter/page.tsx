import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import ThreadsCharCounter from "./ThreadsCharCounter";

const limitRows: [string, string][] = [
  ["Post", "500 characters"],
  ["Bio", "150 characters"],
  ["Links per post", "5 links"],
];

const config: ToolPageConfig = {
  path: "/tools/threads-character-counter",
  name: "Threads character counter",
  crumb: "Threads character counter",
  title: "Threads Character Counter: Free 500-Limit Checker",
  description: "Free Threads character counter for the 500-character post limit and 150-character bio limit. Count words, hashtags and links, then copy your text.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "Threads character counter", after: "with real post limits" },
  lede: "Threads posts can be up to 500 characters, with up to 5 links per post. Use this free counter to check your post or 150-character bio before you publish.",
  art: "writing",
  artLabel: "A creator writes a Threads post beside a character meter and link counter",
  heroPoints: ["500-character post limit", "5-link warning", "No signup"],
  toolTitle: "Count your Threads text",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Threads character counter",
  steps: [
    {
      title: "Choose your Threads field",
      text: "Select Post to check the 500-character limit or Bio to check the 150-character profile limit.",
      art: "analytics",
    },
    {
      title: "Write or paste your text",
      text: "The character, word, line, hashtag and link counts update as you type. Emoji count by code point, so 😀 counts as 1.",
      art: "writing",
    },
    {
      title: "Fix warnings and copy",
      text: "Watch the remaining count and progress bar. Trim text that is over the limit, keep to 5 links per post, then press Copy.",
      art: "visual",
    },
  ],
  featuresTitle: "Check every part of your Threads draft",
  features: [
    {
      title: "Post and bio limits",
      text: "Switch between the 500-character post limit and 150-character bio limit without losing your draft.",
      art: "analytics",
    },
    {
      title: "Link and hashtag checks",
      text: "Count hashtags and http or https links as you write, with a clear warning when a post contains more than 5 links.",
      art: "writing",
    },
    {
      title: "Private, instant counts",
      text: "See characters, words, lines and remaining space together. Your text stays in your browser and is not uploaded or saved.",
      art: "visual",
    },
  ],
  guide: {
    title: "Threads character and link limits",
    intro: "A Threads post can contain up to 500 characters and 5 links, while a Threads bio can contain up to 150 characters. Check the relevant field before publishing.",
    sections: [
      {
        title: "What are the Threads character and link limits?",
        body: (
          <>
            <div className={t.tableWrap}>
              <table className={t.table}>
                <thead>
                  <tr><th scope="col">Threads item</th><th scope="col">Limit</th></tr>
                </thead>
                <tbody>
                  {limitRows.map(([label, value]) => (
                    <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Select Post or Bio in the counter to see how many characters remain. The link warning applies to Threads
              posts and appears when your draft contains more than 5 links.
            </p>
          </>
        ),
      },
      {
        title: "What counts toward a Threads character limit?",
        body: (
          <ul>
            <li><b>Letters, numbers and punctuation count.</b> Spaces and line breaks also occupy characters.</li>
            <li><b>Emoji count by code point.</b> A single emoji such as 😀 counts as 1; combined emoji can contain multiple code points.</li>
            <li><b>Links and hashtags are included.</b> Their characters contribute to the 500-character post total.</li>
            <li><b>Words are separated by whitespace.</b> The word and line totals are guides, not separate Threads limits.</li>
          </ul>
        ),
      },
      {
        title: "How does the 5-link warning work?",
        body: (
          <p>
            The counter finds links beginning with http:// or https://. A post with 6 or more links triggers a warning and
            shows how many to remove. Removing a link also removes its characters from your post total.
          </p>
        ),
      },
      {
        title: "Check the post, then put it on the calendar",
        body: (
          <p>
            Use the counter to finish your draft, then open the <Link href="/threads-scheduler">Threads scheduler</Link> to
            connect through Meta&apos;s official sign-in and choose a publishing time. New to Poskoo? <Link href="/signup">Sign up free</Link> to
            plan Threads, Instagram and Facebook posts from one calendar.
          </p>
        ),
      },
    ],
  },
  faqTitle: "Threads character counter questions",
  faqs: [
    {
      q: "What is the Threads character limit?",
      a: "A Threads post can contain up to 500 characters, and a Threads bio can contain up to 150 characters. Select the matching field above to see how many characters remain.",
    },
    {
      q: "Do emoji count?",
      a: "Yes. Emoji count toward the Threads character limit. This tool counts Unicode code points, so 😀 counts as 1, while a combined emoji can contain multiple code points.",
    },
    {
      q: "How many links can a Threads post have?",
      a: "A Threads post can have up to 5 links. The counter warns you when it finds 6 or more links and shows how many you need to remove.",
    },
    {
      q: "Can I go beyond 500 characters?",
      a: "No. A Threads post must be 500 characters or fewer. Shorten your draft until the remaining count reaches zero or above and the progress bar is no longer red.",
    },
  ],
  related: ["/tools/threads-post-preview", "/tools/linkedin-character-counter", "/tools/instagram-caption-counter", "/tools/threads-thread-maker"],
  schema: {
    features: [
      "Threads 500-character post and 150-character bio limits",
      "Code-point character counting with word and line totals",
      "Hashtag and link counting with a 5-link warning",
      "Live remaining count with an over-limit progress bar",
      "Copy and clear controls with no text upload",
    ],
  },
  cta: {
    title: "Your Threads post fits.",
    mark: "Now schedule it.",
    text: "Connect Threads through Meta's official sign-in, add your post to Poskoo's calendar and publish it at the time you choose.",
  },
};

export const metadata = toolMetadata(config);

export default function ThreadsCharacterCounterPage() {
  return (
    <ToolPageTemplate config={config}>
      <ThreadsCharCounter />
    </ToolPageTemplate>
  );
}
