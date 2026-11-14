import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import ThreadMaker from "../x-thread-maker/ThreadMaker";

const config: ToolPageConfig = {
  path: "/tools/threads-thread-maker",
  name: "Threads thread maker",
  crumb: "Threads thread maker",
  title: "Threads Thread Maker: Split Long Text Into 500-Char Posts",
  description:
    "Paste long text and this free Threads thread maker splits it into numbered posts of up to 500 characters at sentence breaks. Copy each post. No signup.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Threads thread maker:", mark: "split long text", after: "into numbered posts" },
  lede: "A Threads thread is a series of connected posts, and each one can be up to 500 characters. Paste your long text and this free thread maker splits it at sentence breaks, numbers each post and keeps every one inside the limit.",
  art: "writing",
  artLabel: "A creator splits a long document into numbered Threads post cards beside a phone",
  heroPoints: ["500-character posts", "Numbered 1/5", "Copy each post"],
  toolTitle: "Split your text into a Threads thread",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Threads thread maker",
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
      text: "Check the count on every card, then copy posts one at a time or use Copy all to paste the whole thread in order.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "A thread splitter that respects the 500 limit",
  features: [
    {
      title: "Splits at sentence breaks",
      text: "The tool packs whole sentences into each post first, so your thread reads naturally instead of cutting mid-thought.",
      art: "writing",
    },
    {
      title: "Counts the way Threads counts",
      text: "Every post shows its count out of 500, measured by code point so an emoji such as 😀 counts as 1, just like the Threads character counter.",
      art: "analytics",
    },
    {
      title: "Numbering included",
      text: "Numbering is reserved before the text is packed, so the 1/5 label never pushes a post past 500 characters.",
      art: "card-schedule",
    },
  ],
  guide: {
    title: "How to write a Threads thread that people finish",
    intro:
      "A thread is a chain of posts where each reply continues the last. It lets you explain an idea that does not fit in one post, but only if the opening makes people want to keep reading. Here is how to split and structure one.",
    sections: [
      {
        title: "What is a Threads thread?",
        body: (
          <>
            <p>
              A thread is a series of posts connected as replies, so readers can follow one longer idea from start to
              finish. Each post still has to fit Threads&apos; 500-character limit, which is why a long draft needs splitting.
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
        title: "How do I add posts to a thread in the Threads app?",
        body: (
          <p>
            Publish the first post, then tap the reply button on it and write the next post as a reply. Repeat for each
            post in order. Because every reply is attached to the one before it, readers can follow the whole thread from
            the first post.
          </p>
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
  faqTitle: "Threads thread questions",
  faqs: [
    {
      q: "How long can each post in a Threads thread be?",
      a: "Each post in a Threads thread can be up to 500 characters. This tool splits to that 500-character limit and counts by code point, so an emoji such as 😀 counts as 1.",
    },
    {
      q: "Does numbering count toward 500?",
      a: "Yes. The 1/5 label is part of the post text, so it counts toward the 500-character limit. This tool reserves room for the numbering before it packs the text, so a numbered post never goes over.",
    },
    {
      q: "How do I add each post to a thread in the Threads app?",
      a: "Publish the first post, then reply to it with the next post, and repeat in order. Each reply becomes the next part of the thread, so readers can follow the whole chain from the first post.",
    },
    {
      q: "Can I schedule a Threads thread?",
      a: "Poskoo's Threads scheduler connects Threads through Meta's official sign-in and schedules individual posts on a calendar. It does not currently publish a whole thread as one scheduled item, so schedule each post in the thread at the times you want.",
    },
  ],
  related: [
    "/tools/threads-character-counter",
    "/tools/threads-post-preview",
    "/tools/threads-bio-generator",
    "/tools/x-thread-maker",
  ],
  schema: {
    features: [
      "Splits long text into posts of up to 500 characters",
      "Packs whole sentences before falling back to words",
      "Optional 1/5 numbering at the start or end",
      "Code-point count on every post, so emoji count as 1",
      "Copy each post or copy the whole thread",
      "Runs in the browser, no signup",
    ],
  },
  cta: {
    title: "Your thread is ready.",
    mark: "Now schedule the posts.",
    text: "Connect Threads through Meta's official sign-in and add each post to Poskoo's calendar with the Threads scheduler at /threads-scheduler.",
  },
};

export const metadata = toolMetadata(config);

export default function ThreadsThreadMakerPage() {
  return (
    <ToolPageTemplate config={config}>
      <ThreadMaker platform="threads" />
    </ToolPageTemplate>
  );
}
