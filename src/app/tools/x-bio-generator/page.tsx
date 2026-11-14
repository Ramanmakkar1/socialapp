import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import BioTool from "../instagram-bio-generator/BioTool";

const config: ToolPageConfig = {
  path: "/tools/x-bio-generator",
  name: "X (Twitter) bio generator",
  crumb: "X (Twitter) bio generator",
  title: "Twitter Bio Generator: Free X Bio Ideas in 160 Characters",
  description:
    "An X (Twitter) bio can be up to 160 characters. Add your name, what you do and a call to action, pick a niche and copy a bio that fits the limit.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "X (Twitter) bio generator:", mark: "bio ideas", after: "under 160 characters" },
  lede: "An X (Twitter) bio can be up to 160 characters. This free generator writes bio ideas from your name, what you do and a call to action, with a live 160-character counter.",
  art: "writing",
  artLabel: "A creator writes with a giant pencil on a phone-shaped card full of lines and emoji",
  heroPoints: ["160-char counter", "8 niches", "No signup"],
  toolTitle: "Write your X bio",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the X bio generator",
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
      text: "Each bio shows its length out of 160 and turns red if it runs over. Press Copy on the one you like and paste it into Edit profile > Bio on X.",
      art: "card-dm",
    },
  ],
  featuresTitle: "A bio that fits X, reads well and asks for one thing",
  features: [
    {
      title: "Four templates per niche",
      text: "Creator, small business, coach, photographer, fitness, food, e-commerce and agency each have their own four layouts with matching emojis.",
      art: "writing",
    },
    {
      title: "Live 160-character check",
      text: "Every filled-in bio shows its length against X's 160-character bio limit, so you know what fits before you paste it.",
      art: "analytics",
    },
    {
      title: "Optional styled name",
      text: "Turn just your name into Unicode styles such as bold, italic or script while the rest of the bio stays in plain, searchable text.",
      art: "feat-linkbio",
    },
  ],
  guide: {
    title: "How to write an X (Twitter) bio that works in 2026",
    intro:
      "Your bio is the first thing a profile visitor reads after your name. In 160 characters it has to say who you are, what you post about and what to do next. This generator gives you proven layouts so you can focus on the words.",
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
              (for example a chef emoji built from several symbols) may count as more, and X&apos;s own counter can
              differ slightly. Nothing is sent anywhere and nothing is saved.
            </p>
          </>
        ),
      },
      {
        title: "X bio best practices",
        body: (
          <ul>
            <li>
              <b>Lead with what you do.</b> &ldquo;Career coach for new managers&rdquo; tells a visitor more in a second
              than a slogan does.
            </li>
            <li>
              <b>One call to action.</b> Ask for one thing: follow, tap the link, or reply with a keyword. Several asks
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
              That is 96 characters, so it fits comfortably inside X&apos;s 160-character limit. You can add another line
              or a longer call to action and still stay under the cap.
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
              <Link href="/tools/tiktok-username-generator">username generator</Link> helps you pick one that fits.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "X (Twitter) bio questions",
  faqs: [
    {
      q: "How long can an X bio be?",
      a: "An X (Twitter) bio can be up to 160 characters. Emojis, spaces and line breaks all count toward that limit, and some combined emojis can count as more than one character. The 160-character limit covers only the bio text: your location and website are separate profile fields and do not count.",
    },
    {
      q: "What should I put in my X bio?",
      a: "Say who you are and what you post about in plain words, then add one clear call to action such as follow, tap the link or reply with a keyword. A simple formula is your name or brand, what you do and the next step.",
    },
    {
      q: "Can I use hashtags or @mentions in my X bio?",
      a: "Yes. Hashtags and @mentions are allowed in an X bio, and they become clickable links. They still count toward the 160-character limit, so use one or two relevant ones rather than a long list.",
    },
    {
      q: "Can I add a link to my X bio?",
      a: "X has a separate Website field for your main link. Links in the bio text are allowed, but they count toward the 160-character limit, so keep them short.",
    },
    {
      q: "Does it use AI or save my details?",
      a: "No. It fills your text into fixed templates in your browser. Nothing is uploaded, no AI is used and nothing is saved when you leave the page.",
    },
  ],
  related: [
    "/tools/instagram-bio-generator",
    "/tools/tiktok-bio-generator",
    "/tools/x-character-counter",
    "/tools/x-post-preview",
  ],
  schema: {
    features: [
      "Bio templates for 8 niches",
      "Live 160-character counter",
      "Optional Unicode name styles",
      "One-click copy for each bio",
      "Runs in the browser, no signup",
    ],
  },
  cta: {
    title: "Your bio is ready.",
    mark: "Now plan your posts.",
    text: "X scheduling is coming to Poskoo. In the meantime, schedule your Instagram posts and Reels with Poskoo on Meta's official API.",
  },
};

export const metadata = toolMetadata(config);

export default function XBioGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <BioTool platform="x" />
    </ToolPageTemplate>
  );
}
