import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import LinkedInBannerChecker from "./LinkedInBannerChecker";

const config: ToolPageConfig = {
  path: "/tools/linkedin-banner-size-checker",
  name: "LinkedIn banner size checker",
  crumb: "Banner size checker",
  title: "LinkedIn Banner Size Checker: Free 1584x396 Image Test",
  description:
    "Free LinkedIn banner size checker: test your profile banner against 1584x396 (4:1) and the 8 MB limit, with a preview of the profile photo overlap.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "LinkedIn banner size checker", after: "(1584 × 396)" },
  lede: "The LinkedIn profile banner size is 1584 x 396 pixels (4:1), JPG or PNG, under 8 MB; keep text away from the bottom-left, where your profile photo sits.",
  art: "visual",
  artLabel: "A LinkedIn profile banner in a 4:1 frame with the profile photo circle marked in the bottom-left corner",
  heroPoints: ["Exact pixels and ratio", "4:1 frame with photo overlap", "Nothing is uploaded"],
  toolTitle: "Check your LinkedIn banner",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to check your LinkedIn banner size",
  steps: [
    {
      title: "Load a banner image",
      text: "Choose a JPG or PNG with Load a banner image. It is read locally in your browser and never uploaded.",
      art: "visual",
    },
    {
      title: "Read the verdict",
      text: "See the Dimensions, Aspect ratio and file size, a 4:1 preview with the profile photo area marked, and a verdict: Perfect match, Correct 4:1 shape, Too small or Not a 4:1 banner shape.",
      art: "analytics",
    },
    {
      title: "Fix it before you upload",
      text: "If the image is not 4:1, is narrower than 1584 px or is over 8 MB, crop or re-export it at 1584 × 396, press Clear image and check the new file.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Know before LinkedIn crops your banner",
  features: [
    {
      title: "A plain verdict",
      text: "Four clear outcomes tell you if the image is exactly 1584 × 396, the right 4:1 shape at another size, too small, or the wrong shape.",
      art: "analytics",
    },
    {
      title: "See the profile photo overlap",
      text: "The preview fits your whole image inside a 4:1 frame with a circle in the bottom-left showing where your profile photo covers the banner.",
      art: "visual",
    },
    {
      title: "Private by design",
      text: "The file is measured with a local object URL and released when you clear it. No upload, no login.",
      art: "feat-calendar",
    },
  ],
  guide: {
    title: "A practical guide to LinkedIn banner sizes in 2026",
    intro:
      "A LinkedIn profile banner is a 4:1 frame, and your profile photo sits over its bottom-left corner. Shape decides what gets seen, and resolution decides how sharp it looks. Here is how the checker judges a banner and how to fix one that does not fit.",
    sections: [
      {
        title: "What this banner size checker does",
        body: (
          <>
            <p>
              The checker reads your image&apos;s real pixel width and height, reduces them to a ratio such as{" "}
              <code>4:1</code> or <code>1:1</code>, and compares the shape with the 1584 × 396 profile-banner frame. It gives
              one of four verdicts:
            </p>
            <ul>
              <li>
                <b>Perfect match: 1584 × 396.</b> Exactly the recommended size.
              </li>
              <li>
                <b>Correct 4:1 shape.</b> At least 1584 px wide, so it works as a banner; 1584 × 396 is sharpest.
              </li>
              <li>
                <b>Too small.</b> 4:1 but narrower than 1584 px, so LinkedIn may stretch it and it can look soft.
              </li>
              <li>
                <b>Not a 4:1 banner shape.</b> LinkedIn will crop it or add bars.
              </li>
            </ul>
            <p>It accepts JPG and PNG files up to 8 MB. It does not resize or edit the file.</p>
          </>
        ),
      },
      {
        title: "LinkedIn banner sizes at a glance",
        body: (
          <div className={t.tableWrap}>
            <table className={t.table}>
              <caption className="sr-only">LinkedIn banner and cover sizes</caption>
              <thead>
                <tr>
                  <th scope="col">Placement</th>
                  <th scope="col">Size (px)</th>
                  <th scope="col">Aspect ratio</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Personal profile banner</th>
                  <td>1584 × 396</td>
                  <td>4:1</td>
                </tr>
                <tr>
                  <th scope="row">Company page cover</th>
                  <td>1128 × 191</td>
                  <td>About 5.9:1</td>
                </tr>
              </tbody>
            </table>
          </div>
        ),
      },
      {
        title: "Personal banner vs company page cover",
        body: (
          <>
            <p>
              A personal profile banner is <b>1584 × 396 px (4:1)</b>. A company page cover is a wider, shorter{" "}
              <b>1128 × 191 px</b> strip, so a personal banner reused on a company page will be cropped at the sides. Export
              each placement separately rather than stretching one file to fit both.
            </p>
            <p>
              On a company page the logo sits over the bottom-left of the cover, much like the profile photo on a personal
              banner. Keep the same safe zone free of text.
            </p>
          </>
        ),
      },
      {
        title: "Why does my banner get cropped on mobile?",
        body: (
          <ul>
            <li>
              <b>Mobile crops the sides:</b> phones show a narrower centre slice of the banner, so text near the left or
              right edge can disappear.
            </li>
            <li>
              <b>Keep the message centred:</b> place the headline and logo in the middle of the 4:1 frame, not at the edges.
            </li>
            <li>
              <b>Bottom-left is covered:</b> your profile photo overlaps that corner on every screen, so never put text
              there.
            </li>
            <li>
              <b>Blurry:</b> the image is narrower than 1584 px, so LinkedIn upscales it. Re-export at 1584 × 396.
            </li>
          </ul>
        ),
      },
      {
        title: "How do I upload a LinkedIn banner?",
        body: (
          <>
            <p>
              On your profile, choose the pencil icon on the banner, select <b>Change photo</b> and upload your JPG or PNG.
              Crop the image so the important content sits in the centre, then save.
            </p>
            <p>
              Before you upload, check the file here and with the{" "}
              <Link href="/tools/social-media-image-sizes">social media image sizes guide</Link>. Pair the banner with a
              sharp profile line from the <Link href="/tools/linkedin-headline-generator">LinkedIn headline generator</Link>,
              and preview your next update in the <Link href="/tools/linkedin-post-preview">LinkedIn post preview</Link>.
              When you are ready to plan posts, use the{" "}
              <Link href="/linkedin-scheduler">LinkedIn scheduler</Link>.
            </p>
          </>
        ),
      },
    ],
  },
  faqTitle: "LinkedIn banner size questions",
  faqs: [
    {
      q: "What is the correct LinkedIn banner size?",
      a: "The recommended LinkedIn profile banner size is 1584 × 396 pixels, a 4:1 aspect ratio. That fills the banner frame without cropping or bars. Use a JPG or PNG under 8 MB.",
    },
    {
      q: "Does my banner have to be exactly 1584 × 396?",
      a: "No, but it is the safest choice. Any 4:1 image at least 1584 px wide works. Images narrower than 1584 px can look soft, and images with a different shape get cropped or padded.",
    },
    {
      q: "What is the LinkedIn company page cover size?",
      a: "A LinkedIn company page cover is 1128 × 191 pixels, a much wider and shorter strip than the 1584 × 396 personal banner. Export a separate image for each placement instead of reusing one file.",
    },
    {
      q: "Why is my banner cropped on mobile?",
      a: "Phones show a narrower centre slice of the banner, so content near the left and right edges can be cut off. Keep the headline and logo in the middle of the 4:1 frame and leave the bottom-left clear for your profile photo.",
    },
    {
      q: "Is my image uploaded or stored?",
      a: "No. The file is opened with a local object URL in your browser, measured, and released when you clear it or close the tab. Nothing is sent to a server and no LinkedIn login is needed.",
    },
  ],
  related: [
    "/tools/linkedin-post-preview",
    "/tools/linkedin-headline-generator",
    "/tools/social-media-image-sizes",
    "/linkedin-scheduler",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Exact pixel dimensions and aspect ratio",
      "4:1 banner frame preview with profile photo overlap",
      "Verdict against 1584 × 396",
      "Accepts JPG and PNG up to 8 MB",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Your banner is the right size.",
    mark: "Plan your LinkedIn posts.",
    text: "Schedule updates with Poskoo and keep your profile and page looking sharp.",
  },
};

export const metadata = toolMetadata(config);

export default function LinkedInBannerSizeCheckerPage() {
  return (
    <ToolPageTemplate config={config}>
      <LinkedInBannerChecker />
    </ToolPageTemplate>
  );
}
