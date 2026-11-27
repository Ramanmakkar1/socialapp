import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import HookGenerator from "../instagram-hook-generator/HookGenerator";
import { networkAvailability, availabilityPhrase } from "@/components/ChannelStatusNote";

export const revalidate = 600;

const config: ToolPageConfig = {
  path: "/tools/tiktok-hook-generator",
  name: "TikTok hook generator",
  crumb: "TikTok hook generator",
  title: "Free TikTok Hook Generator: Scroll-Stopping Openers",
  description:
    "Type a TikTok topic and get ready-to-say hooks in eight styles, from curiosity to result. Copy a first line that stops the scroll in the first second.",
  pill: "Free · no signup · no AI",
  h1: { mark: "TikTok hook generator" },
  lede: "A TikTok hook generator turns your video topic into ready-to-say opening lines that stop the scroll in the first second. It helps creators beat the swipe decision: type a topic, pick a style, copy a hook and film it as the video opens.",
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
    title: "What is a TikTok hook generator and how does it help creators?",
    intro:
      (
        <>
          <p>
            A TikTok hook generator is a free tool that turns your video topic into a list of opening lines designed to
            stop the scroll in the first second. You type what the video is about, pick a hook style and copy a finished
            line to say or show as the video opens.
          </p>
          <p>
            It helps creators because the hook decides the video&rsquo;s reach: TikTok&rsquo;s algorithm watches early
            retention, and a weak opener means viewers swipe away before the rest of the video matters. A generator gives
            you a batch of strong openers in seconds, so you can test lines without staring at a blank screen.
          </p>
        </>
      ),
    sections: [
      {
        title: "Hook formulas that work on TikTok",
        body: (
          <>
            <p>
              Every hook in this tool is built from one of eight formulas. Each formula creates a reason to keep
              watching: a gap to close, a promise to keep or a claim to check.
            </p>
            <ul>
              <li><b>Curiosity:</b> &ldquo;Nobody tells you this about &hellip;&rdquo; &mdash; opens a gap the viewer wants closed.</li>
              <li><b>Mistake:</b> &ldquo;Stop doing this if you want better &hellip;&rdquo; &mdash; warns the viewer they are losing out.</li>
              <li><b>How-to:</b> &ldquo;How to fix &hellip; in one minute&rdquo; &mdash; promises a fast, concrete result.</li>
              <li><b>Myth:</b> &ldquo;Everyone is wrong about &hellip;&rdquo; &mdash; challenges a belief the viewer already holds.</li>
              <li><b>Story:</b> &ldquo;The &hellip; lesson that cost me a year&rdquo; &mdash; stakes make the viewer lean in.</li>
              <li><b>List:</b> &ldquo;3 &hellip; tips I wish I knew sooner&rdquo; &mdash; a number promises structure and value.</li>
              <li><b>Contrarian:</b> &ldquo;Unpopular opinion: &hellip; is not that hard&rdquo; &mdash; a claim worth arguing with.</li>
              <li><b>Result:</b> &ldquo;This is what better &hellip; looks like&rdquo; &mdash; shows the payoff up front.</li>
            </ul>
            <p>
              Match the formula to the video: how-to and list for tutorials, mistake and myth for corrections, story for
              personal lessons, result for before-and-after. The hook is a promise, so the rest of the video has to keep
              it.
            </p>
          </>
        ),
      },
      {
        title: "What the generator takes as input",
        body: (
          <>
            <p>
              The tool takes two inputs: your topic and a hook style.
            </p>
            <ul>
              <li><b>Topic:</b> two or three words, such as &ldquo;meal prep&rdquo; or &ldquo;budget travel&rdquo;. It is trimmed, capped at 60 characters and dropped into every template, so each hook is a finished line, not a blank template.</li>
              <li><b>Style:</b> keep All to see all eight formulas, or pick one to see its six hooks.</li>
            </ul>
            <p>
              With no topic, the hooks say &ldquo;your niche&rdquo; so you can still see the shapes. Everything runs in
              your browser: no AI call, nothing uploaded, and the same topic always gives the same list.
            </p>
          </>
        ),
      },
      {
        title: "Practical examples",
        body: (
          <>
            <p>
              Type &ldquo;meal prep&rdquo; and the tool returns lines like:
            </p>
            <ul>
              <li>&ldquo;Nobody tells you this about meal prep&rdquo; (curiosity)</li>
              <li>&ldquo;Stop doing this if you want better meal prep&rdquo; (mistake)</li>
              <li>&ldquo;How to fix meal prep in one minute&rdquo; (how-to)</li>
              <li>&ldquo;3 meal prep tips I wish I knew sooner&rdquo; (list)</li>
            </ul>
            <p>
              Say one of these in the first second, put it on screen as text, and keep the same line as the first line of
              the caption. For a fitness account the same topic gives &ldquo;The gym mistake that costs you progress&rdquo;;
              for a finance account, &ldquo;The budgeting myth that has to go&rdquo;. One topic, many angles &mdash; film
              the strongest one.
            </p>
          </>
        ),
      },
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
            a calendar with the <Link href="/tiktok-scheduler">TikTok scheduler</Link>, which publishes through TikTok&rsquo;s
            official API at the time you choose. The <Link href="/tools">free social media tools hub</Link> has the rest
            of the caption, hashtag and timing tools for the same video.
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
    {
      q: "Does the TikTok hook generator use AI?",
      a: "No. The hooks come from eight fixed formulas filled with your topic, all in your browser. Nothing is uploaded, no account is needed and the same topic always gives the same list.",
    },
    {
      q: "Will a generated hook guarantee my video goes viral?",
      a: "No. A hook decides whether viewers stay for the first seconds, which helps the algorithm test your video, but the rest of the video has to keep the promise the hook makes. Treat the list as starting points and edit each line to sound like you.",
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
  const state = networkAvailability("tiktok");
  const pageConfig = state === "live"
    ? config
    : {
        ...config,
        faqs: config.faqs.map((f) => f.q === "Can I schedule the video once I have a hook?"
          ? { ...f, a: `Not yet. TikTok publishing in Poskoo is ${availabilityPhrase(state, "TikTok")}. Until then, write the hook, film the video and post it from the TikTok app.` }
          : f),
        guide: {
          ...config.guide,
          sections: config.guide.sections.map((section) =>
            section.title === "From hook to published TikTok"
              ? {
                  ...section,
                  body: (
                    <p>
                      Once the hook is chosen, film the video, write the caption and plan when it goes out. Draft the rest of the caption with the <Link href="/tools/tiktok-caption-generator">TikTok caption generator</Link>, add a small set of tags with the <Link href="/tools/tiktok-hashtag-generator">TikTok hashtag generator</Link>, and pick a starting time with the{" "}
                      <Link href="/tools/best-time-to-post-on-tiktok">best time to post on TikTok</Link> finder. Then post it from the TikTok app; TikTok publishing in the <Link href="/tiktok-scheduler">TikTok scheduler</Link> is {availabilityPhrase(state, "TikTok")}. The <Link href="/tools">free social media tools hub</Link> has the rest of the caption, hashtag and timing tools for the same video.
                    </p>
                  ),
                }
              : section
          ),
        },
      };
  return (
    <ToolPageTemplate config={pageConfig}>
      <HookGenerator platform="tiktok" tiktokLive={state === "live"} />
    </ToolPageTemplate>
  );
}
