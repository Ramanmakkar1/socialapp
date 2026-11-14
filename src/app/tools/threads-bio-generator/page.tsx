import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import BioTool from "../instagram-bio-generator/BioTool";

const config: ToolPageConfig = {
  path: "/tools/threads-bio-generator",
  name: "Threads bio generator",
  crumb: "Threads bio generator",
  title: "Threads Bio Generator: Free Bio Ideas Under 150 Characters",
  description:
    "Free Threads bio generator: add your name, what you do and a call to action, pick a niche and copy a ready-to-paste bio with a live 150-character counter.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Threads bio generator:", mark: "bio ideas", after: "under 150 characters" },
  lede: "A Threads bio can be up to 150 characters, so it has to say who you are and what to do next in a few short lines. Fill in your details and copy a bio that fits. Threads can import your bio from your Instagram profile, but you can edit it separately here.",
  art: "writing",
  artLabel: "A creator writes with a giant pencil on a phone-shaped card full of lines and emoji",
  heroPoints: ["150-char counter", "8 niches", "No signup"],
  toolTitle: "Write your Threads bio",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Threads bio generator",
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
      text: "Each bio shows its length out of 150 and turns red if it runs over. Press Copy on the one you like and paste it into your Threads profile settings.",
      art: "card-dm",
    },
  ],
  featuresTitle: "A bio that fits, reads well and asks for one thing",
  features: [
    {
      title: "Four templates per niche",
      text: "Creator, small business, coach, photographer, fitness, food, e-commerce and agency each have their own four layouts with matching emojis.",
      art: "writing",
    },
    {
      title: "Live 150-character check",
      text: "Every filled-in bio shows its length against Threads' 150-character bio limit, so you know what fits before you paste it.",
      art: "analytics",
    },
    {
      title: "Optional styled name",
      text: "Turn just your name into Unicode styles such as bold, italic or script while the rest of the bio stays in plain, searchable text.",
      art: "feat-linkbio",
    },
  ],
  guide: {
    title: "How to write a Threads bio that works in 2026",
    intro:
      "Your bio is the first thing a profile visitor reads after your name. In 150 characters it has to say who you are, what you offer and what to do next. This generator gives you proven layouts so you can focus on the words.",
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
              (for example a chef emoji built from several symbols) may count as more, and Threads&apos; own counter can
              differ slightly. Nothing is sent anywhere and nothing is saved.
            </p>
          </>
        ),
      },
      {
        title: "Threads bio best practices",
        body: (
          <ul>
            <li>
              <b>Lead with what you do.</b> &ldquo;Career coach for new managers&rdquo; tells a visitor more in a second
              than a slogan does.
            </li>
            <li>
              <b>One call to action.</b> Ask for one thing: tap the link, book a call, or reply with a keyword. Several
              asks compete with each other.
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
              <b>Make the CTA real.</b> If your bio says &ldquo;Reply START&rdquo;, be ready to reply quickly. For posts, an{" "}
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
              &ldquo;Reply &quot;START&quot; for my free 1:1 checklist&rdquo; and the Coach niche, the first template gives:
            </p>
            <div className={t.example}>
              <p>Maya Chen | Career coach for new managers</p>
              <p>🎯 Your next step</p>
              <p>👇 Reply &quot;START&quot; for my free 1:1 checklist</p>
            </div>
            <p>
              That is 97 characters, so it fits comfortably inside Threads&apos; 150-character limit. You could add one more
              line, such as your location, and still stay under the cap.
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
            <li>Listing three different links or offers in one bio.</li>
            <li>Leaving a call to action that points to an expired offer.</li>
            <li>
              Assuming your Instagram bio is enough. Threads can import it, but a bio written for Threads&apos; audience
              usually performs better.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Threads bio questions",
  faqs: [
    {
      q: "How long can a Threads bio be?",
      a: "A Threads bio can be up to 150 characters. Emojis, spaces and line breaks all count toward that limit, and some combined emojis can count as more than one character.",
    },
    {
      q: "Can my Threads bio be different from my Instagram bio?",
      a: "Yes. Threads can import your bio from your Instagram profile when you set up your account, but you can edit the Threads bio separately, so it can differ from your Instagram bio.",
    },
    {
      q: "Can I add a link to my Threads bio?",
      a: "Threads has a separate links field in your profile settings, so you add your link there rather than in the bio text itself.",
    },
    {
      q: "Does this Threads bio generator use AI or save my details?",
      a: "No. It fills your text into fixed templates in your browser. Nothing is uploaded, no AI is used and nothing is saved when you leave the page.",
    },
  ],
  related: [
    "/tools/instagram-bio-generator",
    "/tools/threads-character-counter",
    "/tools/threads-post-preview",
    "/tools/tiktok-bio-generator",
  ],
  schema: {
    features: [
      "Bio templates for 8 niches",
      "Live 150-character counter",
      "Optional Unicode name styles",
      "One-click copy for each bio",
      "Runs in the browser, no signup",
    ],
  },
  cta: {
    title: "Your bio is ready.",
    mark: "Now schedule your Threads posts.",
    text: "Schedule your Threads posts with Poskoo and keep your profile active, on Meta's official API.",
  },
};

export const metadata = toolMetadata(config);

export default function ThreadsBioGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <BioTool platform="threads" />
    </ToolPageTemplate>
  );
}
