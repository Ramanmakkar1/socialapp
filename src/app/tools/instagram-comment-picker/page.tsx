import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import CommentPicker from "./CommentPicker";

const config: ToolPageConfig = {
  path: "/tools/instagram-comment-picker",
  name: "Instagram comment picker",
  crumb: "Comment picker",
  title: "Instagram Comment Picker: Free Random Giveaway Winner",
  description:
    "Free Instagram comment picker: paste giveaway comments, filter by keyword and tagged friends, keep one entry per person and pick up to 10 random winners.",
  pill: "Free · no login · comments never leave your browser",
  h1: { before: "Instagram comment", mark: "picker", after: "for giveaways" },
  lede: "Paste the comments from your giveaway post, filter by keyword and tagged friends, and pick random winners in seconds. No Instagram login, no scraping.",
  art: "card-dm",
  artLabel: "A relaxed creator on a beanbag while DMs fly out of his phone to followers",
  heroPoints: ["Up to 10 winners", "One entry per person", "No login"],
  toolTitle: "Pick your giveaway winner",
  toolNote: "Free · comments stay in your browser",
  stepsTitle: "How to use the Instagram comment picker",
  steps: [
    {
      title: "Paste the comments",
      text: "Copy the comments from your giveaway post and paste them into the box, one per line, or press Try sample comments to see how it works.",
      art: "writing",
    },
    {
      title: "Apply your giveaway rules",
      text: "Set an optional Keyword, the Min tagged friends and the number of Winners (1 to 10), and keep One entry per person ticked.",
      art: "card-dm",
    },
    {
      title: "Pick and copy the result",
      text: "Press Pick winner. The tool draws at random from the valid entries, then Copy result copies the winners with the entry count.",
      art: "feat-leads",
    },
  ],
  featuresTitle: "A fair draw without handing over your login",
  features: [
    {
      title: "Filters that match your rules",
      text: "Count only comments with your keyword and a minimum number of @tags, and give everyone one entry however often they commented.",
      art: "card-dm",
    },
    {
      title: "Uniform random draw",
      text: "Winners are drawn with a Fisher-Yates shuffle, so every valid entry has the same chance and nobody is picked twice.",
      art: "feat-leads",
    },
    {
      title: "Private by design",
      text: "The picker does not use the Instagram API or scrape anything. Your pasted comments are processed only in your browser.",
      art: "card-leads",
    },
  ],
  guide: {
    title: "How to run a fair Instagram giveaway",
    intro:
      "A giveaway only builds trust if the rules are clear and the draw is fair. This guide covers how the picker reads your comments, how to set up rules that are easy to check, and how to announce the result.",
    sections: [
      {
        title: "How the comment picker works",
        body: (
          <>
            <p>Each non-empty line you paste becomes one entry. The picker recognises these formats:</p>
            <ul>
              <li><code>@username: comment</code> or <code>username: comment</code></li>
              <li><code>@username comment</code></li>
              <li><code>username comment</code>, when the first word looks like an Instagram handle</li>
              <li>plain comment text with no username</li>
            </ul>
            <p>
              The <b>Keyword</b> filter keeps comments that contain the word or phrase as a whole word, ignoring case,
              accents and punctuation. <b>Min tagged friends</b> counts @mentions in the comment text.{" "}
              <b>One entry per person</b> keeps only the first comment from each username (plain lines are de-duplicated
              by their exact text).
            </p>
          </>
        ),
      },
      {
        title: "Example: the sample comments",
        body: (
          <>
            <p>
              Press <b>Try sample comments</b> and you get 6 pasted lines. With the keyword <code>win</code>, one entry
              per person and no tag minimum, 4 entries are valid: <code>@anna.k</code> (her second comment is dropped),{" "}
              <code>@ben_r</code>, <code>@dev.ops</code> and <code>@ella</code>. <code>@cara</code> did not use the
              keyword.
            </p>
            <div className={t.example}>
              <p><b>4</b> valid entries of 6 pasted</p>
              <p>Set Min tagged friends to 2: <b>2</b> valid entries (@anna.k and @dev.ops)</p>
            </div>
          </>
        ),
      },
      {
        title: "Giveaway best practices in 2026",
        body: (
          <ul>
            <li>
              <b>Write the rules in the caption:</b> what counts as an entry, the deadline, who can enter and what the
              prize is.
            </li>
            <li>
              <b>Follow Instagram&apos;s rules.</b> Check the current{" "}
              <a href="https://help.instagram.com/179379842258600" target="_blank" rel="noopener noreferrer">
                promotion guidelines
              </a>{" "}
              before you post; they include stating that Instagram does not sponsor the promotion.
            </li>
            <li>
              <b>Close entries before you copy.</b> Copy the comments only after the deadline so late entries are not
              included.
            </li>
            <li>
              <b>Keep a record.</b> Screen-record the draw and save the copied result in case anyone asks.
            </li>
            <li>
              <b>Contact winners from your own account</b> and warn followers that you never ask for passwords or payment.
            </li>
          </ul>
        ),
      },
      {
        title: "Turn giveaway comments into conversations",
        body: (
          <p>
            A giveaway post often gets far more comments than usual. With{" "}
            <Link href="/instagram-auto-dm">Instagram auto-DM</Link>, everyone who comments your entry keyword can get an
            instant DM, for example to confirm the entry or share a discount code for those who do not win. Check the
            keyword first with the <Link href="/tools/instagram-comment-keyword-tester">comment keyword tester</Link>.
          </p>
        ),
      },
      {
        title: "Common giveaway mistakes",
        body: (
          <ul>
            <li>Leaving lines such as timestamps, &ldquo;Reply&rdquo; or like counts in the pasted text, which then count as entries.</li>
            <li>Changing the rules after entries have closed.</li>
            <li>Letting people who commented many times get extra chances when the rules say one entry each.</li>
            <li>Asking for &ldquo;tag 5 friends&rdquo; when fewer tags would bring more genuine entries.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram comment picker questions",
  faqs: [
    {
      q: "Is this Instagram comment picker free?",
      a: "Yes. It is free, needs no signup and has no limit on how many comments you paste or how many times you pick. Each draw picks between 1 and 10 winners.",
    },
    {
      q: "Do you need my Instagram password?",
      a: "No. The tool never asks for a password and does not connect to Instagram at all. You paste the comments yourself, and they are processed only in your browser.",
    },
    {
      q: "How do I copy comments from an Instagram post?",
      a: "Open the post, load all the comments, then select and copy them and paste them into the box. Each line can be '@username: comment', 'username comment' or just the comment text. Delete lines that are not comments, such as times or 'Reply'.",
    },
    {
      q: "Can it filter comments by keyword?",
      a: "Yes. Type a keyword such as 'win' and only comments that contain that word (in any capitals) count as entries. You can also require a minimum number of tagged friends and allow only one entry per person.",
    },
    {
      q: "How are winners chosen?",
      a: "The picker shuffles the valid entries at random with a Fisher-Yates shuffle and takes the first ones, so every valid entry has an equal chance and no entry is picked twice in a draw.",
    },
  ],
  related: [
    "/tools/instagram-comment-keyword-tester",
    "/tools/instagram-comment-to-dm-preview",
    "/tools/instagram-engagement-rate-calculator",
    "/tools/instagram-caption-generator",
    "/tools/instagram-post-ideas-generator",
  ],
  schema: {
    features: [
      "Paste comments, one per line",
      "Keyword and minimum tagged-friends filters",
      "One entry per person",
      "Pick 1 to 10 random winners",
      "Copy the result, no login",
    ],
  },
  cta: {
    title: "Got hundreds of comments?",
    mark: "DM every one of them.",
    text: "Schedule your next giveaway post with Poskoo and auto-DM everyone who comments your entry keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramCommentPickerPage() {
  return (
    <ToolPageTemplate config={config}>
      <CommentPicker />
    </ToolPageTemplate>
  );
}
