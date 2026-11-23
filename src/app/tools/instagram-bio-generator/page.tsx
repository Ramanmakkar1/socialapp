import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import BioTool from "./BioTool";

const config: ToolPageConfig = {
  path: "/tools/instagram-bio-generator",
  name: "Instagram bio generator",
  crumb: "Bio generator",
  title: "Instagram Bio Generator: Free Bio Ideas to Copy | Poskoo",
  description:
    "Generate Instagram bio ideas for creators, coaches and small businesses. Copy a bio with a live 150-character counter — free, private and no signup.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Instagram bio generator:", mark: "bio ideas", after: "you can copy" },
  lede: "The Instagram bio generator writes four ready-to-paste Instagram bios from your name, what you do and one call to action, with a live 150-character counter. It helps creators, coaches, small businesses and agencies fill their profile in minutes — free, no signup, and nothing is uploaded.",
  art: "writing",
  artLabel: "A creator writes with a giant pencil on a phone-shaped card full of lines and emoji",
  heroPoints: ["150-char counter", "8 niches", "No signup"],
  toolTitle: "Write your Instagram bio",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Instagram bio generator",
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
      text: "Each bio shows its length out of 150 and turns red if it runs over. Press Copy on the one you like and paste it into Edit profile.",
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
      text: "Every filled-in bio shows its length against Instagram's 150-character bio limit, so you know what fits before you paste it.",
      art: "analytics",
    },
    {
      title: "Optional styled name",
      text: "Turn just your name into Unicode styles such as bold, italic or script while the rest of the bio stays in plain, searchable text.",
      art: "feat-linkbio",
    },
  ],
  guide: {
    title: "How to write an Instagram bio that works in 2026",
    intro:
      "This generator writes a complete Instagram bio from three short inputs: who you are, what you do and one call to action. In 150 characters your bio has to say those things clearly, so the tool gives you four ready-made layouts per niche and a live counter, and you can focus on the words.",
    sections: [
      {
        title: "What this bio generator does",
        body: (
          <>
            <p>
              The Instagram bio generator fills your three inputs into four hand-written templates for the niche you pick.
              Templates put each idea on its own line and add a fitting emoji, then end with your call to action. Empty
              lines are removed, so leaving <b>Name or brand</b> blank still gives a clean bio.
            </p>
            <p>
              The counter counts characters as your browser sees them. Most emojis count as one, but some combined emojis
              (for example a chef emoji built from several symbols) may count as more, and Instagram&apos;s own counter can
              differ slightly. Nothing is sent anywhere and nothing is saved.
            </p>
            <p>
              Ready to post it? Plan and schedule it with the{" "}
              <Link href="/instagram-scheduler">Instagram scheduler</Link>, and see{" "}
              <Link href="/help/schedule-instagram-posts">how to schedule Instagram posts</Link> step by step.
            </p>
          </>
        ),
      },
      {
        title: "Instagram bio best practices",
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
              <b>Make the CTA real.</b> If your bio says &ldquo;DM START&rdquo;, be ready to reply quickly. For posts,
              an <Link href="/instagram-auto-dm">Instagram auto DM</Link> can send your link to everyone who comments a
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
              That is 96 characters out of 150, which leaves room to add a location or a short proof point such as years of
              experience.
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
              <Link href="/tools/instagram-username-generator">username generator</Link> helps you pick one that fits.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram bio questions",
  faqs: [
    {
      q: "What is the Instagram bio character limit?",
      a: "Instagram bios allow up to 150 characters. Emojis, spaces, line breaks and styled Unicode letters all count toward that limit, and some combined emojis can count as more than one character.",
    },
    {
      q: "How do I add line breaks to my Instagram bio?",
      a: "Copy a bio from this generator, which already has line breaks, and paste it into Edit profile > Bio in the Instagram app. If the spacing changes, prepare the text in the line break generator and paste again.",
    },
    {
      q: "Are fancy fonts safe to use in my bio?",
      a: "Styled names use standard Unicode characters that you copy and paste. Keep important keywords in plain text, because styled letters may not be read by search or screen readers. This tool only styles the name field.",
    },
    {
      q: "What should I put in a bio call to action?",
      a: "Tell people the one action you want: DM a keyword, tap the link, book a call or shop. Keep it short and make sure it matches something you actually offer.",
    },
    {
      q: "Does this Instagram bio generator use AI or save my details?",
      a: "No. It fills your text into fixed templates in your browser. Nothing is uploaded, no AI is used and nothing is saved when you leave the page.",
    },
  ],
  related: [
    "/tools/instagram-username-generator",
    "/tools/instagram-font-generator",
    "/tools/instagram-line-break-generator",
    "/tools/instagram-dm-link-generator",
    "/tools/instagram-caption-generator",
    "/tools/instagram-highlight-cover-maker",
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
    mark: "Now turn comments into DMs.",
    text: "Schedule your posts with Poskoo and auto-DM your link to everyone who comments a keyword, on the official Meta API.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramBioGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <BioTool />
    </ToolPageTemplate>
  );
}
