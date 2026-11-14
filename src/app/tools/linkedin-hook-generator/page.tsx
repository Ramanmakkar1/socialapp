import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import HookGenerator from "../instagram-hook-generator/HookGenerator";

const config: ToolPageConfig = {
  path: "/tools/linkedin-hook-generator",
  name: "LinkedIn hook generator",
  crumb: "Hook generator",
  title: "LinkedIn Hook Generator: Free First Lines That Get Clicks",
  description:
    "A LinkedIn hook is the first line people see before '...see more'. Type your topic and copy first lines in eight styles, sized for the first 210 characters.",
  pill: "Free · no signup · no AI",
  h1: { before: "LinkedIn hook generator:", mark: "first lines", after: "that get clicks" },
  lede: "A LinkedIn hook is the first line or two people see in the feed before “…see more”. Type what your post is about and get ready-to-copy opening lines in eight styles, written to land in that first line.",
  art: "writing",
  artLabel: "A professional writes a LinkedIn post with a bold first line before the see more link",
  heroPoints: ["8 hook styles", "48 hooks per topic", "One-click copy"],
  toolTitle: "Generate LinkedIn hooks",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the LinkedIn hook generator",
  steps: [
    {
      title: "Name your post topic",
      text: "Type two or three words in What is your LinkedIn post about?, for example \"B2B leads\" or \"career change\". Hooks update as you type.",
      art: "writing",
    },
    {
      title: "Choose a hook style",
      text: "Leave All selected to see every style, or pick Curiosity, Mistake, How-to, Myth, Story, List, Contrarian or Result for six hooks in that style.",
      art: "feat-ai",
    },
    {
      title: "Copy and publish",
      text: "Press Copy on a hook, or Copy all for the full list. Put the hook in the first line of your post so it shows before “…see more”.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "First lines built for the LinkedIn feed",
  features: [
    {
      title: "Eight proven formats",
      text: "Curiosity, mistake, how-to, myth, story, list, contrarian and result hooks cover lessons, opinions and client results alike.",
      art: "writing",
    },
    {
      title: "Your topic in every line",
      text: "Each template is filled with your topic, so the hooks read as finished first lines you can edit and post straight away.",
      art: "feat-ai",
    },
    {
      title: "Private and repeatable",
      text: "Hooks come from fixed templates in your browser. No AI is called, nothing is uploaded and the same topic gives the same list.",
      art: "analytics",
    },
  ],
  guide: {
    title: "How to write LinkedIn hooks people click to read",
    intro:
      "The hook is the first line or two people see before they tap “…see more”. It decides whether the post gets read at all. This generator gives you a list of openers to start from; here is how to choose and use one.",
    sections: [
      {
        title: "What this LinkedIn hook generator does",
        body: (
          <>
            <p>
              The tool has six templates for each of eight hook styles, 48 in total. It cleans up your topic (extra spaces
              are removed and it is cut to 60 characters) and drops it into every template. With no topic, the hooks say
              &ldquo;your niche&rdquo;.
            </p>
            <ul>
              <li><b>All</b> shows every style in labelled groups.</li>
              <li>A style button shows only that style&apos;s six hooks.</li>
              <li><b>Copy all</b> copies the visible hooks, one per line.</li>
            </ul>
            <p>
              The hooks are templates, not predictions: the tool does not know which line will perform best with your
              audience.
            </p>
          </>
        ),
      },
      {
        title: "How long should a LinkedIn hook be?",
        body: (
          <>
            <p>
              LinkedIn shows about the first <b>210 characters</b> (roughly two to three lines) in the feed before it cuts
              the post off with <b>…see more</b>. Keep the hook short enough to finish inside that space, ideally in the
              very first line.
            </p>
            <p>
              As a working target, aim for <b>under 120 characters</b> for the opening line. It survives the cut-off on
              mobile and leaves room for a line break that invites the click. The exact cutoff varies by device and
              layout, so check your draft with the{" "}
              <Link href="/tools/linkedin-character-counter">LinkedIn character counter</Link> before posting.
            </p>
          </>
        ),
      },
      {
        title: "LinkedIn hook examples",
        body: (
          <>
            <p>
              With the topic &ldquo;cold email&rdquo; and the <b>Mistake</b> style, the tool gives:
            </p>
            <div className={t.example}>
              <p>Stop doing this if you want better cold email</p>
              <p>The cold email mistake that costs you followers</p>
              <p>I made this cold email mistake so you don&apos;t have to</p>
              <p>You are doing cold email wrong. Here is the fix</p>
              <p>The quiet cold email mistake that kills your reach</p>
              <p>Fix this cold email mistake before your next post</p>
            </div>
            <p>
              Lines about followers and reach suit a creator audience; a B2B or founder post usually does better with a
              result: &ldquo;We booked 12 meetings from cold email in one month. Here is the sequence.&rdquo; Pick the
              line that matches the person reading, then edit it to sound like you.
            </p>
          </>
        ),
      },
      {
        title: "Common LinkedIn hook mistakes",
        body: (
          <ul>
            <li>Starting with a greeting or a company name before the hook.</li>
            <li>Writing a vague tease such as &ldquo;You need to see this&rdquo; with no clear promise.</li>
            <li>Letting the first line run past the “…see more” cutoff so the point is hidden.</li>
            <li>Using a hook template that does not fit the topic, such as a result hook with no result to show.</li>
          </ul>
        ),
      },
      {
        title: "From hook to published post",
        body: (
          <p>
            Once the hook is chosen, write the body and plan when it goes out. The{" "}
            <Link href="/tools/linkedin-post-generator">LinkedIn post generator</Link> can draft the rest, the{" "}
            <Link href="/tools/linkedin-text-formatter">LinkedIn text formatter</Link> styles the copy, and you can queue
            the post on a calendar with the <Link href="/linkedin-scheduler">LinkedIn scheduler</Link>.
          </p>
        ),
      },
    ],
  },
  faqTitle: "LinkedIn hook questions",
  faqs: [
    {
      q: "What is a LinkedIn hook?",
      a: "A LinkedIn hook is the first line or two of a post, the part people see in the feed before “…see more”. It has to earn the click by naming a result, mistake, question or idea the reader cares about.",
    },
    {
      q: "How long should a LinkedIn hook be?",
      a: "Keep it under about 120 characters so it fits in the first line. LinkedIn shows roughly the first 210 characters (two to three lines) before the see more cutoff, so the opening must finish well inside that space.",
    },
    {
      q: "What are some LinkedIn hook examples?",
      a: "Examples include \"We booked 12 meetings from cold email in one month. Here is the sequence\", \"The career advice that kept me stuck for three years\" and \"Stop doing this if you want better B2B leads\". Each names a specific result or mistake in the first line.",
    },
  ],
  related: [
    "/tools/linkedin-post-generator",
    "/tools/linkedin-character-counter",
    "/tools/linkedin-text-formatter",
    "/tools/linkedin-hashtag-generator",
    "/tools/linkedin-headline-generator",
  ],
  schema: {
    features: [
      "Eight hook styles",
      "Up to 48 hooks per topic",
      "Topic filled into every hook",
      "Copy one hook or all of them",
      "First lines sized for LinkedIn's 210-character fold",
    ],
  },
  cta: {
    title: "Got your hook?",
    mark: "Schedule the post.",
    text: "Queue the post on your Poskoo calendar and publish it automatically with the LinkedIn scheduler.",
  },
};

export const metadata = toolMetadata(config);

export default function LinkedInHookGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <HookGenerator platform="linkedin" />
    </ToolPageTemplate>
  );
}
