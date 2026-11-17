import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import ThumbnailSizeChecker from "./ThumbnailSizeChecker";

export const dynamic = "force-static";
export const revalidate = 600;

const config: ToolPageConfig = {
  path: "/tools/youtube-thumbnail-size-checker",
  name: "YouTube thumbnail size checker",
  crumb: "Thumbnail size checker",
  title: "YouTube Thumbnail Size Checker: Free 1280x720 Image Test",
  description:
    "Free YouTube thumbnail size checker: upload an image to test the 1280x720 size, 16:9 ratio, 640 px minimum width and 2 MB limit before you upload.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "YouTube thumbnail size checker", after: "(1280 × 720)" },
  lede: "The best YouTube thumbnail size is 1280 x 720 pixels (16:9), at least 640 px wide, under 2 MB, as JPG, PNG or GIF.",
  art: "visual",
  artLabel: "A creator measures a video thumbnail frame with a ruler next to a YouTube player showing a 16:9 screen",
  heroPoints: ["Exact pixels and ratio", "16:9 frame preview", "Nothing is uploaded"],
  toolTitle: "Check your YouTube thumbnail",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to check your YouTube thumbnail size",
  steps: [
    {
      title: "Load a thumbnail image",
      text: "Choose a JPG, PNG or GIF with Load a thumbnail image. It is read locally in your browser and never uploaded.",
      art: "visual",
    },
    {
      title: "Read the verdict",
      text: "See the Dimensions, Aspect ratio and file size, a 16:9 preview with the duration badge, and a verdict: Perfect match, Correct 16:9 shape or Not a 16:9 thumbnail shape.",
      art: "analytics",
    },
    {
      title: "Fix it before you upload",
      text: "If the image is not 16:9, is under 640 px wide or is over 2 MB, crop or re-export it at 1280 × 720, press Clear image and check the new file.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Know before YouTube crops your thumbnail",
  features: [
    {
      title: "A plain verdict",
      text: "Three clear outcomes tell you if the image is exactly 1280 × 720, the right 16:9 shape at another size, or the wrong shape.",
      art: "analytics",
    },
    {
      title: "See the duration badge",
      text: "The preview fits your whole image inside a 16:9 frame with a duration badge in the bottom-right corner, where YouTube overlays the video length.",
      art: "visual",
    },
    {
      title: "Private by design",
      text: "The file is measured with a local object URL and released when you clear it. No upload, no login.",
      art: "feat-calendar",
    },
  ],
  guide: {
    title: "A practical guide to YouTube thumbnail sizes in 2026",
    intro:
      "A thumbnail is a 16:9 frame, so the shape is what matters most; resolution decides how sharp it looks. Here is how the checker judges an image and how to fix one that does not fit.",
    sections: [
      {
        title: "What this thumbnail size checker does",
        body: (
          <>
            <p>
              The checker reads your image&apos;s real pixel width and height, reduces them to a ratio such as{" "}
              <code>16:9</code> or <code>1:1</code>, and compares the shape with the 1280 × 720 thumbnail frame. It gives one
              of three verdicts:
            </p>
            <ul>
              <li>
                <b>Perfect match: 1280 × 720.</b> Exactly the recommended size.
              </li>
              <li>
                <b>Correct 16:9 shape, different resolution.</b> It fills the frame; if it is under 640 px wide YouTube
                rejects it, and if it is smaller than 1280 × 720 it may look soft.
              </li>
              <li>
                <b>Not a 16:9 thumbnail shape.</b> YouTube will crop it or add bars.
              </li>
            </ul>
            <p>It accepts JPG, PNG and GIF files up to 2 MB. It does not resize or edit the file.</p>
          </>
        ),
      },
      {
        title: "YouTube thumbnail sizes at a glance",
        body: (
          <div className={t.tableWrap}>
            <table className={t.table}>
              <caption className="sr-only">Valid YouTube thumbnail sizes, all 16:9</caption>
              <thead>
                <tr>
                  <th scope="col">Size (px)</th>
                  <th scope="col">Aspect ratio</th>
                  <th scope="col">Use</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">1280 × 720</th>
                  <td>16:9</td>
                  <td>Recommended default; sharp on every screen</td>
                </tr>
                <tr>
                  <th scope="row">1920 × 1080</th>
                  <td>16:9</td>
                  <td>Full HD; YouTube scales it down to 1280 × 720</td>
                </tr>
                <tr>
                  <th scope="row">640 × 360</th>
                  <td>16:9</td>
                  <td>Minimum width; acceptable but can look soft</td>
                </tr>
              </tbody>
            </table>
          </div>
        ),
      },
      {
        title: "Why is my YouTube thumbnail blurry or cropped?",
        body: (
          <ul>
            <li>
              <b>Blurry:</b> the image is under 640 px wide, so YouTube upscales it. Re-export at 1280 × 720.
            </li>
            <li>
              <b>Cropped:</b> the image is not 16:9, so YouTube crops the edges to fit the frame. Square or portrait images
              lose their sides.
            </li>
            <li>
              <b>Bars:</b> a 16:9 image that is smaller than the frame gets padded with black bars.
            </li>
            <li>
              <b>Hidden text:</b> YouTube overlays the video duration in the bottom-right corner, so text placed there can
              be covered.
            </li>
          </ul>
        ),
      },
      {
        title: "How do I add a custom thumbnail?",
        body: (
          <>
            <p>
              In YouTube Studio, go to <b>Content</b>, open the video, choose <b>Details</b> and use <b>Thumbnail</b> to
              upload your image. Custom thumbnails require a verified account and a channel that has not been flagged for
              inappropriate content.
            </p>
            <p>
              Before you upload, check the file here and with the{" "}
              <Link href="/tools/social-media-image-sizes">social media image sizes guide</Link>. Pair the thumbnail with a
              strong title from the <Link href="/tools/youtube-title-generator">YouTube title generator</Link>.
            </p>
          </>
        ),
      },
    ],
  },
  faqTitle: "YouTube thumbnail size questions",
  faqs: [
    {
      q: "What is the correct YouTube thumbnail size?",
      a: "The recommended YouTube thumbnail size is 1280 × 720 pixels, a 16:9 aspect ratio. That fills the thumbnail frame without cropping or bars. YouTube accepts other 16:9 sizes down to 640 px wide, but smaller images can look soft.",
    },
    {
      q: "Does my thumbnail have to be exactly 1280 × 720?",
      a: "No, but it is the safest choice. Any 16:9 image at least 640 px wide works. Images smaller than 1280 × 720 can look soft, and images with a different shape get cropped or padded.",
    },
    {
      q: "Why does my thumbnail look cropped?",
      a: "YouTube thumbnails use a 16:9 frame. If your image is square, 4:3 or 9:16, YouTube crops the edges or adds bars to fit. Re-export the image at 1280 × 720 and keep text and faces away from the edges.",
    },
    {
      q: "Is my image uploaded or stored?",
      a: "No. The file is opened with a local object URL in your browser, measured, and released when you clear it or close the tab. Nothing is sent to a server and no YouTube login is needed.",
    },
    {
      q: "What files can I check?",
      a: "JPG, PNG and GIF files up to 2 MB. For YouTube itself, a JPG or PNG at 1280 × 720 is a safe choice.",
    },
  ],
  related: [
    "/tools/youtube-title-generator",
    "/tools/social-media-image-sizes",
    "/tools/youtube-tag-generator",
    "/tools/youtube-description-generator",
    "/tools/youtube-hashtag-generator",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Exact pixel dimensions and aspect ratio",
      "16:9 thumbnail frame preview with duration badge",
      "Verdict against 1280 × 720",
      "Accepts JPG, PNG and GIF up to 2 MB",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Your thumbnail is the right size.",
    mark: "Schedule the video.",
    text: "Plan your YouTube uploads with Poskoo, and DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function YoutubeThumbnailSizeCheckerPage() {
  return (
    <ToolPageTemplate config={config}>
      <ThumbnailSizeChecker />
    </ToolPageTemplate>
  );
}
