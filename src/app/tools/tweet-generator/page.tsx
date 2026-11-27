import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import { networkAvailability, availabilityPhrase } from "@/components/ChannelStatusNote";
import CaptionGeneratorTool from "../instagram-caption-generator/CaptionGeneratorTool";

export const revalidate = 600;

const config: ToolPageConfig = {
  path: "/tools/tweet-generator",
  name: "Tweet generator",
  crumb: "Tweet generator",
  title: "Tweet Generator: Free X (Twitter) Post Ideas in Seconds",
  description:
    "Free tweet generator: enter a topic and copy six ready-to-post tweets with a hook and call to action, all within X's 280-character limit. No signup.",
  pill: "Free · no signup · no AI or scraping",
  h1: { before: "Tweet generator:", mark: "X post ideas", after: "in seconds" },
  lede: "A tweet (X post) can be up to 280 characters on a free account. Type your topic to get six ready-to-copy tweets with a hook and a call to action.",
  art: "writing",
  artLabel: "A creator writes short X posts with a hook and a call to action",
  heroPoints: ["Six tweet drafts", "280-character limit", "Hook plus call to action"],
  toolTitle: "Generate your tweets",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate tweets",
  steps: [
    {
      title: "Enter your topic",
      text: "Describe the idea, product or update you want to post about. A specific topic gives the templates a sharper hook and a clearer subject.",
      art: "writing",
    },
    {
      title: "Pick a goal and tone",
      text: "Choose what the tweet should achieve and how it should sound. You can include emojis or keep every draft plain.",
      art: "card-schedule",
    },
    {
      title: "Review, check the count and copy",
      text: "Compare the six tweets, preview one the way it appears in the timeline and check its character count. Edit as needed, then copy it into X.",
      art: "visual",
    },
  ],
  featuresTitle: "Tweets built for the X timeline",
  features: [
    {
      title: "Six directions to compare",
      text: "Each run gives you six tweet drafts built around your topic, each with a hook, supporting lines and a clear call to action.",
      art: "writing",
    },
    {
      title: "Hooks that stop the scroll",
      text: "The first line does the work. Drafts lead with a question, a bold claim or a quick tip, then give people a reason to reply.",
      art: "visual",
    },
    {
      title: "The 280-character limit is built in",
      text: "Every tweet is checked against X's 280-character limit. Extra body lines are dropped first, so the hook and call to action survive.",
      art: "legal",
    },
  ],
  guide: {
    title: "A practical guide to writing tweets",
    intro:
      "A strong tweet says one thing clearly, opens with a hook and ends with a reason to reply. Use these drafts as a starting point, then add the details only you can supply.",
    sections: [
      {
        title: "How long can a tweet be?",
        body: (
          <>
            <p>
              A tweet can be up to <b>280 characters</b> on a free X account. X Premium accounts can post longer
              updates, but 280 remains the safe target for most posts. Links count as 23 characters regardless of their
              real length, which is why a tidy tweet often ends with a short link.
            </p>
            <p>
              Use the <Link href="/tools/x-character-counter">X character counter</Link> to check a tweet you have
              already written. If your idea needs more room, the{" "}
              <Link href="/tools/x-thread-maker">X thread maker</Link> splits it into numbered posts at sentence breaks.
            </p>
          </>
        ),
      },
      {
        title: "How to write a tweet that gets replies",
        body: (
          <>
            <p>
              Ask a question people can answer in one line. Share an opinion and invite disagreement. Reply to your own
              tweet with extra context instead of cramming everything into one post. The <b>hook</b> earns the pause,
              and the <b>call to action</b> earns the reply.
            </p>
            <p>
              Keep the wording plain and the idea specific. A tweet about one small result usually beats a vague
              announcement. Post when your audience is active, and use the{" "}
              <Link href="/tools/best-time-to-post-on-x">best time to post on X</Link> guide to plan around your time
              zone.
            </p>
          </>
        ),
      },
      {
        title: "How many hashtags should a tweet have?",
        body: (
          <>
            <p>
              Most tweets need no hashtags at all, or one or two. Hashtags help when people follow a specific topic or
              event, but a pile of unrelated tags makes a post look like spam and eats into the 280 characters. Choose
              tags that describe the subject, not tags chosen for volume.
            </p>
            <p>
              Need a short set? Try the free{" "}
              <Link href="/tools/x-hashtag-generator">X hashtag generator</Link> and keep only the tags that fit the
              tweet naturally.
            </p>
          </>
        ),
      },
      {
        title: "Common tweet mistakes",
        body: (
          <ul>
            <li>Starting with context instead of the hook, so the point arrives too late.</li>
            <li>Writing past 280 characters and losing the call to action off the end.</li>
            <li>Packing in hashtags or links until the tweet is hard to read.</li>
            <li>Making several unrelated points instead of one clear idea.</li>
            <li>Publishing without a question, opinion or reason for people to reply.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Tweet generator questions",
  faqs: [
    {
      q: "How many characters can a tweet have?",
      a: "A tweet can be up to 280 characters on a free X account. X Premium accounts can post longer updates, but 280 is the limit this generator trims every draft to. Links count as 23 characters.",
    },
    {
      q: "Is this tweet generator free?",
      a: "Yes. The generator is free, needs no signup and runs entirely in your browser. It does not use AI, upload your text or scrape X, and you can copy any draft with one click.",
    },
    {
      q: "How many tweets does it generate at once?",
      a: "Each run creates six tweet drafts for your topic. Pick a goal and tone, read the six options, then copy the one that fits or regenerate for a different order.",
    },
    {
      q: "What happens if a tweet is longer than 280 characters?",
      a: "The generator drops body lines first so the hook and call to action stay intact. If the tweet is still too long, it trims the text and ends it with an ellipsis so every draft fits within 280 characters.",
    },
    {
      q: "Should I use hashtags in a tweet?",
      a: "Usually no more than one or two, and often none. Hashtags help when people follow a specific topic or event, but unrelated tags look like spam and use up the 280-character limit. The X hashtag generator can suggest a short, relevant set.",
    },
    {
      q: "Can I schedule tweets with Poskoo?",
      a: "Yes. Connect X with its official login, plan tweets on one calendar and publish them automatically with Poskoo's X scheduler.",
    },
  ],
  related: [
    "/tools/x-post-generator",
    "/tools/x-character-counter",
    "/tools/x-thread-maker",
    "/tools/x-hashtag-generator",
    "/tools/best-time-to-post-on-x",
    "/x-scheduler",
  ],
  schema: {
    features: [
      "Six tweet drafts for any topic",
      "Goal and tone selection",
      "Optional emojis",
      "Hooks, bodies and calls to action",
      "Character counts against the 280-character X limit",
      "One-click copy with no signup, AI or scraping",
    ],
  },
  cta: {
    title: "Your tweets are ready.",
    mark: "Schedule the posts.",
    text: "Connect X with its official login, plan your tweets on one calendar and publish them automatically with Poskoo's X scheduler.",
  },
};

export const metadata = toolMetadata(config);

export default function TweetGeneratorPage() {
  const state = networkAvailability("x");
  const pageConfig =
    state === "live"
      ? config
      : {
          ...config,
          faqs: config.faqs.map((f) =>
            f.q === "Can I schedule tweets with Poskoo?"
              ? {
                  ...f,
                  a: `Not yet. X publishing in Poskoo is ${availabilityPhrase(state, "X")}. Until then, copy a draft from this generator and post it on X yourself.`,
                }
              : f,
          ),
        };
  return (
    <ToolPageTemplate config={pageConfig}>
      <CaptionGeneratorTool platform="x" />
    </ToolPageTemplate>
  );
}
