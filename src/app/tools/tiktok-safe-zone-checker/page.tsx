import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import { FRAME_H, FRAME_W, SAFE_ZONES, toPixels } from "@/lib/safeZones";
import SafeZoneChecker from "../instagram-safe-zone-checker/SafeZoneChecker";

const px = (id: string) => {
  const zone = SAFE_ZONES.tiktok.find((z) => z.id === id);
  return zone ? toPixels(zone) : { x: 0, y: 0, w: 0, h: 0 };
};
const tiktokTop = px("top");
const tiktokBottom = px("bottom");
const tiktokRight = px("right");
const tiktokSafeW = FRAME_W - tiktokRight.w;
const tiktokSafeH = FRAME_H - tiktokTop.h - tiktokBottom.h;

const zoneRows = [
  { zone: "Following / For You tabs", size: `Top ~${tiktokTop.h} px`, covers: "The Following and For You tabs and the search icon along the top of the feed." },
  { zone: "Caption, username & sound", size: `Bottom ~${tiktokBottom.h} px`, covers: "The username, caption, hashtags, music label and the progress bar. Longer captions push this higher." },
  { zone: "Like/comment/save/share buttons", size: `Right ~${tiktokRight.w} px`, covers: "The column of like, comment, save and share buttons plus the spinning record down the right edge." },
];

