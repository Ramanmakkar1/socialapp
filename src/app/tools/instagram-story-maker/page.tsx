import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import StoryMaker from "./StoryMaker";

const config: ToolPageConfig = {
  path: "/tools/instagram-story-maker",
  name: "Instagram Story maker",
  crumb: "Story maker",
  title: "Instagram Story Maker: Free 1080x1920 Story Designs",
  description:
    "Free Instagram Story maker: design a 1080x1920 Story with a photo, text and gradient background. Safe zone guides keep text clear. Runs in your browser.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { before: "Instagram Story", mark: "maker", after: "with safe zone guides" },
  lede: "Design a 1080×1920 Instagram Story with your photo, text and an optional gradient background, then download a PNG. Safe zone guides keep text clear of the profile name and reply bar.",
  art: "visual",
  artLabel: "A creator measures a photo frame with a ruler next to phone screens of different shapes",
  heroPoints: ["1080×1920 PNG", "Safe zone guides", "No watermark"],
  toolTitle: "Design your Story",
  toolNote: "Free · your photo stays on your device",
  stepsTitle: "How to use the Instagram Story maker",
  steps: [
    {
      title: "Add a photo or background",
      text: "Choose an image under Story photo; it fills the 9:16 frame from the centre. Skip the photo and tick Gradient background for a violet-to-pink backdrop instead.",
      art: "visual",
    },
    {
      title: "Write and style the text",
      text: "Type in Text on Story, set Text size from 32 to 120 px, and pick a Text colour: Brand violet, Ink or Paper. The text sits on a band in the middle of the frame.",
      art: "writing",
    },
    {
      title: "Check the zones and download",
      text: "Keep Show safe zone guides on to see the top and bottom bars, then press Download PNG to save instagram-story.png without the guides.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "A Story design that stays readable in the app",
  features: [
    {
      title: "Text kept in the clear band",
      text: "Your text is centred inside the area between the top 250 px and bottom 250 px, so the profile name and reply bar do not cover it.",
      art: "visual",
    },
    {
      title: "Ready-made colour bands",
      text: "Three colour presets put a solid band behind the text, so it stays readable on busy photos without any design work.",
      art: "writing",
    },
    {
      title: "Private and watermark-free",
      text: "Everything is drawn on a canvas in your browser. The PNG is saved straight to your device with no upload, account or watermark.",
      art: "analytics",
    },
  ],
  guide: {
    title: "A practical guide to designing Instagram Stories",
    intro:
      "A Story is a full-screen 9:16 frame, but Instagram draws its own interface over the top and bottom. Good Story designs keep the message in the middle and leave stickers and links to the Instagram app. Here is how this maker works and how to get clean results.",
    sections: [
      {
        title: "What this Story maker does",
        body: (
          <>
            <p>
              The tool draws on a 1080×1920 canvas. The background is white, or a violet-to-pink gradient when you tick{" "}
              <b>Gradient background</b>. If you choose a photo, it is scaled to cover the whole frame from the centre, so
              wide photos lose their sides.
            </p>
            <p>
              Your text wraps onto up to four lines and sits on a full-width colour band, centred in the clear area between
              the safe zones. <b>Download PNG</b> saves <code>instagram-story.png</code> at full size. The tool designs the
              image only; it does not add stickers, music or links.
            </p>
          </>
        ),
      },
      {
        title: "Instagram Story size and safe zones",
        body: (
          <>
            <div className={t.tableWrap}>
              <table className={t.table}>
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Size</th>
                    <th>What sits there</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Full Story</td>
                    <td>1080×1920 (9:16)</td>
                    <td>The size this tool exports.</td>
                  </tr>
                  <tr>
                    <td>Top safe zone</td>
                    <td>About the top 250 px</td>
                    <td>Profile picture, name and progress bar.</td>
                  </tr>
                  <tr>
                    <td>Bottom safe zone</td>
                    <td>About the bottom 250 px</td>
                    <td>Reply bar and message field.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              These are practical margins, not official Instagram numbers, and the overlays vary a little by phone. Test a
              finished design with the <Link href="/tools/instagram-safe-zone-checker">safe zone checker</Link> or the{" "}
              <Link href="/tools/instagram-story-size-checker">Story size checker</Link>.
            </p>
          </>
        ),
      },
      {
        title: "Best practices for Instagram Stories in 2026",
        body: (
          <ul>
            <li>
              <b>One message per frame.</b> Stories are tapped through quickly, so a short line people can read in a second
              or two works better than a paragraph.
            </li>
            <li>
              <b>Leave room for stickers.</b> If you plan a link, poll or question sticker, keep a clear area above the
              reply bar for it.
            </li>
            <li>
              <b>Use a band on busy photos.</b> Solid colour behind text keeps it readable on any background.
            </li>
            <li>
              <b>Keep a consistent style.</b> Reusing one colour preset for a series makes your Stories recognisable.
            </li>
            <li>
              <b>Plan Stories ahead.</b> Poskoo&apos;s <Link href="/instagram-scheduler">Instagram scheduler</Link> can
              publish a Story image or video at a set time; interactive stickers are still added in the app.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: a product drop announcement",
        body: (
          <>
            <p>A shop announcing a release on a product photo could use these settings:</p>
            <div className={t.example}>
              <p>
                Story photo: product flat-lay · Text on Story: &ldquo;New collection drops Friday&rdquo; · Text size: 56 px ·
                Text colour: Brand violet · Show safe zone guides: on
              </p>
            </div>
            <p>
              At 56 px the 27-character line fits on one line on a violet band in the middle of the frame, well clear of
              both tinted zones. Raise the size to 96 px and it wraps onto two lines. After downloading, upload the PNG as a Story and add a countdown or link sticker in the Instagram app,
              placed above the reply bar.
            </p>
          </>
        ),
      },
      {
        title: "Common Story design mistakes",
        body: (
          <ul>
            <li>Putting text or a call to action in the bottom 250 px, where the reply bar covers it.</li>
            <li>Writing long text at a large size; anything past four lines is cut with an ellipsis.</li>
            <li>Using a wide landscape photo, which loses its sides when cropped to 9:16.</li>
            <li>Baking a URL into the image. People cannot tap it; use a link sticker in the app.</li>
            <li>Choosing Paper text on a white background with no photo or gradient.</li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram Story maker questions",
  faqs: [
    {
      q: "What size is an Instagram Story?",
      a: "An Instagram Story is 1080x1920 pixels (9:16). This tool draws on a 1080x1920 canvas and exports that exact PNG.",
    },
    {
      q: "Where are the Story safe zones?",
      a: "Keep roughly the top 250 px (profile name and progress bar) and the bottom 250 px (reply bar) clear. This tool shows those areas as tinted guides and fits your text inside the clear middle band. Guides are not saved in the PNG.",
    },
    {
      q: "Is my photo uploaded to your server?",
      a: "No. Your photo is opened and drawn on a canvas inside your browser, and the PNG is saved straight to your device. Nothing is uploaded and no account is needed.",
    },
    {
      q: "Can I add a clickable link sticker here?",
      a: "No. This tool designs the Story image with your photo and text. Link stickers are an Instagram feature, so add them in the Instagram app after you upload the PNG, and keep them out of the bottom 250 px where the reply bar sits.",
    },
    {
      q: "Can I make a Story without a photo?",
      a: "Yes. Leave Story photo empty and the Story uses a white background, or tick Gradient background for a violet-to-pink gradient behind your text.",
    },
    {
      q: "Can I schedule the Story I make here?",
      a: "Yes. Poskoo's Instagram scheduler can publish one Story image or video at the date and time you choose. Interactive stickers such as links, polls and music still have to be added in the Instagram app.",
    },
  ],
  related: [
    "/tools/instagram-story-size-checker",
    "/tools/instagram-safe-zone-checker",
    "/tools/instagram-reel-cover-maker",
    "/tools/instagram-highlight-cover-maker",
    "/tools/instagram-image-size",
    "/tools/instagram-carousel-maker",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "1080x1920 Story PNG export",
      "Top and bottom safe zone guides",
      "Text with three colour presets and adjustable size",
      "Optional gradient background",
      "Runs in the browser, no upload or watermark",
    ],
  },
  cta: {
    title: "Your Story is designed.",
    mark: "Schedule it.",
    text: "Schedule Stories, posts and Reels with Poskoo and auto-DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramStoryMakerPage() {
  return (
    <ToolPageTemplate config={config}>
      <StoryMaker />
    </ToolPageTemplate>
  );
}
