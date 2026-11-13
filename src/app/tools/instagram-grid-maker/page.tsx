import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import GridMaker from "./GridMaker";

const config: ToolPageConfig = {
  path: "/tools/instagram-grid-maker",
  name: "Instagram grid maker",
  crumb: "Grid maker",
  title: "Instagram Grid Maker: Split a Photo Into 3, 6 or 9 Posts",
  description:
    "Free Instagram grid maker: split one photo into 3, 6, 9 or 12 tiles in 3:4 or square, numbered in posting order, and download PNGs. No upload, no signup.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "Instagram grid maker:", after: "split one photo into a profile grid" },
  lede: "Split one photo into 3, 6, 9 or 12 tiles that join up into one big picture on your Instagram profile. Tiles are 3:4 (1080×1440) to match the profile grid, or square, and are numbered in the order to post them.",
  art: "visual",
  artLabel: "A creator splits one photo into a grid of profile tiles on a phone",
  heroPoints: ["3 to 12 tiles", "3:4 or square", "Posting order shown"],
  toolTitle: "Split your photo into a profile grid",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to make an Instagram grid from one photo",
  steps: [
    {
      title: "Select an image to split",
      text: "Choose one photo from your device. It is opened in your browser with the canvas API and never uploaded.",
      art: "visual",
    },
    {
      title: "Choose the grid size and tile shape",
      text: "Pick 3 × 1 to 3 × 4 and 3:4 or square tiles. The previews update instantly, numbered in posting order.",
      art: "writing",
    },
    {
      title: "Download and post from the bottom right",
      text: "Press Download on each tile or Download all, then post tile 1 first so the picture joins up on your profile.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "One photo, a whole profile grid",
  features: [
    {
      title: "3:4 tiles that line up",
      text: "The profile grid shows 3:4 thumbnails, so 1080×1440 tiles fill each cell without a cropped edge.",
      art: "visual",
    },
    {
      title: "Posting order built in",
      text: "Every tile is numbered from the bottom right, so you always know which one to post first.",
      art: "feat-calendar",
    },
    {
      title: "Lossless and private",
      text: "Tiles are saved as PNGs straight from your browser. No upload, no account and no watermark.",
      art: "feat-ai",
    },
  ],
  guide: {
    title: "A practical guide to Instagram grid posts in 2026",
    intro:
      "An Instagram grid post is one picture split across several feed posts so it reads as a single image on your profile. The trick is matching the tile shape to the profile grid and posting the tiles in the right order.",
    sections: [
      {
        title: "What a grid maker does",
        body: (
          <>
            <p>
              A grid maker takes one photo, centre-crops it to the shape of the whole grid, then cuts it into equal
              tiles. This tool always uses <b>3 columns</b> and lets you choose 1 to 4 rows, so you get 3, 6, 9 or 12
              posts.
            </p>
            <p>
              Each tile is drawn on a canvas in your browser and saved as a PNG. Nothing is uploaded and no Instagram
              login is needed.
            </p>
          </>
        ),
      },
      {
        title: "Why Instagram grid tiles are 3:4 now",
        body: (
          <>
            <p>
              Since early 2025 the Instagram profile grid shows posts as <b>3:4 portrait thumbnails</b>. A 1080×1440
              tile fills that cell exactly, so neighbouring tiles meet with no gap.
            </p>
            <p>
              Square tiles still work, but the profile crops them to 3:4, so the top and bottom of each tile are cut and
              the picture can show a gap or a shifted edge. Use 3:4 tiles when you want the grid to line up cleanly.
            </p>
          </>
        ),
      },
      {
        title: "What size your photo should be",
        body: (
          <>
            <p>
              Multiply the tile size by the grid. For 3:4 tiles each cell is 1080×1440; for square tiles it is
              1080×1080. The table shows the full photo size for each grid.
            </p>
            <div className={t.tableWrap}>
              <table className={t.table}>
                <thead>
                  <tr>
                    <th scope="col">Grid</th>
                    <th scope="col">Photo for 3:4 tiles</th>
                    <th scope="col">Photo for square tiles</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">3 × 1</th>
                    <td>3240×1440</td>
                    <td>3240×1080</td>
                  </tr>
                  <tr>
                    <th scope="row">3 × 2</th>
                    <td>3240×2880</td>
                    <td>3240×2160</td>
                  </tr>
                  <tr>
                    <th scope="row">3 × 3</th>
                    <td>3240×4320</td>
                    <td>3240×3240</td>
                  </tr>
                  <tr>
                    <th scope="row">3 × 4</th>
                    <td>3240×5760</td>
                    <td>3240×4320</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              A smaller photo still works: the tool upscales it, but the tiles may look soft. The{" "}
              <Link href="/tools/instagram-image-size">Instagram image size guide</Link> lists the other feed sizes.
            </p>
          </>
        ),
      },
      {
        title: "Posting order: start from the bottom right",
        body: (
          <>
            <p>
              Instagram puts your newest post at the top left, so the tile that should sit at the <b>bottom right</b>{" "}
              is posted first. This tool numbers the tiles that way: post 1 is bottom right and the last post is top
              left.
            </p>
            <p>
              Download all saves the files in that order, from post 1 to the last tile, so you can upload them one after
              another without guessing.
            </p>
          </>
        ),
      },
      {
        title: "Common grid mistakes",
        body: (
          <ul>
            <li>
              <b>Posting out of order.</b> One tile in the wrong place breaks the whole picture.
            </li>
            <li>
              <b>Posting something else in between.</b> Any extra post shifts every tile by one, so the grid no longer
              lines up.
            </li>
            <li>
              <b>Text crossing tile edges.</b> Words split across two posts are hard to read in the feed.
            </li>
            <li>
              <b>A weak first tile in the feed.</b> The bottom-right tile is the first thing people see, so give it a
              clear subject.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram grid maker questions",
  faqs: [
    {
      q: "How do I split a photo into an Instagram grid?",
      a: "Select your photo, choose a grid size from 3 × 1 to 3 × 4 and pick 3:4 or square tiles. The tool centre-crops the photo, cuts it into tiles and numbers them in posting order. Download the PNGs and post them from post 1.",
    },
    {
      q: "What order do I post grid tiles in?",
      a: "Post the bottom-right tile first, then work left and up. Instagram puts the newest post at the top left, so the bottom-right tile is post 1 and the top-left tile is the last post.",
    },
    {
      q: "What size should Instagram grid tiles be?",
      a: "Use 1080×1440 for 3:4 tiles to match the profile grid, or 1080×1080 for square tiles. A full 3 × 3 grid is 3240×4320 for 3:4 tiles or 3240×3240 for square tiles.",
    },
    {
      q: "Does the grid maker upload my photo?",
      a: "No. The photo is opened and split in your browser with the canvas API. Nothing is sent to a server, and no Instagram login is needed.",
    },
    {
      q: "Will my grid break if I post something else later?",
      a: "Yes. Any new post shifts the tiles by one, so the picture no longer lines up. Post all the tiles in one session, or in multiples of 3, to keep the grid intact.",
    },
  ],
  related: [
    "/tools/instagram-carousel-splitter",
    "/tools/instagram-image-size",
    "/tools/instagram-post-preview",
    "/tools/social-media-content-calendar",
    "/tools/instagram-caption-generator",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Split one photo into 3, 6, 9 or 12 tiles",
      "3:4 (1080×1440) or square (1080×1080) tiles",
      "Tiles numbered in posting order",
      "PNG download per tile or all at once",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Your grid is ready.",
    mark: "Schedule every tile.",
    text: "Queue all the tiles in order with Poskoo so the grid lands in one go.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramGridMakerPage() {
  return (
    <ToolPageTemplate config={config}>
      <GridMaker />
    </ToolPageTemplate>
  );
}
