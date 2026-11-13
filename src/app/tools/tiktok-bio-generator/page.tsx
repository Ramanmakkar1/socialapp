import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import BioTool from "../instagram-bio-generator/BioTool";

const config: ToolPageConfig = {
  path: "/tools/tiktok-bio-generator",
  name: "TikTok bio generator",
  crumb: "TikTok bio generator",
  title: "TikTok Bio Generator: Free Bio Ideas Under 80 Characters",
  description:
    "Free TikTok bio generator: add your name, what you do and a call to action, pick a niche and copy a short bio with a live 80-character counter.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "TikTok bio generator:", mark: "bio ideas", after: "under 80 characters" },
  lede: "A TikTok bio can be up to 80 characters, so it has to say who you are and what to do next in one or two short lines. Fill in your details and copy a bio that fits.",
  art: "writing",
  artLabel: "A creator writes with a giant pencil on a phone-shaped card full of lines and emoji",
  heroPoints: ["80-char counter", "8 niches", "No signup"],
  toolTitle: "Write your TikTok bio",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the TikTok bio generator",
  steps: [
    {
      title: "Enter your details",
      text: "Type your Name or brand, What you do and a Call to action. The call to action starts as a sample you can overwrite.",
      art: "writing",
    },
    {
      title: "Pick a niche and name style",
      text: "Choose one of 8 niches, such as Coach, Food or Agency, to get four templates. Optionally pick a Style the name font like Bold or Script.",
      art: "visual",
    },
    {
      title: "Check the count and copy",
      text: "Each bio shows its length out of 80 and turns red if it runs over. Press Copy on the one you like and paste it into Edit profile > Bio in the TikTok app.",
      art: "card-dm",
    },
  ],
  featuresTitle: "A short bio that fits, reads well and asks for one thing",
  features: [
    {
      title: "Four templates per niche",
      text: "Creator, small business, coach, photographer, fitness, food, e-commerce and agency each have their own four layouts with matching emojis.",
      art: "writing",
    },
    {
      title: "Live 80-character check",
      text: "Every filled-in bio shows its length against TikTok's 80-character bio limit, so you know what fits before you paste it.",
      art: "analytics",
    },
    {
      title: "Optional styled name",
      text: "Turn just your name into Unicode styles such as bold, italic or script while the rest of the bio stays in plain, searchable text.",
      art: "feat-linkbio",
    },
  ],
  guide: {
    title: "How to write a TikTok bio that works in 2026",
    intro:
      "Your bio is the first thing a profile visitor reads after your name. In 80 characters it has to say who you are, what you offer and what to do next. This generator gives you proven layouts so you can focus on the words.",
    sections: [
      {
        title: "What this bio generator does",
        body: (
          <>
            <p>
              The tool fills your three inputs into four hand-written templates for the niche you pick. Templates put each
              idea on its own line and add a fitting emoji, then end with your call to action. Empty lines are removed, so
              leaving <b>Name or brand</b> blank still gives a clean bio.
            </p>
            <p>
              The counter counts characters as your browser sees them. Most emojis count as one, but some combined emojis
              (for example a chef emoji built from several symbols) may count as more, and TikTok&apos;s own counter can
              differ slightly. Nothing is sent anywhere and nothing is saved.
            </p>
          </>
        ),
      },
      {
        title: "TikTok bio best practices",
        body: (
          <ul>
            <li>
              <b>Lead with what you do.</b> &ldquo;Career coach for new managers&rdquo; tells a visitor more in a second
              than a slogan does.
            </li>
            <li>
              <b>One call to action.</b> Ask for one thing: tap the link, book a call, or DM a keyword. Several asks
              compete with each other.
            </li>
            <li>
              <b>Keep keywords in plain text.</b> Styled Unicode letters look nice but may not be read by search or screen
              readers. Style only your name, if anything.
            </li>
            <li>
              <b>Use line breaks.</b> Short lines are easier to scan. If spacing looks off after pasting, try the{" "}
              <Link href="/tools/instagram-line-break-generator">line break generator</Link>.
            </li>
            <li>
              <b>Make the CTA real.</b> If your bio says &ldquo;DM START&rdquo;, be ready to reply quickly. For posts, an{" "}
              <Link href="/instagram-auto-dm">Instagram auto DM</Link> can send your link to everyone who comments a
              keyword.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: a coach bio",
        body: (
          <>
            <p>
              With Name &ldquo;Maya Chen&rdquo;, What you do &ldquo;Career coach for new managers&rdquo;, Call to action
              &ldquo;DM &quot;LEAD&quot; for my free 1:1 checklist&rdquo; and the Coach niche, the first template gives:
            </p>
            <div className={t.example}>
              <p>Maya Chen | Career coach for new managers</p>
              <p>🎯 Your next step</p>
              <p>👇 DM &quot;LEAD&quot; for my free 1:1 checklist</p>
            </div>
            <p>
              That is 96 characters, so it runs over TikTok&apos;s 80-character limit. Shorten the name or the call to
              action, or drop a line, until the counter turns green.
            </p>
          </>
        ),
      },
      {
        title: "Common bio mistakes",
        body: (
          <ul>
            <li>
              Not matching the template&apos;s wording. One Coach template reads &ldquo;Helping you {"{what you do}"}&rdquo;,
              so phrase that field as an action (&ldquo;lead your first team&rdquo;) if you pick it.
            </li>
            <li>Styling the whole bio in fancy fonts so it is hard to read and search.</li>
            <li>Listing three different links or offers in one short bio.</li>
            <li>Leaving a call to action that points to an expired offer.</li>
            <li>
              Using a name that does not match your handle. The{" "}
              <Link href="/tools/tiktok-username-generator">TikTok username generator</Link> helps you pick one that fits.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "TikTok bio questions",
  faqs: [
    {
      q: "How long can a TikTok bio be?",
      a: "A TikTok bio can be up to 80 characters. Emojis, spaces and line breaks all count toward that limit, and some combined emojis can count as more than one character.",
    },
    {
      q: "Can I add a link to my TikTok bio?",
      a: "If your account has the Website field, add your link there. TikTok shows that field only on some accounts, so not every profile can add a clickable website link.",
    },
    {
      q: "Can I use emoji in my TikTok bio?",
      a: "Yes. Emojis are allowed in a TikTok bio, and each emoji counts toward the 80-character limit in this counter.",
    },
    {
      q: "Does this TikTok bio generator use AI or save my details?",
      a: "No. It fills your text into fixed templates in your browser. Nothing is uploaded, no AI is used and nothing is saved when you leave the page.",
    },
  ],
  related: [
    "/tools/instagram-bio-generator",
    "/tools/tiktok-username-generator",
    "/tools/tiktok-caption-generator",
    "/tools/tiktok-hashtag-generator",
  ],
  schema: {
    features: [
      "Bio templates for 8 niches",
      "Live 80-character counter",
      "Optional Unicode name styles",
      "One-click copy for each bio",
      "Runs in the browser, no signup",
    ],
  },
  cta: {
    title: "Your bio is ready.",
    mark: "Now plan your next video.",
    text: "Schedule your TikTok videos with Poskoo and keep your profile active, on TikTok's official API.",
  },
};

export const metadata = toolMetadata(config);

export default function TikTokBioGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <BioTool platform="tiktok" />
    </ToolPageTemplate>
  );
}
