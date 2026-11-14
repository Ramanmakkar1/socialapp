import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import BioTool from "../instagram-bio-generator/BioTool";

const config: ToolPageConfig = {
  path: "/tools/facebook-bio-generator",
  name: "Facebook bio generator",
  crumb: "Facebook bio generator",
  title: "Facebook Bio Generator: Free 101-Character Bio Ideas",
  description:
    "Free Facebook bio generator: add your name, what you do and a call to action, pick a niche and copy a bio that fits the 101-character Intro limit.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Facebook bio generator:", mark: "bio ideas", after: "under 101 characters" },
  lede: "A Facebook bio (the Intro on your profile) can be up to 101 characters. Add your name, what you do and a call to action, pick a niche and copy a bio that fits.",
  art: "writing",
  artLabel: "A creator writes with a giant pencil on a phone-shaped card full of lines and emoji",
  heroPoints: ["101-char counter", "8 niches", "No signup"],
  toolTitle: "Write your Facebook bio",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Facebook bio generator",
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
      text: "Each bio shows its length out of 101 and turns red if it runs over. Press Copy on the one you like and paste it into Edit profile > Bio on Facebook.",
      art: "card-dm",
    },
  ],
  featuresTitle: "A bio that fits Facebook, reads well and asks for one thing",
  features: [
    {
      title: "Four templates per niche",
      text: "Creator, small business, coach, photographer, fitness, food, e-commerce and agency each have their own four layouts with matching emojis.",
      art: "writing",
    },
    {
      title: "Live 101-character check",
      text: "Every filled-in bio shows its length against Facebook's 101-character Intro limit, so you know what fits before you paste it.",
      art: "analytics",
    },
    {
      title: "Optional styled name",
      text: "Turn just your name into Unicode styles such as bold, italic or script while the rest of the bio stays in plain, searchable text.",
      art: "feat-linkbio",
    },
  ],
  guide: {
    title: "How to write a Facebook bio that works in 2026",
    intro:
      "Your Facebook Intro is the first thing a profile visitor reads after your name. In 101 characters it has to say who you are, what you offer and what to do next. This generator gives you hand-written layouts so you can focus on the words.",
    sections: [
      {
        title: "How long can a Facebook bio be?",
        body: (
          <>
            <p>
              A Facebook profile bio, shown as the Intro on your profile, can be up to 101 characters. Spaces, emojis and
              line breaks all count toward that limit, and some combined emojis can count as more than one character, so
              the counter here shows what your browser sees.
            </p>
            <p>
              That is shorter than an Instagram bio, so every line has to earn its place. Put your name or role first,
              add one detail about what you do, then end with a single call to action. The live counter turns red as soon
              as a filled-in bio passes 101 characters.
            </p>
          </>
        ),
      },
      {
        title: "How do I edit my Facebook bio?",
        body: (
          <>
            <p>
              On Facebook, open your profile, choose <b>Edit profile</b>, select <b>Bio</b> and press <b>Edit</b>. Paste
              the bio you copied here, then save the change. On the mobile app the same option sits under Edit profile on
              your own profile.
            </p>
            <p>
              If you paste and the text looks longer than expected, check for extra blank lines. The{" "}
              <Link href="/tools/instagram-line-break-generator">line break generator</Link> can help tidy spacing before
              you paste.
            </p>
          </>
        ),
      },
      {
        title: "Facebook profile bio vs Page intro",
        body: (
          <>
            <p>
              A profile bio is the Intro on your personal profile. A Page intro is the short description on a business or
              creator Page, and it is edited from the Page settings rather than your personal profile. The two are
              separate, so changing one does not change the other.
            </p>
            <p>
              Use the profile bio for your own name, role and one reason to connect. Use the Page intro to say what the
              business offers, who it serves and how to get in touch. The 101-character counter here is built for the
              profile Intro, so keep it short and direct.
            </p>
          </>
        ),
      },
      {
        title: "What makes a good Facebook bio?",
        body: (
          <ul>
            <li>
              <b>Lead with what you do.</b> &ldquo;Career coach for new managers&rdquo; tells a visitor more in a second
              than a slogan does.
            </li>
            <li>
              <b>One call to action.</b> Ask for one thing: message you, tap the link, or follow the Page. Several asks
              compete with each other.
            </li>
            <li>
              <b>Keep keywords in plain text.</b> Styled Unicode letters look nice but may not be read by search or screen
              readers. Style only your name, if anything.
            </li>
            <li>
              <b>Short lines are easier to scan.</b> Two or three short lines beat one dense block of text.
            </li>
            <li>
              <b>Make the CTA real.</b> If your bio says &ldquo;Message us&rdquo;, be ready to reply quickly and keep the
              offer current.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Facebook bio questions",
  faqs: [
    {
      q: "How long can a Facebook bio be?",
      a: "A Facebook profile bio, shown as the Intro on your profile, can be up to 101 characters. Spaces, emojis and line breaks all count, and some combined emojis can count as more than one character.",
    },
    {
      q: "How do I edit my Facebook bio?",
      a: "Open your profile, choose Edit profile, select Bio and press Edit. Paste the bio you copied, then save. On the mobile app the same option sits under Edit profile on your own profile.",
    },
    {
      q: "What is the difference between a Facebook profile bio and a Page intro?",
      a: "A profile bio is the Intro on your personal profile. A Page intro is the short description on a business or creator Page, edited from the Page settings. The two are separate, so changing one does not change the other.",
    },
    {
      q: "What makes a good Facebook bio?",
      a: "Say who you are and what you do in plain words, keep it to two or three short lines, and end with one clear call to action such as message, follow or tap the link.",
    },
  ],
  related: [
    "/tools/facebook-caption-generator",
    "/tools/facebook-character-counter",
    "/tools/facebook-hashtag-generator",
    "/facebook-scheduler",
  ],
  schema: {
    features: [
      "Bio templates for 8 niches",
      "Live 101-character counter",
      "Optional Unicode name styles",
      "One-click copy for each bio",
      "Runs in the browser, no signup",
    ],
  },
  cta: {
    title: "Your bio is ready.",
    mark: "Now schedule your Facebook posts.",
    text: "Plan and schedule Facebook Page posts with Poskoo on Meta's official API, and keep your new bio working with a steady posting schedule.",
  },
};

export const metadata = toolMetadata(config);

export default function FacebookBioGeneratorPage() {
  return (
    <ToolPageTemplate config={config}>
      <BioTool platform="facebook" />
    </ToolPageTemplate>
  );
}
