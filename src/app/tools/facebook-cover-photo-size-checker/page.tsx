import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import CoverPhotoChecker from "./CoverPhotoChecker";

const config: ToolPageConfig = {
  path: "/tools/facebook-cover-photo-size-checker",
  name: "Facebook cover photo size checker",
  crumb: "Cover photo size checker",
  title: "Facebook Cover Photo Size Checker: Free 820x312 Test",
  description:
    "Free Facebook cover photo size checker: test your image in the 820x312 desktop and 640x360 mobile frames, check the 400x150 minimum and crop.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "Facebook cover photo size checker", after: "(820 × 312)" },
  lede: "Facebook cover photos display at 820 x 312 pixels on desktop and 640 x 360 on phones; upload at least 400 x 150, ideally 1640 x 624, and keep key content centred.",
  art: "visual",
  artLabel: "A creator checks a wide cover photo inside a desktop frame and a phone frame to see where Facebook crops it",
  heroPoints: ["Desktop and phone crops", "Exact pixels and ratio", "Nothing is uploaded"],
  toolTitle: "Check your Facebook cover photo",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to check your Facebook cover photo size",
  steps: [
    {
      title: "Load a cover image",
      text: "Choose a JPG or PNG with Load a cover photo. It is read locally in your browser and never uploaded.",
      art: "visual",
    },
    {
      title: "See both crops",
      text: "The checker shows your image in a desktop frame (820 × 312) and a phone frame (640 × 360) side by side, so you see exactly what Facebook crops.",
      art: "analytics",
    },
    {
      title: "Fix it before you upload",
      text: "If the verdict is Too small or Will be cropped heavily, re-export closer to 1640 × 624, keep key content in the centre, press Clear image and check again.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Know how your cover crops before Facebook does",
  features: [
    {
      title: "Desktop and mobile previews",
      text: "Two frames show the 820 × 312 desktop cover and the 640 × 360 phone cover using object-fit: cover, so both crops are visible at once.",
      art: "visual",
    },
    {
      title: "A plain verdict",
      text: "Three clear outcomes tell you if the image is Too small, Good for desktop and mobile, or Will be cropped heavily.",
      art: "analytics",
    },
    {
      title: "Private by design",
      text: "The file is measured with a local object URL and released when you clear it. No upload, no login and no Facebook connection.",
      art: "feat-calendar",
    },
  ],
  guide: {
    title: "A practical guide to Facebook cover photo sizes in 2026",
    intro:
      "A Facebook cover is not one fixed shape: the desktop header and the phone header crop it differently. Here is how the checker judges an image and how to design one that survives both.",
    sections: [
      {
        title: "What this cover photo size checker does",
        body: (
          <>
            <p>
              The checker reads your image&apos;s real pixel width and height, reduces them to a ratio such as{" "}
              <code>820:312</code> or <code>16:9</code>, and compares the shape with the two cover frames Facebook uses. It
              gives one of three verdicts:
            </p>
            <ul>
              <li>
                <b>Too small.</b> The image is under 400 × 150 px.
              </li>
              <li>
                <b>Good for desktop and mobile.</b> It is at least 820 px wide and its ratio is between 16:9 and 820:312
                (about 1.78 to 2.63).
              </li>
              <li>
                <b>Will be cropped heavily.</b> It is large enough but the shape is too far from either cover frame.
              </li>
            </ul>
            <p>
              It also shows a note, not an error, when the file is over 100 KB: Facebook still accepts it, but an sRGB JPG
              under 100 KB loads fastest.
            </p>
          </>
        ),
      },
      {
        title: "Desktop vs mobile: why the crop changes",
        body: (
          <>
            <p>
              On a desktop the cover shows at <b>820 × 312 px</b>, a wide 820:312 shape. On a phone it shows at{" "}
              <b>640 × 360 px</b>, a 16:9 shape that is taller relative to its width. The same upload is cropped
              differently in each place, which is why a cover that looks right on a laptop can lose its edges on a phone.
            </p>
            <p>
              To satisfy both, upload <b>1640 × 624 px or larger</b> at a 820:312 ratio. That is twice the desktop size, so
              it stays sharp on high-density screens, and the extra width gives the mobile crop room to work with.
            </p>
          </>
        ),
      },
      {
        title: "Where the safe centre area is",
        body: (
          <>
            <p>
              Facebook crops from the edges towards the centre, and your profile picture overlaps the cover at the bottom
              left. Keep faces, logo marks and any text inside the middle of the image, well away from the outer 10% on each
              side.
            </p>
            <ul>
              <li>
                <b>Centre your subject.</b> Put the main visual in the middle third so both crops keep it.
              </li>
              <li>
                <b>Leave the bottom left clear.</b> The profile photo sits there on both desktop and mobile.
              </li>
              <li>
                <b>Avoid text at the edges.</b> Words near the sides disappear in the phone crop.
              </li>
            </ul>
          </>
        ),
      },
      {
        title: "Profile covers vs Facebook Page covers",
        body: (
          <>
            <p>
              Profile and Page covers use the same display sizes and the same 400 × 150 px minimum, so this checker works
              for both. Pages add a Page name and category over the cover, while profiles show your name beside the photo, so
              keep the lower-left area quieter on a Page cover.
            </p>
            <p>
              After you upload, preview your next Page post with the{" "}
              <Link href="/tools/facebook-post-preview">Facebook post preview</Link>, add tags with the{" "}
              <Link href="/tools/facebook-hashtag-generator">Facebook hashtag generator</Link>, and check other formats in
              the <Link href="/tools/social-media-image-sizes">social media image sizes guide</Link>. When the cover is ready,
              plan the announcement post in the{" "}
              <Link href="/facebook-scheduler">Facebook scheduler</Link>.
            </p>
          </>
        ),
      },
    ],
  },
  faqTitle: "Facebook cover photo size questions",
  faqs: [
    {
      q: "What is the correct Facebook cover photo size?",
      a: "Facebook covers display at 820 × 312 pixels on desktop and 640 × 360 pixels on phones. Upload at least 1640 × 624 pixels at a 820:312 ratio so it stays sharp on both, and keep the important content in the centre.",
    },
    {
      q: "What is the minimum Facebook cover photo size?",
      a: "The minimum is 400 × 150 pixels. Images smaller than that are rejected or look blurry, so it is best to start at 1640 × 624 pixels or larger and let Facebook scale it down.",
    },
    {
      q: "Why does my cover look different on mobile?",
      a: "The desktop cover is a wide 820:312 shape and the phone cover is a taller 16:9 shape at 640 × 360. Facebook crops the same image to fit both, so content near the left and right edges can disappear on a phone.",
    },
    {
      q: "What file type and size should a Facebook cover be?",
      a: "Use an sRGB JPG or PNG. Facebook accepts larger files, but a JPG under 100 KB loads fastest, especially on mobile data.",
    },
    {
      q: "Is my image uploaded or stored?",
      a: "No. The file is opened with a local object URL in your browser, measured, and released when you clear it or close the tab. Nothing is sent to a server and no Facebook login is needed.",
    },
  ],
  related: [
    "/tools/facebook-post-preview",
    "/tools/facebook-hashtag-generator",
    "/tools/social-media-image-sizes",
    "/facebook-scheduler",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Exact pixel dimensions and aspect ratio",
      "Desktop (820 × 312) and mobile (640 × 360) crop previews",
      "Verdict against 400 × 150 minimum and 820:312 ratio",
      "100 KB file-size note for faster loading",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Your cover is ready.",
    mark: "Schedule the announcement.",
    text: "Plan your Facebook Page posts with Poskoo and reply to every comment automatically.",
  },
};

export const metadata = toolMetadata(config);

export default function FacebookCoverPhotoSizeCheckerPage() {
  return (
    <ToolPageTemplate config={config}>
      <CoverPhotoChecker />
    </ToolPageTemplate>
  );
}
