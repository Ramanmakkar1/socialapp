import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import LinkedInPostPreview from "./LinkedInPostPreview";

const config: ToolPageConfig = {
  path: "/tools/linkedin-post-preview",
  name: "LinkedIn post preview",
  crumb: "LinkedIn post preview",
  title: "LinkedIn Post Preview: See Your Post Before Publishing",
  description: "Free LinkedIn post preview for desktop and mobile. See where your draft cuts off before see more, check the 3,000-character limit, then copy your text.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "LinkedIn post preview", after: "for desktop and mobile" },
  lede: "A LinkedIn post preview shows how your post will look in the feed, including where LinkedIn cuts it off with \"…see more\" (about 210 characters on desktop, fewer on mobile).",
  art: "visual",
  artLabel: "A creator checks a LinkedIn post across desktop and mobile feed previews",
  heroPoints: ["Desktop and mobile mockups", "Live see more cut-off", "No signup"],
  toolTitle: "Preview your LinkedIn post",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the LinkedIn post preview",
  steps: [
    {
      title: "Write or paste your draft",
      text: "Add your post text, then optionally enter a display name and headline to make the feed mockup look like your profile.",
      art: "writing",
    },
    {
      title: "Compare desktop and mobile",
      text: "Switch widths to see the approximate see more cut-off at 210 characters on desktop or 140 on mobile, or at the third line break.",
      art: "visual",
    },
    {
      title: "Expand, copy and publish",
      text: "Select see more to read the full post, check the 3,000-character count, then copy your finished draft into LinkedIn or your scheduler.",
      art: "analytics",
    },
  ],
  featuresTitle: "Check the opening before you publish",
  features: [
    {
      title: "Find the see more cut-off",
      text: "See where your opening stops on desktop and mobile, including when line breaks make the visible preview shorter.",
      art: "visual",
    },
    {
      title: "Keep every line break",
      text: "The mockup preserves your spacing and wraps long words, helping you spot dense paragraphs and awkward gaps before posting.",
      art: "writing",
    },
    {
      title: "Private and instant",
      text: "The preview and character count update in your browser. Your draft is not uploaded or saved, and no LinkedIn login is needed.",
      art: "analytics",
    },
  ],
  guide: {
    title: "How LinkedIn post previews work",
    intro: "LinkedIn shows only the opening of a longer post in the feed. Previewing that opening helps you put the useful idea before see more and keeps the full draft within the post limit.",
    sections: [
      {
        title: "Where does LinkedIn cut off a post?",
        body: (
          <p>
            This preview uses about <b>210 characters on desktop</b> and <b>140 on mobile</b>, or the third line break if
            it comes first. The cut-off is approximate: the real LinkedIn feed can wrap text differently by device, font
            and screen size. Select <b>…see more</b> in the mockup to expand your complete draft.
          </p>
        ),
      },
      {
        title: "What is the LinkedIn post character limit?",
        body: (
          <p>
            A LinkedIn post can contain up to <b>3,000 characters</b>. Letters, numbers, punctuation, spaces, line breaks
            and emoji all contribute to the total. The live counter turns red when the draft is over the limit; it does
            not stop you typing, so you can finish editing before trimming it.
          </p>
        ),
      },
      {
        title: "Preview the post, then schedule it",
        body: (
          <p>
            Once the opening and spacing look right, copy the draft into the{" "}
            <Link href="/linkedin-scheduler">LinkedIn scheduler</Link> to choose a publishing time. You can also check
            other LinkedIn fields with the <Link href="/tools/linkedin-character-counter">LinkedIn character counter</Link>{" "}
            or add bold and italic Unicode styles with the <Link href="/tools/linkedin-text-formatter">LinkedIn text formatter</Link>.
          </p>
        ),
      },
    ],
  },
  faqTitle: "LinkedIn post preview questions",
  faqs: [
    {
      q: "How many characters show before see more on LinkedIn?",
      a: "About 210 characters show on desktop and about 140 on mobile in this preview. The third line break can make see more appear sooner. LinkedIn's real cut-off varies with line wrapping and screen size.",
    },
    {
      q: "What is the LinkedIn post character limit?",
      a: "A LinkedIn post can be up to 3,000 characters. The counter includes spaces, line breaks, punctuation and emoji, and warns you when the draft goes over the limit.",
    },
    {
      q: "Does line spacing count?",
      a: "Yes. Spaces and line breaks count toward the 3,000-character post limit. Line breaks also affect the feed preview: the third line break can trigger the see more cut-off before the character threshold.",
    },
    {
      q: "Can I schedule LinkedIn posts?",
      a: "Yes. Copy your finished draft into Poskoo's LinkedIn scheduler at /linkedin-scheduler, connect through LinkedIn's official sign-in and choose the date and time you want it published.",
    },
    {
      q: "Is my LinkedIn draft uploaded or saved?",
      a: "No. The preview and count run entirely in your browser. Your draft is not uploaded or saved, and you do not need to connect a LinkedIn account to use this tool.",
    },
  ],
  related: [
    "/tools/linkedin-character-counter",
    "/tools/linkedin-text-formatter",
    "/tools/best-time-to-post-on-linkedin",
  ],
  schema: {
    features: [
      "Desktop and mobile LinkedIn feed mockups",
      "Approximate see more cut-off by characters and line breaks",
      "Live 3,000-character post count",
      "Optional display name, headline and avatar initials",
      "Copy and reset controls with no draft upload",
    ],
  },
  cta: {
    title: "Your LinkedIn opening is ready.",
    mark: "Put the post on the calendar.",
    text: "Connect LinkedIn through its official sign-in, schedule your post with Poskoo and publish it at the time you choose.",
  },
};

export const metadata = toolMetadata(config);

export default function LinkedInPostPreviewPage() {
  return (
    <ToolPageTemplate config={config}>
      <LinkedInPostPreview />
    </ToolPageTemplate>
  );
}
