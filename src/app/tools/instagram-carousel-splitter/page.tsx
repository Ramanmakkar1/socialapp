import Link from "next/link";
import { ToolPageTemplate, toolMetadata, type ToolPageConfig } from "@/components/tools/ToolPageTemplate";
import t from "@/components/tools/tools.module.css";
import CarouselSplitter from "./CarouselSplitter";

const config: ToolPageConfig = {
  path: "/tools/instagram-carousel-splitter",
  name: "Instagram carousel splitter",
  crumb: "Carousel splitter",
  title: "Instagram Carousel Splitter: Split a Photo Into Slides",
  description:
    "Free Instagram carousel splitter: cut one wide photo into 2 to 10 equal-width slides for a seamless swipe, preview each and download PNGs. No upload.",
  pill: "Free · runs in your browser · nothing is uploaded",
  h1: { mark: "Instagram carousel splitter:", after: "turn one photo into slides" },
  lede: "Split one image into 2 to 10 equal-width slides for a seamless panorama carousel. Preview every slide in order and download the PNGs; your photo never leaves your browser.",
  art: "visual",
  artLabel: "A creator measures a photo frame with a ruler next to phone screens of different shapes",
  heroPoints: ["2 to 10 slides", "PNG downloads", "Nothing is uploaded"],
  toolTitle: "Split your photo into slides",
  toolNote: "Free · nothing leaves your browser",
  stepsTitle: "How to split a photo into Instagram carousel slides",
  steps: [
    {
      title: "Select an image to split",
      text: "Choose one wide image from your device. It is opened in your browser with the canvas API and never uploaded.",
      art: "visual",
    },
    {
      title: "Choose the number of slides",
      text: "Pick 2 to 10 slides from the Number of slides menu. The previews update instantly, numbered left to right.",
      art: "writing",
    },
    {
      title: "Download and post in order",
      text: "Press Download on each slide or Download all slides, then upload slide 1 to the last slide to Instagram in that order.",
      art: "card-schedule",
    },
  ],
  featuresTitle: "A seamless swipe from one photo",
  features: [
    {
      title: "Equal-width cuts",
      text: "Every slide gets the same share of the width and the full height, so the edges line up as people swipe.",
      art: "visual",
    },
    {
      title: "Clear slide order",
      text: "Files are named slide-1-of-3.png, slide-2-of-3.png and so on, so the upload order is never a guess.",
      art: "feat-calendar",
    },
    {
      title: "Lossless and private",
      text: "Slides are saved as PNGs straight from your browser. No upload, no account and no watermark.",
      art: "feat-ai",
    },
  ],
  guide: {
    title: "A practical guide to split-photo carousels in 2026",
    intro:
      "A split-photo carousel, often called a panorama or seamless carousel, cuts one wide image into slides so the picture continues as people swipe. The trick is sizing the original so every slide comes out at a shape Instagram displays well.",
    sections: [
      {
        title: "What this carousel splitter does",
        body: (
          <>
            <p>
              The splitter cuts your image into vertical strips of equal width. Each slide keeps the{" "}
              <b>full height</b> of the original and gets <b>one equal share of the width</b>. It does not crop, resize
              or add padding, so the slide shape depends entirely on the image you start with.
            </p>
            <p>
              The work happens on a canvas in your browser, and each slide is saved as a PNG. Nothing is uploaded and no
              Instagram login is needed.
            </p>
          </>
        ),
      },
      {
        title: "How to size the original image",
        body: (
          <>
            <p>
              Decide the slide size first, then multiply the width by the number of slides. Instagram carousels look
              best when every slide uses a standard feed shape, such as 4:5.
            </p>
            <div className={t.tableWrap}>
              <table className={t.table}>
                <thead>
                  <tr>
                    <th scope="col">Slides</th>
                    <th scope="col">Original for 4:5 slides</th>
                    <th scope="col">Original for 1:1 slides</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">2</th>
                    <td>2160×1350</td>
                    <td>2160×1080</td>
                  </tr>
                  <tr>
                    <th scope="row">3</th>
                    <td>3240×1350</td>
                    <td>3240×1080</td>
                  </tr>
                  <tr>
                    <th scope="row">4</th>
                    <td>4320×1350</td>
                    <td>4320×1080</td>
                  </tr>
                  <tr>
                    <th scope="row">5</th>
                    <td>5400×1350</td>
                    <td>5400×1080</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Crop or extend your panorama to those dimensions in your editor before you split it. The{" "}
              <Link href="/tools/instagram-image-size">Instagram image size guide</Link> lists the other slide sizes.
            </p>
          </>
        ),
      },
      {
        title: "Best practices for seamless carousels",
        body: (
          <ul>
            <li>
              <b>Make slide 1 work alone.</b> The first slide is what people see in the feed, so it needs a clear subject.
            </li>
            <li>
              <b>Avoid faces and text on the cut lines.</b> A small gap between slides in the app can split a face or a
              word awkwardly.
            </li>
            <li>
              <b>Lead the eye to the right.</b> A road, a horizon or a line of text that continues past the edge invites
              the swipe.
            </li>
            <li>
              <b>Check the set.</b> Run the slides through the{" "}
              <Link href="/tools/instagram-carousel-size-checker">carousel size checker</Link> to confirm they share one
              ratio.
            </li>
          </ul>
        ),
      },
      {
        title: "Example: a 3-slide panorama at 4:5",
        body: (
          <>
            <p>A 3240×1350 panorama split into 3 slides gives three files:</p>
            <div className={t.example}>
              <p>slide-1-of-3.png · 1080×1350 px</p>
              <p>slide-2-of-3.png · 1080×1350 px</p>
              <p>slide-3-of-3.png · 1080×1350 px</p>
            </div>
            <p>
              Each slide is exactly 4:5, so the carousel fills the portrait frame with no cropping. The same 3240×1350
              image split into 2 slides would give two 1620×1350 slides, which is not a standard feed shape, so match the
              slide count to the width you prepared.
            </p>
          </>
        ),
      },
      {
        title: "Common splitting mistakes",
        body: (
          <ul>
            <li>Splitting a normal 4:3 photo, which produces tall, narrow slides that Instagram crops.</li>
            <li>Changing the slide count after sizing the image for a different number of slides.</li>
            <li>Uploading the slides out of order, so the picture no longer lines up.</li>
            <li>
              Forgetting the caption. A short line telling people to swipe helps; write it with the{" "}
              <Link href="/tools/instagram-caption-generator">caption generator</Link>.
            </li>
          </ul>
        ),
      },
    ],
  },
  faqTitle: "Instagram carousel splitter questions",
  faqs: [
    {
      q: "How do I split a photo into Instagram carousel slides?",
      a: "Select your image, choose 2 to 10 slides, and the tool cuts it into equal-width vertical strips. Preview each slide, download them and upload them to Instagram in order as one carousel.",
    },
    {
      q: "Does the carousel splitter upload my image?",
      a: "No. The image is opened and split in your browser with the canvas API. Nothing is sent to a server, and no Instagram login is needed.",
    },
    {
      q: "What order are the slides in?",
      a: "Slides are numbered left to right, from slide 1 to the last slide, and the file names include the position, such as slide-2-of-3.png. Upload them to Instagram in the same order.",
    },
    {
      q: "What size are the downloaded slides?",
      a: "Each slide keeps the full height of your original image and gets an equal share of its width. A 3240×1350 image split into 3 slides gives three 1080×1350 PNGs.",
    },
    {
      q: "What size should my image be for a seamless carousel?",
      a: "Multiply the slide width by the number of slides. For 4:5 slides use 1080×1350 per slide, so a 3-slide panorama should be 3240×1350 and a 4-slide panorama 4320×1350.",
    },
  ],
  related: [
    "/tools/instagram-carousel-size-checker",
    "/tools/instagram-carousel-maker",
    "/tools/instagram-image-size",
    "/tools/instagram-post-preview",
    "/tools/instagram-caption-generator",
  ],
  schema: {
    category: "MultimediaApplication",
    features: [
      "Split one image into 2 to 10 equal-width slides",
      "Slides keep the full image height",
      "Numbered previews in posting order",
      "PNG download per slide or all at once",
      "Runs in the browser, no upload",
    ],
  },
  cta: {
    title: "Your slides are ready.",
    mark: "Schedule the carousel.",
    text: "Plan the panorama post with Poskoo, and DM everyone who comments your keyword.",
  },
};

export const metadata = toolMetadata(config);

export default function InstagramCarouselSplitterPage() {
  return (
    <ToolPageTemplate config={config}>
      <CarouselSplitter />
    </ToolPageTemplate>
  );
}
