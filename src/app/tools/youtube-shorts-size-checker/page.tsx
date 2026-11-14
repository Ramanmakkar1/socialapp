import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import VideoSizeChecker from "@/components/tools/VideoSizeChecker";

const config: ToolPageConfig = {
  path: "/tools/youtube-shorts-size-checker",
  name: "YouTube Shorts size checker",
  crumb: "YouTube Shorts size checker",
  title: "YouTube Shorts Size Checker: 1080 × 1920 and 9:16 Ratio",
  description:
    "The best YouTube Shorts size is 1080 × 1920 pixels in a 9:16 frame. Load a clip to check its exact pixels, aspect ratio and length before you post. Free.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "YouTube Shorts size checker", after: "(1080 × 1920)" },
  lede: "The best YouTube Shorts size is 1080 × 1920 pixels in a 9:16 vertical frame.",
  art: "visual",
  artLabel: "A creator measures a vertical video frame next to a phone showing a 9:16 Short",
  heroPoints: ["Exact pixels and ratio", "9:16 frame preview", "Nothing is uploaded"],
  toolTitle: "Check your Short",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to check your YouTube Shorts size",
  steps: [
    {
      title: "Load a Shorts video",
      text: "Choose an MP4, MOV or WebM file with the Load a Shorts video button. It is read locally in your browser and never uploaded.",
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
  featuresTitle: "Know before YouTube crops your Short",
  features: [
    {
      title: "A plain verdict",
      text: "Clear outcomes tell you if the video is exactly 1080 × 1920, the right 9:16 shape at another size, or the wrong shape.",
      art: "analytics",
    },
    {
      title: "See the empty space",
      text: "The preview fits your whole clip inside a 9:16 phone frame, so a square or horizontal video shows the gaps YouTube has to fill.",
      art: "visual",
    },
    {
      title: "Private by design",
      text: "The file is measured with a local object URL and released when you clear it. No upload, no login, no account needed.",
      art: "feat-calendar",
    },
  ],
  guide: {
    title: "YouTube Shorts size: what do you need to know?",
    intro:
      "Shorts are vertical and full-screen, so the shape of your video matters more than anything else. Here is the size to aim for, what happens to horizontal videos, how long a Short can be, and where the interface covers your frame.",
    sections: [
      {
        title: "What is the best YouTube Shorts size?",
        body: (
          <>
            <p>
              The best YouTube Shorts size is <b>1080 × 1920 pixels</b> in a <b>9:16 vertical frame</b>. That fills a
              phone screen without cropping or black bars and is the size most creators export for Shorts.
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
                <b>File types:</b> MP4, MOV and WebM all work with this checker. Check the current upload options in
                YouTube Studio.
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
        title: "What happens to horizontal videos on YouTube Shorts?",
        body: (
          <>
            <p>
              YouTube only treats a video as a Short when it is square or vertical. A horizontal (16:9) video is not
              treated as a Short, so it is published as a regular video instead of appearing in the Shorts feed.
            </p>
            <p>
              If you want a horizontal clip in Shorts, place it on a 1080 × 1920 vertical background and keep the
              important action in the middle, or crop it to 9:16. That way it fills the frame and counts as a Short.
            </p>
            <div className={t.example}>
              <p>Dimensions: 1920 × 1080 · Aspect ratio: 16:9</p>
              <p>
                Not a 9:16 shape. YouTube does not treat horizontal videos as Shorts, so this video will publish as a
                regular video. Re-export or crop it to 1080 × 1920 before you post.
              </p>
            </div>
          </>
        ),
      },
      {
        title: "How long can a YouTube Short be?",
        body: (
          <>
            <p>
              A YouTube Short can be up to <b>3 minutes</b> long. Square or vertical videos up to 3 minutes count as
              Shorts, so a clip that runs longer is published as a regular video.
            </p>
            <p>
              This checker compares your clip with a <b>3-minute</b> limit. If the Length result is over 3 minutes,
              trim the clip or upload it as a regular video instead.
            </p>
          </>
        ),
      },
      {
        title: "Where do the title, channel name and buttons cover my Short?",
        body: (
          <>
            <p>
              YouTube&apos;s interface sits on top of your Short. The channel name, title, description and action
              buttons cover the right side and the lower part of the screen, and the top has the Shorts navigation.
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
  faqTitle: "YouTube Shorts size questions",
  faqs: [
    {
      q: "What is the best YouTube Shorts size?",
      a: "1080 × 1920 pixels in a 9:16 vertical frame. That fills a phone screen without cropping or bars. Any 9:16 video fills the frame, but 1080 × 1920 is the sharpest common export.",
    },
    {
      q: "Does my YouTube Short have to be exactly 1080 × 1920?",
      a: "No, but it is the safest choice. Any 9:16 video fills the frame. Videos smaller than 1080 × 1920 can look soft, and videos with a different shape get cropped or padded with bars.",
    },
    {
      q: "What happens if I upload a horizontal video to YouTube Shorts?",
      a: "YouTube does not treat horizontal videos as Shorts, so it publishes as a regular video instead of appearing in the Shorts feed. Crop or re-export the clip at 1080 × 1920 to make it a Short.",
    },
    {
      q: "How long can a YouTube Short be?",
      a: "Up to 3 minutes. Square or vertical videos up to 3 minutes count as Shorts, and anything longer is published as a regular video. Trim the clip or upload it as a regular video.",
    },
  ],
  related: [
    "/tools/youtube-thumbnail-size-checker",
    "/tools/youtube-title-generator",
    "/tools/youtube-hashtag-generator",
    "/tools/tiktok-video-size-checker",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Exact pixel dimensions and aspect ratio",
      "9:16 Shorts frame preview",
      "Length check against 3 minutes",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Your Short is the right size.",
    mark: "Schedule it.",
    text: "Plan and schedule your YouTube videos with Poskoo, on the official platform APIs.",
  },
};

export const metadata = toolMetadata(config);

export default function YouTubeShortsSizeCheckerPage() {
  return (
    <ToolPageTemplate config={config}>
      <VideoSizeChecker
        platform="YouTube Shorts"
        targetWidth={1080}
        targetHeight={1920}
        ratioW={9}
        ratioH={16}
        maxSeconds={180}
        durationNote="YouTube Shorts can be up to 3 minutes long; square or vertical videos up to 3 minutes count as Shorts."
        inputLabel="Load a Shorts video"
      />
    </ToolPageTemplate>
  );
}
