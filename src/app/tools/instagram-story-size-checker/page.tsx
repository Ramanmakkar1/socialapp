import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import StorySizeChecker from "./StorySizeChecker";

const config: ToolPageConfig = {
  path: "/tools/instagram-story-size-checker",
  name: "Instagram Story size checker",
  crumb: "Story size checker",
  title: "Instagram Story Size Checker: Is It 1080 × 1920?",
  description:
    "Check an Instagram Story image in seconds: see its exact pixels and aspect ratio, preview it in a 9:16 frame and find out if it matches 1080 × 1920. Free.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "Instagram Story size checker", after: "(1080 × 1920)" },
  lede: "The recommended Instagram Story size is 1080 × 1920 pixels (9:16). Load your image to see its exact dimensions and ratio, preview it in a 9:16 frame and find out what to fix.",
  art: "visual",
  artLabel: "A creator measures a photo frame with a ruler next to phone screens of different shapes",
  heroPoints: ["Exact pixels and ratio", "9:16 frame preview", "Nothing is uploaded"],
  toolTitle: "Check your Story image",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to check your Instagram Story size",
  steps: [
    {
      title: "Load a Story image",
      text: "Choose a JPG, PNG or WebP under 20 MB with Load a Story image. It is read locally in your browser and never uploaded.",
      art: "visual",
    },
    {
      title: "Read the verdict",
      text: "See the Dimensions, Aspect ratio and file size, a 9:16 preview, and a verdict: Perfect match, Correct 9:16 shape or Not a 9:16 Story shape.",
      art: "analytics",
    },
    {
      title: "Fix it before you post",
      text: "If the image is not 9:16, crop or re-export it at 1080 × 1920, press Clear image and check the new file.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Know before Instagram crops your Story",
  features: [
    {
      title: "A plain verdict",
      text: "Three clear outcomes tell you if the image is exactly 1080 × 1920, the right shape at another size, or the wrong shape.",
      art: "analytics",
    },
    {
      title: "See the empty space",
      text: "The preview fits your whole image inside a 9:16 phone frame, so a square or landscape image shows the gaps Instagram has to fill.",
      art: "visual",
    },
    {
      title: "Private by design",
      text: "The file is measured with a local object URL and released when you clear it. No upload, no login.",
      art: "feat-calendar",
    },
  ],
  guide: {
    title: "A practical guide to Instagram Story sizes in 2026",
    intro:
      "A Story fills the whole phone screen, so the frame is tall and narrow. Getting the shape right is what matters most; resolution decides how sharp it looks. Here is how the checker judges an image and how to fix one that does not fit.",
    sections: [
      {
        title: "What this Story size checker does",
        body: (
          <>
            <p>
              The checker reads your image&apos;s real pixel width and height, reduces them to a ratio such as{" "}
              <code>9:16</code> or <code>4:5</code>, and compares the shape with the 1080 × 1920 Story frame. It gives one
              of three verdicts:
            </p>
            <ul>
              <li>
                <b>Perfect match: 1080 × 1920.</b> Exactly the recommended size.
              </li>
              <li>
                <b>Correct 9:16 shape, different resolution.</b> It fills the frame; if it is smaller than 1080 × 1920 it
                may look soft.
              </li>
              <li>
                <b>Not a 9:16 Story shape.</b> Instagram will crop it or add bars.
              </li>
            </ul>
            <p>It accepts image files up to 20 MB. It does not resize or edit the file.</p>
          </>
        ),
      },
      {
        title: "Instagram Story sizes at a glance",
        body: (
          <ul>
            <li>
              <b>Recommended:</b> 1080 × 1920 px, a 9:16 aspect ratio.
            </li>
            <li>
              <b>Same shape, other sizes:</b> 1440 × 2560 or 720 × 1280 are also 9:16. Larger files are scaled down;
              smaller ones can look soft.
            </li>
            <li>
              <b>File types:</b> JPG, PNG or WebP all work with this checker. Check the current upload limits in the
              Instagram app.
            </li>
            <li>
              <b>Safe area:</b> keep text and faces away from the top and bottom, where the profile bar and reply field
              sit. The <Link href="/tools/instagram-safe-zone-checker">safe zone checker</Link> shows those areas.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: a feed photo reused as a Story",
        body: (
          <>
            <p>You load a 1080 × 1350 portrait post you want to share to your Story. The checker shows:</p>
            <div className={t.example}>
              <p>Dimensions: 1080 × 1350 · Aspect ratio: 4:5</p>
              <p>
                Not a 9:16 Story shape. This image is 1080 × 1350 px (4:5). Instagram Stories use a 9:16 frame, so this
                image will be cropped or padded with bars. Re-export or crop it to 1080 × 1920 before you post.
              </p>
            </div>
            <p>
              Either crop a 9:16 version with the <Link href="/tools/instagram-image-size">image size crop tool</Link>, or
              place the photo on a 1080 × 1920 background in the{" "}
              <Link href="/tools/instagram-story-maker">Story maker</Link> so you choose what fills the space.
            </p>
          </>
        ),
      },
      {
        title: "Common Story size mistakes",
        body: (
          <ul>
            <li>Posting a landscape photo and letting Instagram crop the sides.</li>
            <li>Exporting a 9:16 image well below 1080 px wide, which can look soft.</li>
            <li>Putting text at the very top or bottom of the frame.</li>
            <li>Assuming a phone screenshot is 9:16; many modern phones are taller, so check it.</li>
            <li>
              Posting Stories whenever you remember. Plan them with the{" "}
              <Link href="/instagram-scheduler">Instagram scheduler</Link>.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram Story size questions",
  faqs: [
    {
      q: "What is the correct Instagram Story size?",
      a: "The recommended Instagram Story size is 1080 × 1920 pixels, a 9:16 aspect ratio. That fills a phone screen without cropping or bars. Instagram accepts other sizes but fits them into the 9:16 frame.",
    },
    {
      q: "Does my Story image have to be exactly 1080 × 1920?",
      a: "No, but it is the safest choice. Any 9:16 image fills the frame. Images smaller than 1080 × 1920 can look soft, and images with a different shape get cropped or padded.",
    },
    {
      q: "Why does my Story look cropped?",
      a: "Instagram Stories use a 9:16 frame. If your image is square, 4:5 or 16:9, Instagram crops the edges or adds bars to fit. Re-export the image at 1080 × 1920 and keep text and faces away from the edges.",
    },
    {
      q: "Is my image uploaded or stored?",
      a: "No. The file is opened with a local object URL in your browser, measured, and released when you clear it or close the tab. Nothing is sent to a server and no Instagram login is needed.",
    },
    {
      q: "What files can I check?",
      a: "Any image your browser can open, such as JPG, PNG or WebP, up to 20 MB. For Instagram itself, a JPG or PNG at 1080 × 1920 is a safe choice.",
    },
  ],
  related: [
    "/tools/instagram-safe-zone-checker",
    "/tools/instagram-story-maker",
    "/tools/instagram-image-size",
    "/tools/instagram-highlight-cover-maker",
    "/tools/instagram-reel-cover-maker",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Exact pixel dimensions and aspect ratio",
      "9:16 Story frame preview",
      "Verdict against 1080 × 1920",
      "Accepts images up to 20 MB",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Your Story is the right size.",
    mark: "Schedule it.",
    text: "Plan your Stories and Reels with Poskoo, and DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramStorySizeCheckerPage() {
  return (
    <ToolPageTemplate config={config}>
      <StorySizeChecker />
    </ToolPageTemplate>
  );
}
