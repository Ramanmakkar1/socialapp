import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import CoverSizeChecker from "@/components/tools/CoverSizeChecker";

const config: ToolPageConfig = {
  path: "/tools/x-header-size-checker",
  name: "X header size checker",
  crumb: "Header size checker",
  title: "X (Twitter) Header Size Checker: Free 1500x500 Test",
  description:
    "Free X (Twitter) header size checker: test your image in the 1500x500, 3:1 frame, check the 5 MB limit and see where your profile photo overlaps.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "X (Twitter) header size checker", after: "(1500 × 500)" },
  lede: "The X (Twitter) header size is 1500 x 500 pixels (3:1), JPG, PNG or GIF, up to 5 MB; keep text away from the bottom-left, where your profile photo overlaps, and from the top and bottom edges, which can be cropped.",
  art: "visual",
  artLabel: "A creator checks a wide X header inside a profile frame to see where the avatar overlaps and where it gets cropped",
  heroPoints: ["1500 × 500 (3:1) frame", "Exact pixels and file size", "Nothing is uploaded"],
  toolTitle: "Check your X header size",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to check your X header size",
  steps: [
    {
      title: "Load a header image",
      text: "Choose a JPG, PNG or GIF with Load a header image. It is read locally in your browser and never uploaded.",
      art: "visual",
    },
    {
      title: "See the profile crop",
      text: "The checker shows your image in a 1500 × 500 frame with a profile photo overlay at the bottom-left, so you see exactly what X crops and covers.",
      art: "analytics",
    },
    {
      title: "Fix it before you upload",
      text: "If the image is the wrong shape, too small or over 5 MB, re-export it at 1500 × 500, move text away from the edges and press Clear image to check again.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Know how your X header crops before you upload it",
  features: [
    {
      title: "The real 3:1 frame",
      text: "The preview uses the 1500 × 500 shape X shows on a profile, so a wide image that looks fine in your editor is checked against the real crop.",
      art: "visual",
    },
    {
      title: "Profile photo overlay",
      text: "A labelled circle marks where your avatar overlaps the bottom-left of the header, so you can keep logos, faces and text clear of it.",
      art: "analytics",
    },
    {
      title: "Private by design",
      text: "The file is measured with a local object URL and released when you clear it. No upload, no login and no X connection.",
      art: "feat-calendar",
    },
  ],
  guide: {
    title: "A practical guide to X (Twitter) header sizes in 2026",
    intro:
      "An X header is one wide 3:1 banner, but the profile photo, the page layout and the crop on different screens all take a bite out of it. Here is how the checker judges an image and how to design one that survives every crop.",
    sections: [
      {
        title: "What this X header size checker does",
        body: (
          <>
            <p>
              The checker reads your image&apos;s real pixel width and height, reduces them to a ratio such as{" "}
              <code>3:1</code> or <code>16:9</code>, and compares the shape and file size with what X accepts for a
              header. It shows the exact dimensions, the aspect ratio and the file size, then gives a plain verdict such
              as Perfect match, Correct shape, Too small or Not the right shape.
            </p>
            <p>
              It also accepts JPG, PNG and GIF files up to 5 MB, and displays a 1500 × 500 profile preview with a circle
              where your profile photo sits. It does not resize or edit the file.
            </p>
          </>
        ),
      },
      {
        title: "X sizes at a glance",
        body: (
          <div className={t.tableWrap}>
            <table className={t.table}>
              <caption className="sr-only">X (Twitter) header and image sizes</caption>
              <thead>
                <tr>
                  <th scope="col">Use</th>
                  <th scope="col">Size (px)</th>
                  <th scope="col">Aspect ratio</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Header</th>
                  <td>1500 × 500</td>
                  <td>3:1</td>
                </tr>
                <tr>
                  <th scope="row">Profile photo</th>
                  <td>400 × 400</td>
                  <td>1:1</td>
                </tr>
                <tr>
                  <th scope="row">In-feed image</th>
                  <td>1600 × 900</td>
                  <td>16:9</td>
                </tr>
              </tbody>
            </table>
          </div>
        ),
      },
      {
        title: "Why does my X header get cropped?",
        body: (
          <ul>
            <li>
              <b>One wide 3:1 frame:</b> X displays the header as a wide banner, so a taller image is cropped at the top
              and bottom to fit.
            </li>
            <li>
              <b>Your profile photo overlaps the bottom-left:</b> the avatar sits over the header there, so keep logos and
              text out of that corner.
            </li>
            <li>
              <b>Phones show a narrower slice:</b> a smaller screen shows less of the sides, so avoid putting important
              words at the far left or right edge.
            </li>
            <li>
              <b>Keep a safe margin:</b> leave breathing room at the top and bottom and keep the subject in the middle
              third of the image.
            </li>
          </ul>
        ),
      },
      {
        title: "How to change your X header",
        body: (
          <>
            <p>
              On X, open your profile, tap <b>Edit profile</b> and choose the header image, or upload it from the profile
              settings on desktop. Select your 1500 × 500 file, drag it to frame the centre, and save.
            </p>
            <p>
              Before you upload, check the words with the{" "}
              <Link href="/tools/x-character-counter">X character counter</Link>, preview your next post with the{" "}
              <Link href="/tools/x-post-preview">X post preview</Link>, and compare other formats in the{" "}
              <Link href="/tools/social-media-image-sizes">social media image sizes guide</Link>. When the profile is
              ready, plan the announcement in the <Link href="/x-scheduler">X scheduler</Link>.
            </p>
          </>
        ),
      },
    ],
  },
  faqTitle: "X header size questions",
  faqs: [
    {
      q: "What is the X (Twitter) header size?",
      a: "The X header displays at 1500 × 500 pixels, a 3:1 ratio. Upload a JPG, PNG or GIF at that size, up to 5 MB, and keep key content away from the bottom-left where your profile photo overlaps.",
    },
    {
      q: "What is the maximum file size for an X header?",
      a: "X accepts header images up to 5 MB in JPG, PNG or GIF format. A compressed JPG is usually smallest and loads fastest, while PNG keeps sharp text and flat colours.",
    },
    {
      q: "Why is my X header cropped or blurry?",
      a: "X shows the header as a wide 3:1 banner, so a taller image is cropped at the top and bottom, and a smaller image is stretched and looks soft. Export at exactly 1500 × 500 pixels with the subject in the centre to avoid both.",
    },
    {
      q: "Where should I put text on an X header?",
      a: "Keep text in the middle of the banner, away from the top and bottom edges and clear of the bottom-left corner where your profile photo sits. On phones the sides are cropped too, so leave a margin at the left and right edges.",
    },
    {
      q: "Is my image uploaded or stored?",
      a: "No. The file is opened with a local object URL in your browser, measured, and released when you clear it or close the tab. Nothing is sent to a server and no X login is needed.",
    },
  ],
  related: [
    "/tools/x-post-preview",
    "/tools/x-character-counter",
    "/tools/social-media-image-sizes",
    "/x-scheduler",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Exact pixel dimensions and aspect ratio",
      "1500 × 500 profile header preview",
      "Profile photo overlap marker at the bottom-left",
      "Verdict against the 3:1 shape and 5 MB limit",
      "Accepts JPG, PNG and GIF up to 5 MB",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Your header is the right size.",
    mark: "Schedule the announcement.",
    text: "Plan your X posts with Poskoo and publish them automatically.",
  },
};

export const metadata = toolMetadata(config);

export default function XHeaderSizeCheckerPage() {
  return (
    <ToolPageTemplate config={config}>
      <CoverSizeChecker
        platform="X"
        targetW={1500}
        targetH={500}
        maxBytes={5 * 1024 * 1024}
        acceptedTypes={["image/jpeg", "image/png", "image/gif"]}
        acceptLabel="JPG, PNG or GIF"
        overlay={{ shape: "circle", left: "3%", bottom: "-12%", size: "18%", label: "Profile photo" }}
        frameLabel="X header (1500 × 500, 3:1)"
      />
    </ToolPageTemplate>
  );
}
