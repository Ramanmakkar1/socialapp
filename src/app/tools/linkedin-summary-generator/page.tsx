import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import SummaryTool from "./SummaryTool";

const description =
  "Free LinkedIn summary generator: turn your role, audience, results and skills into About section drafts, check the 2,600-character limit and copy.";

const config: ToolPageConfig = {
  path: "/tools/linkedin-summary-generator",
  name: "LinkedIn summary generator",
  crumb: "LinkedIn summary generator",
  title: "LinkedIn Summary Generator: Free About Section Examples",
  description,
  pill: "Free · runs in your browser · no AI",
  h1: { mark: "LinkedIn summary generator", after: "for your About section" },
  lede: "The LinkedIn About section (your summary) allows up to 2,600 characters, but only the first few lines show before “see more”, so put who you help and the result you deliver first.",
  art: "writing",
  artLabel: "A creator writes a LinkedIn About section beside a character meter and a see more preview",
  heroPoints: ["4 About section drafts", "2,600-character limit check", "Preview before “see more”"],
  toolTitle: "Write your LinkedIn About section",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to write a LinkedIn summary",
  steps: [
    {
      title: "Add your role and audience",
      text: "Type your job title and who you help, then describe the result or proof you deliver in your own words. Add your top skills as a comma-separated list.",
      art: "writing",
    },
    {
      title: "Add a personal line and CTA",
      text: "A short personal line is optional. Keep or edit the call to action so the end of your summary tells people what to do next, such as message you or visit a link.",
      art: "visual",
    },
    {
      title: "Check the limit and copy",
      text: "Each card shows its character count out of 2,600 and the text that appears before “see more”. Copy the draft that fits and paste it into your LinkedIn profile.",
      art: "writing",
    },
  ],
  featuresTitle: "About section drafts that respect LinkedIn's limits",
  features: [
    {
      title: "Four useful angles",
      text: "Story, results-first, skills and keywords, and a short version cover the most common ways to open a LinkedIn summary.",
      art: "writing",
    },
    {
      title: "The 2,600 check",
      text: "Every draft shows its character count out of 2,600 and turns coral when it is over, so you can trim before you paste.",
      art: "analytics",
    },
    {
      title: "Preview the cut-off",
      text: "A preview badge shows the first ~265 characters, which is roughly what visitors see before they click “see more”.",
      art: "visual",
    },
  ],
  guide: {
    title: "How to write a LinkedIn About section that gets read",
    intro:
      "Your summary is one of the few places on LinkedIn where you can explain what you do in full sentences. Open with the reader's problem and your result, then add proof, skills and a clear next step.",
    sections: [
      {
        title: "How long can a LinkedIn summary be?",
        body: (
          <p>
            A LinkedIn About section allows up to <b>2,600 characters</b>. Only the first few lines show before
            &ldquo;see more&rdquo;, so put who you help and the result you deliver in the opening sentence. Check a
            finished draft with the <Link href="/tools/linkedin-character-counter">LinkedIn character counter</Link>.
          </p>
        ),
      },
      {
        title: "What should I put in my LinkedIn About section?",
        body: (
          <p>
            Say who you are, who you help, the result or proof you deliver and the skills you use. Add a short personal
            line if it fits, then finish with a call to action. Keep paragraphs short so the section is easy to scan on
            mobile.
          </p>
        ),
      },
      {
        title: "Should a LinkedIn summary be first or third person?",
        body: (
          <p>
            First person reads warmer and is the usual choice for most profiles. Third person can suit a formal
            consultancy or an executive bio, but pick one voice and stay consistent. The Story draft here is written in
            first person as a starting point.
          </p>
        ),
      },
      {
        title: "Is the summary the same as the headline?",
        body: (
          <p>
            No. The headline is the single line under your name; the summary is the longer About section further down
            the profile. Write the short line first with the{" "}
            <Link href="/tools/linkedin-headline-generator">LinkedIn headline generator</Link>, then expand it into your
            summary.
          </p>
        ),
      },
    ],
  },
  faqTitle: "LinkedIn summary questions",
  faqs: [
    {
      q: "How long can a LinkedIn summary be?",
      a: "A LinkedIn About section allows up to 2,600 characters. Only the first few lines are visible before “see more”, so put your audience and result at the start.",
    },
    {
      q: "What should I put in my LinkedIn About section?",
      a: "Cover who you are, who you help, the result or proof you deliver and your top skills. Add a short personal line if it helps, and end with a clear call to action.",
    },
    {
      q: "Should a LinkedIn summary be first or third person?",
      a: "Most profiles read best in first person because it sounds direct and human. Third person can suit formal bios, but choose one voice and keep it consistent.",
    },
    {
      q: "Is the summary the same as the headline?",
      a: "No. The headline is the line under your name, while the summary is the longer About section. Use the LinkedIn headline generator for the short line and this tool for the summary.",
    },
    {
      q: "Does the tool use AI?",
      a: "No. It fills fixed templates with your role, audience, result, skills and call to action, so the drafts are deterministic and nothing leaves your browser.",
    },
  ],
  related: [
    "/tools/linkedin-headline-generator",
    "/tools/linkedin-post-generator",
    "/tools/linkedin-character-counter",
    "/tools/linkedin-post-preview",
    "/linkedin-scheduler",
  ],
  schema: {
    features: [
      "Four LinkedIn About section drafts: story, results-first, skills and short",
      "Character count out of 2,600 on every draft",
      "Preview of the first ~265 characters shown before “see more”",
      "Optional personal line and a call to action",
      "Copy any draft with no data upload",
    ],
  },
  cta: {
    title: "Your summary is ready.",
    mark: "Plan the posts behind it.",
    text: "Connect LinkedIn through its official sign-in, schedule posts on one calendar and keep your profile active with Poskoo.",
  },
};

export const metadata = toolMetadata(config);

export default function LinkedInSummaryGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <SummaryTool />
    </ToolPageTemplate>
  );
}
