import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import ThreadMaker from "./ThreadMaker";

const config: ToolPageConfig = {
  path: "/tools/x-thread-maker",
  name: "X (Twitter) thread maker",
  crumb: "X (Twitter) thread maker",
  title: "Twitter Thread Maker: Split Text Into 280-Character Posts",
  description:
    "Paste long text and this free Twitter thread maker splits it into numbered X posts of up to 280 characters at sentence breaks. Copy each post. No signup.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Twitter thread maker:", mark: "split long text", after: "into numbered X posts" },
  lede: "A Twitter thread is a series of connected posts, and each one can be up to 280 characters. Paste your long text and this free thread maker splits it at sentence breaks, numbers each post and keeps every one inside the limit.",
  art: "writing",
  artLabel: "A creator splits a long document into numbered post cards beside a phone",
  heroPoints: ["280-character posts", "Numbered 1/5", "Copy each post"],
  toolTitle: "Split your text into a thread",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Twitter thread maker",
  steps: [
    {
      title: "Paste your long text",
      text: "Add the article, notes or script you want to turn into a thread. The sample shows a short piece about scheduling posts that you can replace.",
      art: "writing",
    },
    {
      title: "Choose numbering",
      text: "Keep Add numbering on to label each post 1/5, then pick whether the label sits at the end or the start of the post.",
      art: "analytics",
    },
    {
      title: "Copy each post or copy all",
      text: "Check the weighted count on every card, then copy posts one at a time or use Copy all to paste the whole thread in order.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "A thread splitter that respects the 280 limit",
  features: [
    {
      title: "Splits at sentence breaks",
      text: "The tool packs whole sentences into each post first, so your thread reads naturally instead of cutting mid-thought.",
      art: "writing",
    },
    {
      title: "Counts the way X counts",
      text: "Every post shows its weighted count out of 280, with links counted as 23 and emoji as 2, so nothing goes over the limit.",
      art: "analytics",
    },
    {
      title: "Numbering included",
      text: "Numbering is reserved before the text is packed, so the 1/5 label never pushes a post past 280 characters.",
      art: "card-schedule",
    },
  ],
  guide: {
    title: "How to write a Twitter thread that people finish",
    intro:
      "A thread is a chain of posts where each reply continues the last. It lets you explain an idea that does not fit in one post, but only if the opening makes people want to keep reading. Here is how to split and structure one.",
    sections: [
      {
        title: "What is a Twitter thread?",
        body: (
          <>
            <p>
              A thread is a series of posts connected as replies, so readers can follow one longer idea from start to
              finish. Each post still has to fit X&apos;s 280-character limit, which is why a long draft needs splitting.
            </p>
            <p>
              This tool splits on blank lines first, then packs whole sentences into posts. If a single sentence is too
              long it falls back to words, and a single word longer than the limit is hard-split. Numbering is added
              after the total is known, so the labels are accurate.
            </p>
          </>
        ),
      },
      {
        title: "How long should a thread be?",
        body: (
          <p>
            Most useful threads run 3 to 8 posts. That is long enough to explain one idea with an example and a next
            step, and short enough that readers reach the end. If your draft needs 20 posts, it may work better as an
            article with a short thread pointing to it.
          </p>
        ),
      },
      {
        title: "Put the hook in post 1",
        body: (
          <p>
            The first post is the only one most people see in their feed. Lead with the promise or the surprising
            result, not with background. A clear first line earns the tap that opens the rest of the thread.
          </p>
        ),
      },
      {
        title: "End with one call to action",
        body: (
          <p>
            Use the last post to ask for one thing: follow, reply, save the thread or tap your link. One ask is easier
            to act on than three. If you want to keep the conversation going, reply to your own thread with a question.
          </p>
        ),
      },
    ],
  },
  faqTitle: "Twitter thread questions",
  faqs: [
    {
      q: "How long can each post in an X thread be?",
      a: "Each post in an X thread can be up to 280 weighted characters on a standard account. X Premium accounts can post up to 25,000 characters, but this tool splits to the standard 280 limit so the thread works for every reader.",
    },
    {
      q: "Does numbering count toward 280?",
      a: "Yes. The 1/5 label is part of the post text, so it counts toward the 280-character limit. This tool reserves room for the numbering before it packs the text, so a numbered post never goes over.",
    },
    {
      q: "Do links count as 23 characters?",
      a: "Yes. X counts every link as 23 weighted characters, however long the address is. The counter on each post uses the same rule, so a post with a link is measured the way X will measure it.",
    },
    {
      q: "Can I schedule a thread?",
      a: "Poskoo's X scheduler connects X through its official sign-in and schedules individual posts on a calendar. It does not currently publish a whole thread as one scheduled item, so schedule each post in the thread at the times you want.",
    },
  ],
  related: [
    "/tools/x-character-counter",
    "/tools/x-post-preview",
    "/tools/x-hashtag-generator",
    "/tools/x-bio-generator",
    "/tools/threads-character-counter",
  ],
  schema: {
    features: [
      "Splits long text into posts of up to 280 weighted characters",
      "Packs whole sentences before falling back to words",
      "Optional 1/5 numbering at the start or end",
      "Weighted count on every post, with links as 23 and emoji as 2",
      "Copy each post or copy the whole thread",
      "Runs in the browser, no signup",
    ],
  },
  cta: {
    title: "Your thread is ready.",
    mark: "Now schedule the posts.",
    text: "Connect X through its official sign-in and add each post to Poskoo's calendar with the X scheduler at /x-scheduler.",
  },
};

export const metadata = toolMetadata(config);

export default function XThreadMakerPage() {
  return (
    <ToolPageTemplate config={config}>
      <ThreadMaker />
    </ToolPageTemplate>
  );
}
