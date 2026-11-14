import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import VideoSizeChecker from "@/components/tools/VideoSizeChecker";

const config: ToolPageConfig = {
  path: "/tools/instagram-reels-size-checker",
  name: "Instagram Reels size checker",
  crumb: "Instagram Reels size checker",
  title: "Instagram Reels Size Checker: 1080 × 1920, 9:16 Ratio",
  description:
    "The best Instagram Reels size is 1080 × 1920 pixels in a 9:16 frame. Load a clip to check its pixels, aspect ratio and length before you post. Free.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "Instagram Reels size checker", after: "(1080 × 1920)" },
  lede: "The best Instagram Reels size is 1080 × 1920 pixels in a 9:16 vertical frame.",
  art: "visual",
  artLabel: "A creator measures a vertical Reel frame next to a phone showing a 9:16 Reel",
  heroPoints: ["Exact pixels and ratio", "9:16 frame preview", "Nothing is uploaded"],
  toolTitle: "Check your Reel",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to check your Instagram Reels size",
  steps: [
    {
      title: "Load a Reel",
      text: "Choose an MP4, MOV or WebM file with the Load a Reel button. It is read locally in your browser and never uploaded.",
      art: "visual",
    },
    {
      title: "Read the verdict",
      text: "See the Dimensions, Aspect ratio, Length and a 9:16 preview, then get a verdict against 1080 × 1920 and the 9:16 frame.",
      art: "analytics",
    },
    {
      title: "Fix it before you post",
      text: "If the clip is not 9:16 or is over 3 minutes, crop or re-export it, then press Clear video and check the new file.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Know before Instagram crops your Reel",
  features: [
    {
      title: "A plain verdict",
      text: "Clear outcomes tell you if the video is exactly 1080 × 1920, the right 9:16 shape at another size, or the wrong shape.",
      art: "analytics",
    },
    {
      title: "See the empty space",
      text: "The preview fits your whole clip inside a 9:16 phone frame, so a square or horizontal video shows the gaps Instagram has to fill.",
      art: "visual",
    },
    {
      title: "Private by design",
      text: "The file is measured with a local object URL and released when you clear it. No upload, no login, no account needed.",
      art: "feat-calendar",
    },
  ],
  guide: {
    title: "Instagram Reels size: what do you need to know?",
    intro:
      "Reels are vertical and full-screen, so the shape of your video matters more than anything else. Here is the size to aim for, how long a Reel can be, how it looks in your profile grid, and where the interface covers your frame.",
    sections: [
      {
        title: "What is the best Instagram Reels size?",
        body: (
          <>
            <p>
              The best Instagram Reels size is <b>1080 × 1920 pixels</b> in a <b>9:16 vertical frame</b>. That fills a
              phone screen without cropping or black bars and is the size most creators export for Reels.
            </p>
            <ul>
              <li>
                <b>Recommended:</b> 1080 × 1920 px, a 9:16 aspect ratio.
              </li>
              <li>
                <b>Same shape, other sizes:</b> 720 × 1280 is also 9:16. It fills the frame, but it can look soft on
                larger phone screens.
              </li>
              <li>
                <b>File types:</b> MP4, MOV and WebM all work with this checker. Check the current upload options in the
                Instagram app.
              </li>
            </ul>
            <p>
              Load your clip above to see its real pixels and ratio. If it is not 9:16, re-export or crop it to
              1080 × 1920 before you upload. Once it checks out, schedule it with the{" "}
              <Link href="/instagram-scheduler">Instagram scheduler</Link> and prepare a cover with the{" "}
              <Link href="/tools/instagram-reel-cover-maker">Reel cover maker</Link>.
            </p>
          </>
        ),
      },
      {
        title: "How long can an Instagram Reel be?",
        body: (
          <>
            <p>
              An Instagram Reel can be up to <b>3 minutes</b> long when you upload it in the Instagram app. Check the
              app for the current limit, because Instagram has changed it before and may change it again.
            </p>
            <p>
              This checker compares your clip with a <b>3-minute</b> limit. If the Length result is over 3 minutes,
              trim the clip or split it into more than one Reel.
            </p>
          </>
        ),
      },
      {
        title: "How does a Reel look on my profile grid?",
        body: (
          <>
            <p>
              Your profile grid shows a cropped, taller-than-square preview of each Reel, not the full 9:16 frame. The
              sides and top and bottom of your video can be cut off in that preview.
            </p>
            <p>
              Keep the main subject in the centre of the frame so it survives the grid crop, and pick a cover that
              still reads at a glance. You can build one with the free{" "}
              <Link href="/tools/instagram-reel-cover-maker">Reel cover maker</Link>.
            </p>
          </>
        ),
      },
      {
        title: "Where do captions and buttons cover my Reel?",
        body: (
          <>
            <p>
              Instagram&apos;s interface sits on top of your Reel. The caption, username and action buttons cover the
              bottom and the right side of the screen, and the top holds the navigation.
            </p>
            <p>
              Keep faces, text and products away from those edges and toward the middle of the 9:16 frame. The preview
              above fits your whole clip into the phone shape so you can see the space the interface will use. For a
              dedicated overlay view, try the{" "}
              <Link href="/tools/instagram-safe-zone-checker">Instagram safe zone checker</Link>.
            </p>
            <div className={t.example}>
              <p>Dimensions: 1920 × 1080 · Aspect ratio: 16:9</p>
              <p>
                Not a 9:16 shape. Instagram will crop this horizontal video or add bars to fill the Reel frame, so
                parts of the picture can be lost. Re-export or crop it to 1080 × 1920 before you post.
              </p>
            </div>
          </>
        ),
      },
    ],
  },
  faqTitle: "Instagram Reels size questions",
  faqs: [
    {
      q: "What size is an Instagram Reel?",
      a: "1080 × 1920 pixels in a 9:16 vertical frame. That fills a phone screen without cropping or bars. Any 9:16 video fills the frame, but 1080 × 1920 is the sharpest common export.",
    },
    {
      q: "Does a Reel have to be exactly 1080 × 1920?",
      a: "No. Any 9:16 video fills the frame, such as 720 × 1280. 1080 × 1920 is the recommended size because it stays sharp on larger phone screens, while smaller files can look soft.",
    },
    {
      q: "Can an Instagram Reel be horizontal?",
      a: "You can upload a horizontal video, but Instagram will crop it or add bars to fill the 9:16 Reel frame, so parts of the picture can be lost. Crop it to 9:16 or place it on a vertical background first.",
    },
    {
      q: "How long can an Instagram Reel be?",
      a: "Up to 3 minutes when you upload it in the Instagram app. Check the app for the current limit, because Instagram has changed it before. This checker compares your clip with a 3-minute limit.",
    },
  ],
  related: [
    "/tools/instagram-reel-cover-maker",
    "/tools/instagram-story-size-checker",
    "/tools/instagram-safe-zone-checker",
    "/tools/tiktok-video-size-checker",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Exact pixel dimensions and aspect ratio",
      "9:16 Reels frame preview",
      "Length check against 3 minutes",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Your Reel is the right size.",
    mark: "Schedule it.",
    text: "Schedule Instagram Reels with Poskoo on the official Instagram API.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramReelsSizeCheckerPage() {
  return (
    <ToolPageTemplate config={config}>
      <VideoSizeChecker
        platform="Instagram Reels"
        targetWidth={1080}
        targetHeight={1920}
        ratioW={9}
        ratioH={16}
        maxSeconds={180}
        durationNote="Instagram Reels can be up to 3 minutes long when uploaded in the Instagram app."
        inputLabel="Load a Reel"
      />
    </ToolPageTemplate>
  );
}
