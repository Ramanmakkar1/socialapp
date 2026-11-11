import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import { FRAME_H, FRAME_W, SAFE_ZONES, toPixels } from "@/lib/safeZones";
import SafeZoneChecker from "./SafeZoneChecker";

const px = (mode: "reels" | "story", id: string) => {
  const zone = SAFE_ZONES[mode].find((z) => z.id === id);
  return zone ? toPixels(zone) : { x: 0, y: 0, w: 0, h: 0 };
};
const reelsTop = px("reels", "top");
const reelsBottom = px("reels", "bottom");
const reelsRight = px("reels", "right");
const storyTop = px("story", "top");
const storyBottom = px("story", "bottom");
const reelsSafeW = FRAME_W - reelsRight.w;
const reelsSafeH = FRAME_H - reelsTop.h - reelsBottom.h;

const zoneRows = [
  { zone: "Reels: header and camera", size: `Top ~${reelsTop.h} px`, covers: "The Reels title and camera icon, close to the phone's status bar." },
  { zone: "Reels: caption and audio", size: `Bottom ~${reelsBottom.h} px`, covers: "Username, follow button, caption preview, tagged people and the audio label. Longer captions push this higher." },
  { zone: "Reels: action buttons", size: `Right ~${reelsRight.w} px`, covers: "The column of like, comment, share and save buttons down the right edge." },
  { zone: "Story: profile and progress bar", size: `Top ~${storyTop.h} px`, covers: "Progress segments, profile photo, name and the close button." },
  { zone: "Story: reply bar", size: `Bottom ~${storyBottom.h} px`, covers: "The Send message field plus like and share icons." },
];

