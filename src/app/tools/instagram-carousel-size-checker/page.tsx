import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import CarouselSizeChecker from "./CarouselSizeChecker";

const config: ToolPageConfig = {
  path: "/tools/instagram-carousel-size-checker",
  name: "Instagram carousel size checker",
  crumb: "Carousel size checker",
  title: "Instagram Carousel Size Checker: Match Every Slide Ratio",
  description:
    "Free Instagram carousel size checker: see each slide's pixels, aspect ratio and file size, and spot any slide that breaks the first one's ratio. No upload.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "Instagram carousel size checker", after: "for every slide" },
  lede: "Select your carousel images to see each file's pixel size, aspect ratio and file size, and find out in seconds whether every slide matches the first one.",
  art: "visual",
  artLabel: "A creator measures a photo frame with a ruler next to phone screens of different shapes",
  heroPoints: ["Checks every slide", "Flags mixed ratios", "Nothing is uploaded"],
  toolTitle: "Check your carousel slides",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to check Instagram carousel sizes",
  steps: [
    {
      title: "Select your carousel images",
      text: "Use Select carousel images to pick all the slides at once, in the order you will post them. They are read in your browser and never uploaded.",
      art: "visual",
    },
    {
      title: "Read the summary and each slide",
      text: "The summary shows the slide count, total file size and whether the aspect ratio is Same or Mixed. Each slide card shows its pixels, ratio and file size.",
      art: "analytics",
    },
    {
      title: "Fix any slide marked Different ratio",
      text: "Re-export the flagged slides at the first slide's ratio, press Clear all and select the set again until the summary says Same.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "Catch a mismatched slide before Instagram does",
  features: [
    {
      title: "Compared with slide one",
      text: "Every file is checked against the first slide, the one that sets the carousel frame, and labelled Matches or Different ratio.",
      art: "visual",
    },
    {
      title: "Shape, not just pixels",
      text: "1080×1350 and 1350×1688 are both 4:5, so they pass. The checker compares width-to-height, so you only re-export slides that are really off.",
      art: "analytics",
    },
    {
      title: "Private by design",
      text: "Images are measured with local object URLs and released when you clear them. No upload, no login, no Instagram access.",
      art: "feat-calendar",
    },
  ],
  guide: {
    title: "A practical guide to Instagram carousel sizes in 2026",
    intro:
      "A carousel is one post with several swipeable slides, and it looks tidy only when every slide has the same shape. Here is how the checker works and how to get a carousel right the first time.",
    sections: [
      {
        title: "What this carousel size checker does",
        body: (
          <>
            <p>
              The checker reads the real width and height of every image you select. For each slide it shows the pixel
              size, the aspect ratio (named, such as <code>4:5</code>, when it is a common shape), the ratio as a
              decimal and the file size. The summary adds up the file sizes and says whether the ratios are{" "}
              <b>Same</b> or <b>Mixed</b>.
            </p>
            <p>
              Two slides count as the same ratio when their width-to-height values are within 0.005 of each other, so a
              one-pixel rounding difference passes. The tool does not resize, crop or upload anything, and it cannot
              tell you whether Instagram will accept a file; it reports what your files are.
            </p>
          </>
        ),
      },
      {
        title: "Best practices for carousel sizes in 2026",
        body: (
          <ul>
            <li>
              <b>Pick one ratio for the whole post.</b> The first slide sets the frame, so design every slide at that
              ratio.
            </li>
            <li>
              <b>Portrait is a good default.</b> 1080×1350 (4:5) takes more feed height than square; 1080×1440 (3:4) is
              taller still. The <Link href="/tools/instagram-image-size">Instagram image size guide</Link> lists every
              format.
            </li>
            <li>
              <b>Export at 1080 px wide.</b> Smaller slides can look soft once Instagram scales them up.
            </li>
            <li>
              <b>Export from one template.</b> Using the same canvas for every slide is the simplest way to keep sizes
              identical.
            </li>
            <li>
              <b>Keep the order.</b> Select the files in the order you will post them so slide 1 here is slide 1 on
              Instagram.
            </li>
          </ul>
        ),
      },
      {
        title: "Common Instagram carousel ratios",
        body: (
          <div className={t.tableWrap}>
            <table className={t.table}>
              <thead>
                <tr>
                  <th scope="col">Ratio</th>
                  <th scope="col">Pixels</th>
                  <th scope="col">Use it for</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">1:1</th>
                  <td>1080×1080</td>
                  <td>Classic square carousel</td>
                </tr>
                <tr>
                  <th scope="row">4:5</th>
                  <td>1080×1350</td>
                  <td>Portrait carousel with more feed height</td>
                </tr>
                <tr>
                  <th scope="row">3:4</th>
                  <td>1080×1440</td>
                  <td>Taller portrait frame</td>
                </tr>
                <tr>
                  <th scope="row">9:16</th>
                  <td>1080×1920</td>
                  <td>Better suited to Stories and Reels than feed carousels</td>
                </tr>
              </tbody>
            </table>
          </div>
        ),
      },
      {
        title: "Example: one square slide in a portrait set",
        body: (
          <>
            <p>Select three files: two 1080×1350 exports and a 1080×1080 photo you added last minute. The checker shows:</p>
            <div className={t.example}>
              <p>Aspect ratio: Mixed</p>
              <p>Slide 1: 1080×1350 px · Ratio 4:5 (0.80) · First slide sets the ratio</p>
              <p>Slide 2: 1080×1350 px · Ratio 4:5 (0.80) · Matches the first slide</p>
              <p>Slide 3: 1080×1080 px · Ratio 1:1 (1.00) · Different ratio</p>
            </div>
            <p>
              Crop slide 3 to 1080×1350 with the <Link href="/tools/instagram-image-size">image size crop tool</Link>,
              select the set again, and the summary changes to <b>Same · 4:5</b>.
            </p>
          </>
        ),
      },
      {
        title: "Common carousel mistakes",
        body: (
          <ul>
            <li>Starting with a square slide and following it with portrait slides.</li>
            <li>Mixing photos straight from the camera (often 4:3 or 3:2) with designed 4:5 slides.</li>
            <li>Checking pixel counts but not the shape: different sizes can share a ratio, and similar sizes may not.</li>
            <li>Uploading the slides in a different order from the one you planned.</li>
            <li>
              Leaving the carousel to post manually at a bad time. Plan it with the{" "}
              <Link href="/instagram-scheduler">Instagram scheduler</Link> instead.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram carousel size questions",
  faqs: [
    {
      q: "What size should Instagram carousel images be?",
      a: "A common choice is 1080×1350 px (4:5) or 1080×1080 px (1:1); 1080×1440 px (3:4) is a taller option. Use the same aspect ratio on every slide, so export the whole set from one template.",
    },
    {
      q: "Do all carousel slides need the same aspect ratio?",
      a: "Plan for one ratio across the whole carousel. The first slide sets the frame, and mismatched slides can be cropped or padded as people swipe. This checker compares every file with the first slide.",
    },
    {
      q: "Does this tool upload my images?",
      a: "No. Files are opened locally in your browser, measured, and released when you clear or replace them. Nothing is sent to a server, and no Instagram login is needed.",
    },
    {
      q: "Does it tell me if Instagram will accept my files?",
      a: "No. It reports the actual pixel dimensions, aspect ratio and file size of your images. Instagram decides its own upload limits and crops, so also check the final post in the Instagram app.",
    },
    {
      q: "What counts as the same aspect ratio?",
      a: "The tool compares each slide's width-to-height value with the first slide. A tiny rounding difference, such as 1080×1349 and 1080×1350, counts as the same ratio; a different shape such as 1:1 and 4:5 is flagged as mixed.",
    },
  ],
  related: [
    "/tools/instagram-image-size",
    "/tools/instagram-carousel-maker",
    "/tools/instagram-carousel-splitter",
    "/tools/instagram-post-preview",
    "/tools/instagram-story-size-checker",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Pixel size, aspect ratio and file size for every slide",
      "Compares every slide with the first slide",
      "Same or Mixed ratio summary",
      "Total carousel file size",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Every slide matches.",
    mark: "Schedule the carousel.",
    text: "Plan the whole carousel with Poskoo, and DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramCarouselSizeCheckerPage() {
  return (
    <ToolPageTemplate config={config}>
      <CarouselSizeChecker />
    </ToolPageTemplate>
  );
}