const config: ToolPageConfig = {
  path: "/tools/tiktok-safe-zone-checker",
  name: "TikTok safe zone checker",
  crumb: "Safe zone checker",
  title: "TikTok Safe Zone Checker: Free 1080×1920 PNG Template",
  description:
    "Free TikTok safe zone checker: load a video frame to see what the caption, sound label and buttons cover, then download a 1080×1920 safe zone template.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "TikTok safe zone checker", after: "for 1080×1920 videos" },
  lede: `On a 1080×1920 TikTok video, keep text and faces out of roughly the top ${tiktokTop.h} px, bottom ${tiktokBottom.h} px and right ${tiktokRight.w} px. Load a frame to check your layout, then download a free template.`,
  art: "visual",
  artLabel: "A creator measures a vertical video frame with a ruler next to a phone showing the TikTok interface",
  heroPoints: ["TikTok zones", "Image or video", "Free 1080×1920 template"],
  toolTitle: "Check your TikTok video layout",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to check TikTok safe zones",
  steps: [
    {
      title: "Load an image or video",
      text: "Use Load an image or video to open a 9:16 cover or video frame. It is opened locally and never uploaded.",
      art: "visual",
    },
    {
      title: "See what TikTok covers",
      text: "The shaded areas show the top tabs, the caption and sound block at the bottom, and the action buttons on the right. Adjust the overlay opacity or grid to check your layout.",
      art: "analytics",
    },
    {
      title: "Fix it or grab the template",
      text: "Move anything inside a shaded area in your editor and check again, or press Download blank safe-zone template to design inside the clear area next time.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "See what TikTok covers before you post",
  features: [
    {
      title: "The real TikTok layout",
      text: "The top tabs, caption, sound label and the like, comment, save and share buttons are shaded where they usually sit, so you see the real clash.",
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
    title: "A practical guide to TikTok safe zones in 2026",
    intro:
      "TikTok fills the whole screen, and the app draws its own interface on top: the top tabs, the caption and sound block, and the action buttons down the right. A safe zone is the area that stays clear. Here is what each zone hides and how to design around it.",
    sections: [
      {
        title: "What this safe zone checker does",
        body: (
          <>
            <p>
              The checker places your image or video in a 9:16 phone frame and shades the areas TikTok&apos;s interface
              usually covers. The zones are stored as percentages of a 1080×1920 frame, and the list under the controls
              converts each one to pixels.
            </p>
            <p>
              The zones are approximate guides. TikTok&apos;s layout changes with the device, screen shape, app version
              and caption length, so leave a little extra margin. Your file is opened with a local object URL; nothing is
              uploaded.
            </p>
          </>
        ),
      },
      {
        title: "What TikTok's interface covers (1080×1920)",
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
        title: "How to use the TikTok safe zone checker",
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
        title: "Best practices for TikTok layouts",
        body: (
          <ul>
            <li>
              <b>Put text in the upper middle.</b> The lower quarter is busy with the caption and sound, so on-screen
              titles read best a little above centre.
            </li>
            <li>
              <b>Keep faces off the right edge.</b> The action buttons run down the right side of a TikTok video.
            </li>
            <li>
              <b>Leave room for long captions.</b> A long caption pushes the text block higher, so keep the bottom third
              clear.
            </li>
            <li>
              <b>Start at the right size.</b> Export at 1080×1920, then plan the post with the{" "}
              <Link href="/tiktok-scheduler">TikTok scheduler</Link>.
            </li>
          </ul>
        ),
      },
      {
        title: "TikTok vs Instagram Reels",
        body: (
          <p>
            TikTok and Instagram Reels both use a 9:16 frame, but the interface sits in different places. Use the{" "}
            <Link href="/tools/instagram-safe-zone-checker">Instagram safe zone checker</Link> for Reels and Stories,
            and this page for TikTok. To plan posts, see how to{" "}
            <Link href="/help/schedule-tiktok-posts">schedule TikTok posts</Link>.
          </p>
        ),
      },
      {
        title: "Example: the clear area on a TikTok video",
        body: (
          <>
            <p>Take the TikTok zones away from a 1080×1920 frame and this is what is left:</p>
            <div className={t.example}>
              <p>
                Clear area: about {tiktokSafeW}×{tiktokSafeH} px, starting {tiktokTop.h} px from the top and ending{" "}
                {tiktokRight.w} px from the right edge
              </p>
            </div>
            <p>
              A headline and a face both fit comfortably in the clear area. A price tag in the bottom corner, where many
              templates put it, sits under the caption.
            </p>
          </>
        ),
      },
    ],
  },
  faqTitle: "TikTok safe zone questions",
  faqs: [
    {
      q: "What is the TikTok safe zone?",
      a: `On a 1080×1920 TikTok video, keep important text and faces out of roughly the top ${tiktokTop.h} px, the bottom ${tiktokBottom.h} px and the right ${tiktokRight.w} px. That leaves a central area the tabs, caption, sound label and action buttons do not cover.`,
    },
    {
      q: "What size is a TikTok video?",
      a: "A standard TikTok video is 1080×1920 pixels, a 9:16 vertical frame. Export at that size so the app does not crop or letterbox your video.",
    },
    {
      q: "Does the safe zone change with long captions?",
      a: "Yes. A long caption pushes the text block higher up the screen, so the bottom safe zone grows. Keep the bottom third clear and leave extra margin when your caption is long.",
    },
    {
      q: "Is this the same as Instagram Reels?",
      a: "No. TikTok and Instagram Reels both use a 9:16 frame, but the interface sits in different places. Use the Instagram safe zone checker for Reels and Stories.",
    },
  ],
  related: [
    "/tools/tiktok-engagement-rate-calculator",
    "/tools/tiktok-caption-generator",
    "/tools/tiktok-hashtag-generator",
    "/tools/best-time-to-post-on-tiktok",
    "/tools/instagram-safe-zone-checker",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "TikTok safe zone overlays",
      "Top tabs, caption and action button zones",
      "Works with images and video",
      "Adjustable overlay opacity and rule-of-thirds grid",
      "Free 1080×1920 PNG template",
    ],
  },
  cta: {
    title: "Your TikTok video is clear of the interface.",
    mark: "Schedule it.",
    text: "Plan your TikTok videos with Poskoo, and DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function TikTokSafeZoneCheckerPage() {
  return (
    <ToolPageTemplate config={config}>
      <SafeZoneChecker modes={[{ id: "tiktok", label: "TikTok" }]} />
    </ToolPageTemplate>
  );
}
