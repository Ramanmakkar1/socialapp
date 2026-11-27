import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import KeywordTesterTool from "./KeywordTesterTool";

const config: ToolPageConfig = {
  path: "/tools/instagram-comment-keyword-tester",
  name: "Instagram comment keyword tester",
  crumb: "Comment keyword tester",
  title: "Instagram Comment Keyword Tester for Auto-DM Rules",
  description:
    "Free Instagram comment keyword tester: check which comments match GUIDE or LINK with contains or exact match before your auto-DM rule goes live.",
  pill: "Free · runs in your browser · nothing is sent",
  h1: { before: "Instagram comment", mark: "keyword tester" },
  lede: "Check which comments would trigger your auto-DM keyword before you publish the rule. The tester uses the same matching code as Poskoo's in-app rule editor.",
  art: "card-dm",
  artLabel: "A relaxed creator on a beanbag tests comment keywords as DMs fly from their phone to followers",
  heroPoints: ["Contains or exact match", "Same logic as live rules", "No login"],
  toolTitle: "Test your comment keywords",
  toolNote: "Free · local simulation only",
  stepsTitle: "How to use the Instagram comment keyword tester",
  steps: [
    {
      title: "Enter your keywords",
      text: "Type one or more keywords in the Keywords box, separated by commas (for example GUIDE, LINK). Each one appears as a chip below.",
      art: "writing",
    },
    {
      title: "Pick a match type",
      text: "Choose Comment contains keyword or Comment matches exactly in the Match type menu, the same two options as an auto-DM rule.",
      art: "card-dm",
    },
    {
      title: "Try example comments",
      text: "Type an Example comment or tap a sample such as send GUIDE please. The status line tells you whether it matched and which keyword.",
      art: "feat-dm",
    },
  ],
  featuresTitle: "Catch keyword problems before followers do",
  features: [
    {
      title: "The real matching code",
      text: "The tester calls the same function Poskoo uses for live comment rules, so what matches here matches in the app.",
      art: "feat-dm",
    },
    {
      title: "Forgiving where it should be",
      text: "Case, accents, punctuation, extra spaces and leading @mentions are ignored, so guide! and @friend GUIDE still count.",
      art: "writing",
    },
    {
      title: "Strict where it matters",
      text: "Keywords match as whole words, so GUIDE does not fire on guidebook. Exact mode rejects longer sentences entirely.",
      art: "card-leads",
    },
  ],
  guide: {
    title: "How to choose and test an Instagram comment keyword",
    intro:
      "A comment keyword is the word you ask followers to comment so an automation can send them a DM. A good keyword is easy to type and rare in normal conversation. This guide explains how matching works and how to pick a keyword that triggers exactly when you want it to.",
    sections: [
      {
        title: "How keyword matching works",
        body: (
          <>
            <p>Before comparing anything, the tester normalizes both the comment and each keyword:</p>
            <ul>
              <li>lowercases the text and strips accents, so <code>Guíde</code> becomes <code>guide</code>;</li>
              <li>removes @mentions at the start of the comment;</li>
              <li>turns punctuation into spaces and collapses repeated spaces;</li>
              <li>treats each emoji as its own word, so an emoji such as 🔥 can be a keyword.</li>
            </ul>
            <p>
              Then it checks your keywords in order. <b>Contains</b> matches when a keyword appears as a whole word or
              phrase anywhere in the comment. <b>Exact</b> matches only when the whole normalized comment equals the
              keyword.
            </p>
          </>
        ),
      },
      {
        title: "Contains or exact: which to choose",
        body: (
          <ul>
            <li>
              <b>Contains</b> is the forgiving choice. People rarely type just one word; they write &ldquo;GUIDE
              please&rdquo; or &ldquo;can I get the guide&rdquo;, and contains still catches them.
            </li>
            <li>
              <b>Exact</b> suits short, unusual keywords when you want only deliberate requests, for example when the
              keyword is a common word that also appears in normal comments.
            </li>
            <li>
              Multi-word keywords work too: <code>free guide</code> in contains mode matches &ldquo;send me the free
              guide&rdquo;.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: GUIDE tested both ways",
        body: (
          <>
            <p>These results come from the tester with the keyword GUIDE:</p>
            <div className={t.tableWrap}>
              <table className={t.table}>
                <thead>
                  <tr><th>Comment</th><th>Contains</th><th>Exact</th></tr>
                </thead>
                <tbody>
                  <tr><td><code>GUIDE</code></td><td>Match</td><td>Match</td></tr>
                  <tr><td><code>guide!</code></td><td>Match</td><td>Match</td></tr>
                  <tr><td><code>@mia GUIDE</code></td><td>Match</td><td>Match</td></tr>
                  <tr><td><code>send GUIDE please</code></td><td>Match</td><td>No match</td></tr>
                  <tr><td><code>guidebook pls</code></td><td>No match</td><td>No match</td></tr>
                  <tr><td><code>hello</code></td><td>No match</td><td>No match</td></tr>
                </tbody>
              </table>
            </div>
            <p>
              The status line reports the normalized keyword, for example{" "}
              <code>Matched keyword: &ldquo;guide&rdquo;</code>.
            </p>
          </>
        ),
      },
      {
        title: "Best practices for comment keywords in 2026",
        body: (
          <ul>
            <li><b>One short, distinctive word.</b> GUIDE, LINK, PRICE or a product name are easy to spell on a phone.</li>
            <li><b>Avoid everyday words.</b> hi, yes, love or thanks appear in ordinary comments and would trigger DMs no one asked for.</li>
            <li><b>Say it clearly.</b> Put the keyword in the caption, on the Reel cover and in the first line, written the same way each time.</li>
            <li>
              <b>Add likely variants.</b> If people may type a plural or a synonym, list it as a second keyword.
            </li>
            <li>
              <b>Preview the whole flow.</b> Once the keyword works, check the DM it sends in the{" "}
              <Link href="/tools/instagram-comment-to-dm-preview">comment-to-DM preview</Link>.
            </li>
          </ul>
        ),
      },
      {
        title: "Common keyword mistakes",
        body: (
          <ul>
            <li>Expecting contains mode to match part of a word, such as GUIDE inside guidebook.</li>
            <li>Choosing exact mode and then asking people to &ldquo;comment GUIDE below with your question&rdquo;.</li>
            <li>Using a keyword that is hard to spell or autocorrects to something else.</li>
            <li>
              Forgetting that a live rule also needs a connected account and active status. Set that up in{" "}
              <Link href="/instagram-auto-dm">Instagram auto-DM</Link>.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Comment keyword questions",
  faqs: [
    {
      q: "What keyword should I use for Instagram comment auto-DM?",
      a: "Pick one short, distinctive word followers can spell easily, such as GUIDE, LINK or PRICE. Avoid common words like hi, yes or thanks: they appear in ordinary comments and can trigger DMs you did not intend.",
    },
    {
      q: "What is the difference between contains and exact match?",
      a: "Contains matches when the normalized comment includes your keyword as a whole word or phrase anywhere, for example send GUIDE please. Exact requires the whole comment to equal the keyword after normalization, so GUIDE and guide! match but longer sentences do not.",
    },
    {
      q: "Does capitalisation or punctuation matter?",
      a: "No. Both modes ignore case, accents and punctuation, collapse extra spaces and remove @mentions at the start of a comment before comparing.",
    },
    {
      q: "Can I test several keywords at once?",
      a: "Yes. Separate keywords with commas in the Keywords box. A comment matches if any of the keywords matches.",
    },
    {
      q: "Does this tester send real DMs?",
      a: "No. Everything runs locally in your browser using the same keyword-matching code as Poskoo auto-DM rules. Nothing is saved, uploaded or sent to Instagram.",
    },
    {
      q: "How does a comment keyword trigger a DM in Poskoo?",
      a: "Connect Instagram, create a rule with keywords and a DM message, and choose which posts it applies to. When someone comments a matching keyword, Poskoo sends your DM through the official Meta API if the rule is active and delivery rules allow it.",
    },
  ],
  related: [
    "/tools/instagram-comment-to-dm-preview",
    "/tools/instagram-comment-to-dm-calculator",
    "/tools/instagram-dm-link-generator",
    "/tools/instagram-comment-picker",
    "/tools/instagram-caption-generator",
  ],
  schema: {
    features: [
      "Contains and exact keyword matching",
      "Several comma-separated keywords",
      "Same normalization as live auto-DM rules",
      "Sample comments to test instantly",
      "Runs locally, nothing sent",
    ],
  },
  cta: {
    title: "Your keyword works.",
    mark: "Now let it send the DMs.",
    text: "Create a Poskoo rule with this keyword and your message, and every matching comment gets a DM through the official Meta API.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramCommentKeywordTesterPage() {
  return (
    <ToolPageTemplate config={config}>
      <KeywordTesterTool />
    </ToolPageTemplate>
  );
}
