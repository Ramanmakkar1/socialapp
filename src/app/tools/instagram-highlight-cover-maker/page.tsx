import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import HighlightCoverMaker from "./HighlightCoverMaker";

const config: ToolPageConfig = {
  path: "/tools/instagram-highlight-cover-maker",
  name: "Instagram highlight cover maker",
  crumb: "Highlight cover maker",
  title: "Instagram Highlight Cover Maker: Free Icon Covers (PNG)",
  description:
    "Free Instagram highlight cover maker: pick a colour, icon and short label, preview the circle crop and download a 1080×1080 or 1080×1920 PNG. No upload.",
  pill: "Free · runs in your browser · no watermark",
  h1: { mark: "Instagram highlight cover maker", after: "with free icons" },
  answer:
    "This free Instagram highlight cover maker lets you design highlight covers right in your browser: pick a colour, icon and label, preview the circle crop and download a PNG, with no sign-up. Every download is free, with no watermark and no limit.",
  lede: "Pick a colour and an icon, add an optional label, preview the circle crop and download a ready-to-use highlight cover PNG. No upload, no account, no watermark.",
  art: "visual",
  artLabel: "A creator measures a photo frame with a ruler next to phone screens of different shapes",
  heroPoints: ["16 icons, 8 palettes", "Circle-crop preview", "No signup"],
  toolTitle: "Design your highlight cover",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to make an Instagram highlight cover",
  steps: [
    {
      title: "Pick a colour and icon",
      text: "Choose one of 8 palettes or set a Custom background and Custom icon colour, then pick one of 16 icons. Add an optional label of up to 12 characters.",
      art: "visual",
    },
    {
      title: "Choose style and format",
      text: "Set the Background style to solid, gradient or ring, and the Format to square (1080×1080) or story (1080×1920). Check the small round preview.",
      art: "writing",
    },
    {
      title: "Download and set the cover",
      text: "Press Download PNG, or Download all 16 icons in this colour for a matching set. In Instagram, edit the highlight and choose the PNG as its cover.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "A tidy profile in a few clicks",
  features: [
    {
      title: "A matching set at once",
      text: "Download all 16 icons in one colour and style, so every highlight on your profile looks like part of one set.",
      art: "visual",
    },
    {
      title: "See the real crop",
      text: "A 64 px round preview shows how the cover looks as a highlight circle on your profile, before you download it.",
      art: "feat-linkbio",
    },
    {
      title: "Your brand colours",
      text: "Use the colour pickers to match your brand exactly, or start from soft presets like Blush, Sage and Lilac.",
      art: "feat-ai",
    },
  ],
  guide: {
    title: "A practical guide to Instagram highlight covers in 2026",
    intro:
      "Highlights sit just under your bio, so their covers are one of the first things a profile visitor sees. Simple, matching icons make it easy to tell what each highlight holds. Here is how this maker works and how to set the covers up.",
    sections: [
      {
        title: "What this highlight cover maker does",
        body: (
          <>
            <p>
              The maker draws a cover on a canvas in your browser: a background colour (solid, a soft radial gradient,
              or with a thin ring), one of 16 icons and an optional label of up to 12 characters, all centred. The{" "}
              <b>square</b> format exports a 1080×1080 PNG where the circle fills the image; the <b>story</b> format
              exports a 1080×1920 PNG with the design in the middle.
            </p>
            <p>
              Files are named after the icon, such as <code>highlight-cover-heart.png</code>. Nothing is uploaded and
              there is no watermark.
            </p>
          </>
        ),
      },
      {
        title: "How to add a highlight cover on Instagram",
        body: (
          <>
            <ol>
              <li>Save the PNG to your phone&apos;s camera roll.</li>
              <li>Open your profile and press and hold the highlight you want to change.</li>
              <li>Tap Edit highlight, then Edit cover.</li>
              <li>Choose the PNG, centre the icon in the circle and tap Done.</li>
            </ol>
            <p>Menu names can change between app versions, so look for the edit option if the wording differs.</p>
          </>
        ),
      },
      {
        title: "Best practices for highlight covers",
        body: (
          <ul>
            <li>
              <b>Design for the circle.</b> Instagram shows a small circle from the centre of the image, so keep the icon
              and label well inside it.
            </li>
            <li>
              <b>One style for every cover.</b> Same colour, same background style, different icons.
            </li>
            <li>
              <b>Short labels or none.</b> The highlight name already appears under the circle, so a label inside the
              cover is optional.
            </li>
            <li>
              <b>Pick icons that match the content.</b> A calendar for events, a tag for offers, a question mark for FAQs.
              Write the bio above them with the <Link href="/tools/instagram-bio-generator">bio generator</Link>.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: a five-highlight set for a small shop",
        body: (
          <>
            <p>
              Choose the Charcoal palette, the ring style and the square format, then press Download all 16 icons in this
              colour. Keep the five you need:
            </p>
            <div className={t.example}>
              <p>highlight-cover-bag.png · New in</p>
              <p>highlight-cover-tag.png · Offers</p>
              <p>highlight-cover-star.png · Reviews</p>
              <p>highlight-cover-question.png · FAQ</p>
              <p>highlight-cover-pin.png · Find us</p>
            </div>
            <p>
              Every file is 1080×1080 with the same colour and ring, so the row of highlights looks consistent. Name each
              highlight in the app; the cover itself needs no label.
            </p>
          </>
        ),
      },
      {
        title: "Common highlight cover mistakes",
        body: (
          <ul>
            <li>Putting the icon or text near the edge, where the circle crop cuts it off.</li>
            <li>Mixing many colours and styles, so the row looks unplanned.</li>
            <li>Long labels that are unreadable at highlight size.</li>
            <li>
              Leaving highlights empty. Keep adding Stories to them; the{" "}
              <Link href="/instagram-scheduler">Instagram scheduler</Link> helps you plan them.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram highlight cover questions",
  faqs: [
    {
      q: "What size are Instagram highlight covers?",
      a: "Instagram shows a highlight cover as a small circle cropped from the centre of the image. This tool exports a 1080×1080 square PNG, where the circle fills the image, or a 1080×1920 Story-size PNG with the design centred. Both work when you choose a cover.",
    },
    {
      q: "How do I change a highlight cover on Instagram?",
      a: "Save the PNG to your phone, open your profile, press and hold the highlight, tap Edit highlight, then Edit cover. Choose the PNG, centre the icon in the circle and tap Done.",
    },
    {
      q: "Why does my cover look cut off at the edges?",
      a: "Instagram only shows a circle from the centre of the image. Keep your icon and label well inside the middle of the circle; anything near the edge can be cropped out.",
    },
    {
      q: "Are my designs uploaded to your server?",
      a: "No. The cover is drawn on a canvas inside your browser and saved straight to your device. Nothing is sent to a server and no account is needed.",
    },
    {
      q: "Is this Instagram highlight cover maker free?",
      a: "Yes. It is free with no watermark, no signup and no limit on downloads, including the option to download all 16 icons in one colour.",
    },
  ],
  related: [
    "/tools/instagram-story-maker",
    "/tools/instagram-bio-generator",
    "/tools/instagram-story-size-checker",
    "/tools/instagram-reel-cover-maker",
    "/tools/tiktok-caption-generator",
    "/tools/instagram-safe-zone-checker",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "16 icons and 8 colour palettes plus custom colours",
      "Solid, gradient and ring backgrounds",
      "Optional label up to 12 characters",
      "1080×1080 or 1080×1920 PNG export",
      "Download all 16 icons in one colour",
    ],
  },
  cta: {
    title: "Your highlights look sharp.",
    mark: "Now fill them with Stories.",
    text: "Plan your Stories with Poskoo, and DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramHighlightCoverMakerPage() {
  return (
    <ToolPageTemplate
      config={config}
      afterTool={
        <p className={t.prose}>
          Once your covers are ready, schedule the Stories they belong to with the{" "}
          <Link href="/instagram-scheduler">Poskoo Instagram scheduler</Link>.
        </p>
      }
    >
      <HighlightCoverMaker />
    </ToolPageTemplate>
  );
}
