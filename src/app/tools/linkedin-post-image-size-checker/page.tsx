import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import CoverSizeChecker from "@/components/tools/CoverSizeChecker";

const config: ToolPageConfig = {
  path: "/tools/linkedin-post-image-size-checker",
  name: "LinkedIn post image size checker",
  crumb: "Post image size checker",
  title: "LinkedIn Post Image Size Checker: Free 1200x627 Test",
  description:
    "Check a LinkedIn post image in seconds: see its exact pixels and ratio, preview it in a 1.91:1 feed frame and find out if it matches 1200 x 627. Free.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "LinkedIn post image size checker", after: "(1200 × 627)" },
  lede: "The recommended LinkedIn post image size is 1200 x 627 pixels (1.91:1); square 1200 x 1200 and portrait 1080 x 1350 also display well in the feed.",
  art: "visual",
  artLabel: "A creator checks a landscape post image inside a LinkedIn feed frame to see how it will be cropped",
  heroPoints: ["Exact pixels and ratio", "1.91:1 feed preview", "Nothing is uploaded"],
  toolTitle: "Check your LinkedIn post image",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to check your LinkedIn post image size",
  steps: [
    {
      title: "Load a post image",
      text: "Choose a JPG, PNG or GIF with Load a cover image. It is read locally in your browser and never uploaded.",
      art: "visual",
    },
    {
      title: "Read the verdict",
      text: "See the Dimensions, Aspect ratio and file size, a 1.91:1 preview, and a verdict: Perfect match, Correct shape, Too small or Not the right shape.",
      art: "analytics",
    },
    {
      title: "Fix it before you upload",
      text: "If the image is the wrong shape, narrower than 552 px or over 5 MB, crop or re-export it at 1200 × 627, press Clear image and check the new file.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Know before LinkedIn crops your post image",
  features: [
    {
      title: "A plain verdict",
      text: "Four clear outcomes tell you if the image is exactly 1200 × 627, the right shape at another size, too small, or the wrong shape for the feed.",
      art: "analytics",
    },
    {
      title: "See the feed frame",
      text: "The preview fits your whole image inside the 1.91:1 frame LinkedIn uses for shared images, so you can spot what will be cropped before you post.",
      art: "visual",
    },
    {
      title: "Private by design",
      text: "The file is measured with a local object URL and released when you clear it. No upload, no login and no LinkedIn connection.",
      art: "feat-calendar",
    },
  ],
  guide: {
    title: "A practical guide to LinkedIn post image sizes in 2026",
    intro:
      "LinkedIn shows shared images in a wide landscape frame, but square and portrait images also work. Here is how the checker judges an image and how to design one that looks sharp in the feed.",
    sections: [
      {
        title: "What this LinkedIn post image size checker does",
        body: (
          <>
            <p>
              The checker reads your image&apos;s real pixel width and height, reduces them to a ratio such as{" "}
              <code>1200:627</code> or <code>1.91:1</code>, and compares the shape with the frame LinkedIn uses for a
              shared post image. It gives one of four verdicts:
            </p>
            <ul>
              <li>
                <b>Perfect match: 1200 × 627.</b> Exactly the recommended landscape upload size.
              </li>
              <li>
                <b>Correct shape.</b> The ratio is right and it is at least 1200 px wide.
              </li>
              <li>
                <b>Too small.</b> The right shape, but narrower than the 552 px minimum, so LinkedIn may stretch it and it
                can look soft.
              </li>
              <li>
                <b>Not the right shape.</b> LinkedIn will crop it or add bars.
              </li>
            </ul>
            <p>It accepts JPG, PNG and GIF files up to 5 MB. It does not resize or edit the file.</p>
          </>
        ),
      },
      {
        title: "LinkedIn post image sizes at a glance",
        body: (
          <div className={t.tableWrap}>
            <table className={t.table}>
              <caption className="sr-only">LinkedIn post image sizes</caption>
              <thead>
                <tr>
                  <th scope="col">Format</th>
                  <th scope="col">Size (px)</th>
                  <th scope="col">What it means</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Landscape (recommended)</th>
                  <td>1200 × 627</td>
                  <td>A 1.91:1 image that fills the feed frame without cropping.</td>
                </tr>
                <tr>
                  <th scope="row">Square</th>
                  <td>1200 × 1200</td>
                  <td>A 1:1 image that also displays well in the feed.</td>
                </tr>
                <tr>
                  <th scope="row">Portrait</th>
                  <td>1080 × 1350</td>
                  <td>A 4:5 image that takes more vertical space on mobile.</td>
                </tr>
                <tr>
                  <th scope="row">Minimum width</th>
                  <td>552</td>
                  <td>The smallest width LinkedIn accepts for a shared image.</td>
                </tr>
                <tr>
                  <th scope="row">Maximum file size</th>
                  <td>5 MB</td>
                  <td>Keep the upload under 5 MB as a JPG, PNG or GIF.</td>
                </tr>
              </tbody>
            </table>
          </div>
        ),
      },
      {
        title: "Why does my LinkedIn post image get cropped?",
        body: (
          <ul>
            <li>
              <b>Different shapes:</b> the feed uses a wide 1.91:1 frame, so a square or portrait image is cropped or
              letterboxed to fit.
            </li>
            <li>
              <b>The edges disappear:</b> the sides can be trimmed, so text near the left or right edge may be cut off.
            </li>
            <li>
              <b>Keep the message centred:</b> place the headline and logo away from the edges, with a little breathing
              room.
            </li>
            <li>
              <b>Blurry:</b> the image is narrower than 552 px, so LinkedIn upscales it. Re-export at 1200 × 627.
            </li>
            <li>
              <b>Too heavy:</b> files over 5 MB may fail to upload. Compress the image before you post.
            </li>
          </ul>
        ),
      },
      {
        title: "How do I add an image to a LinkedIn post?",
        body: (
          <>
            <p>
              Start a post, choose <b>Add a photo</b>, then upload your JPG, PNG or GIF. Crop so the important content
              sits in the centre, add your text, and publish or schedule it.
            </p>
            <p>
              Before you upload, check the file here and with the{" "}
              <Link href="/tools/social-media-image-sizes">social media image sizes guide</Link>. Pair it with a sharp
              banner using the{" "}
              <Link href="/tools/linkedin-banner-size-checker">LinkedIn banner size checker</Link>, then{" "}
              <Link href="/linkedin-scheduler">schedule LinkedIn posts with Poskoo</Link>.
            </p>
          </>
        ),
      },
    ],
  },
  faqTitle: "LinkedIn post image size questions",
  faqs: [
    {
      q: "What is the correct LinkedIn post image size?",
      a: "The recommended LinkedIn post image size is 1200 × 627 pixels at a 1.91:1 ratio. Square 1200 × 1200 and portrait 1080 × 1350 images also display well in the feed, but the landscape size fills the frame without cropping.",
    },
    {
      q: "What is the minimum LinkedIn post image size?",
      a: "The smallest width LinkedIn accepts for a shared image is 552 pixels. Images narrower than that may be stretched and look soft, so start at 1200 × 627 pixels or larger and let LinkedIn scale it down.",
    },
    {
      q: "What is the maximum LinkedIn post image file size?",
      a: "Keep the upload under 5 MB. Use a JPG, PNG or GIF, and compress the file if it is larger so the upload does not fail.",
    },
    {
      q: "Should I use a square or portrait image on LinkedIn?",
      a: "Square 1200 × 1200 and portrait 1080 × 1350 images both display well in the feed. Choose the shape that suits the content, but keep text away from the edges so nothing important is cropped.",
    },
    {
      q: "Is my image uploaded or stored?",
      a: "No. The file is opened with a local object URL in your browser, measured, and released when you clear it or close the tab. Nothing is sent to a server and no LinkedIn login is needed.",
    },
  ],
  related: [
    "/tools/linkedin-post-preview",
    "/tools/linkedin-character-counter",
    "/tools/social-media-image-sizes",
    "/linkedin-scheduler",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Exact pixel dimensions and aspect ratio",
      "1.91:1 feed frame preview",
      "Verdict against 1200 × 627 and the 552 px minimum",
      "Accepts JPG, PNG and GIF up to 5 MB",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Your post image is the right size.",
    mark: "Plan your LinkedIn posts.",
    text: "Schedule updates with Poskoo and keep your feed looking sharp.",
  },
};

export const metadata = toolMetadata(config);

export default function LinkedInPostImageSizeCheckerPage() {
  return (
    <ToolPageTemplate config={config}>
      <CoverSizeChecker
        platform="LinkedIn"
        targetW={1200}
        targetH={627}
        minW={552}
        maxBytes={5 * 1024 * 1024}
        acceptedTypes={["image/jpeg", "image/png", "image/gif"]}
        acceptLabel="JPG, PNG or GIF"
        ratioTolerance={0.02}
        frameLabel="LinkedIn feed preview (1.91:1)"
      />
    </ToolPageTemplate>
  );
}
