import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import ImageResizer from "./ImageResizer";

export const dynamic = "force-static";
export const revalidate = 600;

const config: ToolPageConfig = {
  path: "/tools/instagram-image-resizer",
  name: "Instagram image resizer",
  crumb: "Image resizer",
  title: "Instagram Image Resizer: Free 1080x1350 & 1080x1080",
  description:
    "Free Instagram image resizer: crop or fit a photo to 1080x1080, 1080x1350, 1080x1920 or 1080x566 in your browser and download an exact-size JPG.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "Instagram image resizer", after: "(1080x1080, 4:5, 9:16)" },
  lede: "Instagram posts are 1080 px wide: 1080x1080 for square, 1080x1350 for portrait (4:5) and 1080x1920 for Stories and Reels; this free resizer crops or pads your photo to any of them in your browser.",
  art: "visual",
  artLabel: "A creator resizes one photo into square, portrait, Story and landscape frames and downloads each JPG",
  heroPoints: ["Square, 4:5, 9:16 and 1.91:1", "Crop or fit with a background", "Exact-size JPG download"],
  toolTitle: "Resize your photo for Instagram",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to resize an image for Instagram",
  steps: [
    {
      title: "Load a photo",
      text: "Choose a JPG, PNG or WebP with Select a photo to resize. It is read locally in your browser with an object URL and never uploaded.",
      art: "visual",
    },
    {
      title: "Pick a preset and fit",
      text: "Choose Square 1080x1080, Portrait 4:5 1080x1350, Story / Reel 9:16 1080x1920 or Landscape 1080x566, then crop to fill or fit the photo on a background colour.",
      art: "writing",
    },
    {
      title: "Download the JPG",
      text: "Check the original and output dimensions, then press Download to save an exact-size JPG named after the preset. Use Clear to start another photo.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "The exact Instagram size, without an editor",
  features: [
    {
      title: "Four presets, one click",
      text: "Square, portrait 4:5, Story and Reel 9:16 and landscape 1.91:1, all at 1080 px wide, so you never guess the pixel size.",
      art: "visual",
    },
    {
      title: "Crop or fit",
      text: "Crop to fill keeps the centre of the photo and fills the whole frame, while Fit with background keeps the whole photo and pads it with a colour you pick.",
      art: "analytics",
    },
    {
      title: "Private by design",
      text: "The photo is drawn on a canvas in your browser and released when you clear it. No upload, no login and no Instagram connection.",
      art: "feat-calendar",
    },
  ],
  guide: {
    title: "A practical guide to resizing images for Instagram in 2026",
    intro:
      "Instagram shows every photo in a fixed frame, so the shape you upload decides what gets cropped. This resizer makes the frame for you, in your browser, at the exact pixels Instagram uses. Here is which size to pick and how to keep the photo looking sharp.",
    sections: [
      {
        title: "What this Instagram image resizer does",
        body: (
          <>
            <p>
              The resizer takes one photo and redraws it on a canvas at <b>1080x1080</b>, <b>1080x1350</b>,{" "}
              <b>1080x1920</b> or <b>1080x566</b>. In Crop to fill mode it keeps the centre of the photo and trims the
              edges that do not fit. In Fit with background mode it keeps the whole photo and pads the empty space with
              the colour you choose.
            </p>
            <p>
              The preview is a scaled view of the real output, and the Download button saves a JPG at exactly the preset
              size. Everything runs on your device, so the photo is never sent to a server.
            </p>
          </>
        ),
      },
      {
        title: "Which Instagram size should you choose?",
        body: (
          <>
            <ul>
              <li>
                <b>1080x1080 (1:1 square)</b> is safe everywhere and works well for quotes, product tiles and
                grid-friendly posts.
              </li>
              <li>
                <b>1080x1350 (4:5 portrait)</b> takes the most height in the feed, so it is the best default for photos.
              </li>
              <li>
                <b>1080x1920 (9:16)</b> is the full-screen frame for Stories and Reels.
              </li>
              <li>
                <b>1080x566 (1.91:1 landscape)</b> is the widest feed shape and suits wide group shots.
              </li>
            </ul>
            <p>
              Whichever you pick, start from a photo at least 1080 px wide. Smaller photos are upscaled, and the resizer
              warns you when that happens.
            </p>
          </>
        ),
      },
      {
        title: "Crop to fill or fit with background?",
        body: (
          <>
            <p>
              Crop to fill is the usual choice for photos: nothing is padded, the frame is full, and only the edges are
              trimmed. Keep faces and text near the centre so the crop does not cut them.
            </p>
            <p>
              Fit with background is better for logos, screenshots and designs where every part matters. The whole image
              stays visible and the leftover space takes your chosen colour, so match it to the post background or use
              white for a clean product shot.
            </p>
          </>
        ),
      },
      {
        title: "Check the size before you post",
        body: (
          <>
            <p>
              Compare every format in the <Link href="/tools/instagram-image-size">Instagram image size guide</Link>, or
              turn one photo into profile tiles with the{" "}
              <Link href="/tools/instagram-grid-maker">Instagram grid maker</Link>. When the image is ready, plan the
              post on your calendar and keep the caption and crop together.
            </p>
            <p>
              Need a hand planning? <Link href="/signup">Create a free Poskoo account</Link> to schedule the post and DM
              everyone who comments your keyword.
            </p>
          </>
        ),
      },
    ],
  },
  faqTitle: "Instagram image resizer questions",
  faqs: [
    {
      q: "What is the best size for an Instagram post?",
      a: "Use 1080x1350 px (4:5 portrait) for most feed photos, because it fills more of the screen. Use 1080x1080 (1:1) for square posts and 1080x1920 (9:16) for Stories and Reels.",
    },
    {
      q: "Does Instagram crop 4:5 photos?",
      a: "No. Instagram shows 4:5 photos at their full 1080x1350 frame in the feed. Taller photos, such as 9:16, are cropped in the feed, so resize long images to 4:5 if the whole photo must stay visible.",
    },
    {
      q: "How do I post a landscape photo without cropping it?",
      a: "Resize it to 1080x566 (1.91:1), the widest shape the feed shows. If the photo is even wider, use Fit with background to keep the whole image and fill the sides with a colour instead of cutting it off.",
    },
    {
      q: "Is my photo uploaded when I use this resizer?",
      a: "No. The photo is opened with a local object URL, drawn on a canvas in your browser and released when you clear it or close the tab. Nothing is sent to a server and no login is needed.",
    },
    {
      q: "What happens if my photo is smaller than 1080 px?",
      a: "The resizer still makes the preset size, but the photo is stretched to 1080 px wide and may look soft. A plain warning appears above the preview so you know before you download.",
    },
  ],
  related: [
    "/tools/instagram-image-size",
    "/tools/instagram-grid-maker",
    "/tools/instagram-story-size-checker",
    "/tools/instagram-post-preview",
    "/tools/social-media-image-sizes",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Resize to 1080x1080, 1080x1350, 1080x1920 and 1080x566",
      "Crop to fill or fit with a custom background colour",
      "Live preview with original and output dimensions",
      "Exact-size JPG download at quality 0.92",
      "Accepts JPG, PNG and WebP",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Your photo is the right size.",
    mark: "Schedule the post.",
    text: "Plan your Instagram posts with Poskoo and publish them automatically.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramImageResizerPage() {
  return (
    <ToolPageTemplate config={config}>
      <ImageResizer />
    </ToolPageTemplate>
  );
}
