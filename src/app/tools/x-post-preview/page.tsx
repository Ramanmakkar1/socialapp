import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import { networkAvailability, availabilityPhrase } from "@/components/ChannelStatusNote";
import XPostPreview from "./XPostPreview";

export const revalidate = 600;

const config: ToolPageConfig = {
  path: "/tools/x-post-preview",
  name: "X post preview",
  crumb: "X post preview",
  title: "X Post Preview: See How Your Tweet Looks Before Posting",
  description:
    "Free X post preview for desktop and mobile. See how your tweet looks before you publish, with links counted as 23 characters against the 280 limit.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "X post preview", after: "for desktop and mobile" },
  lede: "An X post preview shows how your post (tweet) looks on X before you publish, counting links as 23 characters against the 280-character limit.",
  art: "visual",
  artLabel: "A creator checks an X post across desktop and mobile previews",
  heroPoints: ["Desktop and mobile mockups", "X-accurate 280-character count", "No signup"],
  toolTitle: "Preview your X post",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to use the X post preview",
  steps: [
    {
      title: "Write or paste your draft",
      text: "Add your post text, then optionally enter a display name and @handle so the mockup looks like your profile.",
      art: "writing",
    },
    {
      title: "Compare desktop and mobile",
      text: "Switch widths to see how your post wraps on a desktop timeline and a phone, and add an image to check how it sits under the text.",
      art: "visual",
    },
    {
      title: "Check the count, copy and publish",
      text: "Watch the live count with links as 23 characters, trim anything over 280, then copy your finished draft into X or your scheduler.",
      art: "analytics",
    },
  ],
  featuresTitle: "Check the post before you publish",
  features: [
    {
      title: "X-accurate character count",
      text: "Links count as 23 characters and emoji as 2, matching how X counts your post against the 280 limit.",
      art: "analytics",
    },
    {
      title: "Desktop and mobile mockups",
      text: "See the post in a desktop timeline card and a phone frame, with #hashtags and @mentions highlighted in the brand colour.",
      art: "visual",
    },
    {
      title: "Private and instant",
      text: "The preview and count update in your browser. Your draft and image are not uploaded, and no X login is needed.",
      art: "writing",
    },
  ],
  guide: {
    title: "How X post previews work",
    intro:
      "X shows your post in a timeline card, and the feed crops images and wraps text by device. Previewing both widths helps you check the opening, the image and the character count before you publish.",
    sections: [
      {
        title: "How long can a post on X be?",
        body: (
          <p>
            A standard X post can be up to <b>280 characters</b>. Letters, numbers, spaces, line breaks and emoji all
            count; emoji count as 2. Premium subscribers get a longer limit of <b>25,000 characters</b>. This preview
            counts against the 280 limit and turns red when the draft is over it.
          </p>
        ),
      },
      {
        title: "How does X count links and emoji?",
        body: (
          <p>
            Every link counts as a flat <b>23 characters</b>, no matter how long the URL is, because X wraps it in a
            t.co short link. Emoji count as <b>2 characters</b> each. This preview uses X&apos;s weighting, so a post
            with one long URL and a few emoji is counted the same way X counts it.
          </p>
        ),
      },
      {
        title: "Why does my image crop in the X feed?",
        body: (
          <p>
            X crops images to fit the timeline card: landscape images are shown with the top and bottom cut off, and
            very tall images are cropped to a 16:9 area in the feed. Upload an image in this preview to see it under
            your text, and keep important content in the centre so the crop does not cut it off.
          </p>
        ),
      },
      {
        title: "Preview the post, then schedule it",
        body: (
          <p>
            Once the text, image and count look right, copy the draft into the{" "}
            <Link href="/x-scheduler">X scheduler</Link> to choose a publishing time. You can also check other X
            fields with the <Link href="/tools/x-character-counter">X character counter</Link> or find the{" "}
            <Link href="/tools/best-time-to-post-on-x">best time to post on X</Link>.
          </p>
        ),
      },
    ],
  },
  faqTitle: "X post preview questions",
  faqs: [
    {
      q: "How many characters can an X post be?",
      a: "A standard X post can be up to 280 characters. Links count as 23 characters and emoji as 2 each. Premium subscribers can post up to 25,000 characters.",
    },
    {
      q: "Does the preview count links like X does?",
      a: "Yes. Every link is counted as 23 characters, matching X's t.co wrapping, and emoji count as 2. The live counter shows the total against the 280-character limit.",
    },
    {
      q: "Can I preview an image with my post?",
      a: "Yes. Add an image and it is shown under your text in the mockup. The image stays in your browser as a local preview and is not uploaded anywhere.",
    },
    {
      q: "Does my draft get uploaded or saved?",
      a: "No. The preview and character count run entirely in your browser. Your draft and image are not uploaded or saved, and you do not need to connect an X account to use this tool.",
    },
    {
      q: "Can I schedule X posts?",
      a: "Yes. Copy your finished draft into Poskoo's X scheduler at /x-scheduler, connect through X's official sign-in and choose the date and time you want it published.",
    },
  ],
  related: [
    "/tools/x-character-counter",
    "/tools/best-time-to-post-on-x",
    "/tools/linkedin-post-preview",
    "/tools/threads-post-preview",
  ],
  schema: {
    features: [
      "Desktop and mobile X post mockups",
      "X-accurate 280-character count with links as 23",
      "Hashtag and mention highlighting",
      "Optional display name, @handle and image preview",
      "Copy and reset controls with no draft upload",
    ],
  },
  cta: {
    title: "Your post is ready.",
    mark: "Put it on the calendar.",
    text: "Connect X through its official sign-in, schedule your post with Poskoo and publish it at the time you choose.",
  },
};

export const metadata = toolMetadata(config);

export default function XPostPreviewPage() {
  const state = networkAvailability("x");
  const pageConfig =
    state === "live"
      ? config
      : {
          ...config,
          faqs: config.faqs.map((f) =>
            f.q === "Can I schedule X posts?"
              ? {
                  ...f,
                  a: `Not yet. X publishing in Poskoo is ${availabilityPhrase(state, "X")}. Until then, preview your draft here, copy it and post it on X yourself.`,
                }
              : f,
          ),
        };
  return (
    <ToolPageTemplate config={pageConfig}>
      <XPostPreview />
    </ToolPageTemplate>
  );
}
