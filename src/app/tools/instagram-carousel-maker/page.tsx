import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import CarouselMaker from "./CarouselMaker";

const config: ToolPageConfig = {
  path: "/tools/instagram-carousel-maker",
  name: "Instagram carousel maker",
  crumb: "Carousel maker",
  title: "Instagram Carousel Maker: Free Text Slides (1080×1350)",
  description:
    "Free Instagram carousel maker: write a headline and body text per slide, pick colours, reorder slides and download each as a 1080×1350 PNG. No signup.",
  pill: "Free · runs in your browser · no watermark",
  h1: { mark: "Instagram carousel maker:", after: "free text slides" },
  lede: "Build clean text-and-colour carousel slides, preview them in order and download each one as a 1080×1350 PNG. No upload, no account, no watermark.",
  art: "visual",
  artLabel: "A creator measures a photo frame with a ruler next to phone screens of different shapes",
  heroPoints: ["1080×1350 PNGs", "6 colour presets", "No signup"],
  toolTitle: "Design your carousel slides",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to make an Instagram carousel",
  steps: [
    {
      title: "Write the slide",
      text: "In the Editing slide panel, type a Headline and Body text and choose a Background colour. The preview grid redraws as you type.",
      art: "writing",
    },
    {
      title: "Add and order slides",
      text: "Press Add slide for a new slide, which opens it for editing. Use the up and down arrows to move it and the bin icon to delete it.",
      art: "visual",
    },
    {
      title: "Download and post",
      text: "Press Download under a slide or Download all slides. Upload the PNGs to Instagram in the same order as one carousel post.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Simple slides that read well in the feed",
  features: [
    {
      title: "The right size every time",
      text: "Every slide is drawn at 1080×1350 (4:5), so the whole carousel shares one ratio with no cropping.",
      art: "visual",
    },
    {
      title: "Built-in slide numbers",
      text: "Each slide shows its position, such as 2 / 5, so readers know how much is left to swipe.",
      art: "writing",
    },
    {
      title: "Private and free",
      text: "Slides are drawn on a canvas in your browser and saved to your device. Nothing is uploaded and there is no watermark.",
      art: "feat-ai",
    },
  ],
  guide: {
    title: "A practical guide to Instagram carousels in 2026",
    intro:
      "A carousel is a single post with several swipeable slides. It suits lists, steps and short lessons, where one idea per slide keeps people swiping. Here is how this maker works and how to plan a carousel that gets read to the end.",
    sections: [
      {
        title: "What this carousel maker does",
        body: (
          <>
            <p>
              The maker draws each slide on a canvas at <b>1080×1350 px</b>. A slide has a headline (large bold text, up
              to four lines), body text (up to eight lines), one of six background colours (Violet, Ink, Paper, Coral,
              Mint and Sky, each with a matching text colour) and a slide number in the bottom-left corner.
            </p>
            <p>
              It starts with a three-slide example you can rewrite. Text that runs past the line limits is cut off on the
              slide, so keep it short and check the preview before you download. Files are saved as{" "}
              <code>slide-1-of-3.png</code> and so on.
            </p>
          </>
        ),
      },
      {
        title: "How to plan a carousel that gets swiped",
        body: (
          <ul>
            <li>
              <b>Slide 1 is the hook.</b> It is the only slide people see in the feed, so state the promise plainly. The{" "}
              <Link href="/tools/instagram-hook-generator">hook generator</Link> can help with the wording.
            </li>
            <li>
              <b>One idea per slide.</b> A short headline plus one or two lines of body text reads better on a phone than
              a paragraph.
            </li>
            <li>
              <b>Keep a consistent look.</b> Reuse two or three colours so the slides feel like one post.
            </li>
            <li>
              <b>End with a clear ask.</b> The last slide can ask people to save the post, follow, or comment a keyword.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: a five-slide tips carousel",
        body: (
          <>
            <p>For a post about writing better captions, a simple outline looks like this:</p>
            <div className={t.example}>
              <p>1 / 5 · 3 caption fixes that get more replies (Violet)</p>
              <p>2 / 5 · Start with a question (Paper)</p>
              <p>3 / 5 · Put the point in the first line (Paper)</p>
              <p>4 / 5 · End with one clear ask (Paper)</p>
              <p>5 / 5 · Comment CAPTIONS for the full checklist (Ink)</p>
            </div>
            <p>
              The coloured first and last slides frame the post, and the middle slides share one colour. If you use a
              comment keyword on the last slide, <Link href="/instagram-auto-dm">Instagram auto DM</Link> can send the
              checklist to everyone who comments it.
            </p>
          </>
        ),
      },
      {
        title: "Common carousel mistakes",
        body: (
          <ul>
            <li>A first slide that does not say what the carousel is about.</li>
            <li>Long body text that gets cut off or is too small to read on a phone.</li>
            <li>Mixing slide sizes from different tools in one post.</li>
            <li>Uploading the PNGs in a different order from the numbers on the slides.</li>
            <li>
              Posting whenever the slides are finished instead of planning a time with the{" "}
              <Link href="/instagram-scheduler">Instagram scheduler</Link>.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram carousel maker questions",
  faqs: [
    {
      q: "How do I make an Instagram carousel?",
      a: "Create your slides here and download them as PNGs. Then open Instagram, tap the plus button, choose Post, select the slides in order and share. Instagram shows them as one swipeable carousel.",
    },
    {
      q: "What size are the downloaded carousel slides?",
      a: "Every slide is exported as a 1080×1350 pixel PNG, the 4:5 portrait feed size. All slides share the same size, so the carousel stays consistent as people swipe.",
    },
    {
      q: "Can I reorder or delete slides?",
      a: "Yes. The up and down arrows in the editing panel move the slide you are editing earlier or later, and the bin icon deletes it. The preview grid and slide numbers update to match.",
    },
    {
      q: "Can I add photos or my own fonts?",
      a: "No. This maker creates text-and-colour slides with a headline, body text and one of six background colours. For photo carousels, crop your images with the Instagram image size tool instead.",
    },
    {
      q: "Is my text or design uploaded to your server?",
      a: "No. The slides are drawn on a canvas inside your browser and the PNGs are saved straight to your device. Nothing is uploaded and no Instagram login is needed.",
    },
    {
      q: "Can I schedule the carousel with Poskoo?",
      a: "Yes. Download the slides, then use the Poskoo Instagram scheduler to plan the carousel for a date and time in your time zone.",
    },
  ],
  related: [
    "/tools/instagram-carousel-splitter",
    "/tools/instagram-carousel-size-checker",
    "/tools/instagram-hook-generator",
    "/tools/instagram-caption-generator",
    "/tools/instagram-post-preview",
    "/tools/instagram-image-size",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Headline and body text per slide",
      "Six background colour presets",
      "Add, reorder and delete slides",
      "Automatic slide numbers",
      "1080×1350 PNG download, no watermark",
    ],
  },
  cta: {
    title: "Your carousel is designed.",
    mark: "Schedule it.",
    text: "Plan the carousel with Poskoo, and DM everyone who comments the keyword on your last slide.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramCarouselMakerPage() {
  return (
    <ToolPageTemplate config={config}>
      <CarouselMaker />
    </ToolPageTemplate>
  );
}
