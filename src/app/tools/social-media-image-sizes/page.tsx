import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import { platforms, type SizeRow } from "./sizes";
import ImageSizeFinder from "./ImageSizeFinder";

function SizeTable({ rows, label }: { rows: SizeRow[]; label: string }) {
  return (
    <div className={`${t.tableWrap} overflow-x-auto`}>
      <table className={t.table}>
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr>
            <th scope="col">Format</th>
            <th scope="col">Size (px)</th>
            <th scope="col">Aspect ratio</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.format}>
              <th scope="row">{row.format}</th>
              <td>{row.size}</td>
              <td>{row.ratio}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const quickAnswer = (
  <>
    <ImageSizeFinder />
    <h3 className="mt-8 text-lg font-semibold">Quick answer: default sizes</h3>
    <div className={`${t.tableWrap} overflow-x-auto`}>
      <table className={t.table}>
        <caption className="sr-only">Quick answer: default social media image sizes</caption>
        <thead>
          <tr>
            <th scope="col">Format</th>
            <th scope="col">Size (px)</th>
            <th scope="col">Aspect ratio</th>
          </tr>
        </thead>
        <tbody>
          <tr><th scope="row">Feed post</th><td>1080×1350</td><td>4:5</td></tr>
          <tr><th scope="row">Story / Reel / Short</th><td>1080×1920</td><td>9:16</td></tr>
          <tr><th scope="row">Link preview</th><td>1200×630</td><td>1.91:1</td></tr>
          <tr><th scope="row">Profile photo</th><td>Square; see each platform below</td><td>1:1</td></tr>
        </tbody>
      </table>
    </div>
    <p>Last checked: November 2026</p>
  </>
);

const platformTables = platforms.map((platform) => (
  <section key={platform.name} className={t.section} aria-labelledby={`${platform.name.toLowerCase()}-sizes`}>
    <div className="head">
      <p className="eyebrow">Platform cheat sheet</p>
      <h2 id={`${platform.name.toLowerCase()}-sizes`}>{platform.name} image sizes</h2>
      <p>{platform.note}</p>
      <p><Link href={platform.scheduler}>Schedule {platform.name} posts</Link></p>
    </div>
    <SizeTable rows={platform.rows} label={`${platform.name} image sizes in pixels and aspect ratios`} />
  </section>
));

const config: ToolPageConfig = {
  path: "/tools/social-media-image-sizes",
  name: "Social media image sizes",
  crumb: "Social media image sizes",
  title: "Social Media Image Sizes 2026: Every Platform Cheat Sheet",
  description:
    "Use these social media image sizes for 2026: 1080×1350 for feeds, 1080×1920 for vertical video and 1200×630 for links, with tables for 9 platforms.",
  pill: "Free · 9 platforms · updated November 2026",
  h1: { mark: "Social media image sizes 2026", after: "every platform cheat sheet" },
  lede: "The safest all-round sizes in 2026 are 1080×1350 (4:5) for feeds, 1080×1920 (9:16) for Stories, Reels and Shorts, and 1200×630 for link previews.",
  art: "visual",
  artLabel: "A creator compares portrait, square, landscape and vertical image frames for different social platforms",
  heroPoints: ["9 platform tables", "Pixels and aspect ratios", "No sign-up"],
  toolTitle: "Quick answer: default sizes for every platform",
  toolNote: "Free reference · no sign-up",
  stepsTitle: "How to use the social media image size guide",
  steps: [
    { title: "Choose your platform", text: "Find the platform table below, then choose the row for your feed post, video, profile image, banner or link preview.", art: "visual" },
    { title: "Export at the listed size", text: "Set your design canvas to the pixel dimensions in the table. Match the aspect ratio so the platform does not need to crop the image.", art: "writing" },
    { title: "Preview and schedule", text: "Check the crop in the platform app, especially around faces and text, then use the scheduler link in the platform section to plan the post.", art: "card-schedule" },
  ],
  featuresTitle: "One reference for every channel",
  features: [
    { title: "Feed, vertical and wide formats", text: "Compare 4:5 feed portraits, 9:16 Stories and vertical video, 16:9 thumbnails and wide link previews without switching between guides.", art: "visual" },
    { title: "Exact pixels and ratios", text: "Every row gives the format, pixel dimensions and aspect ratio, so you can set up a design canvas correctly the first time.", art: "analytics" },
    { title: "A direct route to publishing", text: "Each platform section links to its scheduler, helping you move from a correctly sized asset to a planned post.", art: "card-schedule" },
  ],
  guide: {
    title: "How to choose social media image sizes in 2026",
    intro: "Start with the aspect ratio the placement expects, then export at the listed pixel size. This avoids unexpected crops and keeps text, faces and logos clear on desktop and mobile screens.",
    sections: [
      {
        title: "Why aspect ratio matters",
        body: <p>Aspect ratio describes the shape of an image independently of its resolution. A 1080×1350 image and an 800×1000 image are both 4:5, but the larger file gives you the standard working size listed above. If the source image has a different shape, crop it deliberately before uploading rather than letting the feed choose the crop.</p>,
      },
      {
        title: "Keep important details away from the edges",
        body: <p>Profile pictures are usually shown as circles, vertical videos have interface elements over the top and bottom, and channel banners appear at different widths across devices. Centre faces and logos, keep text inside the visible area and check YouTube channel art against its 1546×423 safe area.</p>,
      },
      {
        title: "Link previews are not all identical",
        body: <p>Use 1200×630 as the general link-preview default and 1200×627 specifically for LinkedIn. The page sharing the link controls its preview image through its metadata; changing the social post image does not necessarily change the link card.</p>,
      },
    ],
  },
  faqTitle: "Social media image size questions",
  faqs: [
    {
      q: "What is the best image size for all social media?",
      a: "For a feed image that works across most platforms, use 1080×1350 pixels (4:5). For Stories, Reels, TikTok videos and Shorts, use 1080×1920 pixels (9:16). Use 1200×630 as a general link-preview size, but use 1200×627 for LinkedIn.",
    },
    {
      q: "What size is a 4:5 image?",
      a: "A standard 4:5 social media image is 1080×1350 pixels: for every four units of width, there are five units of height. Any dimensions with that same relationship are 4:5, including 800×1000 and 1600×2000.",
    },
    {
      q: "What image size does LinkedIn use?",
      a: "LinkedIn feed images work at 1200×1200 square or 1080×1350 portrait. Use 1200×627 for a link preview, 1128×191 for a company cover and 1584×396 for a personal profile banner.",
    },
    {
      q: "Why is my image cropped on Instagram?",
      a: "Instagram fits images into the aspect ratio of the placement. A wide image in a 4:5 feed slot or a landscape image in a 9:16 Story can be cropped or padded. Export feed portraits at 1080×1350 and Stories or Reels at 1080×1920, then preview the crop before posting.",
    },
  ],
  related: [
    "/tools/instagram-image-size",
    "/tools/instagram-carousel-size-checker",
    "/tools/instagram-safe-zone-checker",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "2026 image size tables for nine social platforms",
      "Pixel dimensions and aspect ratios for feeds, video, profiles and banners",
      "Quick-answer table for common cross-platform formats",
      "Direct links to nine social media schedulers",
    ],
  },
  cta: {
    title: "Your images are ready.",
    mark: "Now put them on the calendar.",
    text: "Plan and schedule your social posts with Poskoo, with a free plan and no credit card required.",
  },
};

export const metadata = toolMetadata(config);

export default function SocialMediaImageSizesPage() {
  return <ToolPageTemplate config={config} afterTool={platformTables}>{quickAnswer}</ToolPageTemplate>;
}
