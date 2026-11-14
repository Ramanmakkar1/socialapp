import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import StorySizeChecker from "@/app/tools/instagram-story-size-checker/StorySizeChecker";

const config: ToolPageConfig = {
  path: "/tools/pinterest-pin-size-checker",
  name: "Pinterest pin size checker",
  crumb: "Pinterest pin size checker",
  title: "Pinterest Pin Size Checker: 1000 × 1500 and 2:3 Ratio",
  description:
    "The best Pinterest pin size is 1000 × 1500 pixels in a 2:3 vertical ratio. Load an image to check its pixels and shape before you pin. Free, no upload.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "Pinterest pin size checker", after: "(1000 × 1500)" },
  lede: "The best Pinterest pin size is 1000 × 1500 pixels, a 2:3 vertical ratio.",
  art: "visual",
  artLabel: "A creator checks a vertical Pin image against a 2:3 frame before pinning",
  heroPoints: ["Exact pixels and ratio", "2:3 Pin preview", "Nothing is uploaded"],
  toolTitle: "Check your Pin",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to check your Pinterest pin size",
  steps: [
    {
      title: "Load an image",
      text: "Choose a JPG, PNG or WebP file with the Load a pin image button. It is read locally in your browser and never uploaded.",
      art: "visual",
    },
    {
      title: "Read the verdict",
      text: "See the Dimensions, Aspect ratio and a 2:3 preview, then get a verdict against 1000 × 1500 and the 2:3 shape.",
      art: "analytics",
    },
    {
      title: "Fix it before you pin",
      text: "If the image is not 2:3, crop or re-export it to 1000 × 1500, then press Clear image and check the new file.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Know before Pinterest crops your Pin",
  features: [
    {
      title: "A plain verdict",
      text: "Clear outcomes tell you if the image is exactly 1000 × 1500, the right 2:3 shape at another size, or the wrong shape.",
      art: "analytics",
    },
    {
      title: "See the 2:3 frame",
      text: "The preview fits your whole image inside a 2:3 Pin frame, so a square or horizontal image shows the gaps Pinterest has to fill.",
      art: "visual",
    },
    {
      title: "Private by design",
      text: "The file is measured with a local object URL and released when you clear it. No upload, no login, no account needed.",
      art: "feat-calendar",
    },
  ],
  guide: {
    title: "Pinterest pin size: what do you need to know?",
    intro:
      "Pinterest is a vertical, image-first feed, so the shape of your Pin matters more than anything else. Here is the size to aim for, what happens to very tall Pins, and whether square or horizontal images work.",
    sections: [
      {
        title: "What is the best Pinterest pin size?",
        body: (
          <>
            <p>
              The best Pinterest pin size is <b>1000 × 1500 pixels</b> in a <b>2:3 vertical ratio</b>. That fills the
              Pin frame without cropping or bars and is the size most creators export for Pinterest.
            </p>
            <ul>
              <li>
                <b>Recommended:</b> 1000 × 1500 px, a 2:3 aspect ratio.
              </li>
              <li>
                <b>Same shape, other sizes:</b> larger 2:3 sizes like 1500 × 2250 are fine. Pinterest scales them down,
                so they stay sharp.
              </li>
              <li>
                <b>File types:</b> JPG, PNG and WebP all work with this checker.
              </li>
            </ul>
            <p>
              Load your image above to see its real pixels and ratio. If it is not 2:3, crop or re-export it to
              1000 × 1500 before you pin. Once it checks out, schedule it with the{" "}
              <Link href="/pinterest-scheduler">Pinterest scheduler</Link>.
            </p>
          </>
        ),
      },
      {
        title: "What happens if my pin is taller than 2:3?",
        body: (
          <>
            <p>
              Very tall Pins can be cut off in the feed. Pinterest shows a 2:3 crop in most places, so a much taller
              image loses its bottom edge. Keep the key text and the product in the top and middle of the image so
              nothing important is trimmed.
            </p>
            <p>
              If you want a longer infographic-style Pin, design it so the first 2:3 section works on its own, then let
              the rest add detail for people who open it.
            </p>
            <div className={t.example}>
              <p>Dimensions: 1000 × 2000 · Aspect ratio: 1:2</p>
              <p>
                Taller than 2:3. Pinterest crops this to a 2:3 frame in the feed, so the bottom of the image may be cut
                off. Keep key text in the top and middle, or re-export at 1000 × 1500.
              </p>
            </div>
          </>
        ),
      },
      {
        title: "Can I use square or horizontal pins?",
        body: (
          <>
            <p>
              Yes, you can upload square (1:1) or horizontal images, but vertical 2:3 Pins take more space in the feed
              and tend to get more attention. A square or horizontal image is padded or cropped to fit, which can make
              it look smaller next to taller Pins.
            </p>
            <p>
              For the strongest result, use a 2:3 vertical image at 1000 × 1500. If you only have a square or
              horizontal photo, place it on a 1000 × 1500 background and keep the subject in the middle.
            </p>
          </>
        ),
      },
      {
        title: "What should go in the pin description?",
        body: (
          <>
            <p>
              Write a clear, keyword-rich description that says what the Pin is and who it helps. Pinterest allows up
              to 500 characters, so lead with the main keyword and the benefit, then add a call to action.
            </p>
            <p>
              Check the length with the{" "}
              <Link href="/tools/pinterest-character-counter">Pinterest character counter</Link> and add a few tags
              with the{" "}
              <Link href="/tools/pinterest-hashtag-generator">Pinterest hashtag generator</Link> before you publish.
            </p>
          </>
        ),
      },
    ],
  },
  faqTitle: "Pinterest pin size questions",
  faqs: [
    {
      q: "What is the best Pinterest pin size?",
      a: "1000 × 1500 pixels in a 2:3 vertical ratio. Larger 2:3 sizes like 1500 × 2250 are also fine because Pinterest scales them down, so they stay sharp.",
    },
    {
      q: "What happens if my pin is taller than 2:3?",
      a: "Very tall Pins can be cut off in the feed. Pinterest shows a 2:3 crop in most places, so keep key text and the product in the top and middle of the image.",
    },
    {
      q: "Can I use square or horizontal pins?",
      a: "Yes, but vertical 2:3 Pins take more space in the feed and tend to get more attention. Square or horizontal images are padded or cropped to fit.",
    },
    {
      q: "What should go in the pin description?",
      a: "A clear, keyword-rich description of what the Pin is and who it helps, up to 500 characters. Lead with the main keyword and benefit, then add a call to action.",
    },
  ],
  related: [
    "/tools/pinterest-character-counter",
    "/tools/pinterest-hashtag-generator",
    "/tools/best-time-to-post-on-pinterest",
    "/tools/social-media-image-sizes",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Exact pixel dimensions and aspect ratio",
      "2:3 Pinterest Pin frame preview",
      "Verdict against 1000 × 1500",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Your Pin is the right size.",
    mark: "Schedule it.",
    text: "Plan and schedule Pinterest Pins with Poskoo, on the official platform APIs.",
  },
};

export const metadata = toolMetadata(config);

export default function PinterestPinSizeCheckerPage() {
  return (
    <ToolPageTemplate config={config}>
      <StorySizeChecker
        platform="Pinterest"
        formatName="pin"
        targetWidth={1000}
        targetHeight={1500}
        ratioW={2}
        ratioH={3}
        inputLabel="Load a pin image"
      />
    </ToolPageTemplate>
  );
}
