import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import { FRAME_H, FRAME_W, SAFE_ZONES, toPixels } from "@/lib/safeZones";
import SafeZoneChecker from "../instagram-safe-zone-checker/SafeZoneChecker";

const px = (id: string) => {
  const zone = SAFE_ZONES.shorts.find((z) => z.id === id);
  return zone ? toPixels(zone) : { x: 0, y: 0, w: 0, h: 0 };
};
const shortsTop = px("top");
const shortsBottom = px("bottom");
const shortsRight = px("right");
const shortsSafeW = FRAME_W - shortsRight.w;
const shortsSafeH = FRAME_H - shortsTop.h - shortsBottom.h;

const zoneRows = [
  { zone: "Search & menu icons", size: `Top ~${shortsTop.h} px`, covers: "The search and menu icons along the top of the Shorts player." },
  { zone: "Title, channel & subscribe", size: `Bottom ~${shortsBottom.h} px`, covers: "The video title, channel name, subscribe button and description at the bottom. Longer titles push this higher." },
  { zone: "Like/dislike/comment/share/remix buttons", size: `Right ~${shortsRight.w} px`, covers: "The column of like, dislike, comment, share and remix buttons down the right edge." },
];

const config: ToolPageConfig = {
  path: "/tools/youtube-shorts-safe-zone-checker",
  name: "YouTube Shorts safe zone checker",
  crumb: "Safe zone checker",
  title: "YouTube Shorts Safe Zone Checker: Free 1080×1920 Template",
  description:
    "Free YouTube Shorts safe zone checker: load a frame to see what the title, channel name and buttons cover, then download a 1080×1920 template.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "YouTube Shorts safe zone checker", after: "for 1080×1920 videos" },
  lede: `On a 1080×1920 YouTube Short, keep text and faces out of roughly the top ${shortsTop.h} px, bottom ${shortsBottom.h} px and right ${shortsRight.w} px. Load a frame to check your layout, then download a free template.`,
  art: "visual",
  artLabel: "A creator measures a vertical video frame with a ruler next to a phone showing the YouTube Shorts interface",
  heroPoints: ["Shorts zones", "Image or video", "Free 1080×1920 template"],
  toolTitle: "Check your YouTube Short layout",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to check YouTube Shorts safe zones",
  steps: [
    {
      title: "Load an image or video",
      text: "Use Load an image or video to open a 9:16 cover or video frame. It is opened locally and never uploaded.",
      art: "visual",
    },
    {
      title: "See what Shorts covers",
      text: "The shaded areas show the top icons, the title and channel block at the bottom, and the action buttons on the right. Adjust the overlay opacity or grid to check your layout.",
      art: "analytics",
    },
    {
      title: "Fix it or grab the template",
      text: "Move anything inside a shaded area in your editor and check again, or press Download blank safe-zone template to design inside the clear area next time.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "See what YouTube Shorts covers before you post",
  features: [
    {
      title: "The real Shorts layout",
      text: "The top icons, title, channel name, subscribe button and the like, comment, share and remix buttons are shaded where they usually sit, so you see the real clash.",
      art: "visual",
    },
    {
      title: "Works with video too",
      text: "Load a video file and the checker shows an early frame inside the 9:16 phone preview.",
      art: "feat-ai",
    },
    {
      title: "A template for your editor",
      text: "Download a 1080×1920 PNG of the zones, with an optional rule-of-thirds grid, to use as a layer in Canva, Figma or CapCut.",
      art: "writing",
    },
  ],
  guide: {
    title: "A practical guide to YouTube Shorts safe zones in 2026",
    intro:
      "YouTube Shorts fills the whole screen, and the app draws its own interface on top: the search and menu icons, the title and channel block, and the action buttons down the right. A safe zone is the area that stays clear. Here is what each zone hides and how to design around it.",
    sections: [
      {
        title: "What this safe zone checker does",
        body: (
          <>
            <p>
              The checker places your image or video in a 9:16 phone frame and shades the areas YouTube Shorts&apos;
              interface usually covers. The zones are stored as percentages of a 1080×1920 frame, and the list under the
              controls converts each one to pixels.
            </p>
            <p>
              The zones are approximate guides. YouTube&apos;s layout changes with the device, screen shape, app version
              and title length, so leave a little extra margin. Your file is opened with a local object URL; nothing is
              uploaded.
            </p>
          </>
        ),
      },
      {
        title: "What the Shorts interface covers (1080×1920)",
        body: (
          <div className={t.tableWrap}>
            <table className={t.table}>
              <thead>
                <tr>
                  <th scope="col">Zone</th>
                  <th scope="col">Size</th>
                  <th scope="col">What sits there</th>
                </tr>
              </thead>
              <tbody>
                {zoneRows.map((r) => (
                  <tr key={r.zone}>
                    <th scope="row">{r.zone}</th>
                    <td>{r.size}</td>
                    <td>{r.covers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      },
      {
        title: "How to use the YouTube Shorts safe zone checker",
        body: (
          <ol>
            <li>Load a 9:16 cover or video frame with Load an image or video. It stays in your browser.</li>
            <li>Check the shaded zones against your text, faces and logos, and adjust the overlay opacity or grid.</li>
            <li>Move anything inside a shaded area in your editor, then load the frame again to confirm.</li>
            <li>Download the blank 1080×1920 template and design inside the clear area next time.</li>
          </ol>
        ),
      },
      {
        title: "Best practices for Shorts layouts",
        body: (
          <ul>
            <li>
              <b>Put text in the upper middle.</b> The lower quarter is busy with the title and channel block, so
              on-screen titles read best a little above centre.
            </li>
            <li>
              <b>Keep faces off the right edge.</b> The action buttons run down the right side of a Short.
            </li>
            <li>
              <b>Leave room for long titles.</b> A long title pushes the text block higher, so keep the bottom third
              clear.
            </li>
            <li>
              <b>Start at the right size.</b> Export at 1080×1920, then plan the post with the{" "}
              <Link href="/youtube-scheduler">YouTube scheduler</Link>.
            </li>
          </ul>
        ),
      },
      {
        title: "Shorts vs TikTok and Instagram Reels",
        body: (
          <p>
            Shorts, TikTok and Instagram Reels all use a 9:16 frame, but the interface sits in different places. Use the{" "}
            <Link href="/tools/tiktok-safe-zone-checker">TikTok safe zone checker</Link> for TikTok and the{" "}
            <Link href="/tools/instagram-safe-zone-checker">Instagram safe zone checker</Link> for Reels and Stories.
            To plan posts, see how to{" "}
            <Link href="/help/schedule-youtube-videos">schedule YouTube videos</Link>.
          </p>
        ),
      },
      {
        title: "Example: the clear area on a YouTube Short",
        body: (
          <>
            <p>Take the Shorts zones away from a 1080×1920 frame and this is what is left:</p>
            <div className={t.example}>
              <p>
                Clear area: about {shortsSafeW}×{shortsSafeH} px, starting {shortsTop.h} px from the top and ending{" "}
                {shortsRight.w} px from the right edge
              </p>
            </div>
            <p>
              A headline and a face both fit comfortably in the clear area. A price tag in the bottom corner, where many
              templates put it, sits under the title and channel block.
            </p>
          </>
        ),
      },
    ],
  },
  faqTitle: "YouTube Shorts safe zone questions",
  faqs: [
    {
      q: "What is the YouTube Shorts safe zone?",
      a: `On a 1080×1920 Short, keep important text and faces out of roughly the top ${shortsTop.h} px, the bottom ${shortsBottom.h} px and the right ${shortsRight.w} px. That leaves a central area the icons, title, channel block and action buttons do not cover.`,
    },
    {
      q: "What size is a YouTube Short?",
      a: "A standard YouTube Short is 1080×1920 pixels, a 9:16 vertical frame. Export at that size so the app does not crop or letterbox your video.",
    },
    {
      q: "Is the Shorts safe zone the same as TikTok?",
      a: "No. Shorts, TikTok and Instagram Reels all use a 9:16 frame, but the interface sits in different places. Use the TikTok safe zone checker for TikTok and the Instagram safe zone checker for Reels and Stories.",
    },
    {
      q: "Does the safe zone change with long titles?",
      a: "Yes. A long title pushes the text block higher up the screen, so the bottom safe zone grows. Keep the bottom third clear and leave extra margin when your title is long.",
    },
  ],
  related: [
    "/tools/youtube-shorts-size-checker",
    "/tools/youtube-engagement-rate-calculator",
    "/tools/youtube-thumbnail-size-checker",
    "/tools/tiktok-safe-zone-checker",
    "/tools/instagram-safe-zone-checker",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "YouTube Shorts safe zone overlays",
      "Top icons, title and action button zones",
      "Works with images and video",
      "Adjustable overlay opacity and rule-of-thirds grid",
      "Free 1080×1920 PNG template",
    ],
  },
  cta: {
    title: "Your YouTube Short is clear of the interface.",
    mark: "Schedule it.",
    text: "Plan your Shorts and long videos with Poskoo, and DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function YouTubeShortsSafeZoneCheckerPage() {
  return (
    <ToolPageTemplate config={config}>
      <SafeZoneChecker modes={[{ id: "shorts", label: "Shorts" }]} />
    </ToolPageTemplate>
  );
}
