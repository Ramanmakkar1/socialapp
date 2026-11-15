import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import CoverSizeChecker from "@/components/tools/CoverSizeChecker";

const config: ToolPageConfig = {
  path: "/tools/facebook-post-size-checker",
  name: "Facebook post size checker",
  crumb: "Post size checker",
  title: "Facebook Post Size Checker: Free 1080x1350 Image Test",
  description:
    "Check a Facebook feed image in seconds: see its exact pixels and ratio, preview it in a 4:5 frame and find out if it matches 1080 x 1350. Free.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "Facebook post size checker", after: "(1080 × 1350)" },
  lede: "The best Facebook feed post size is 1080 x 1350 pixels (4:5); square 1080 x 1080 also works and link images use 1200 x 630.",
  art: "visual",
  artLabel: "A creator checks a vertical feed image inside a 4:5 Facebook post frame before publishing",
  heroPoints: ["Exact pixels and ratio", "4:5 feed preview", "Nothing is uploaded"],
  toolTitle: "Check your Facebook post",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to check your Facebook post size",
  steps: [
    {
      title: "Load an image",
      text: "Choose a JPG or PNG file with the Load a post image button. It is read locally in your browser and never uploaded.",
      art: "visual",
    },
    {
      title: "Read the verdict",
      text: "See the Dimensions, Aspect ratio and file size, a 4:5 preview, and a verdict: Perfect match, Correct shape, Too small or Not the right shape.",
      art: "analytics",
    },
    {
      title: "Fix it before you post",
      text: "If the image is not 4:5 or narrower than 600 px, crop or re-export it at 1080 × 1350, press Clear image and check the new file.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Know before Facebook crops your post",
  features: [
    {
      title: "A plain verdict",
      text: "Clear outcomes tell you if the image is exactly 1080 × 1350, the right 4:5 shape at another size, too small or the wrong shape.",
      art: "analytics",
    },
    {
      title: "See the 4:5 frame",
      text: "The preview fits your whole image inside a 4:5 feed frame, so a square or landscape image shows the gaps Facebook has to fill.",
      art: "visual",
    },
    {
      title: "Private by design",
      text: "The file is measured with a local object URL and released when you clear it. No upload, no login, no account needed.",
      art: "feat-calendar",
    },
  ],
  guide: {
    title: "Facebook post size: what do you need to know?",
    intro:
      "Facebook shows feed images in a tall 4:5 frame, so the shape of your image decides how much of it people see. Here is the size to aim for, when square works, and why a photo can look cropped or blurry.",
    sections: [
      {
        title: "What size is a Facebook post image?",
        body: (
          <>
            <p>
              The best size for a Facebook feed post is <b>1080 × 1350 pixels</b>, a 4:5 portrait image. It fills the
              tallest frame Facebook shows in the feed, so it takes more screen space than a square or landscape photo.
              A square <b>1080 × 1080</b> image also works, and link previews use <b>1200 × 630</b>.
            </p>
            <p>
              The checker reads your image&apos;s real pixel width and height, reduces them to a ratio such as{" "}
              <code>4:5</code> or <code>1080:1350</code>, and compares the shape with the 4:5 feed frame. It gives one of
              four verdicts:
            </p>
            <ul>
              <li>
                <b>Perfect match: 1080 × 1350.</b> Exactly the recommended portrait upload size.
              </li>
              <li>
                <b>Correct shape.</b> The ratio is right and the image is at least 600 px wide.
              </li>
              <li>
                <b>Too small.</b> The right shape, but narrower than the 600 px minimum, so Facebook may upscale it and
                it can look soft.
              </li>
              <li>
                <b>Not the right shape.</b> Facebook will crop it or add bars to fill the 4:5 frame.
              </li>
            </ul>
            <p>It accepts JPG and PNG files. It does not resize or edit the file.</p>
          </>
        ),
      },
      {
        title: "Facebook image sizes at a glance",
        body: (
          <div className={t.tableWrap}>
            <table className={t.table}>
              <caption className="sr-only">Facebook image sizes</caption>
              <thead>
                <tr>
                  <th scope="col">Format</th>
                  <th scope="col">Size (px)</th>
                  <th scope="col">What it means</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Portrait feed post</th>
                  <td>1080 × 1350</td>
                  <td>A 4:5 image that fills the tallest feed frame. The size to aim for.</td>
                </tr>
                <tr>
                  <th scope="row">Square feed post</th>
                  <td>1080 × 1080</td>
                  <td>A 1:1 image that also works and shows fully in the feed.</td>
                </tr>
                <tr>
                  <th scope="row">Link preview</th>
                  <td>1200 × 630</td>
                  <td>The landscape image Facebook pulls from a shared link.</td>
                </tr>
                <tr>
                  <th scope="row">Story / Reel</th>
                  <td>1080 × 1920</td>
                  <td>A 9:16 vertical image or video that fills the phone screen.</td>
                </tr>
                <tr>
                  <th scope="row">Cover photo</th>
                  <td>820 × 312</td>
                  <td>Shown on desktop; phones crop it to 640 × 360.</td>
                </tr>
              </tbody>
            </table>
          </div>
        ),
      },
      {
        title: "Why is my Facebook photo cropped or blurry?",
        body: (
          <>
            <p>
              A photo is cropped when its shape does not match the 4:5 feed frame. Facebook fills the frame from the
              centre, so the top and bottom of a landscape image, or the sides of a very tall one, can be cut off. Keep
              faces, text and the product in the middle of the image so nothing important is trimmed.
            </p>
            <p>
              A photo looks blurry when it is uploaded smaller than the frame and Facebook stretches it. Export at{" "}
              <b>1080 × 1350</b> or larger so the image stays sharp on high-density phone screens. If you only have a
              square photo, place it on a 1080 × 1350 background and keep the subject centred.
            </p>
            <div className={t.example}>
              <p>Dimensions: 1920 × 1080 · Aspect ratio: 16:9</p>
              <p>
                A landscape image in a 4:5 frame. Facebook crops the sides to fill the feed, so keep key content in the
                middle, or re-export at 1080 × 1350.
              </p>
            </div>
          </>
        ),
      },
      {
        title: "What file type and size should a Facebook post be?",
        body: (
          <>
            <p>
              Upload a <b>JPG</b> or <b>PNG</b> file. JPG is best for photos and keeps the file small; PNG suits graphics
              with text or flat colour. Export at 1080 × 1350 and let Facebook scale the image down for the feed.
            </p>
            <p>
              Once the image checks out, preview the post with the{" "}
              <Link href="/tools/facebook-post-preview">Facebook post preview</Link>, check your header with the{" "}
              <Link href="/tools/facebook-cover-photo-size-checker">Facebook cover photo size checker</Link>, compare
              other formats in the <Link href="/tools/social-media-image-sizes">social media image sizes guide</Link>,
              then <Link href="/facebook-scheduler">schedule your Facebook post with Poskoo</Link>.
            </p>
          </>
        ),
      },
    ],
  },
  faqTitle: "Facebook post size questions",
  faqs: [
    {
      q: "What is the best Facebook post size?",
      a: "1080 × 1350 pixels in a 4:5 portrait ratio. It fills the tallest frame Facebook shows in the feed. A square 1080 × 1080 image also works, and link previews use 1200 × 630.",
    },
    {
      q: "Why is my Facebook photo cropped?",
      a: "Facebook fills the 4:5 feed frame from the centre, so an image with a different shape loses its edges. Keep faces, text and the product in the middle, or crop the image to 1080 × 1350 before you upload.",
    },
    {
      q: "Why does my Facebook post look blurry?",
      a: "A photo looks blurry when it is uploaded smaller than the frame and Facebook stretches it. Export at 1080 × 1350 or larger so it stays sharp on high-density phone screens.",
    },
    {
      q: "Can I post a square image on Facebook?",
      a: "Yes. A square 1080 × 1080 image also works and shows fully in the feed, but a 4:5 portrait at 1080 × 1350 takes more screen space and usually gets more attention.",
    },
    {
      q: "Is my image uploaded or stored?",
      a: "No. The file is opened with a local object URL in your browser, measured, and released when you clear it or close the tab. Nothing is sent to a server and no Facebook login is needed.",
    },
  ],
  related: [
    "/tools/facebook-cover-photo-size-checker",
    "/tools/facebook-post-preview",
    "/tools/social-media-image-sizes",
    "/facebook-scheduler",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Exact pixel dimensions and aspect ratio",
      "4:5 Facebook feed post frame preview",
      "Verdict against 1080 × 1350 and the 600 px minimum",
      "Accepts JPG and PNG",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Your post is the right size.",
    mark: "Schedule it.",
    text: "Plan and schedule Facebook Page posts with Poskoo, on the official platform APIs.",
  },
};

export const metadata = toolMetadata(config);

export default function FacebookPostSizeCheckerPage() {
  return (
    <ToolPageTemplate config={config}>
      <CoverSizeChecker
        platform="Facebook"
        targetW={1080}
        targetH={1350}
        minW={600}
        acceptedTypes={["image/jpeg", "image/png"]}
        acceptLabel="JPG or PNG"
        ratioTolerance={0.03}
        frameLabel="Facebook feed post (4:5)"
      />
    </ToolPageTemplate>
  );
}
