import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import HookGenerator from "./HookGenerator";

const config: ToolPageConfig = {
  path: "/tools/instagram-hook-generator",
  name: "Instagram hook generator",
  crumb: "Hook generator",
  title: "Instagram Hook Generator: Free Reel Hook Ideas",
  description:
    "Free Instagram hook generator: type your Reel topic and copy up to 48 first lines across eight styles, from curiosity and mistake to myth, list and result.",
  pill: "Free · no signup · no AI",
  h1: { before: "Instagram hook generator:", mark: "first lines", after: "for your Reels" },
  lede: "Type what your Reel is about and get ready-to-copy opening lines in eight hook styles. Pick one, say it in the first second, and put it at the top of your caption.",
  art: "writing",
  artLabel: "A creator writes with a giant pencil on a phone-shaped card with a bold opening line",
  heroPoints: ["8 hook styles", "48 hooks per topic", "One-click copy"],
  toolTitle: "Generate Reel hooks",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Instagram hook generator",
  steps: [
    {
      title: "Name your Reel topic",
      text: "Type two or three words in What is your Reel about?, for example \"meal prep\" or \"cold email\". Hooks update as you type.",
      art: "writing",
    },
    {
      title: "Choose a hook style",
      text: "Leave All selected to see every style, or pick Curiosity, Mistake, How-to, Myth, Story, List, Contrarian or Result for six hooks in that style.",
      art: "feat-ai",
    },
    {
      title: "Copy and film",
      text: "Press Copy on a hook, or Copy all for the full list. Open the Reel with it on screen and in the first line of the caption.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Openers for every kind of Reel",
  features: [
    {
      title: "Eight proven formats",
      text: "Curiosity, mistake, how-to, myth, story, list, contrarian and result hooks cover tutorials, opinions and case studies alike.",
      art: "writing",
    },
    {
      title: "Your topic in every line",
      text: "Each template is filled with your topic, so the hooks read as finished lines you can say or show straight away.",
      art: "feat-ai",
    },
    {
      title: "Private and repeatable",
      text: "Hooks come from fixed templates in your browser. No AI is called, nothing is uploaded and the same topic gives the same list.",
      art: "analytics",
    },
  ],
  guide: {
    title: "How to write Instagram Reel hooks that hold attention",
    intro:
      "The hook is the first line someone hears or reads. It decides whether they keep watching. This generator gives you a list of openers to start from; here is how it works and how to use a hook well.",
    sections: [
      {
        title: "What this hook generator does",
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
              The hooks are templates, not predictions: the tool does not know which line will perform best on your
              account.
            </p>
          </>
        ),
      },
      {
        title: "Hook best practices for Reels in 2026",
        body: (
          <ul>
            <li>
              <b>Say it and show it.</b> Put the hook in on-screen text in the first second and say it out loud, for people
              watching with and without sound.
            </li>
            <li>
              <b>Keep the promise small.</b> The Reel has to deliver what the hook says. A specific promise you can keep in
              30 seconds beats a big one you cannot.
            </li>
            <li>
              <b>Match the caption.</b> Use the same line, or a close variation, as the first line of the caption, which
              is what shows before &ldquo;more&rdquo;. The{" "}
              <Link href="/tools/instagram-caption-generator">caption generator</Link> can draft the rest.
            </li>
            <li>
              <b>Rotate styles.</b> If every Reel opens with &ldquo;Stop doing this&rdquo;, your feed sounds repetitive.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: mistake hooks for a meal prep Reel",
        body: (
          <>
            <p>
              With the topic &ldquo;meal prep&rdquo; and the <b>Mistake</b> style, the tool gives:
            </p>
            <div className={t.example}>
              <p>Stop doing this if you want better meal prep</p>
              <p>The meal prep mistake that costs you followers</p>
              <p>I made this meal prep mistake so you don&apos;t have to</p>
              <p>You are doing meal prep wrong. Here is the fix</p>
              <p>The quiet meal prep mistake that kills your reach</p>
              <p>Fix this meal prep mistake before your next Reel</p>
            </div>
            <p>
              Lines about followers and reach suit a Reel for creators, not for people who just want lunches sorted.
              &ldquo;You are doing meal prep wrong. Here is the fix&rdquo; fits a cooking audience and sets up a clear
              before-and-after. Pick the line that matches the person watching, then edit it to sound like you.
            </p>
          </>
        ),
      },
      {
        title: "Common hook mistakes",
        body: (
          <ul>
            <li>Starting with a greeting or a logo before the hook.</li>
            <li>Writing a clickbait hook the video never pays off.</li>
            <li>Using a hook template that does not fit the topic, such as a result hook with no result to show.</li>
            <li>Putting the hook only in the caption, where most viewers never look.</li>
          </ul>
        ),
      },
      {
        title: "From hook to published Reel",
        body: (
          <p>
            Once the hook is chosen, film the Reel, add a cover and plan when it goes out. You can queue it on a calendar
            with the <Link href="/instagram-scheduler">Instagram scheduler</Link>; the{" "}
            <Link href="/help/schedule-instagram-reels">Reels scheduling guide</Link> walks through the steps. If the Reel
            asks viewers to comment a keyword, an automatic DM can deliver what you promised.
          </p>
        ),
      },
    ],
  },
  faqTitle: "Instagram hook generator questions",
  faqs: [
    {
      q: "Is this Instagram hook generator free?",
      a: "Yes. The tool runs entirely in your browser: type a topic, pick a style and copy a hook. Nothing is uploaded, no account is needed and there is no AI call behind it.",
    },
    {
      q: "How many hooks does it generate?",
      a: "Six hooks for each of eight styles, so up to 48 hooks per topic when All is selected. Selecting one style shows its six hooks.",
    },
    {
      q: "How do I use a hook in a Reel?",
      a: "Put the hook in the first line of your caption and say it or show it on screen in the first second. The hook is a promise; the rest of the Reel has to keep it.",
    },
    {
      q: "Which hook style should I use?",
      a: "Match the style to the content: how-to and list hooks fit tutorials, mistake and myth hooks fit corrections, story hooks fit personal lessons and result hooks fit before-and-after content. Select All to compare them side by side.",
    },
    {
      q: "Can I schedule the Reel once I have a hook?",
      a: "Yes. Poskoo schedules Instagram Reels from a calendar, so you can write the hook, film the Reel and queue it for the time you choose.",
    },
  ],
  related: [
    "/tools/instagram-caption-generator",
    "/tools/instagram-post-ideas-generator",
    "/tools/instagram-reel-cover-maker",
    "/tools/instagram-safe-zone-checker",
    "/tools/instagram-hashtag-generator",
  ],
  schema: {
    features: [
      "Eight hook styles",
      "Up to 48 hooks per topic",
      "Topic filled into every hook",
      "Copy one hook or all of them",
    ],
  },
  cta: {
    title: "Got your hook?",
    mark: "Schedule the Reel.",
    text: "Queue the Reel on your Poskoo calendar and auto-DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramHookGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <HookGenerator />
    </ToolPageTemplate>
  );
}
