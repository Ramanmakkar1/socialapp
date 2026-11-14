import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import HookGenerator from "../instagram-hook-generator/HookGenerator";

const config: ToolPageConfig = {
  path: "/tools/tiktok-hook-generator",
  name: "TikTok hook generator",
  crumb: "TikTok hook generator",
  title: "Free TikTok Hook Generator: Scroll-Stopping Openers",
  description:
    "Type a TikTok topic and get ready-to-say hooks in eight styles, from curiosity to result. Copy a first line that stops the scroll in the first second.",
  pill: "Free · no signup · no AI",
  h1: { mark: "TikTok hook generator" },
  lede: "A hook is the first 1-3 seconds or first line that stops the scroll. Type a topic to get ready-to-say hooks you can use in your next TikTok video.",
  art: "writing",
  artLabel: "A creator writes a bold opening line on a phone-shaped card with a giant pencil",
  heroPoints: ["8 hook styles", "48 hooks per topic", "One-click copy"],
  toolTitle: "Generate TikTok hooks",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the TikTok hook generator",
  steps: [
    {
      title: "Type your video topic",
      text: "Enter two or three words in What is your video about?, such as \"meal prep\" or \"budget travel\". The hooks update as you type.",
      art: "writing",
    },
    {
      title: "Pick a hook style",
      text: "Keep All selected to see every style, or choose Curiosity, Mistake, How-to, Myth, Story, List, Contrarian or Result for six hooks in that style.",
      art: "feat-ai",
    },
    {
      title: "Copy and film",
      text: "Press Copy on a hook, or Copy all for the full list. Say it in the first second and put it on screen as the video opens.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Openers built for TikTok videos",
  features: [
    {
      title: "Eight hook formats",
      text: "Curiosity, mistake, how-to, myth, story, list, contrarian and result hooks cover tutorials, opinions, reactions and before-and-after videos.",
      art: "writing",
    },
    {
      title: "Your topic in every line",
      text: "Each template is filled with your topic, so every hook is a finished line you can say or show on screen straight away.",
      art: "feat-ai",
    },
    {
      title: "Private and repeatable",
      text: "Hooks come from fixed templates in your browser. No AI is called, nothing is uploaded and the same topic gives the same list.",
      art: "analytics",
    },
  ],
  guide: {
    title: "What is a hook on TikTok?",
    intro:
      "A hook is the first 1-3 seconds or the first line of a TikTok video. It is the part that decides whether someone keeps watching or keeps scrolling. This generator gives you a list of openers to start from; here is how to choose and use one.",
    sections: [
      {
        title: "How long should a TikTok hook be?",
        body: (
          <>
            <p>
              Keep the spoken hook to one short sentence, about 3 to 10 words, so it lands before the viewer can swipe
              away. On-screen text should fit in a single line or two and stay readable on a phone.
            </p>
            <ul>
              <li><b>Spoken:</b> one sentence you can say in under two seconds.</li>
              <li><b>On screen:</b> short enough to read at a glance, ideally under 60 characters.</li>
              <li><b>Caption:</b> repeat the same line as the first line of the caption, which is what shows before &ldquo;more&rdquo;.</li>
            </ul>
            <p>
              The tool cleans up your topic (extra spaces are removed and it is cut to 60 characters) and drops it into
              every template. With no topic, the hooks say &ldquo;your niche&rdquo;.
            </p>
          </>
        ),
      },
      {
        title: "Hook text on screen vs spoken hook",
        body: (
          <>
            <p>
              Use both when you can. Say the hook out loud for people watching with sound, and show the same idea as
              on-screen text for people watching on mute. Keep the two close, not word-for-word different, so the video
              feels clear either way.
            </p>
            <p>
              Put the on-screen text near the top or middle of the frame and keep it clear of the caption, sound label
              and buttons. The <Link href="/tools/tiktok-safe-zone-checker">TikTok safe zone checker</Link> shows what
              the interface covers on a 9:16 frame.
            </p>
          </>
        ),
      },
      {
        title: "Choosing a hook style for your video",
        body: (
          <>
            <p>
              Match the style to the content: how-to and list hooks fit tutorials, mistake and myth hooks fit
              corrections, story hooks fit personal lessons and result hooks fit before-and-after videos. Select All to
              compare them side by side.
            </p>
            <p>
              The hooks are templates, not predictions: the tool does not know which line will perform best on your
              account. Pick the line that matches the person watching, then edit it to sound like you.
            </p>
          </>
        ),
      },
      {
        title: "From hook to published TikTok",
        body: (
          <p>
            Once the hook is chosen, film the video, write the caption and plan when it goes out. Draft the rest of the
            caption with the <Link href="/tools/tiktok-caption-generator">TikTok caption generator</Link>, add a small
            set of tags with the <Link href="/tools/tiktok-hashtag-generator">TikTok hashtag generator</Link>, and pick
            a starting time with the{" "}
            <Link href="/tools/best-time-to-post-on-tiktok">best time to post on TikTok</Link> finder. Then queue it on
            a calendar with the <Link href="/tiktok-scheduler">TikTok scheduler</Link>.
          </p>
        ),
      },
    ],
  },
  faqTitle: "TikTok hook generator questions",
  faqs: [
    {
      q: "Is this TikTok hook generator free?",
      a: "Yes. The tool runs entirely in your browser: type a topic, pick a style and copy a hook. Nothing is uploaded, no account is needed and there is no AI call behind it.",
    },
    {
      q: "How many hooks does it generate?",
      a: "Six hooks for each of eight styles, so up to 48 hooks per topic when All is selected. Selecting one style shows its six hooks.",
    },
    {
      q: "How do I use a hook in a TikTok video?",
      a: "Say the hook in the first second and show it as on-screen text as the video opens. The hook is a promise, so the rest of the video has to keep it.",
    },
    {
      q: "Can I schedule the video once I have a hook?",
      a: "Yes. Poskoo schedules TikTok videos and photo posts from a calendar, so you can write the hook, film the video and queue it for the time you choose.",
    },
  ],
  related: [
    "/tools/tiktok-caption-generator",
    "/tools/tiktok-hashtag-generator",
    "/tools/tiktok-safe-zone-checker",
    "/tools/best-time-to-post-on-tiktok",
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
    mark: "Schedule the video.",
    text: "Queue the video on your Poskoo calendar and publish it through TikTok's official API at the time you choose.",
  },
};

export const metadata = toolMetadata(config);

export default function TikTokHookGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <HookGenerator platform="tiktok" />
    </ToolPageTemplate>
  );
}
