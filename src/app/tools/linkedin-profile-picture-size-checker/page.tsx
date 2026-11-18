import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import ProfilePhotoChecker from "@/components/tools/ProfilePhotoChecker";

export const dynamic = "force-static";
export const revalidate = 86400;

const config: ToolPageConfig = {
  path: "/tools/linkedin-profile-picture-size-checker",
  name: "LinkedIn profile picture size checker",
  crumb: "Profile picture size checker",
  title: "LinkedIn Profile Picture Size Checker: Free 400x400 Test",
  description:
    "LinkedIn profile photos should be square, at least 400 × 400 px and under 8 MB, and are cropped to a circle. Upload yours to check size, ratio and crop.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "LinkedIn profile picture size checker", after: "(400 × 400)" },
  lede: "The LinkedIn profile picture size is 400 × 400 px (1:1), JPG, PNG or GIF, under 8 MB. LinkedIn crops it to a circle, so load your image to check its exact pixels, ratio and what the circle cuts off.",
  art: "visual",
  artLabel: "A professional checks a square profile photo inside a circle crop next to a LinkedIn profile screen",
  heroPoints: ["Exact pixels and ratio", "Circle crop preview", "Nothing is uploaded"],
  toolTitle: "Check your profile picture",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to check your LinkedIn profile picture size",
  steps: [
    {
      title: "Load a profile photo",
      text: "Choose a JPG, PNG or GIF with Load a profile photo. It is read locally in your browser and never uploaded.",
      art: "visual",
    },
    {
      title: "Read the verdict",
      text: "See the Dimensions, Aspect ratio and file size, a circle-crop preview, and a verdict: Perfect square, Square but too small, Good square photo or Not square.",
      art: "analytics",
    },
    {
      title: "Fix it before you upload",
      text: "If the image is not square, is under 400 × 400 px or is over 8 MB, crop or re-export it at 400 × 400, press Clear image and check the new file.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Know what LinkedIn will cut off",
  features: [
    {
      title: "A plain verdict",
      text: "Four clear outcomes tell you if the image is exactly 400 × 400, square but too small, a good square photo, or the wrong shape.",
      art: "analytics",
    },
    {
      title: "See the circle crop",
      text: "The square frame darkens everything outside the circle LinkedIn shows, so you can spot a face or logo that will be cut off.",
      art: "visual",
    },
    {
      title: "Private by design",
      text: "The file is measured with a local object URL and released when you clear it. No upload, no login.",
      art: "feat-calendar",
    },
  ],
  guide: {
    title: "A practical guide to LinkedIn profile picture sizes in 2026",
    intro:
      "A LinkedIn profile picture is stored as a square and displayed as a circle, so the shape and the centre of the image matter more than the file name. Here is how the checker judges a photo and how to fix one that does not fit.",
    sections: [
      {
        title: "What size should a LinkedIn profile picture be?",
        body: (
          <>
            <p>
              LinkedIn profile pictures should be square (1:1) and at least 400 × 400 pixels. A larger square, such as
              800 × 800 or 1000 × 1000, also works and gives LinkedIn more detail to scale down. The image is shown as a
              circle on your profile, in posts and in comments.
            </p>
            <p>
              The checker reads your image&apos;s real pixel width and height, reduces them to a ratio such as{" "}
              <code>1:1</code> or <code>4:5</code>, and compares the shape with the square LinkedIn uses. It gives one
              of four verdicts:
            </p>
            <ul>
              <li>
                <b>Perfect square at 400 × 400.</b> Exactly the recommended size.
              </li>
              <li>
                <b>Square, but too small.</b> The shape is right, but the shorter side is under 400 px.
              </li>
              <li>
                <b>Good square photo.</b> Square and at least 400 × 400 px.
              </li>
              <li>
                <b>Not square: the corners will be cropped.</b> LinkedIn will crop the edges to make a square.
              </li>
            </ul>
            <p>It does not resize or edit the file.</p>
          </>
        ),
      },
      {
        title: "What is the LinkedIn profile photo file size limit?",
        body: (
          <>
            <p>
              LinkedIn accepts JPG, PNG and GIF profile photos up to 8 MB. That is generous for a headshot, so a normal
              photo exported at 400 × 400 px or larger will usually fit well under the limit. If a file is rejected, it
              is almost always over 8 MB or in an unsupported format.
            </p>
            <p>
              The checker shows the file size in KB or MB and flags anything over 8 MB before you upload. Re-export the
              image as a JPG at a sensible quality to bring the size down without changing the square shape.
            </p>
          </>
        ),
      },
      {
        title: "How do I make my LinkedIn photo look professional in the circle?",
        body: (
          <>
            <p>
              LinkedIn crops the square to a circle, so the four corners are always lost. Keep your face, logo or text
              inside the middle of the square, roughly within the circle that touches all four edges. Leave a little
              breathing room around it.
            </p>
            <p>
              Use a plain or softly blurred background, good light and a head-and-shoulders crop so the face fills the
              circle. The preview above darkens everything outside that circle. If your logo touches a corner, move it
              toward the centre and check again.
            </p>
            <p>
              For the wider profile banner, use the{" "}
              <Link href="/tools/linkedin-banner-size-checker">LinkedIn banner size checker</Link> so the two images
              match.
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
                Not square: the corners will be cropped. This image is 1080 × 1350 px (4:5). LinkedIn crops profile
                pictures to a square and then a circle, so the edges and corners of this image are lost. Crop it to a
                1:1 square at 400 × 400 px.
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
            <li>Uploading a portrait or landscape photo and letting LinkedIn crop the sides.</li>
            <li>Using an image smaller than 400 × 400 px, which can look soft in the app.</li>
            <li>Putting a logo or face in a corner where the circle cuts it off.</li>
            <li>Using a busy background that makes a small circular avatar hard to read.</li>
            <li>
              Changing the photo whenever you remember. Plan profile updates with the{" "}
              <Link href="/linkedin-scheduler">LinkedIn scheduler</Link>.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "LinkedIn profile picture questions",
  faqs: [
    {
      q: "What size should a LinkedIn profile picture be?",
      a: "Use a square 1:1 image of at least 400 × 400 pixels. 800 × 800 or 1000 × 1000 px is a safe choice because LinkedIn has more detail to scale down. LinkedIn shows the square as a circle on your profile, posts and comments.",
    },
    {
      q: "Does my profile picture have to be exactly 400 × 400?",
      a: "No. Any square image at least 400 × 400 px works. Larger squares are scaled down, and images under 400 px on the shorter side can look soft. The important part is the 1:1 shape and enough resolution.",
    },
    {
      q: "What is the LinkedIn profile photo file size limit?",
      a: "LinkedIn accepts JPG, PNG and GIF profile photos up to 8 MB. A normal headshot exported at 400 × 400 px or larger is usually well under that. If a file is rejected, check that it is under 8 MB and in a supported format.",
    },
    {
      q: "Why does my profile picture look cropped?",
      a: "LinkedIn crops profile pictures to a square and then displays them as a circle. If your image is not square, the edges are cut to make it square, and the four corners are always outside the circle. Keep faces and logos in the centre.",
    },
    {
      q: "Is my photo uploaded or stored?",
      a: "No. The file is opened with a local object URL in your browser, measured, and released when you clear it or close the tab. Nothing is sent to a server and no LinkedIn login is needed.",
    },
  ],
  related: [
    "/tools/linkedin-banner-size-checker",
    "/tools/linkedin-post-preview",
    "/tools/social-media-image-sizes",
    "/linkedin-scheduler",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Exact pixel dimensions and aspect ratio",
      "Circle crop preview of the square frame",
      "Verdict against 400 × 400 px",
      "Accepts JPG, PNG and GIF up to 8 MB",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Your profile picture is the right size.",
    mark: "Plan your LinkedIn posts.",
    text: "Schedule updates with Poskoo and keep your profile and page looking sharp.",
  },
};

export const metadata = toolMetadata(config);

export default function LinkedInProfilePictureSizeCheckerPage() {
  return (
    <ToolPageTemplate config={config}>
      <ProfilePhotoChecker
        platform="LinkedIn"
        recommended={400}
        minSide={400}
        maxSide={7680}
        maxBytes={8 * 1024 * 1024}
        acceptedTypes={["image/jpeg", "image/png", "image/gif"]}
        acceptedLabel="JPG, PNG or GIF"
        displayNote="LinkedIn shows it as a circle on your profile, posts and comments"
      />
    </ToolPageTemplate>
  );
}
