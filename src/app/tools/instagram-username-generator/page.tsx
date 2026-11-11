import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import UsernameTool from "./UsernameTool";

const config: ToolPageConfig = {
  path: "/tools/instagram-username-generator",
  name: "Instagram username generator",
  crumb: "Username generator",
  title: "Instagram Username Generator: Free Name Ideas to Copy",
  description:
    "Free Instagram username generator: turn your name and niche into up to 30 clean, creative or brand handle ideas that follow Instagram username rules.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Instagram username generator:", mark: "handle ideas", after: "to copy" },
  lede: "Type your name and niche, pick a style, and get up to 30 Instagram username ideas that use only letters, numbers, periods and underscores. Copy one with a tap.",
  art: "writing",
  artLabel: "A creator writes with a giant pencil on a phone-shaped card full of lines and emoji",
  heroPoints: ["Up to 30 ideas", "Valid characters only", "No signup"],
  toolTitle: "Generate username ideas",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Instagram username generator",
  steps: [
    {
      title: "Enter a name and niche",
      text: "Type Your name or brand and a Niche or topic. You can leave the name empty to get niche-only ideas such as the.baking.",
      art: "writing",
    },
    {
      title: "Pick a style",
      text: "Choose Clean (personal), Creative or Business / brand. Your style's patterns come first, followed by ideas from the other two styles.",
      art: "feat-ai",
    },
    {
      title: "Copy and check it in the app",
      text: "Press Copy next to a username, then enter it in Edit profile > Username in Instagram to see whether it is free.",
      art: "card-dm",
    },
  ],
  featuresTitle: "Handles that are valid before you even try them",
  features: [
    {
      title: "Follows Instagram's character rules",
      text: "Every idea is 30 characters or fewer, uses only lowercase letters, numbers, periods and underscores, and never starts, ends or doubles up with a period.",
      art: "analytics",
    },
    {
      title: "Three styles, one list",
      text: "Clean handles for personal accounts, playful creative ones, and brand formats like .co, hq and .studio, with first.last variants for two-word names.",
      art: "writing",
    },
    {
      title: "Same input, same list",
      text: "No AI and no randomness: the list is built from fixed patterns in your browser, so you can come back and find the same ideas again.",
      art: "feat-linkbio",
    },
  ],
  guide: {
    title: "How to choose an Instagram username in 2026",
    intro:
      "Your username is your address on Instagram: it appears on every post, comment and DM, and in your profile link. A good one is short, easy to say and easy to type. This generator gives you a list of valid options to start from.",
    sections: [
      {
        title: "How the username generator works",
        body: (
          <>
            <p>
              The tool lowercases your name and niche, removes accents, spaces and symbols, and joins the words. It then
              runs them through a fixed set of patterns: <code>first.last</code> style handles for two-word names, then
              patterns for your chosen style (for example <code>the.name</code>, <code>name.daily</code> or{" "}
              <code>name.studio</code>), then the other styles and a few niche-only extras.
            </p>
            <p>
              Each idea is checked against Instagram&apos;s basic format rules and duplicates are removed, up to 30 results.
              The tool does not contact Instagram, so it cannot tell you whether a handle is already taken.
            </p>
          </>
        ),
      },
      {
        title: "What makes a good Instagram username",
        body: (
          <ul>
            <li>
              <b>Short and sayable.</b> If you can say it out loud once and someone can type it, it works.
            </li>
            <li>
              <b>Consistent across platforms.</b> Use the same handle you have, or want, on TikTok, Threads and YouTube.
            </li>
            <li>
              <b>Add the niche only if it helps.</b> <code>maya.bakes</code> tells people what to expect, but it can feel
              limiting if your content changes later.
            </li>
            <li>
              <b>Avoid confusing punctuation.</b> <code>maya._.chen</code> is valid but hard to remember. One period or
              underscore is plenty.
            </li>
            <li>
              <b>Skip long number strings.</b> They look like spam accounts and are easy to mistype.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: ideas for a baker",
        body: (
          <>
            <p>
              With Your name or brand &ldquo;Maya Chen&rdquo;, Niche &ldquo;baking&rdquo; and the Clean style, the first
              ten of 30 ideas are:
            </p>
            <div className={t.example}>
              <p>@maya.chen · @maya_chen · @m.chen · @maya.c · @mayachen</p>
              <p>@mayachen.baking · @mayachen_baking · @the.mayachen · @its.mayachen · @real.mayachen</p>
            </div>
            <p>
              Shortlist two or three, say them out loud, and check each one in the app. If the plain name is taken, a
              niche variant such as <code>mayachen.baking</code> is often still free.
            </p>
          </>
        ),
      },
      {
        title: "Common username mistakes",
        body: (
          <ul>
            <li>Picking a handle that is hard to spell after hearing it once.</li>
            <li>Using a name that looks like an existing brand or impersonates someone.</li>
            <li>Changing your username often, which breaks links you have already shared.</li>
            <li>
              Forgetting the rest of the profile. Write a matching bio with the{" "}
              <Link href="/tools/instagram-bio-generator">bio generator</Link> and a direct message link with the{" "}
              <Link href="/tools/instagram-dm-link-generator">DM link generator</Link>.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram username questions",
  faqs: [
    {
      q: "What characters can an Instagram username use?",
      a: "Instagram usernames can be up to 30 characters and use letters, numbers, periods and underscores. Every idea here also avoids a period at the start or end and two periods in a row.",
    },
    {
      q: "Does this tool check if a username is available?",
      a: "No. The generator runs in your browser and never contacts Instagram. Type the name into Edit profile > Username in the Instagram app to see if it is free.",
    },
    {
      q: "How do I change my Instagram username?",
      a: "Open your profile in the Instagram app, tap Edit profile, then tap Username. Enter the new name and save it if Instagram shows that it is available.",
    },
    {
      q: "What makes a good Instagram username?",
      a: "Keep it short, easy to say and easy to spell. Use the same name you use on other platforms, add your niche only if it helps people find you, and avoid long strings of numbers.",
    },
    {
      q: "Can I get ideas without entering my name?",
      a: "Yes. Leave the name field empty and type only a niche or topic. The generator then builds every idea from the niche, such as the.baking or baking.daily.",
    },
  ],
  related: [
    "/tools/instagram-bio-generator",
    "/tools/instagram-font-generator",
    "/tools/instagram-dm-link-generator",
    "/tools/instagram-post-ideas-generator",
    "/tools/instagram-hashtag-generator",
  ],
  schema: {
    features: [
      "Up to 30 username ideas per search",
      "Clean, creative and business styles",
      "Follows Instagram username character rules",
      "Niche-only ideas when no name is given",
      "One-click copy, no signup",
    ],
  },
  cta: {
    title: "Got the handle?",
    mark: "Start posting on schedule.",
    text: "Plan your first posts with Poskoo's free scheduler and DM your link to everyone who comments a keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramUsernameGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <UsernameTool />
    </ToolPageTemplate>
  );
}
