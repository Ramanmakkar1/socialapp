import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import FacebookPostPreview from "./FacebookPostPreview";

const config: ToolPageConfig = {
  path: "/tools/facebook-post-preview",
  name: "Facebook post preview",
  crumb: "Facebook post preview",
  title: "Facebook Post Preview: Check See More on Desktop & Mobile",
  description: "Free Facebook post preview for desktop and mobile. See where your post cuts off before See more, check the 63,206-character limit, then copy your text.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "Facebook post preview", after: "for desktop and mobile" },
  lede: "A Facebook post preview shows how a Page or profile post looks in the feed and where Facebook hides the rest behind \"See more\" (about 480 characters on desktop, about 125 on mobile).",
  art: "visual",
  artLabel: "A creator checks a Facebook post across desktop and mobile feed previews",
  heroPoints: ["Desktop and mobile mockups", "Live See more cut-off", "No signup"],
  toolTitle: "Preview your Facebook post",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the Facebook post preview",
  steps: [
    {
      title: "Write or paste your draft",
      text: "Add your post text, then optionally enter a Page name and pick an image to make the feed mockup look like your Page.",
      art: "writing",
    },
    {
      title: "Compare desktop and mobile",
      text: "Switch widths to see the approximate See more cut-off at about 480 characters on desktop or about 125 on mobile, or at the third line break.",
      art: "visual",
    },
    {
      title: "Expand, copy and publish",
      text: "Select See more to read the full post, check the 63,206-character count, then copy your finished draft into Facebook or your scheduler.",
      art: "analytics",
    },
  ],
  featuresTitle: "Check the opening before you publish",
  features: [
    {
      title: "Find the See more cut-off",
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
      text: "The preview and character count update in your browser. Your draft is not uploaded or saved, and no Facebook login is needed.",
      art: "analytics",
    },
  ],
  guide: {
    title: "How Facebook post previews work",
    intro: "Facebook shows only the opening of a longer post in the feed. Previewing that opening helps you put the useful idea before See more and keeps the full draft within the post limit.",
    sections: [
      {
        title: "Where does Facebook cut off a post?",
        body: (
          <p>
            This preview uses about <b>480 characters on desktop</b> and <b>125 on mobile</b>, or the third line break if
            it comes first. The cut-off is approximate: the real Facebook feed can wrap text differently by device, font
            and screen size. Select <b>…See more</b> in the mockup to expand your complete draft.
          </p>
        ),
      },
      {
        title: "How long should a Facebook post be?",
        body: (
          <p>
            A Facebook post can contain up to <b>63,206 characters</b>, so length is rarely the constraint. Posts that
            earn the most engagement usually fit in a short opening: a clear first two lines, one useful idea, and a
            question that invites comments. Keep the hook before the See more cut-off, because most readers never expand
            the full text.
          </p>
        ),
      },
      {
        title: "What image size works best in the Facebook feed?",
        body: (
          <p>
            Square images (1080 x 1080) work in both the feed and shared links, while 1200 x 630 is the recommended size
            for link previews. Check exact dimensions and ratios with the{" "}
            <Link href="/tools/social-media-image-sizes">social media image sizes</Link> guide, then drop the image into
            this preview to see how it sits under your text.
          </p>
        ),
      },
    ],
  },
  faqTitle: "Facebook post preview questions",
  faqs: [
    {
      q: "How many characters show before See more on Facebook?",
      a: "About 480 characters show on desktop and about 125 on mobile in this preview. The third line break can make See more appear sooner. Facebook's real cut-off varies with line wrapping and screen size.",
    },
    {
      q: "What is the Facebook post character limit?",
      a: "A Facebook post can be up to 63,206 characters. The counter includes spaces, line breaks, punctuation and emoji, and warns you when the draft goes over the limit.",
    },
    {
      q: "Does line spacing count?",
      a: "Yes. Spaces and line breaks count toward the 63,206-character post limit. Line breaks also affect the feed preview: the third line break can trigger the See more cut-off before the character threshold.",
    },
    {
      q: "Can I schedule Facebook posts?",
      a: "Yes. Copy your finished draft into Poskoo's Facebook scheduler at /facebook-scheduler, connect your Page through Meta's official sign-in and choose the date and time you want it published.",
    },
    {
      q: "Is my Facebook draft uploaded or saved?",
      a: "No. The preview and count run entirely in your browser. Your draft is not uploaded or saved, and you do not need to connect a Facebook account to use this tool.",
    },
  ],
  related: [
    "/tools/facebook-character-counter",
    "/tools/best-time-to-post-on-facebook",
    "/tools/linkedin-post-preview",
    "/tools/social-media-image-sizes",
  ],
  schema: {
    features: [
      "Desktop and mobile Facebook feed mockups",
      "Approximate See more cut-off by characters and line breaks",
      "Live 63,206-character post count",
      "Optional Page name and local image preview",
      "Copy and reset controls with no draft upload",
    ],
  },
  cta: {
    title: "Your Facebook opening is ready.",
    mark: "Put the post on the calendar.",
    text: "Connect your Page through Meta's official sign-in, schedule your post with Poskoo and publish it at the time you choose.",
  },
};

export const metadata = toolMetadata(config);

export default function FacebookPostPreviewPage() {
  return (
    <ToolPageTemplate config={config}>
      <FacebookPostPreview />
    </ToolPageTemplate>
  );
}
