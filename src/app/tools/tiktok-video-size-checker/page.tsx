import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import VideoSizeChecker from "@/components/tools/VideoSizeChecker";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const config: ToolPageConfig = {
  path: "/tools/tiktok-video-size-checker",
  name: "TikTok video size checker",
  crumb: "TikTok video size checker",
  title: "TikTok Video Size Checker: 1080 × 1920 and 9:16 Ratio",
  description:
    "The best TikTok video size is 1080 × 1920 pixels in a 9:16 frame. Load your clip to check its exact pixels, aspect ratio and length before you post. Free.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "TikTok video size checker", after: "(1080 × 1920)" },
  lede: "The best TikTok video size is 1080 × 1920 pixels in a 9:16 vertical frame.",
  art: "visual",
  artLabel: "A creator measures a vertical video frame next to a phone showing a 9:16 clip",
  heroPoints: ["Exact pixels and ratio", "9:16 frame preview", "Nothing is uploaded"],
  toolTitle: "Check your TikTok video",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to check your TikTok video size",
  steps: [
    {
      title: "Load a TikTok video",
      text: "Choose an MP4, MOV or WebM file with the Load a TikTok video button. It is read locally in your browser and never uploaded.",
      art: "visual",
    },
    {
      title: "Read the verdict",
      text: "See the Dimensions, Aspect ratio, Length and a 9:16 preview, then get a verdict against 1080 × 1920 and the 9:16 frame.",
      art: "analytics",
    },
    {
      title: "Fix it before you post",
      text: "If the clip is not 9:16 or is too long, crop or re-export it, then press Clear video and check the new file.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Know before TikTok crops your video",
  features: [
    {
      title: "A plain verdict",
      text: "Clear outcomes tell you if the video is exactly 1080 × 1920, the right 9:16 shape at another size, or the wrong shape.",
      art: "analytics",
    },
    {
      title: "See the empty space",
      text: "The preview fits your whole clip inside a 9:16 phone frame, so a square or horizontal video shows the gaps TikTok has to fill.",
      art: "visual",
    },
    {
      title: "Private by design",
      text: "The file is measured with a local object URL and released when you clear it. No upload, no login, no account needed.",
      art: "feat-calendar",
    },
  ],
  guide: {
    title: "TikTok video size: what do you need to know?",
    intro:
      "TikTok is a vertical, full-screen platform, so the shape of your video matters more than anything else. Here is the size to aim for, what happens to other shapes, how long a video can be, and where the interface covers your frame.",
    sections: [
      {
        title: "What is the best TikTok video size?",
        body: (
          <>
            <p>
              The best TikTok video size is <b>1080 × 1920 pixels</b> in a <b>9:16 vertical frame</b>. That fills a phone
              screen without cropping or black bars and is the size most creators export for TikTok.
            </p>
            <ul>
              <li>
                <b>Recommended:</b> 1080 × 1920 px, a 9:16 aspect ratio.
              </li>
              <li>
                <b>Same shape, other sizes:</b> 720 × 1280 or 1440 × 2560 are also 9:16. Larger files are scaled down;
                smaller ones can look soft.
              </li>
              <li>
                <b>File types:</b> MP4, MOV and WebM all work with this checker. Check the current upload options in the
                TikTok app.
              </li>
            </ul>
            <p>
              Load your clip above to see its real pixels and ratio. If it is not 9:16, re-export or crop it to
              1080 × 1920 before you upload.
            </p>
          </>
        ),
      },
      {
        title: "What happens to horizontal or square videos on TikTok?",
        body: (
          <>
            <p>
              TikTok fits every video into a vertical 9:16 player. A horizontal (16:9) or square (1:1) video does not
              fill that frame, so TikTok either crops the edges or adds bars above and below to fill the space.
            </p>
            <p>
              Cropping can cut off faces, text and products at the sides. Bars make the video smaller on screen and can
              look like a repost from another platform. If you only have a horizontal clip, place it on a 1080 × 1920
              vertical background and keep the important action in the middle, or crop it to 9:16.
            </p>
            <div className={t.example}>
              <p>Dimensions: 1920 × 1080 · Aspect ratio: 16:9</p>
              <p>
                Not a 9:16 shape. TikTok uses a 9:16 frame, so this video will be cropped or padded with bars. Re-export
                or crop it to 1080 × 1920 before you post.
              </p>
            </div>
          </>
        ),
      },
      {
        title: "How long can a TikTok video be?",
        body: (
          <>
            <p>
              The TikTok app takes videos up to 10 minutes. Longer uploads, up to 60 minutes, are possible from a
              computer. The limit can differ by account and by how you upload, so check the current rule in the app or on
              the web uploader.
            </p>
            <p>
              This checker compares your clip with a <b>10-minute</b> limit, which is the app-side ceiling. If the
              Length result is over 10 minutes, trim the clip or upload it from a computer if your account allows longer
              videos.
            </p>
          </>
        ),
      },
      {
        title: "Where do captions and buttons cover my video?",
        body: (
          <>
            <p>
              TikTok&apos;s interface sits on top of your video. The profile name, caption, music and action buttons
              cover the right side and the lower part of the screen, and the top has the Following and For You tabs.
            </p>
            <p>
              Keep faces, text and products away from those edges and toward the middle of the 9:16 frame. The preview
              above fits your whole clip into the phone shape so you can see the space the interface will use. For a
              dedicated overlay view, try the{" "}
              <Link href="/tools/instagram-safe-zone-checker">safe zone checker</Link>.
            </p>
          </>
        ),
      },
    ],
  },
  faqTitle: "TikTok video size questions",
  faqs: [
    {
      q: "What is the best TikTok video size?",
      a: "1080 × 1920 pixels in a 9:16 vertical frame. That fills a phone screen without cropping or bars. Any 9:16 video fills the frame, but 1080 × 1920 is the sharpest common export.",
    },
    {
      q: "Does my TikTok video have to be exactly 1080 × 1920?",
      a: "No, but it is the safest choice. Any 9:16 video fills the frame. Videos smaller than 1080 × 1920 can look soft, and videos with a different shape get cropped or padded with bars.",
    },
    {
      q: "What happens if I upload a horizontal video to TikTok?",
      a: "TikTok fits it into a 9:16 player, so it either crops the sides or adds bars above and below. Keep the important action in the middle, or crop and re-export the clip at 1080 × 1920 before you post.",
    },
    {
      q: "How long can a TikTok video be?",
      a: "The TikTok app takes videos up to 10 minutes, and longer uploads up to 60 minutes are possible from a computer. The limit can differ by account and upload method, so check the current rule in the app.",
    },
  ],
  related: [
    "/tools/tiktok-caption-counter",
    "/tools/tiktok-hashtag-generator",
    "/tools/instagram-reels-size-checker",
    "/tiktok-scheduler",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Exact pixel dimensions and aspect ratio",
      "9:16 TikTok frame preview",
      "Length check against 10 minutes",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Your TikTok video is the right size.",
    mark: "Schedule it.",
    text: "Plan your TikToks with Poskoo and DM everyone who comments your keyword, on the official platform APIs.",
  },
};

export const metadata = toolMetadata(config);

export default function TikTokVideoSizeCheckerPage() {
  return (
    <ToolPageTemplate config={config}>
      <VideoSizeChecker
        platform="TikTok"
        targetWidth={1080}
        targetHeight={1920}
        ratioW={9}
        ratioH={16}
        maxSeconds={600}
        durationNote="The TikTok app takes videos up to 10 minutes; longer uploads (up to 60 minutes) are possible from a computer."
        inputLabel="Load a TikTok video"
      />
    </ToolPageTemplate>
  );
}
