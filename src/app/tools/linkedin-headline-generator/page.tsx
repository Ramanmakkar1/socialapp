import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import HeadlineTool from "./HeadlineTool";

const description =
  "Free LinkedIn headline generator: enter your role, audience, result and skills to get profile headline ideas, check the 220-character limit and copy.";

const config: ToolPageConfig = {
  path: "/tools/linkedin-headline-generator",
  name: "LinkedIn headline generator",
  crumb: "LinkedIn headline generator",
  title: "LinkedIn Headline Generator: Free Profile Headlines",
  description,
  pill: "Free · runs in your browser · no AI",
  h1: { mark: "LinkedIn headline generator", after: "for a profile that gets found" },
  lede: "A LinkedIn headline can be up to 220 characters; the strongest ones say who you help, how, and the result, with your main keyword early.",
  art: "writing",
  artLabel: "A creator builds a LinkedIn profile headline beside a character meter and a search preview",
  heroPoints: ["5 headline formulas", "220-character limit check", "About 60 characters visible on mobile"],
  toolTitle: "Build your LinkedIn headline",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to generate a LinkedIn headline",
  steps: [
    {
      title: "Add your role and audience",
      text: "Type your job title and who you help, such as Marketing Manager and B2B SaaS teams. Add the result you deliver and your key skills as a comma-separated list.",
      art: "writing",
    },
    {
      title: "Pick a headline formula",
      text: "Leave All selected to compare every angle, or choose Role + audience, Result, Keywords, Mission or Creator to focus on one style.",
      art: "visual",
    },
    {
      title: "Check the length and copy",
      text: "Each card shows its character count out of 220 and flags text that may be cut off on mobile. Copy the headline that fits and paste it into your LinkedIn profile.",
      art: "writing",
    },
  ],
  featuresTitle: "Headline ideas that respect LinkedIn's limits",
  features: [
    {
      title: "Five proven angles",
      text: "Role, result, keyword, mission and creator formulas cover the most common ways people describe their work on LinkedIn.",
      art: "writing",
    },
    {
      title: "The 220 and 60 checks",
      text: "Every headline shows its character count out of 220, with a warning when it is too long and a muted note when it passes about 60 characters.",
      art: "analytics",
    },
    {
      title: "Private and repeatable",
      text: "Headlines come from fixed templates in your browser. No AI is called, nothing is uploaded, and the same details always give the same list.",
      art: "visual",
    },
  ],
  guide: {
    title: "How to write a LinkedIn headline that gets found",
    intro:
      "Your headline appears next to your name in search, comments, messages and connection requests, so it needs to work in a single line. Use the generated ideas as a starting point, then edit them to sound like you.",
    sections: [
      {
        title: "How long can a LinkedIn headline be?",
        body: (
          <p>
            LinkedIn allows up to <b>220 characters</b> in a headline. Many mobile feeds show only about the first{" "}
            <b>60 characters</b>, so put the most important words at the front. A headline under 220 characters is
            accepted, but a shorter one is easier to scan. Check a finished headline with the{" "}
            <Link href="/tools/linkedin-character-counter">free LinkedIn character counter</Link>.
          </p>
        ),
      },
      {
        title: "What makes a good LinkedIn headline?",
        body: (
          <p>
            A strong headline says who you help, how you help them and the result they get, in plain language. Lead with
            your role or the outcome, avoid vague titles and keep the most useful detail first. For example, &ldquo;Marketing
            Manager helping B2B SaaS teams grow pipeline from LinkedIn&rdquo; gives a reader more than &ldquo;Marketing
            Manager&rdquo; alone. Make the text easy to read in plain case, and style only a few words with the{" "}
            <Link href="/tools/linkedin-text-formatter">LinkedIn text formatter</Link>.
          </p>
        ),
      },
      {
        title: "Should I use keywords in my headline?",
        body: (
          <p>
            Yes, but in a natural sentence. LinkedIn search matches words in your headline, so include the terms people
            use for your role, service or niche. Put your main keyword early rather than listing many keywords at the end.
            Once the headline is ready, use the{" "}
            <Link href="/linkedin-scheduler">LinkedIn scheduler</Link> to plan posts that support your profile.
          </p>
        ),
      },
    ],
  },
  faqTitle: "LinkedIn headline questions",
  faqs: [
    {
      q: "Is this LinkedIn headline generator free?",
      a: "Yes. The tool runs entirely in your browser: add your details, pick a formula and copy a headline. Nothing is uploaded, no account is needed and there is no AI call behind it.",
    },
    {
      q: "How many headline ideas does it generate?",
      a: "Each of the five formulas gives up to four headlines, so you can see up to 20 ideas when All is selected. Choosing one formula shows its own headlines.",
    },
    {
      q: "What happens if my headline is too long?",
      a: "Headlines over 220 characters are marked 'too long'. Headlines over about 60 characters get a muted note that they may be cut off in mobile feeds, so keep the key words early.",
    },
    {
      q: "Does the tool use AI?",
      a: "No. It fills a fixed set of headline templates with your role, audience, result and skills, so the results are deterministic and no data leaves your browser.",
    },
  ],
  related: [
    "/tools/linkedin-text-formatter",
    "/tools/linkedin-character-counter",
    "/linkedin-scheduler",
    "/tools/linkedin-post-preview",
  ],
  schema: {
    features: [
      "Five LinkedIn headline formulas: role and audience, result, keywords, mission and creator",
      "Up to 20 deterministic headline ideas from one set of details",
      "Character count out of 220 on every headline",
      "Warnings for headlines over 220 characters and notes for text over about 60 characters",
      "Copy one headline or all headlines with no data upload",
    ],
  },
  cta: {
    title: "Your headline is ready.",
    mark: "Plan the posts behind it.",
    text: "Connect LinkedIn through its official sign-in, schedule posts on one calendar and keep your profile active with Poskoo.",
  },
};

export const metadata = toolMetadata(config);

export default function LinkedInHeadlineGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <HeadlineTool />
    </ToolPageTemplate>
  );
}
