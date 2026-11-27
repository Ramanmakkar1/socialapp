import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import ProfilePhotoChecker from "@/components/tools/ProfilePhotoChecker";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const config: ToolPageConfig = {
  path: "/tools/tiktok-profile-picture-size-checker",
  name: "TikTok profile picture size checker",
  crumb: "Profile picture size checker",
  title: "TikTok Profile Picture Size Checker: Free 200x200 Test",
  description:
    "The TikTok profile picture should be a square of at least 200 × 200 px (1:1) in JPG or PNG, cropped to a circle. Check yours free in your browser.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "TikTok profile picture size checker", after: "(200 × 200)" },
  lede: "The TikTok profile picture should be a square of at least 200 × 200 px (1:1) in JPG or PNG, and TikTok crops it to a circle. Load your image to check its exact pixels, ratio and what the circle cuts off.",
  art: "visual",
  artLabel: "A creator checks a square profile photo inside a circle crop next to a TikTok profile screen",
  heroPoints: ["Exact pixels and ratio", "Circle crop preview", "Nothing is uploaded"],
  toolTitle: "Check your profile picture",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to check your TikTok profile picture size",
  steps: [
    {
      title: "Load a profile photo",
      text: "Choose a JPG or PNG with Load a profile photo. It is read locally in your browser and never uploaded.",
      art: "visual",
    },
    {
      title: "Read the verdict",
      text: "See the Dimensions, Aspect ratio and file size, a circle-crop preview, and a verdict: Perfect square, Square but too small, Good square photo or Not square.",
      art: "analytics",
    },
    {
      title: "Fix it before you upload",
      text: "If the image is not square or is under 200 × 200 px, crop or re-export it at 200 × 200 or larger, press Clear image and check the new file.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Know what TikTok will cut off",
  features: [
    {
      title: "A plain verdict",
      text: "Four clear outcomes tell you if the image is exactly 200 × 200, square but too small, a good square photo, or the wrong shape.",
      art: "analytics",
    },
    {
      title: "See the circle crop",
      text: "The square frame darkens everything outside the circle TikTok shows, so you can spot a face or logo that will be cut off.",
      art: "visual",
    },
    {
      title: "Private by design",
      text: "The file is measured with a local object URL and released when you clear it. No upload, no login.",
      art: "feat-calendar",
    },
  ],
  guide: {
    title: "A practical guide to TikTok profile picture sizes in 2026",
    intro:
      "A TikTok profile picture is stored as a square and displayed as a circle, so the shape and the centre of the image matter more than the file name. Here is how the checker judges a photo and how to fix one that does not fit.",
    sections: [
      {
        title: "What size should a TikTok profile picture be?",
        body: (
          <>
            <p>
              Upload a square (1:1) image of 200 × 200 pixels or larger. TikTok&apos;s minimum is 20 × 20 px, but an
              image that small looks blurry, so 200 × 200 or more is the safe choice. JPG and PNG both work, and TikTok
              shows the image as a circle on your profile, in the For You feed and in comments.
            </p>
            <div className={t.tableWrap}>
              <table className={t.table}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Recommended upload</td>
                    <td>200 × 200 px or larger</td>
                  </tr>
                  <tr>
                    <td>Shape</td>
                    <td>1:1, shown as a circle</td>
                  </tr>
                  <tr>
                    <td>Minimum</td>
                    <td>20 × 20 px</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              The checker reads your image&apos;s real pixel width and height, reduces them to a ratio such as{" "}
              <code>1:1</code> or <code>4:5</code>, and compares the shape with the square TikTok uses. It gives one
              of four verdicts:
            </p>
            <ul>
              <li>
                <b>Perfect square at 200 × 200.</b> Exactly the recommended size.
              </li>
              <li>
                <b>Square, but too small.</b> The shape is right, but the shorter side is under 200 px.
              </li>
              <li>
                <b>Good square photo.</b> Square and at least 200 × 200 px.
              </li>
              <li>
                <b>Not square: the corners will be cropped.</b> TikTok will crop the edges to make a square.
              </li>
            </ul>
            <p>It does not resize or edit the file.</p>
          </>
        ),
      },
      {
        title: "What file types does TikTok accept for a profile picture?",
        body: (
          <>
            <p>
              TikTok accepts JPG and PNG profile pictures. Both are fine for a headshot or logo; JPG keeps photos
              smaller, while PNG keeps sharp edges and transparency for a logo. Export at 200 × 200 px or larger so the
              circle stays crisp on high-density phone screens.
            </p>
            <p>
              The checker confirms the file type and shows the pixel dimensions before you upload, so you can catch a
              wrong format or a tiny image first.
            </p>
          </>
        ),
      },
      {
        title: "How do I make my TikTok photo look good in the circle?",
        body: (
          <>
            <p>
              TikTok crops the square to a circle, so the four corners are always lost. Keep your face, logo or text
              inside the middle of the square, roughly within the circle that touches all four edges. Leave a little
              breathing room around it.
            </p>
            <p>
              Use a plain or softly blurred background, good light and a head-and-shoulders crop so the face fills the
              circle. The preview above darkens everything outside that circle. If your logo touches a corner, move it
              toward the centre and check again.
            </p>
            <p>
              Writing the rest of your profile? Try the{" "}
              <Link href="/tools/tiktok-bio-generator">TikTok bio generator</Link> and the{" "}
              <Link href="/tools/tiktok-username-generator">TikTok username generator</Link>.
            </p>
          </>
        ),
      },
      {
        title: "Example: a portrait photo as a profile picture",
        body: (
          <>
            <p>You load a 1080 × 1350 portrait photo you want to use as your profile picture. The checker shows:</p>
            <div className={t.example}>
              <p>Dimensions: 1080 × 1350 · Aspect ratio: 4:5</p>
              <p>
                Not square: the corners will be cropped. This image is 1080 × 1350 px (4:5). TikTok crops profile
                pictures to a square and then a circle, so the edges and corners of this image are lost. Crop it to a
                1:1 square at 200 × 200 px or larger.
              </p>
            </div>
            <p>
              Crop a square version with the <Link href="/tools/social-media-image-sizes">social media image sizes guide</Link>{" "}
              and choose the profile photo option, then check the result here.
            </p>
          </>
        ),
      },
      {
        title: "Common profile picture mistakes",
        body: (
          <ul>
            <li>Uploading a portrait or landscape photo and letting TikTok crop the sides.</li>
            <li>Using an image smaller than 200 × 200 px, which can look soft in the app.</li>
            <li>Putting a logo or face in a corner where the circle cuts it off.</li>
            <li>Using a busy background that makes a small circular avatar hard to read.</li>
            <li>Changing the photo often. Keep one clear photo so viewers recognise your videos in the feed.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "TikTok profile picture questions",
  faqs: [
    {
      q: "What size should a TikTok profile picture be?",
      a: "Use a square 1:1 image of at least 200 × 200 pixels. TikTok's minimum is 20 × 20 px, but tiny images look blurry, so 200 × 200 or larger is the safe choice. TikTok shows the square as a circle on your profile, in the For You feed and in comments.",
    },
    {
      q: "Does my TikTok profile picture have to be exactly 200 × 200?",
      a: "No. Any square image at least 200 × 200 px works. Larger squares are scaled down, and images under 200 px on the shorter side can look soft. The important part is the 1:1 shape and enough resolution.",
    },
    {
      q: "What file types can I use for a TikTok profile picture?",
      a: "TikTok accepts JPG and PNG profile pictures. JPG is a good choice for photos and PNG for logos with sharp edges. Export at 200 × 200 px or larger so the circle stays crisp on phone screens.",
    },
    {
      q: "Why does my TikTok profile picture look cropped?",
      a: "TikTok crops profile pictures to a square and then displays them as a circle. If your image is not square, the edges are cut to make it square, and the four corners are always outside the circle. Keep faces and logos in the centre.",
    },
    {
      q: "Is my photo uploaded or stored?",
      a: "No. The file is opened with a local object URL in your browser, measured, and released when you clear it or close the tab. Nothing is sent to a server and no TikTok login is needed.",
    },
  ],
  related: [
    "/tools/tiktok-bio-generator",
    "/tools/tiktok-username-generator",
    "/tools/tiktok-video-size-checker",
    "/tools/social-media-image-sizes",
    "/tiktok-scheduler",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Exact pixel dimensions and aspect ratio",
      "Circle crop preview of the square frame",
      "Verdict against 200 × 200 px",
      "Accepts JPG and PNG",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Your profile picture is the right size.",
    mark: "Plan your TikTok posts.",
    text: "Schedule videos with Poskoo and keep your profile looking sharp.",
  },
};

export const metadata = toolMetadata(config);

export default function TikTokProfilePictureSizeCheckerPage() {
  return (
    <ToolPageTemplate config={config}>
      <ProfilePhotoChecker
        platform="TikTok"
        recommended={200}
        minSide={200}
        acceptedTypes={["image/jpeg", "image/png"]}
        acceptedLabel="JPG or PNG"
        displayNote="TikTok shows it as a circle on your profile, videos and comments"
      />
    </ToolPageTemplate>
  );
}
