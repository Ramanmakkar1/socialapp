import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import PostPreviewTool from "./PostPreviewTool";

const config: ToolPageConfig = {
  path: "/tools/instagram-post-preview",
  name: "Instagram post preview",
  crumb: "Post preview",
  title: "Instagram Post Preview: Free Feed Mockup Tool",
  description:
    "Free Instagram post preview: add a local photo, handle and caption, compare square and portrait crops, and see where the caption folds before you post.",
  pill: "Free · no signup · images stay in your browser",
  h1: { before: "Instagram", mark: "post preview", after: "before you publish" },
  lede: "See your photo, handle and caption together in a feed-style mockup. Compare square and portrait crops and check where the caption cuts off with \"more\".",
  art: "visual",
  artLabel: "A creator measures a photo frame with a ruler next to phone screens of different shapes",
  heroPoints: ["1:1 and 4:5 crops", "Caption fold check", "No upload"],
  toolTitle: "Preview your Instagram post",
  toolNote: "Free · images never leave your browser",
  stepsTitle: "How to use the Instagram post preview",
  steps: [
    {
      title: "Add your handle and photo",
      text: "Type a Display handle, then pick a JPG, PNG or WebP up to 10 MB with Local image or the Choose your image button in the mockup.",
      art: "visual",
    },
    {
      title: "Write the caption",
      text: "Type or paste your caption. The count shows characters out of 2,200, and the mockup shows the first lines with a \"… more\" button you can expand.",
      art: "writing",
    },
    {
      title: "Pick a shape and copy",
      text: "Switch Preview shape between Square · 1:1 and Portrait · 4:5 to see the crop, then press Copy caption and paste it into Instagram or your scheduler.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Catch crop and caption problems before your followers do",
  features: [
    {
      title: "Square vs portrait in one click",
      text: "See the same photo center-cropped to 1:1 and 4:5, so you know whether faces, products or text survive the frame.",
      art: "visual",
    },
    {
      title: "Your first lines, as the feed shows them",
      text: "The preview cuts the caption at about 125 characters or the second line break, whichever comes first, so you can tune your hook.",
      art: "writing",
    },
    {
      title: "Private by default",
      text: "Your image is shown from a local object URL and is never uploaded. Nothing is saved, and refreshing clears the preview.",
      art: "analytics",
    },
  ],
  guide: {
    title: "How to preview an Instagram post in 2026",
    intro:
      "Most posting mistakes are visible in a second once you see the post in a feed layout: a head cut off by the crop, a caption whose first line says nothing, or a hook buried under a blank line. This tool shows you those things before you publish.",
    sections: [
      {
        title: "What the post preview shows",
        body: (
          <>
            <p>
              The mockup combines four things: your <b>display handle</b> (with an initial as the avatar), your{" "}
              <b>image</b> center-cropped to the shape you pick, like, comment and share icons, and your <b>caption</b>{" "}
              starting with the handle in bold.
            </p>
            <p>
              The caption is folded the way the feed roughly does it: at about 125 characters, or earlier at the second
              line break. Both the crop and the fold are approximations; the real cut-off varies by device and app version,
              and Instagram lets you adjust the crop when you post. The tool also counts characters against the 2,200
              caption limit and warns you if you go over.
            </p>
          </>
        ),
      },
      {
        title: "Square or portrait: which shape to use",
        body: (
          <>
            <p>
              Feed posts are commonly prepared at 1080 × 1080 px for square (1:1) and 1080 × 1350 px for portrait (4:5).
              Portrait takes up more of the screen in the feed, so it is a common choice for photos with a clear subject.
            </p>
            <ul>
              <li>Keep faces and key text away from the top and bottom edges if you might switch shapes.</li>
              <li>Check how the image looks as a profile grid tile too; the grid crops differently from the feed.</li>
              <li>
                For exact pixel sizes per format, see the <Link href="/tools/instagram-image-size">image size guide</Link>.
              </li>
            </ul>
          </>
        ),
      },
      {
        title: "Example: where the sample caption folds",
        body: (
          <>
            <p>The tool starts with this 96-character caption:</p>
            <div className={t.example}>
              <p>A little behind the scenes ✨</p>
              <p>Good things start with a first draft. What are you creating today?</p>
            </div>
            <p>
              Even though it is short, the feed preview shows only <b>&ldquo;your.studio A little behind the scenes ✨&rdquo;</b>{" "}
              followed by &ldquo;… more&rdquo;, because the blank line counts as the second line break. If the question is
              the part that matters, move it to the first line.
            </p>
          </>
        ),
      },
      {
        title: "Common post preview mistakes",
        body: (
          <ul>
            <li>Writing a first line that only works after the reader taps &ldquo;more&rdquo;.</li>
            <li>Starting with a blank line or a row of emojis, which wastes the visible part of the caption.</li>
            <li>Checking only the square crop and then posting in portrait, or the other way round.</li>
            <li>
              Pasting the caption without checking hashtags and mentions. The{" "}
              <Link href="/tools/instagram-caption-counter">caption counter</Link> checks the 30-hashtag and 20-mention
              limits as well as length.
            </li>
            <li>
              Leaving the post to go out &ldquo;later&rdquo; manually. Use an{" "}
              <Link href="/instagram-scheduler">Instagram scheduler</Link> so the checked version is the one that goes
              live.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram post preview questions",
  faqs: [
    {
      q: "Are my images private?",
      a: "Yes. Images stay in this browser tab through local object URLs. This tool never uploads them or fetches your profile. Images and captions are not saved; refreshing clears the preview.",
    },
    {
      q: "How accurate is the Instagram preview?",
      a: "This is a feed mockup, not an official Instagram renderer. The centered crop and the caption fold at about 125 characters or the second line break are approximations; fonts, spacing and the fold vary by device and app version. Check the final post in Instagram.",
    },
    {
      q: "Which image files can I preview?",
      a: "JPG, PNG and WebP images up to 10 MB. If a file is another type or larger, the tool shows a message and keeps your current preview unchanged.",
    },
    {
      q: "Can I schedule or publish from this tool?",
      a: "No. This free tool previews a single image and copies captions. It does not publish, schedule or carry your image into signup. Copy your caption, then add it to a scheduled post in your Poskoo account.",
    },
    {
      q: "Can I preview a caption I wrote in the caption counter?",
      a: "Yes. When you send a caption from the Instagram caption counter, this page imports it once with emoji and line breaks intact, and shows a note that it was imported.",
    },
  ],
  related: [
    "/tools/instagram-caption-counter",
    "/tools/instagram-image-size",
    "/tools/instagram-carousel-size-checker",
    "/tools/instagram-safe-zone-checker",
    "/tools/threads-post-preview",
    "/tools/instagram-caption-formatter",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Feed mockup with your photo, handle and caption",
      "Square 1:1 and portrait 4:5 crop preview",
      "Approximate caption fold with expand",
      "2,200-character caption count",
      "Images stay in the browser, nothing uploaded",
    ],
  },
  cta: {
    title: "It looks right.",
    mark: "Now schedule it.",
    text: "Schedule the post with Poskoo and auto-DM your link to everyone who comments a keyword, on the official Meta API.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramPostPreviewPage() {
  return (
    <ToolPageTemplate config={config}>
      <PostPreviewTool />
    </ToolPageTemplate>
  );
}
