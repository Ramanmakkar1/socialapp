import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import { IG_FORMATS, STORY_SAFE_ZONE_PX } from "@/lib/igSizes";
import CropPreview from "./CropPreview";

const ratioLabel = (w: number, h: number) => {
  if (w === h) return "1:1";
  if (w === 1080 && h === 1350) return "4:5";
  if (w === 1080 && h === 1440) return "3:4";
  if (w === 1080 && h === 566) return "1.91:1";
  if (w === 1080 && h === 1920) return "9:16";
  return `${w}:${h}`;
};

const BEST_FOR: Record<string, string> = {
  "feed-square": "Grid-friendly posts, quotes, product tiles",
  "feed-portrait": "Most photos and product shots",
  "feed-tall": "Maximum height in the feed and the newer grid",
  landscape: "Wide group shots and banners",
  "story-reel": "Stories, Reels and Reel covers",
  profile: "Profile photo, shown as a circle",
  carousel: "Every slide matches the first slide's ratio",
};

const sizesTable = (
  <section className={t.section} aria-labelledby="sizes-title">
    <div className="head">
      <p className="eyebrow">Sizes</p>
      <h2 id="sizes-title">Instagram image sizes at a glance (2026)</h2>
    </div>
    <div className={t.tableWrap}>
      <table className={t.table}>
        <thead>
          <tr>
            <th scope="col">Format</th>
            <th scope="col">Pixels</th>
            <th scope="col">Ratio</th>
            <th scope="col">Best for</th>
          </tr>
        </thead>
        <tbody>
          {IG_FORMATS.map((f) => (
            <tr key={f.id}>
              <th scope="row">{f.label}</th>
              <td>{f.infoOnly ? "Same as first slide" : `${f.width}×${f.height}`}</td>
              <td>{f.infoOnly ? "Same as first slide" : ratioLabel(f.width, f.height)}</td>
              <td>{BEST_FOR[f.id]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const config: ToolPageConfig = {
  path: "/tools/instagram-image-size",
  name: "Instagram image size guide and crop tool",
  crumb: "Image size guide",
  title: "Instagram Image Sizes (2026): Post, Story, Reel & Carousel",
  description:
    "Instagram image sizes for 2026: feed, Story, Reel, profile and carousel pixels in one table, plus a free tool to crop your photo and download an exact JPG.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "Instagram image sizes", after: "(2026): post, Story, Reel & carousel" },
  lede: "Pixel dimensions for every main Instagram format, plus a live crop preview. Reposition your photo, then download a JPG at the exact size.",
  art: "visual",
  artLabel: "A creator measures a photo frame with a ruler next to phone screens of different shapes",
  heroPoints: ["7 formats in one table", "Exact-size JPG download", "Runs in your browser"],
  toolTitle: "Crop your photo to an Instagram size",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to crop a photo to an Instagram size",
  steps: [
    {
      title: "Upload a photo",
      text: "Use Upload a photo to open an image from your device. It is drawn on a canvas in your browser and never sent to a server.",
      art: "visual",
    },
    {
      title: "Pick a format and reposition",
      text: "Choose square, portrait, tall portrait, landscape, Story / Reel cover or profile photo. Move the Horizontal and Vertical sliders to frame the subject, or press Center crop.",
      art: "writing",
    },
    {
      title: "Download the JPG",
      text: "Press Download to save a JPG at the exact pixel size shown under Output size, then add it to your post or schedule it.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "The right size before you post",
  features: [
    {
      title: "Every size in one place",
      text: "Feed square, 4:5 portrait, 3:4 tall, landscape, 9:16 Story and Reel, profile photo and the carousel rule, side by side.",
      art: "visual",
    },
    {
      title: "Crop exactly what you want",
      text: "Sliders move the crop window across your photo, and the preview and the downloaded JPG always match.",
      art: "feat-ai",
    },
    {
      title: "Safe zones on 9:16",
      text: `The Story / Reel crop shades the top and bottom ${STORY_SAFE_ZONE_PX} px so you can see where Instagram's interface sits.`,
      art: "analytics",
    },
  ],
  guide: {
    title: "A practical guide to Instagram image sizes in 2026",
    intro:
      "Instagram accepts many shapes, but it displays each one in a fixed frame. Uploading at the right ratio and width means nothing important gets cropped and your image stays sharp. Here is how the crop tool works and which size to pick.",
    sections: [
      {
        title: "What this tool does",
        body: (
          <>
            <p>
              The crop tool takes one photo and cuts the largest possible area that matches the format you choose. It
              then scales that area to the exact output size, for example <b>1080×1350</b> for a 4:5 portrait post, and
              saves it as a JPG named after the format.
            </p>
            <p>
              The sliders only move the crop window; they do not zoom. Everything happens on a canvas in your browser,
              so the photo is not uploaded. The profile photo option previews a circle, and the Story / Reel option
              shades the top and bottom areas where Instagram&apos;s interface usually sits.
            </p>
          </>
        ),
      },
      {
        title: "Which size to choose in 2026",
        body: (
          <>
            <ul>
              <li>
                <b>4:5 portrait (1080×1350)</b> is a strong default for feed photos. It takes more height in the feed
                than a square, so people see more of the image as they scroll.
              </li>
              <li>
                <b>3:4 tall portrait (1080×1440)</b> matches the taller tiles Instagram now uses on profile grids. Use it
                when you want the most vertical space in a feed post.
              </li>
              <li>
                <b>1:1 square (1080×1080)</b> still works everywhere and is simple to design for, but uses less screen
                space than portrait.
              </li>
              <li>
                <b>1.91:1 landscape (1080×566)</b> is the widest feed shape. It suits wide group photos, but it looks
                small on a phone.
              </li>
              <li>
                <b>9:16 (1080×1920)</b> is the full-screen frame for Stories and Reels.
              </li>
            </ul>
            <p>
              Export at 1080 px wide. Instagram scales larger files down, and smaller files can look soft once they are
              stretched to fill the screen.
            </p>
          </>
        ),
      },
      {
        title: "Stories, Reels and the carousel rule",
        body: (
          <>
            <p>
              Stories and Reels publish at 1080×1920. If you add a square or landscape photo, Instagram crops it or adds
              bars, so crop it yourself and keep faces in frame. Usernames, captions, music labels and reply buttons
              cover roughly the top and bottom {STORY_SAFE_ZONE_PX} px; the{" "}
              <Link href="/tools/instagram-safe-zone-checker">safe zone checker</Link> shows those areas in more detail.
            </p>
            <p>
              In a carousel, the first slide sets the frame for the whole post. Plan every slide at one ratio, for
              example all 4:5 at 1080×1350, and confirm the files with the{" "}
              <Link href="/tools/instagram-carousel-size-checker">carousel size checker</Link> before you upload.
            </p>
          </>
        ),
      },
      {
        title: "Example: a landscape photo cropped to 4:5",
        body: (
          <>
            <p>
              Say you have a 4000×3000 camera photo (4:3) and want a portrait feed post. With{" "}
              <b>Feed post (portrait)</b> selected and the sliders centred, the tool keeps the full height and takes the
              middle 2400×3000 area, trimming 800 px from each side. Drag the Horizontal slider to the left or right to
              keep a subject that sits off-centre.
            </p>
            <div className={t.example}>
              <p>Output size: 1080×1350 px</p>
              <p>File: instagram-feed-portrait-1080x1350.jpg</p>
            </div>
            <p>
              The same photo as a Story / Reel cover keeps a much narrower strip (about 1688×3000), so check that the
              subject still fits before you download.
            </p>
          </>
        ),
      },
      {
        title: "Common image size mistakes",
        body: (
          <>
            <ul>
              <li>Uploading a landscape photo as a Story and letting Instagram decide the crop.</li>
              <li>Mixing square and portrait slides in one carousel.</li>
              <li>Exporting below 1080 px wide, which can look soft on modern phones.</li>
              <li>Placing text or logos at the very top or bottom of a 9:16 frame, where the interface covers them.</li>
              <li>
                Putting a face near the edge of a profile photo, where the circle cuts it off. When the image is ready,
                plan the post with the <Link href="/instagram-scheduler">Instagram scheduler</Link>.
              </li>
            </ul>
            <p>
              Posting to other networks too? See the <Link href="/tools/social-media-image-sizes">image sizes for every social platform</Link>.
            </p>
            <p>
              Before you upload, test the photo with the <Link href="/tools/instagram-profile-picture-size-checker">Instagram profile picture size checker</Link> to see the square frame and circle crop.
            </p>
          </>
        ),
      },
    ],
  },
  faqTitle: "Instagram image size questions",
  faqs: [
    {
      q: "What size should Instagram feed photos be in 2026?",
      a: "Use 1080 px wide: 1080×1080 for square (1:1), 1080×1350 for portrait (4:5), 1080×1440 for tall portrait (3:4) or 1080×566 for landscape (about 1.91:1). Instagram scales larger uploads down, and smaller files may look soft.",
    },
    {
      q: "Is 4:5 or 3:4 better than square on Instagram?",
      a: "Portrait and tall portrait posts take more vertical space in the feed than square, so more of the image is visible as people scroll. Square still works everywhere. Pick one ratio per carousel and keep every slide the same.",
    },
    {
      q: "What size are Instagram Stories and Reels?",
      a: "Stories and Reels use 1080×1920 pixels (9:16). Keep important text and logos out of roughly the top and bottom 250 px, where the profile bar, captions and buttons sit.",
    },
    {
      q: "What aspect ratio must carousel slides use?",
      a: "Plan every slide at the same aspect ratio as the first slide. If slide one is 4:5, make the rest 4:5 too, so nothing is cropped or padded as people swipe.",
    },
    {
      q: "What size is an Instagram profile picture?",
      a: "Profile photos are shown as a small circle. Upload a square image of at least 320×320 pixels and keep faces and logos centred so the circular crop does not cut them off.",
    },
    {
      q: "Is my photo uploaded when I use the crop tool?",
      a: "No. The photo is opened and cropped on a canvas in your browser, and the JPG is saved straight to your device. Nothing is sent to a server and no login is needed.",
    },
  ],
  related: [
    "/tools/instagram-carousel-size-checker",
    "/tools/instagram-story-size-checker",
    "/tools/instagram-safe-zone-checker",
    "/tools/instagram-carousel-splitter",
    "/tools/instagram-post-preview",
    "/tools/instagram-reel-cover-maker",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Instagram size table for feed, Story, Reel, profile and carousel",
      "Crop preview for 1:1, 4:5, 3:4, 1.91:1, 9:16 and profile circle",
      "Horizontal and vertical crop position sliders",
      "Exact-size JPG download",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Your image is the right size.",
    mark: "Now schedule it.",
    text: "Plan the post on your calendar with Poskoo, and DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramImageSizePage() {
  return (
    <ToolPageTemplate config={config} afterTool={sizesTable}>
      <CropPreview />
    </ToolPageTemplate>
  );
}
