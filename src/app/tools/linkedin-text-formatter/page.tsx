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
import t from "@/components/tools/tools.module.css";
import { BRAND } from "@/lib/brand";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import FormatterTool from "./FormatterTool";

const PATH = "/tools/linkedin-text-formatter";
const description = "Free LinkedIn text formatter: create bold and italic Unicode text for posts and headlines, add bullets, copy text and check the 3,000-character post limit.";

const config: ToolPageConfig = {
  path: "/tools/linkedin-text-formatter",
  name: "LinkedIn Text Formatter",
  crumb: "LinkedIn Text Formatter",
  title: "LinkedIn Text Formatter: Bold & Italic Text Free | Poskoo",
  description,
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "LinkedIn Text Formatter" },
  lede: "Turn text into Unicode bold and italic you can paste into LinkedIn posts, headlines and About sections. Add a bullet list, copy any style and check the post length as you type.",
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
              Keep search terms and calls to action in plain text where possible. Once your post is ready, you can{" "}
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
  faqTitle: "LinkedIn text formatting questions",
  faqs: [
    {
      q: "How do I bold text on LinkedIn?",
      a: "Type your text in this formatter, press Copy next to Bold, and paste the Unicode result into your LinkedIn post. LinkedIn's standard post composer does not have a native bold button.",
    },
    {
      q: "Does bold text hurt LinkedIn reach?",
      a: "There is no confirmed evidence that Unicode bold text directly reduces LinkedIn reach. However, long styled passages can be hard to read and may reduce engagement, so use bold only for a few key words.",
    },
    {
      q: "What is the LinkedIn post character limit?",
      a: "LinkedIn posts can be up to 3,000 characters. The live counter above tracks your draft against that limit and turns red above 3,000; check LinkedIn's composer before publishing because Unicode characters may be counted differently.",
    },
    {
      q: "Will it work in my LinkedIn headline?",
      a: "Yes, these Unicode styles generally work when pasted into a LinkedIn headline or About section. Keep important keywords in plain text and use styling sparingly because search matching and screen-reader pronunciation can be unreliable.",
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
        <ToolCard title={config.toolTitle} note={config.toolNote}><FormatterTool /></ToolCard>
        <p className="small" style={{ marginTop: 14, textAlign: "center" }}>
          Screen readers may read Unicode styled letters poorly, so use them only for a few key words.
        </p>
        <HowItWorks title={config.stepsTitle} steps={config.steps} />
        <ToolFeatures title={config.featuresTitle} features={config.features} />
        <ToolGuide guide={config.guide} />
        <ToolFaqSection title={config.faqTitle} faqs={config.faqs} />
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