const config: ToolPageConfig = {
  path: "/tools/instagram-safe-zone-checker",
  name: "Instagram Reels and Story safe zone checker",
  crumb: "Safe zone checker",
  title: "Instagram Safe Zone Checker: Reels & Story (Free Template)",
  description:
    "Free Instagram Reels and Story safe zone checker: load a frame to see what captions and buttons cover, then download a 1080×1920 PNG template.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "Instagram safe zone checker", after: "for Reels & Stories" },
  lede: `On a 1080×1920 Reel, keep text and faces out of roughly the top ${reelsTop.h} px, bottom ${reelsBottom.h} px and right ${reelsRight.w} px. Load a frame to check your layout, then download a free template.`,
  art: "visual",
  artLabel: "A creator measures a photo frame with a ruler next to phone screens of different shapes",
  heroPoints: ["Reels and Story zones", "Image or video", "Free 1080×1920 template"],
  toolTitle: "Check your Reel or Story layout",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to check Instagram safe zones",
  steps: [
    {
      title: "Load an image or video",
      text: "Use Load an image or video to open a 9:16 cover, Story or video frame. It is opened locally and never uploaded.",
      art: "visual",
    },
    {
      title: "Pick Reels or Story",
      text: "Choose the Format to see the shaded areas for that view. For Reels, toggle Show Reel interface to preview the caption and buttons, and adjust the overlay opacity or grid.",
      art: "analytics",
    },
    {
      title: "Fix it or grab the template",
      text: "Move anything inside a shaded area in your editor and check again, or press Download blank safe-zone template to design inside the clear area next time.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "See what Instagram covers before you post",
  features: [
    {
      title: "A realistic Reel overlay",
      text: "A sample username, caption, audio label and like, comment, share and save buttons sit over your frame, so you see the real clash.",
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
    title: "A practical guide to Instagram safe zones in 2026",
    intro:
      "Reels and Stories fill the whole screen, and Instagram draws its own interface on top: captions, buttons, the profile bar and the reply field. A safe zone is the area that stays clear. Here is what each zone hides and how to design around it.",
    sections: [
      {
        title: "What this safe zone checker does",
        body: (
          <>
            <p>
              The checker places your image or video in a 9:16 phone frame and shades the areas Instagram&apos;s
              interface usually covers. The zones are stored as percentages of a 1080×1920 frame, and the list under the
              controls converts each one to pixels.
            </p>
            <p>
              The zones are approximate guides. Instagram&apos;s layout changes with the device, screen shape, app version
              and caption length, so leave a little extra margin. Your file is opened with a local object URL; nothing is
              uploaded.
            </p>
          </>
        ),
      },
      {
        title: "What each zone hides (1080×1920)",
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
        title: "Best practices for Reels and Story layouts",
        body: (
          <ul>
            <li>
              <b>Put text in the upper middle.</b> On Reels the lower third is busy with the caption, so on-screen titles
              read best a little above centre.
            </li>
            <li>
              <b>Keep faces off the right edge.</b> The action buttons run down the right side of a Reel.
            </li>
            <li>
              <b>Design the cover for both views.</b> A Reel cover is also shown cropped on your profile grid, so check it
              with the <Link href="/tools/instagram-reel-cover-maker">Reel cover maker</Link>.
            </li>
            <li>
              <b>Start at the right size.</b> Export at 1080×1920; the{" "}
              <Link href="/tools/instagram-story-size-checker">Story size checker</Link> confirms the file.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: the clear area on a Reel",
        body: (
          <>
            <p>Take the Reels zones away from a 1080×1920 frame and this is what is left:</p>
            <div className={t.example}>
              <p>
                Clear area: about {reelsSafeW}×{reelsSafeH} px, starting {reelsTop.h} px from the top and ending{" "}
                {reelsRight.w} px from the right edge
              </p>
              <p>
                Story clear area: about {FRAME_W}×{FRAME_H - storyTop.h - storyBottom.h} px between the top {storyTop.h} px
                and bottom {storyBottom.h} px
              </p>
            </div>
            <p>
              A headline and a face both fit comfortably in the Reel&apos;s clear area. A price tag in the bottom corner,
              where many templates put it, sits under the caption.
            </p>
          </>
        ),
      },
      {
        title: "Common safe zone mistakes",
        body: (
          <ul>
            <li>Putting captions or subtitles at the very bottom of a Reel, where Instagram&apos;s caption covers them.</li>
            <li>Placing a logo in the top corner of a Story, under the profile bar.</li>
            <li>Designing right up to the edge with no margin for different phones.</li>
            <li>Forgetting to hide the template layer before exporting.</li>
            <li>
              Checking the design but not the timing. Plan the post with the{" "}
              <Link href="/instagram-scheduler">Instagram scheduler</Link>.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram safe zone questions",
  faqs: [
    {
      q: "What is the Instagram Reels safe zone?",
      a: `On a 1080×1920 Reel, keep important text and faces out of roughly the top ${reelsTop.h} px, the bottom ${reelsBottom.h} px and the right ${reelsRight.w} px. That leaves a central area the caption, audio label and action buttons do not cover.`,
    },
    {
      q: "What is the Instagram Story safe zone?",
      a: `Stories are also 1080×1920. Leave about ${storyTop.h} px clear at the top for the progress and profile bar and about ${storyBottom.h} px at the bottom for the reply bar. The sides are mostly free, but keep a small margin.`,
    },
    {
      q: "Are these safe zones exact?",
      a: "No. They are approximate guides. Instagram's interface changes with the device, screen ratio, app version and caption length, so leave a little extra space around anything important.",
    },
    {
      q: "Is my image or video uploaded anywhere?",
      a: "No. The file is opened with a local object URL in your browser. Nothing is sent to a server, and closing the tab clears it.",
    },
    {
      q: "How do I use the safe zone template?",
      a: "Download the 1080×1920 PNG, place it as the top layer in Canva, Figma, CapCut or Premiere at low opacity, design inside the clear area, then hide or delete the layer before you export.",
    },
  ],
  related: [
    "/tools/instagram-story-size-checker",
    "/tools/instagram-reel-cover-maker",
    "/tools/instagram-story-maker",
    "/tools/instagram-image-size",
    "/tools/instagram-post-preview",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Reels and Story safe zone overlays",
      "Sample Reel interface with caption and buttons",
      "Works with images and video",
      "Adjustable overlay opacity and rule-of-thirds grid",
      "Free 1080×1920 PNG template",
    ],
  },
  cta: {
    title: "Your Reel is clear of the interface.",
    mark: "Schedule it.",
    text: "Plan your Reels and Stories with Poskoo, and DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramSafeZoneCheckerPage() {
  return (
    <ToolPageTemplate config={config}>
      <SafeZoneChecker />
    </ToolPageTemplate>
  );
}
