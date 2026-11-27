import Link from "next/link";
import { networkAvailability, availabilityPhrase } from "@/components/ChannelStatusNote";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import CoverSizeChecker from "@/components/tools/CoverSizeChecker";

const config: ToolPageConfig = {
  path: "/tools/tiktok-photo-size-checker",
  name: "TikTok photo size checker",
  crumb: "Photo size checker",
  title: "TikTok Photo Size Checker: Free 1080x1920 (9:16) Test",
  description:
    "Free TikTok photo size checker: test a photo post or slideshow image in the 1080x1920 (9:16) frame, check the 720 px minimum and see the crop.",
  pill: "Free - runs in your browser - nothing is uploaded",
  h1: { mark: "TikTok photo size checker", after: "(1080 x 1920)" },
  lede: "The recommended TikTok photo size is 1080 x 1920 pixels (9:16), the full vertical screen; TikTok photo posts can hold up to 35 images. Upload JPG, PNG or WebP at least 720 px wide, and keep key content in the centre.",
  art: "visual",
  artLabel: "A creator checks a vertical photo inside a TikTok phone frame to see where the captions and buttons cover it",
  heroPoints: ["1080 x 1920 (9:16) frame", "Exact pixels and file size", "Nothing is uploaded"],
  toolTitle: "Check your TikTok photo size",
  toolNote: "Free - nothing leaves your browser",
  stepsTitle: "How to check your TikTok photo size",
  steps: [
    {
      title: "Load a photo",
      text: "Choose a JPG, PNG or WebP with Load a photo. It is read locally in your browser and never uploaded.",
      art: "visual",
    },
    {
      title: "Read the verdict",
      text: "See the Dimensions, Aspect ratio and file size, a 1080 x 1920 full-screen preview, and a verdict: Perfect match, Correct shape, Too small or Not the right shape.",
      art: "analytics",
    },
    {
      title: "Fix it before you post",
      text: "If the image is not 9:16, is narrower than 720 px or is over 20 MB, crop or re-export it at 1080 x 1920, press Clear image and check the new file.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Know how your TikTok photo will look before you post",
  features: [
    {
      title: "A plain verdict",
      text: "Four clear outcomes tell you if the image is exactly 1080 x 1920, the right 9:16 shape at another size, too small or the wrong shape.",
      art: "analytics",
    },
    {
      title: "The full vertical screen",
      text: "The preview fits your whole image inside a 1080 x 1920 phone frame, so you can see what the TikTok caption and buttons will cover.",
      art: "visual",
    },
    {
      title: "Private by design",
      text: "The file is measured with a local object URL and released when you clear it. No upload, no login and no TikTok connection.",
      art: "feat-calendar",
    },
  ],
  guide: {
    title: "A practical guide to TikTok photo sizes in 2026",
    intro:
      "TikTok photo posts and slideshows use the same full vertical screen as video. Here is how the checker judges an image and how to design photos that fill 1080 x 1920 without losing the important part.",
    sections: [
      {
        title: "What this TikTok photo size checker does",
        body: (
          <>
            <p>
              The checker reads your image&apos;s real pixel width and height, reduces them to a ratio such as{" "}
              <code>9:16</code> or <code>4:3</code>, and compares the shape with the 1080 x 1920 frame. It gives
              one of four verdicts:
            </p>
            <ul>
              <li>
                <b>Perfect match: 1080 x 1920.</b> Exactly the recommended TikTok photo size, so it fills the screen
                with no crop.
              </li>
              <li>
                <b>Correct shape.</b> The 9:16 shape is right and the image is at least 720 px wide, so TikTok scales it
                to fit; 1080 px is recommended for the sharpest result.
              </li>
              <li>
                <b>Too small.</b> The shape is right but the image is narrower than 720 px, so TikTok may stretch it
                and it can look soft.
              </li>
              <li>
                <b>Not the right shape.</b> TikTok will crop it or add bars.
              </li>
            </ul>
            <p>
              It accepts JPG, PNG and WebP files up to 20 MB. It does not resize or edit the file.
            </p>
          </>
        ),
      },
      {
        title: "TikTok photo sizes at a glance",
        body: (
          <div className={t.tableWrap}>
            <table className={t.table}>
              <caption className="sr-only">TikTok photo sizes</caption>
              <thead>
                <tr>
                  <th scope="col">Use</th>
                  <th scope="col">Size (px)</th>
                  <th scope="col">Aspect ratio</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Recommended photo</th>
                  <td>1080 x 1920</td>
                  <td>9:16</td>
                </tr>
                <tr>
                  <th scope="row">Minimum width</th>
                  <td>720 x 1280</td>
                  <td>9:16</td>
                </tr>
                <tr>
                  <th scope="row">Square photo</th>
                  <td>1080 x 1080</td>
                  <td>1:1</td>
                </tr>
                <tr>
                  <th scope="row">Photo post limit</th>
                  <td>Up to 35 images</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </div>
        ),
      },
      {
        title: "Why does TikTok crop my photo?",
        body: (
          <ul>
            <li>
              <b>One shape only:</b> TikTok displays photos in a tall 9:16 frame, so a landscape or square image is
              cropped or shown with bars.
            </li>
            <li>
              <b>Captions and buttons cover the edges:</b> the caption sits along the bottom, the action buttons run up
              the right edge and the sound label sits near the bottom. Keep faces, text and logos in the centre of the
              frame.
            </li>
            <li>
              <b>Phones crop the sides:</b> different screen shapes show a slightly narrower or wider centre slice, so
              avoid text right at the left or right edge.
            </li>
            <li>
              <b>Keep a safe margin:</b> leave about 120 px clear at the top and 320 px clear at the bottom before you
              add anything important.
            </li>
          </ul>
        ),
      },
      {
        title: "How do I post photos on TikTok?",
        body: (
          <>
            <p>
              In the TikTok app, tap <b>+</b>, choose <b>Upload</b> and select your photos. Add a caption, pick a
              cover and post. For a slideshow, select up to 35 images in the order you want them to appear.
            </p>
            <p>
              Before you post, check the file here and with the{" "}
              <Link href="/tools/social-media-image-sizes">social media image sizes guide</Link>. Check the caption
              with the <Link href="/tools/tiktok-caption-counter">TikTok caption counter</Link>, then{" "}
              <Link href="/tiktok-scheduler">schedule TikTok posts with Poskoo</Link>.
            </p>
          </>
        ),
      },
    ],
  },
  faqTitle: "TikTok photo size questions",
  faqs: [
    {
      q: "What size should TikTok photos be?",
      a: "TikTok photos should be 1080 x 1920 pixels at a 9:16 ratio, the full vertical screen. That size fills the frame without cropping. Keep the image at least 720 px wide, and use JPG, PNG or WebP under 20 MB.",
    },
    {
      q: "Can I post landscape photos on TikTok?",
      a: "Yes, you can upload a landscape photo, but TikTok shows it in a tall 9:16 frame, so it will be cropped or shown with bars. If the wide framing matters, export a 1080 x 1920 version with the subject centred and any text well away from the edges.",
    },
    {
      q: "Why does TikTok crop my photo?",
      a: "TikTok uses one tall 9:16 frame for photo posts, so any image that is not 9:16 is cropped or padded. Captions along the bottom and buttons up the right edge cover part of the frame, so keep faces, text and logos in the centre.",
    },
    {
      q: "How many photos can a TikTok photo post have?",
      a: "A TikTok photo post can hold up to 35 images in one slideshow. They appear in the order you select them, so upload the strongest image first because it becomes the cover people see in the feed.",
    },
    {
      q: "What file type and size should a TikTok photo be?",
      a: "Use a JPG, PNG or WebP file up to 20 MB, at 1080 x 1920 pixels and at least 720 px wide. JPG is usually smallest for photos, while PNG keeps sharp text and flat colours.",
    },
    {
      q: "Is my photo uploaded or stored?",
      a: "No. The file is opened with a local object URL in your browser, measured, and released when you clear it or close the tab. Nothing is sent to a server and no TikTok login is needed.",
    },
  ],
  related: [
    "/tools/tiktok-video-size-checker",
    "/tools/tiktok-caption-counter",
    "/tools/tiktok-safe-zone-checker",
    "/tools/social-media-image-sizes",
    "/tiktok-scheduler",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Exact pixel dimensions and aspect ratio",
      "1080 x 1920 full-screen photo preview",
      "Verdict against 1080 x 1920 and the 720 px minimum",
      "Accepts JPG, PNG and WebP up to 20 MB",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Your photo is the right size.",
    mark: "Schedule the post.",
    text: "Plan TikTok photo posts and videos with Poskoo and publish them automatically.",
  },
};

export const metadata = toolMetadata(config);

export default function TikTokPhotoSizeCheckerPage() {
  const state = networkAvailability("tiktok");
  const pageConfig =
    state === "live"
      ? config
      : {
          ...config,
          guide: {
            ...config.guide,
            sections: config.guide.sections.map((section) =>
              section.title === "How do I post photos on TikTok?"
                ? {
                    ...section,
                    body: (
                      <>
                        <p>
                          In the TikTok app, tap <b>+</b>, choose <b>Upload</b> and select your photos. Add a caption, pick a
                          cover and post. For a slideshow, select up to 35 images in the order you want them to appear.
                        </p>
                        <p>
                          Before you post, check the file here and with the{" "}
                          <Link href="/tools/social-media-image-sizes">social media image sizes guide</Link>. Check the caption
                          with the <Link href="/tools/tiktok-caption-counter">TikTok caption counter</Link>, then post them from the
                          TikTok app. Publishing in the <Link href="/tiktok-scheduler">TikTok scheduler</Link> is {availabilityPhrase(state, "TikTok")}.
                        </p>
                      </>
                    ),
                  }
                : section
            ),
          },
        };
  return (
    <ToolPageTemplate config={pageConfig}>
      <CoverSizeChecker
        platform="TikTok"
        targetW={1080}
        targetH={1920}
        minW={720}
        maxBytes={20 * 1024 * 1024}
        acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
        acceptLabel="JPG, PNG or WebP"
        ratioTolerance={0.02}
        frameLabel="TikTok full-screen preview (9:16)"
      />
    </ToolPageTemplate>
  );
}
