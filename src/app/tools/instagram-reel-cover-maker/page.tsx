import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import ReelCoverMaker from "./ReelCoverMaker";

const config: ToolPageConfig = {
  path: "/tools/instagram-reel-cover-maker",
  name: "Instagram Reel cover maker",
  crumb: "Reel cover maker",
  title: "Instagram Reel Cover Maker: Free 1080x1920 Thumbnails",
  description:
    "Free Instagram Reel cover maker: add your photo and a bold title, check the 3:4 grid and 4:5 feed crops, then download a 1080x1920 PNG. Nothing uploaded.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Instagram Reel", mark: "cover maker", after: "for 1080×1920 thumbnails" },
  lede: "Add your photo and a bold title, check the profile-grid and feed crops, and download a 1080×1920 Reel cover PNG. No upload, no account, no watermark.",
  art: "visual",
  artLabel: "A creator measures a photo frame with a ruler next to phone screens of different shapes",
  heroPoints: ["1080×1920 PNG", "Grid and feed crop guides", "No watermark"],
  toolTitle: "Make your Reel cover",
  toolNote: "Free · your photo stays on your device",
  stepsTitle: "How to use the Instagram Reel cover maker",
  steps: [
    {
      title: "Choose a cover photo",
      text: "Pick a JPG or PNG under Cover photo. It fills the 9:16 frame; use the Zoom, Horizontal position and Vertical position sliders to frame the subject.",
      art: "visual",
    },
    {
      title: "Add a title and style",
      text: "Type an optional title of up to 60 characters, pick Brand, Charcoal, Cream or No band, and set the font size between 64 and 120 px.",
      art: "writing",
    },
    {
      title: "Check crops and download",
      text: "Keep Show crop guides on to see the 3:4 grid and 4:5 feed areas, then press Download PNG to save reel-cover.png without the guides.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "A Reel cover that still works when Instagram crops it",
  features: [
    {
      title: "Title placed for the grid",
      text: "The title band is centred inside the 3:4 profile-grid crop, so it stays visible on your profile and not only in the full-screen view.",
      art: "visual",
    },
    {
      title: "Live crop guides",
      text: "Yellow dashes mark the profile grid (3:4) and blue dashes the feed (4:5). The guides are for checking only and never end up in the PNG.",
      art: "feat-calendar",
    },
    {
      title: "Private by design",
      text: "Your photo is drawn on a canvas in your browser and the PNG is saved straight to your device. No upload, no account, no watermark.",
      art: "analytics",
    },
  ],
  guide: {
    title: "A practical guide to Instagram Reel covers",
    intro:
      "A Reel cover is the still frame people see on your profile grid and wherever the Reel is shown before it plays. A clear cover tells someone what the video is about before they tap. Here is how this maker works and how to design covers that survive Instagram's crops.",
    sections: [
      {
        title: "What this Reel cover maker does",
        body: (
          <>
            <p>
              The tool draws your photo onto a 1080×1920 canvas using a cover fit, so the frame is always filled. Zoom goes
              from 1× to 3× and the two position sliders move the photo within whatever overflows the frame.
            </p>
            <p>
              An optional title of up to 60 characters wraps onto at most three lines and sits on a rounded band in one of
              four styles (<b>Brand</b>, <b>Charcoal</b>, <b>Cream</b>) or, with <b>No band</b>, as white text with a soft
              shadow. Everything happens in your browser and <b>Download PNG</b> saves <code>reel-cover.png</code> at full
              size.
            </p>
          </>
        ),
      },
      {
        title: "Reel cover size and crops",
        body: (
          <>
            <p>Design for the full 9:16 frame, but keep the important part in the middle.</p>
            <div className={t.tableWrap}>
              <table className={t.table}>
                <thead>
                  <tr>
                    <th>Where it shows</th>
                    <th>Visible area</th>
                    <th>What to know</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Full cover</td>
                    <td>1080×1920 (9:16)</td>
                    <td>The size this tool exports.</td>
                  </tr>
                  <tr>
                    <td>Profile grid</td>
                    <td>Centre 1080×1440 (3:4)</td>
                    <td>Top and bottom are hidden.</td>
                  </tr>
                  <tr>
                    <td>Feed</td>
                    <td>Centre 1080×1350 (4:5)</td>
                    <td>Can be cropped tighter than the grid.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Instagram changes how covers are displayed from time to time, so check the preview in the app before you
              share. For other formats, see the <Link href="/tools/instagram-image-size">Instagram image size guide</Link>.
            </p>
          </>
        ),
      },
      {
        title: "Best practices for Reel covers in 2026",
        body: (
          <ul>
            <li>
              <b>Keep the title short.</b> Three to six words that name the topic read at thumbnail size. Long titles get
              small or wrap onto three lines.
            </li>
            <li>
              <b>Put faces and text in the centre.</b> Anything near the top or bottom edge is cut on the grid. Check it with
              the <Link href="/tools/instagram-safe-zone-checker">safe zone checker</Link> too.
            </li>
            <li>
              <b>Use a band on busy photos.</b> A solid band keeps text readable; No band works best on simple, darker
              backgrounds.
            </li>
            <li>
              <b>Stay consistent.</b> Reusing one title style across a series makes your profile grid easier to scan.
            </li>
            <li>
              <b>Match the hook.</b> The cover title should promise the same thing as the first seconds of the Reel.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: adding the cover to a Reel",
        body: (
          <>
            <p>
              Say you made a cover with the title &ldquo;3 hooks that doubled my views&rdquo; in the Brand style. To use it:
            </p>
            <div className={t.example}>
              <ol>
                <li>Before you share a new Reel, tap Edit cover on the final screen.</li>
                <li>Tap Add from camera roll and choose the reel-cover.png you downloaded.</li>
                <li>Check the grid preview, then tap Done and share your Reel.</li>
              </ol>
            </div>
            <p>
              Already posted? Open the Reel, tap the three-dot menu and look for the edit option, then Edit cover. Menu
              labels move between app versions, so the exact path may differ. If you plan Reels ahead, you can{" "}
              <Link href="/instagram-scheduler">schedule them with Poskoo</Link>.
            </p>
          </>
        ),
      },
      {
        title: "Common Reel cover mistakes",
        body: (
          <ul>
            <li>Placing the title near the top of the 9:16 frame, where the grid crop hides it.</li>
            <li>Using a random frame from the video that shows motion blur or a half-closed eye.</li>
            <li>White text with no band on a bright photo.</li>
            <li>Writing a title that does not match what the Reel actually delivers.</li>
            <li>Uploading a low-resolution photo; zooming in on it makes the cover look soft.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram Reel cover questions",
  faqs: [
    {
      q: "What size is an Instagram Reel cover?",
      a: "A Reel cover is 1080x1920 pixels (9:16). The profile grid shows only the centre 1080x1440 (3:4) and the feed can show the centre 1080x1350 (4:5), so keep your title and faces in the middle.",
    },
    {
      q: "Is my photo uploaded to your server?",
      a: "No. Your photo is opened and drawn on a canvas inside your browser, and the PNG is saved straight to your device. Nothing is uploaded and no account is needed.",
    },
    {
      q: "Can I change the cover of a Reel I already posted?",
      a: "Yes. Open the Reel, tap the three-dot menu, choose the edit option and then Edit cover, and pick a new image from your camera roll. Menu labels can differ between app versions.",
    },
    {
      q: "Why is the title cut off on my profile grid?",
      a: "The grid crops the cover to 3:4, so the top and bottom of the 1080x1920 frame are hidden. This tool places the title in the centre of the grid crop. Turn on Show crop guides to check before you download.",
    },
    {
      q: "Will the crop guides appear in my downloaded cover?",
      a: "No. The yellow and blue guides are only drawn on the preview. Download PNG renders a separate copy without them.",
    },
    {
      q: "Does the Reel cover maker add a watermark?",
      a: "No. The downloaded reel-cover.png contains only your photo and your title, with no watermark or logo.",
    },
  ],
  related: [
    "/tools/instagram-safe-zone-checker",
    "/tools/instagram-image-size",
    "/tools/instagram-story-maker",
    "/tools/instagram-highlight-cover-maker",
    "/tools/instagram-hook-generator",
    "/tools/instagram-post-preview",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "1080x1920 Reel cover PNG export",
      "Profile grid (3:4) and feed (4:5) crop guides",
      "Zoom and position controls",
      "Four title styles with adjustable font size",
      "Runs in the browser, no upload or watermark",
    ],
  },
  cta: {
    title: "Your cover is ready.",
    mark: "Schedule the Reel.",
    text: "Schedule your Reels with Poskoo and auto-DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramReelCoverMakerPage() {
  return (
    <ToolPageTemplate config={config}>
      <ReelCoverMaker />
    </ToolPageTemplate>
  );
}
