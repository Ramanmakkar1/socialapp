import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import BannerSizeChecker from "./BannerSizeChecker";

const config: ToolPageConfig = {
  path: "/tools/youtube-banner-size-checker",
  name: "YouTube banner size checker",
  crumb: "Banner size checker",
  title: "YouTube Banner Size Checker: Free 2560x1440 Image Test",
  description:
    "Free YouTube banner size checker: test channel art against 2560x1440, the 2048x1152 minimum, 6 MB limit and 1546x423 safe area right in your browser.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "YouTube banner size checker", after: "(2560 × 1440)" },
  lede: "The best YouTube banner size is 2560 x 1440 pixels (16:9), at least 2048 x 1152, under 6 MB, with text and logos inside the 1546 x 423 safe area.",
  art: "visual",
  artLabel: "A YouTube channel banner in a 16:9 frame with the 1546×423 safe area marked where TV, desktop and phones all show it",
  heroPoints: ["Exact pixels and ratio", "16:9 frame with safe area", "Nothing is uploaded"],
  toolTitle: "Check your YouTube banner",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to check your YouTube banner size",
  steps: [
    {
      title: "Load a banner image",
      text: "Choose a JPG, PNG, GIF or BMP with Load a banner image. It is read locally in your browser and never uploaded.",
      art: "visual",
    },
    {
      title: "Read the verdict",
      text: "See the Dimensions, Aspect ratio and file size, a 16:9 preview with the 1546 × 423 safe area marked, and a verdict: Perfect match, Correct 16:9 shape, Too small or Not a 16:9 banner shape.",
      art: "analytics",
    },
    {
      title: "Fix it before you upload",
      text: "If the image is not 16:9, is under 2048 × 1152 px or is over 6 MB, crop or re-export it at 2560 × 1440, press Clear image and check the new file.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Know before YouTube crops your banner",
  features: [
    {
      title: "A plain verdict",
      text: "Four clear outcomes tell you if the image is exactly 2560 × 1440, the right 16:9 shape at another size, too small, or the wrong shape.",
      art: "analytics",
    },
    {
      title: "See the safe area",
      text: "The preview fits your whole image inside a 16:9 frame with a dashed box for the 1546 × 423 safe area that TV, desktop and phones all show.",
      art: "visual",
    },
    {
      title: "Private by design",
      text: "The file is measured with a local object URL and released when you clear it. No upload, no login.",
      art: "feat-calendar",
    },
  ],
  guide: {
    title: "A practical guide to YouTube banner sizes in 2026",
    intro:
      "A YouTube banner is a 16:9 frame shown at different widths on TV, desktop and phones. Shape decides what gets seen, and resolution decides how sharp it looks. Here is how the checker judges a banner and how to fix one that does not fit.",
    sections: [
      {
        title: "What this banner size checker does",
        body: (
          <>
            <p>
              The checker reads your image&apos;s real pixel width and height, reduces them to a ratio such as{" "}
              <code>16:9</code> or <code>1:1</code>, and compares the shape with the 2560 × 1440 banner frame. It gives one
              of four verdicts:
            </p>
            <ul>
              <li>
                <b>Perfect match: 2560 × 1440.</b> Exactly the recommended size.
              </li>
              <li>
                <b>Correct 16:9 shape.</b> At least 2048 × 1152 px, so it works as a banner; 2560 × 1440 is sharpest.
              </li>
              <li>
                <b>Too small.</b> 16:9 but under 2048 × 1152 px, so YouTube may reject it or stretch it.
              </li>
              <li>
                <b>Not a 16:9 banner shape.</b> YouTube will crop it or add bars.
              </li>
            </ul>
            <p>It accepts JPG, PNG, GIF and BMP files up to 6 MB. It does not resize or edit the file.</p>
          </>
        ),
      },
      {
        title: "YouTube banner sizes at a glance",
        body: (
          <div className={t.tableWrap}>
            <table className={t.table}>
              <caption className="sr-only">Valid YouTube banner sizes, all 16:9</caption>
              <thead>
                <tr>
                  <th scope="col">Size (px)</th>
                  <th scope="col">Aspect ratio</th>
                  <th scope="col">Use</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">2560 × 1440</th>
                  <td>16:9</td>
                  <td>Recommended default; sharp on TV, desktop and phones</td>
                </tr>
                <tr>
                  <th scope="row">2048 × 1152</th>
                  <td>16:9</td>
                  <td>YouTube&apos;s minimum; acceptable but can look soft on large screens</td>
                </tr>
              </tbody>
            </table>
          </div>
        ),
      },
      {
        title: "Where your YouTube banner is seen",
        body: (
          <ul>
            <li>
              <b>TV:</b> shows the full 2560 × 1440 image, so keep the whole design clean.
            </li>
            <li>
              <b>Desktop:</b> shows about 2560 × 423 across the middle of the banner.
            </li>
            <li>
              <b>Phones:</b> show the 1546 × 423 safe area only. Put channel names, logos and calls to action inside it.
            </li>
          </ul>
        ),
      },
      {
        title: "How do I change my YouTube banner?",
        body: (
          <>
            <p>
              In YouTube Studio, go to <b>Customization</b>, choose <b>Branding</b> and upload your image under{" "}
              <b>Banner image</b>. Preview it on TV, desktop and mobile before publishing.
            </p>
            <p>
              Before you upload, check the file here and with the{" "}
              <Link href="/tools/social-media-image-sizes">social media image sizes guide</Link>. Pair the banner with a
              posting plan from the{" "}
              <Link href="/youtube-scheduler">YouTube scheduler</Link>.
            </p>
          </>
        ),
      },
    ],
  },
  faqTitle: "YouTube banner size questions",
  faqs: [
    {
      q: "What is the correct YouTube banner size?",
      a: "The best YouTube banner size is 2560 × 1440 pixels, a 16:9 aspect ratio. YouTube's minimum is 2048 × 1152 pixels, and files must be under 6 MB. Keep text and logos inside the 1546 × 423 safe area that every device shows.",
    },
    {
      q: "Does my banner have to be exactly 2560 × 1440?",
      a: "No. Any 16:9 image at least 2048 × 1152 px works, but 2560 × 1440 is sharpest on every screen. Images under 2048 × 1152 px are too small, and images with a different shape get cropped or padded.",
    },
    {
      q: "What is the YouTube banner safe area?",
      a: "The 1546 × 423 safe area is the part of your banner that shows on TV, desktop and phones. Put channel names, logos and calls to action inside it so nothing is cut off on any device.",
    },
    {
      q: "Is my image uploaded or stored?",
      a: "No. The file is opened with a local object URL in your browser, measured, and released when you clear it or close the tab. Nothing is sent to a server and no YouTube login is needed.",
    },
    {
      q: "What files can I check?",
      a: "JPG, PNG, GIF and BMP files up to 6 MB. For YouTube itself, a JPG or PNG at 2560 × 1440 is a safe choice.",
    },
  ],
  related: [
    "/tools/youtube-thumbnail-size-checker",
    "/tools/social-media-image-sizes",
    "/youtube-scheduler",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Exact pixel dimensions and aspect ratio",
      "16:9 banner frame preview with 1546 × 423 safe area",
      "Verdict against 2560 × 1440",
      "Accepts JPG, PNG, GIF and BMP up to 6 MB",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Your banner is the right size.",
    mark: "Schedule the video.",
    text: "Plan your YouTube uploads with Poskoo, and DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function YoutubeBannerSizeCheckerPage() {
  return (
    <ToolPageTemplate config={config}>
      <BannerSizeChecker />
    </ToolPageTemplate>
  );
}
