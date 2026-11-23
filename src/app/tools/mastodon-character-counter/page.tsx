import type { Metadata } from "next";
import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import MastodonCharCounter from "./MastodonCharCounter";

const limitRows: [string, string][] = [
  ["Post (default)", "500 characters"],
  ["Post (your server)", "Server-set limit, often higher"],
  ["Link of any length", "23 characters"],
  ["Remote mention @user@server", "Only @user is counted"],
  ["Local mention @user", "Counted as typed"],
];

const config: ToolPageConfig = {
  path: "/tools/mastodon-character-counter",
  name: "Mastodon character counter",
  crumb: "Mastodon character counter",
  title: "Mastodon Character Counter: 500 Limit, Links as 23",
  description: "Free Mastodon character counter for the default 500-character limit. Links count as 23, mentions count only the username, and set your server's limit.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "Mastodon character counter" },
  lede: "Most Mastodon servers allow 500 characters per post; links always count as 23 and mentions count only the username.",
  art: "writing",
  artLabel: "A creator writes a Mastodon post beside a character meter, a flying link and a mention bubble",
  heroPoints: ["500-character default limit", "Links count as 23", "No signup"],
  toolTitle: "Count your Mastodon post",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Mastodon character counter",
  steps: [
    {
      title: "Set your server's limit",
      text: "Leave the limit at 500 for most servers, or enter the higher limit your Mastodon server allows.",
      art: "analytics",
    },
    {
      title: "Write or paste your post",
      text: "Add your draft to the text box. Every http(s) link counts as 23 characters and a remote mention such as @user@server counts only as @user.",
      art: "writing",
    },
    {
      title: "Check what is left and copy",
      text: "Watch the remaining count, links and mentions. Trim anything over the limit, then press Copy to use your post.",
      art: "visual",
    },
  ],
  featuresTitle: "Count your post the way Mastodon does",
  features: [
    {
      title: "Links always count as 23",
      text: "A full https:// link counts as 23 characters, however long the address is. The counter replaces each URL with the same fixed length Mastodon uses.",
      art: "analytics",
    },
    {
      title: "Mentions drop the domain",
      text: "A remote mention like @alice@mastodon.social counts only as @alice. Typing your own server's domain does not push the post over the limit.",
      art: "writing",
    },
    {
      title: "Any server limit",
      text: "Start at the 500-character default, then enter your server's own limit if it allows more. Your text never leaves your browser.",
      art: "visual",
    },
  ],
  guide: {
    title: "How Mastodon counts characters",
    intro: "Mastodon's default post limit is 500 characters, but links and remote mentions are not counted the way you might expect. The table below shows the rules this counter applies.",
    sections: [
      {
        title: "Mastodon character counting rules",
        body: (
          <>
            <div className={t.tableWrap}>
              <table className={t.table}>
                <thead>
                  <tr><th scope="col">Item</th><th scope="col">How Mastodon counts it</th></tr>
                </thead>
                <tbody>
                  {limitRows.map(([label, value]) => (
                    <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Every <code>http://</code> or <code>https://</code> link is counted as 23 characters, no matter how long the
              URL is. A remote mention keeps only the username part, so <code>@alice@mastodon.social</code> counts as six
              characters: <code>@alice</code>.
            </p>
          </>
        ),
      },
      {
        title: "Why links count as 23 characters",
        body: (
          <p>
            Mastodon gives every link the same fixed length so that a long URL does not use up your whole post. This is
            the same idea as X&apos;s 23-character link rule. Shortening a URL yourself does not reduce the count below 23,
            because the fixed length is already applied to the full link.
          </p>
        ),
      },
      {
        title: "Do spaces, emoji and hashtags count?",
        body: (
          <ul>
            <li><b>Spaces and line breaks count.</b> Each one uses a character in your post.</li>
            <li><b>Emoji count as they appear.</b> This counter counts visible characters with Array.from, so a combined emoji is read as its code points.</li>
            <li><b>Hashtags count in full.</b> The # sign, letters and numbers all use characters.</li>
            <li><b>Local mentions count in full.</b> A mention without a domain, such as @alice, is counted as typed.</li>
          </ul>
        ),
      },
      {
        title: "Check the post, then put it on the calendar",
        body: (
          <p>
            Use the counter to finish your draft, then open the <Link href="/mastodon-scheduler">Mastodon scheduler</Link> to
            connect your server with OAuth and choose a publishing time. If you are setting up your first scheduled post,
            follow the <Link href="/help/schedule-mastodon-posts">step-by-step Mastodon scheduling guide</Link>. New to
            Poskoo? <Link href="/signup">Sign up free</Link> to plan Mastodon posts beside your other social channels.
          </p>
        ),
      },
    ],
  },
  faqTitle: "Mastodon character counter questions",
  faqs: [
    {
      q: "How many characters can a Mastodon post have?",
      a: "Most Mastodon servers allow 500 characters per post, which is the default. Some servers raise the limit, so enter your server's limit in the counter if it allows more.",
    },
    {
      q: "How much does a link count on Mastodon?",
      a: "Every http:// or https:// link counts as 23 characters on Mastodon, regardless of its actual length. This includes long paths and query strings.",
    },
    {
      q: "How are @user@server mentions counted?",
      a: "A remote mention counts only as @user, so the domain part is not counted. For example, @alice@mastodon.social counts as the six characters in @alice.",
    },
    {
      q: "Do spaces and emoji count toward the limit?",
      a: "Yes. Spaces and line breaks count as characters. Emoji are counted as their visible code points, so a simple emoji usually counts as one and a combined emoji can use more.",
    },
    {
      q: "Is my Mastodon post uploaded or saved?",
      a: "No. All counting happens in your browser. Your post is not uploaded or saved, and you do not need to sign in to use the counter.",
    },
  ],
  related: ["/tools/bluesky-character-counter", "/tools/threads-character-counter", "/tools/x-character-counter", "/tools/linkedin-character-counter"],
  schema: {
    features: [
      "Mastodon character counting against the 500 default and any server limit",
      "Full http(s) URLs counted as 23 characters",
      "Remote mentions counted by username only",
      "Link and mention totals with remaining characters",
      "Copy and clear controls with no text upload",
    ],
  },
  cta: {
    title: "Your Mastodon post fits.",
    mark: "Now schedule it.",
    text: "Connect your Mastodon server with OAuth, add your post to Poskoo's calendar and publish it at the time you choose.",
  },
};

export const metadata: Metadata = {
  ...toolMetadata(config),
  title: { absolute: "Mastodon Character Counter: 500 Limit, Links as 23" },
  alternates: { canonical: config.path },
};

export default function MastodonCharacterCounterPage() {
  return (
    <ToolPageTemplate config={config}>
      <MastodonCharCounter />
    </ToolPageTemplate>
  );
}
