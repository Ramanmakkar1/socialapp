import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import ProfilePhotoChecker from "@/components/tools/ProfilePhotoChecker";

const config: ToolPageConfig = {
  path: "/tools/youtube-profile-picture-size-checker",
  name: "YouTube profile picture size checker",
  crumb: "Profile picture size checker",
  title: "YouTube Profile Picture Size Checker: Free 800x800 Test",
  description:
    "YouTube recommends an 800x800 square profile picture, shown as a 98x98 circle, as a PNG, JPG, BMP or non-animated GIF up to 4 MB. Check yours free.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "YouTube profile picture size checker", after: "(800 × 800)" },
  lede: "The YouTube profile picture size is 800 × 800 px (1:1), as a PNG, JPG, BMP or non-animated GIF up to 4 MB. YouTube shows it as a 98 × 98 circle on your channel, videos and comments, so load your image to check its exact pixels, ratio and what the circle cuts off.",
  art: "visual",
  artLabel: "A creator checks a square channel photo inside a circle crop next to a YouTube channel screen",
  heroPoints: ["Exact pixels and ratio", "Circle crop preview", "Nothing is uploaded"],
  toolTitle: "Check your profile picture",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to check your YouTube profile picture size",
  steps: [
    {
      title: "Load a profile photo",
      text: "Choose a JPG, PNG, BMP or GIF with Load a profile photo. It is read locally in your browser and never uploaded.",
      art: "visual",
    },
    {
      title: "Read the verdict",
      text: "See the Dimensions, Aspect ratio and file size, a circle-crop preview, and a verdict: Perfect square, Square but too small, Good square photo or Not square.",
      art: "analytics",
    },
    {
      title: "Fix it before you upload",
      text: "If the image is not square, is under 800 × 800 px or is over 4 MB, crop or re-export it at 800 × 800, press Clear image and check the new file.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Know what YouTube will cut off",
  features: [
    {
      title: "A plain verdict",
      text: "Four clear outcomes tell you if the image is exactly 800 × 800, square but too small, a good square photo, or the wrong shape.",
      art: "analytics",
    },
    {
      title: "See the circle crop",
      text: "The square frame darkens everything outside the circle YouTube shows, so you can spot a face or logo that will be cut off.",
      art: "visual",
    },
    {
      title: "Private by design",
      text: "The file is measured with a local object URL and released when you clear it. No upload, no login.",
      art: "feat-calendar",
    },
  ],
  guide: {
    title: "A practical guide to YouTube profile picture sizes in 2026",
    intro:
      "A YouTube profile picture is stored as a square and displayed as a circle, so the shape and the centre of the image matter more than the file name. Here is how the checker judges a photo and how to fix one that does not fit.",
    sections: [
      {
        title: "What size is a YouTube profile picture?",
        body: (
          <>
            <p>
              YouTube recommends an 800 × 800 pixel square (1:1) profile picture. A larger square, such as 1000 × 1000
              or 2000 × 2000, also works and gives YouTube more detail to scale down. The image is shown as a 98 × 98
              circle on your channel, on your videos and in comments.
            </p>
            <p>
              The checker reads your image&apos;s real pixel width and height, reduces them to a ratio such as{" "}
              <code>1:1</code> or <code>4:5</code>, and compares the shape with the square YouTube uses. It gives one
              of four verdicts:
            </p>
            <ul>
              <li>
                <b>Perfect square at 800 × 800.</b> Exactly the recommended size.
              </li>
              <li>
                <b>Square, but too small.</b> The shape is right, but the shorter side is under 800 px.
              </li>
              <li>
                <b>Good square photo.</b> Square and at least 800 × 800 px.
              </li>
              <li>
                <b>Not square: the corners will be cropped.</b> YouTube will crop the edges to make a square.
              </li>
            </ul>
            <p>It does not resize or edit the file.</p>
          </>
        ),
      },
      {
        title: "What is the YouTube profile picture file size limit?",
        body: (
          <>
            <p>
              YouTube accepts PNG, JPG, BMP and non-animated GIF profile pictures up to 4 MB. That is generous for a
              channel photo, so a normal image exported at 800 × 800 px or larger will usually fit well under the
              limit. If a file is rejected, it is almost always over 4 MB, animated, or in an unsupported format.
            </p>
            <p>
              The checker shows the file size in KB or MB and flags anything over 4 MB before you upload. Re-export the
              image as a JPG at a sensible quality to bring the size down without changing the square shape.
            </p>
          </>
        ),
      },
      {
        title: "Why is my YouTube profile picture blurry?",
        body: (
          <>
            <p>
              A blurry channel photo is usually too small. YouTube shows the image at 98 × 98 px, but it also uses the
              same file on larger channel headers and in video pages, so a tiny upload looks soft when it is scaled.
              Start from a square of at least 800 × 800 px, ideally 1000 × 1000 or more.
            </p>
            <p>
              YouTube crops the square to a circle, so the four corners are always lost. Keep your face, logo or text
              inside the middle of the square, roughly within the circle that touches all four edges. Leave a little
              breathing room around it.
            </p>
            <p>
              For the wider channel banner, use the{" "}
              <Link href="/tools/youtube-banner-size-checker">YouTube banner size checker</Link> so the two images
              match.
            </p>
          </>
        ),
      },
      {
        title: "Example: a portrait photo as a profile picture",
        body: (
          <>
            <p>You load a 1080 × 1350 portrait photo you want to use as your channel photo. The checker shows:</p>
            <div className={t.example}>
              <p>Dimensions: 1080 × 1350 · Aspect ratio: 4:5</p>
              <p>
                Not square: the corners will be cropped. This image is 1080 × 1350 px (4:5). YouTube crops profile
                pictures to a square and then a circle, so the edges and corners of this image are lost. Crop it to a
                1:1 square at 800 × 800 px.
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
            <li>Uploading a portrait or landscape photo and letting YouTube crop the sides.</li>
            <li>Using an image smaller than 800 × 800 px, which can look soft in the app.</li>
            <li>Putting a logo or face in a corner where the circle cuts it off.</li>
            <li>Using a busy background that makes a small circular avatar hard to read.</li>
            <li>
              Changing the photo whenever you remember. Plan channel updates with the{" "}
              <Link href="/youtube-scheduler">YouTube scheduler</Link>.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "YouTube profile picture questions",
  faqs: [
    {
      q: "What size should a YouTube profile picture be?",
      a: "Use a square 1:1 image of 800 × 800 pixels. Larger squares such as 1000 × 1000 or 2000 × 2000 px also work because YouTube has more detail to scale down. YouTube shows the square as a 98 × 98 circle on your channel, videos and comments.",
    },
    {
      q: "Does my profile picture have to be exactly 800 × 800?",
      a: "No. Any square image at least 800 × 800 px works. Larger squares are scaled down, and images under 800 px on the shorter side can look soft. The important part is the 1:1 shape and enough resolution.",
    },
    {
      q: "What is the YouTube profile picture file size limit?",
      a: "YouTube accepts PNG, JPG, BMP and non-animated GIF profile pictures up to 4 MB. A normal image exported at 800 × 800 px or larger is usually well under that. If a file is rejected, check that it is under 4 MB, not animated and in a supported format.",
    },
    {
      q: "Why does my profile picture look cropped?",
      a: "YouTube crops profile pictures to a square and then displays them as a circle. If your image is not square, the edges are cut to make it square, and the four corners are always outside the circle. Keep faces and logos in the centre.",
    },
    {
      q: "Is my photo uploaded or stored?",
      a: "No. The file is opened with a local object URL in your browser, measured, and released when you clear it or close the tab. Nothing is sent to a server and no YouTube login is needed.",
    },
  ],
  related: [
    "/tools/youtube-banner-size-checker",
    "/tools/youtube-thumbnail-size-checker",
    "/tools/youtube-handle-generator",
    "/tools/social-media-image-sizes",
    "/youtube-scheduler",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Exact pixel dimensions and aspect ratio",
      "Circle crop preview of the square frame",
      "Verdict against 800 × 800 px",
      "Accepts JPG, PNG, BMP and GIF up to 4 MB",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Your profile picture is the right size.",
    mark: "Plan your YouTube uploads.",
    text: "Schedule videos with Poskoo and keep your channel and profile looking sharp.",
  },
};

export const metadata = toolMetadata(config);

export default function YouTubeProfilePictureSizeCheckerPage() {
  return (
    <ToolPageTemplate config={config}>
      <ProfilePhotoChecker
        platform="YouTube"
        recommended={800}
        minSide={98}
        maxBytes={4 * 1024 * 1024}
        acceptedTypes={["image/jpeg", "image/png", "image/gif", "image/bmp"]}
        acceptedLabel="JPG, PNG, BMP or GIF"
        displayNote="YouTube shows it as a 98 × 98 circle on your channel, videos and comments"
      />
    </ToolPageTemplate>
  );
}
