import Link from "next/link";
import { AnimArt } from "@/components/AnimArt";
import PublicShell from "@/components/PublicShell";
import {
  HowItWorks,
  ToolCard,
  ToolFaqSection,
  ToolFeatures,
  ToolGuide,
  ToolHero,
  toolMetadata,
  type ToolPageConfig,
} from "@/components/tools/ToolPageTemplate";
import { toolByHref } from "@/components/tools/registry";
import { ToolIcon } from "@/components/tools/ToolIcon";
import t from "@/components/tools/tools.module.css";
import { BRAND } from "@/lib/brand";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import FormatterTool from "./FormatterTool";

const PATH = "/tools/linkedin-text-formatter";
const description = "Paste your text, turn it into bold, italic or bulleted LinkedIn styles, then copy clean text in one click. Free, no sign-up, nothing uploaded.";

const config: ToolPageConfig = {
  path: "/tools/linkedin-text-formatter",
  name: "LinkedIn Text Formatter",
  crumb: "LinkedIn Text Formatter",
  title: "LinkedIn Text Formatter: Bold, Italic & Bullets",
  description,
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "LinkedIn Text Formatter" },
  lede: "LinkedIn has no bold or italic button, so you bold text by converting it to Unicode bold characters and pasting them into your post, headline or About section. Type below, copy a style, add bullets and check the 3,000-character limit.",
  art: "writing",
  artLabel: "A creator writes a LinkedIn post with a giant pencil and styled letters on a phone-shaped card",
  heroPoints: ["5 useful text styles", "One-click bullets", "3,000-character counter"],
  toolTitle: "Format your LinkedIn text",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to format text for LinkedIn",
  steps: [
    {
      title: "Type or paste your text",
      text: "Enter a post, headline or About-section line in Your text. Every preview and the character counter update as you type.",
      art: "writing",
    },
    {
      title: "Choose a useful style",
      text: "Compare bold, italic, bold italic, sans bold and monospace. Choose Bullet list to add a bullet to every non-empty line while preserving blank lines.",
      art: "feat-linkbio",
    },
    {
      title: "Copy it into LinkedIn",
      text: "Press Copy beside your chosen result, then paste it into LinkedIn or into a scheduled Poskoo post. Keep the rest in plain text for easy reading.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Simple formatting without editing hacks",
  features: [
    {
      title: "Five LinkedIn-friendly styles",
      text: "Use bold and italic for emphasis, bold italic or sans bold for a short heading, and monospace for a compact code or data snippet.",
      art: "writing",
    },
    {
      title: "Instant, tidy bullet lists",
      text: "Turn separate lines into bullets in one click. Empty lines stay empty, so your paragraph spacing remains intact when you copy the result.",
      art: "feat-linkbio",
    },
    {
      title: "A live post-length check",
      text: "The 3,000-character counter updates while you write and turns red if your draft is too long. Formatting runs locally without uploading your text.",
      art: "analytics",
    },
  ],
  guide: {
    title: "LinkedIn bold text: how Unicode formatting works",
    intro: "LinkedIn does not offer bold or italic buttons in its standard post composer. A LinkedIn text formatter works by replacing ordinary letters with lookalike Unicode characters, which you can copy and paste as text.",
    sections: [
      {
        title: "How do I add bold or italics to a LinkedIn post?",
        body: (
          <p>
            Type your draft above and copy the Bold or Italic result. Paste it into LinkedIn&apos;s post composer in place
            of your original text. These are Unicode letters rather than a LinkedIn font setting, so you can combine a
            styled phrase with ordinary text. They also work in many profile fields, including headlines and About sections.
          </p>
        ),
      },
      {
        title: "When should I use styled text and bullets?",
        body: (
          <>
            <p>
              Use a bold phrase to mark a key takeaway and italics for a short title or aside. The Bullet list output adds
              &ldquo;• &rdquo; to each non-empty line, making a sequence of ideas easier to scan without changing blank lines.
            </p>
            <p>
              Keep search terms and calls to action in plain text where possible. To write the profile line your post
              points back to, use the <Link href="/tools/linkedin-headline-generator">free LinkedIn headline generator</Link>.
              Once your post is ready, you can{" "}
              <Link href="/linkedin-scheduler">schedule LinkedIn posts with Poskoo</Link> instead of publishing by hand.
            </p>
          </>
        ),
      },
      {
        title: "Are Unicode styles accessible?",
        body: (
          <p>
            Not always. Screen readers may read Unicode styled letters poorly, so use them only for a few key words. Do not
            style an entire post or headline. Test important profile text on another device, and keep the plain-language
            message understandable even if the styling is difficult to read.
          </p>
        ),
      },
    ],
  },
  faqTitle: "Frequently asked questions",
  faqs: [
    {
      q: "Does the formatting survive when I paste it into LinkedIn?",
      a: "Yes. The formatter copies real Unicode characters rather than styling, so bold, italic and bulleted text stays formatted when you paste it into LinkedIn's post composer, headline or About section. It also survives saving a draft and publishing from the LinkedIn app or desktop.",
    },
    {
      q: "Does LinkedIn support bold and italic text?",
      a: "LinkedIn's composer has no native bold or italic button. This tool creates the effect by replacing letters with lookalike Unicode characters, which LinkedIn treats as ordinary text, so bold and italic display on both desktop and mobile.",
    },
    {
      q: "What is the LinkedIn post character limit?",
      a: "LinkedIn posts can be up to 3,000 characters. The live counter above tracks your draft against that limit and turns red above 3,000; check LinkedIn's composer before publishing because Unicode characters may be counted differently.",
    },
  ],
  related: [],
  schema: {
    features: [
      "Bold, italic, bold italic, sans bold and monospace text",
      "Bullet lists with blank lines preserved",
      "Live 3,000-character counter",
      "One-click copy for LinkedIn posts and profile fields",
    ],
    howTo: false,
  },
};

export const metadata = toolMetadata(config);

const moreTools = [
  "/tools/youtube-thumbnail-size-checker",
  "/tools/best-time-to-post-on-threads",
  "/tools/tiktok-money-calculator",
  "/tools/best-time-to-post-on-youtube",
].flatMap((href) => {
  const tool = toolByHref(href);
  return tool ? [tool] : [];
});

const appJsonLd = {
  ...toolSoftwareJsonLd({ name: config.name, description, url: `${BRAND.url}${PATH}` }),
  featureList: config.schema?.features,
};

export default function LinkedInTextFormatterPage() {
  return (
    <PublicShell breadcrumbs={[{ name: "Free tools", path: "/tools" }, { name: config.crumb ?? config.name, path: PATH }]}>
      {[appJsonLd, faqJsonLd(config.faqs)].map((data) => (
        <script key={data["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(data) }} />
      ))}
      <div className={t.page}>
        <ToolHero config={config} />
        <p className="small" style={{ maxWidth: 720, margin: "0 auto 20px", textAlign: "center" }}>
          This free LinkedIn text formatter turns plain text into bold, italic, bulleted and other Unicode styles you can
          copy and paste into LinkedIn posts, headlines and About sections. It runs in your browser with no sign-up, and
          nothing you type is uploaded.
        </p>
        <ToolCard title={config.toolTitle} note={config.toolNote}><FormatterTool /></ToolCard>
        <p className="small" style={{ marginTop: 14, textAlign: "center" }}>
          Screen readers may read Unicode styled letters poorly, so use them only for a few key words.
        </p>
        <HowItWorks title={config.stepsTitle} steps={config.steps} />
        <ToolFeatures title={config.featuresTitle} features={config.features} />
        <ToolGuide guide={config.guide} />
        <ToolFaqSection title={config.faqTitle ?? `${config.name} FAQ`} faqs={config.faqs} />
        <section className={t.section} aria-labelledby="more-tools-title">
          <div className={t.relHead}>
            <div>
              <p className="eyebrow">Keep going</p>
              <h2 id="more-tools-title">More free tools</h2>
            </div>
            <Link href="/tools" className={t.textLink}>See all tools <span aria-hidden="true">→</span></Link>
          </div>
          <ul className={t.grid}>
            {moreTools.map((tool) => (
              <li key={tool.href}>
                <Link href={tool.href} className={`${t.card} ${t[`acc_${tool.category}`]}`}>
                  <span className={t.cardTop}>
                    <span className={`${t.cardIcon} ${t[`cat_${tool.category}`]}`}>
                      <ToolIcon name={tool.icon} />
                    </span>
                    <b>{tool.name}</b>
                  </span>
                  <p>{tool.summary}</p>
                  <span className={t.go}>Open tool <span aria-hidden="true">→</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className={t.section}>
          <div className="cta">
            <div className="ctaCopy">
              <p className="ctaEyebrow">Free plan · no credit card</p>
              <h2>Formatted your post? <em className="s">Put it on the calendar.</em></h2>
              <p>Copy your finished text, choose a time and let Poskoo publish through LinkedIn&apos;s official API.</p>
              <div className="ctas">
                <Link className="btn" href="/linkedin-scheduler">schedule LinkedIn posts with Poskoo <span aria-hidden="true">→</span></Link>
                <Link className="btn" href="/signup">Sign up free</Link>
              </div>
            </div>
            <AnimArt name="card-schedule" label="A creator pins a formatted LinkedIn post onto a weekly calendar" />
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
