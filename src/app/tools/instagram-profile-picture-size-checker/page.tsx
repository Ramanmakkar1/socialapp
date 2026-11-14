import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import ProfilePhotoChecker from "@/components/tools/ProfilePhotoChecker";

const config: ToolPageConfig = {
  path: "/tools/instagram-profile-picture-size-checker",
  name: "Instagram profile picture size checker",
  crumb: "Profile picture size checker",
  title: "Instagram Profile Picture Size Checker: Free 320x320 Test",
  description:
    "Instagram profile pictures should be square, at least 320x320 px, and shown as a circle. Upload yours to check its size, ratio and circle crop. Free.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "Instagram profile picture size checker", after: "(320 × 320)" },
  lede: "The Instagram profile picture size is 320 × 320 px (1:1). Instagram crops it to a circle and shows it at about 110 × 110 px in the app, so load your image to check its exact pixels, ratio and what the circle cuts off.",
  art: "visual",
  artLabel: "A creator checks a square profile photo inside a circle crop next to a phone profile screen",
  heroPoints: ["Exact pixels and ratio", "Circle crop preview", "Nothing is uploaded"],
  toolTitle: "Check your profile picture",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to check your Instagram profile picture size",
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
      text: "If the image is not square or is under 320 × 320 px, crop or re-export it at 320 × 320, press Clear image and check the new file.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Know what Instagram will cut off",
  features: [
    {
      title: "A plain verdict",
      text: "Four clear outcomes tell you if the image is exactly 320 × 320, square but too small, a good square photo, or the wrong shape.",
      art: "analytics",
    },
    {
      title: "See the circle crop",
      text: "The square frame darkens everything outside the circle Instagram shows, so you can spot a face or logo that will be cut off.",
      art: "visual",
    },
    {
      title: "Private by design",
      text: "The file is measured with a local object URL and released when you clear it. No upload, no login.",
      art: "feat-calendar",
    },
  ],
  guide: {
    title: "A practical guide to Instagram profile picture sizes in 2026",
    intro:
      "A profile picture is stored as a square and displayed as a circle, so the shape and the centre of the image matter more than the file name. Here is how the checker judges a photo and how to fix one that does not fit.",
    sections: [
      {
        title: "What size is an Instagram profile picture?",
        body: (
          <>
            <p>
              Instagram stores profile pictures as a square of at least 320 × 320 pixels (1:1). In the app it shows
              that square as a circle at about 110 × 110 px, and smaller versions appear in comments and the Story
              ring. A larger square, such as 1080 × 1080, also works and gives Instagram more detail to scale down.
            </p>
            <p>
              The checker reads your image&apos;s real pixel width and height, reduces them to a ratio such as{" "}
              <code>1:1</code> or <code>4:5</code>, and compares the shape with the square Instagram uses. It gives one
              of four verdicts:
            </p>
            <ul>
              <li>
                <b>Perfect square at 320 × 320.</b> Exactly the recommended size.
              </li>
              <li>
                <b>Square, but too small.</b> The shape is right, but the shorter side is under 320 px.
              </li>
              <li>
                <b>Good square photo.</b> Square and at least 320 × 320 px.
              </li>
              <li>
                <b>Not square: the corners will be cropped.</b> Instagram will crop the edges to make a square.
              </li>
            </ul>
            <p>It does not resize or edit the file.</p>
          </>
        ),
      },
      {
        title: "Why is my Instagram profile picture blurry?",
        body: (
          <>
            <p>
              A profile picture looks blurry when the uploaded image is smaller than the space Instagram displays it
              in, or when it has been compressed several times. Upload a square image of at least 320 × 320 px, and
              ideally 1080 × 1080 px, so Instagram has enough detail when it scales the photo down to the circle.
            </p>
            <p>
              Avoid screenshots of a photo and avoid re-saving the same JPG over and over. Export a fresh copy from
              the original at 1080 × 1080 px, then check it with this tool before uploading.
            </p>
          </>
        ),
      },
      {
        title: "How do I keep my logo inside the circle?",
        body: (
          <>
            <p>
              Instagram crops the square to a circle, so the four corners are always lost. Keep the important part of
              a logo, face or text inside the middle of the square, roughly within the circle that touches all four
              edges. Leave a little breathing room around it.
            </p>
            <p>
              The preview above darkens everything outside that circle. If your logo touches a corner, move it toward
              the centre and check again. For a matching set of profile and highlight images, use the{" "}
              <Link href="/tools/instagram-highlight-cover-maker">highlight cover maker</Link>.
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
                Not square: the corners will be cropped. This image is 1080 × 1350 px (4:5). Instagram crops profile
                pictures to a square and then a circle, so the edges and corners of this image are lost. Crop it to a
                1:1 square at 320 × 320 px.
              </p>
            </div>
            <p>
              Crop a square version with the <Link href="/tools/instagram-image-size">Instagram image size tool</Link>{" "}
              and choose the profile photo option, then check the result here.
            </p>
          </>
        ),
      },
      {
        title: "Common profile picture mistakes",
        body: (
          <ul>
            <li>Uploading a portrait or landscape photo and letting Instagram crop the sides.</li>
            <li>Using an image smaller than 320 × 320 px, which can look soft in the app.</li>
            <li>Putting a logo or face in a corner where the circle cuts it off.</li>
            <li>Using a busy background that makes a small circular avatar hard to read.</li>
            <li>
              Changing the photo whenever you remember. Plan profile updates with the{" "}
              <Link href="/instagram-scheduler">Instagram scheduler</Link>.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram profile picture questions",
  faqs: [
    {
      q: "What size should an Instagram profile picture be?",
      a: "Use a square 1:1 image of at least 320 × 320 pixels. 1080 × 1080 px is a safe choice because Instagram has more detail to scale down. Instagram shows the square as a circle at about 110 × 110 px in the app.",
    },
    {
      q: "Does my profile picture have to be exactly 320 × 320?",
      a: "No. Any square image at least 320 × 320 px works. Larger squares are scaled down, and images under 320 px on the shorter side can look soft. The important part is the 1:1 shape and enough resolution.",
    },
    {
      q: "Why does my profile picture look cropped?",
      a: "Instagram crops profile pictures to a square and then displays them as a circle. If your image is not square, the edges are cut to make it square, and the four corners are always outside the circle. Keep faces and logos in the centre.",
    },
    {
      q: "Is my photo uploaded or stored?",
      a: "No. The file is opened with a local object URL in your browser, measured, and released when you clear it or close the tab. Nothing is sent to a server and no Instagram login is needed.",
    },
    {
      q: "What files can I check?",
      a: "JPG or PNG images. For Instagram itself, a square JPG or PNG at 320 × 320 px or larger is a safe choice. The checker does not resize or edit the file.",
    },
  ],
  related: [
    "/tools/instagram-image-size",
    "/tools/instagram-story-size-checker",
    "/tools/instagram-safe-zone-checker",
    "/tools/instagram-highlight-cover-maker",
    "/tools/facebook-cover-photo-size-checker",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Exact pixel dimensions and aspect ratio",
      "Circle crop preview of the square frame",
      "Verdict against 320 × 320 px",
      "Feed, comment and Story ring previews",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Your profile picture is the right size.",
    mark: "Schedule the next post.",
    text: "Plan posts and Stories with Poskoo, and DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramProfilePictureSizeCheckerPage() {
  return (
    <ToolPageTemplate config={config}>
      <ProfilePhotoChecker
        platform="Instagram"
        recommended={320}
        minSide={320}
        acceptedTypes={["image/jpeg", "image/png"]}
        acceptedLabel="JPG or PNG"
        displayNote="Instagram shows it as a circle about 110 × 110 px in the app"
      />
    </ToolPageTemplate>
  );
}
