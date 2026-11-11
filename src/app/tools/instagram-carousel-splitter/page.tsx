import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import CarouselSplitter from "./CarouselSplitter";
import { breadcrumbJsonLd, faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/tools/instagram-carousel-splitter";
const title = "Instagram Carousel Splitter: Split a Photo Free | Poskoo";
const description =
  "Split one image into equal-width Instagram carousel slides in your browser. Preview every crop, keep the order, and download the slides free.";
export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
};
const faqs = [
  {
    q: "How do I split a photo into Instagram carousel slides?",
    a: "Select your image, choose how many slides you want, and the tool cuts it into equal-width vertical strips. Preview each crop, then download the slides and upload them in order as a carousel.",
  },
  {
    q: "Does the carousel splitter upload my image?",
    a: "No. The image is opened and split in your browser with the canvas API. Nothing is sent to a server, and no Instagram login is needed.",
  },
  {
    q: "What order are the slides in?",
    a: "Slides are numbered left to right, from slide 1 to the last slide. Download them in that order and upload them to Instagram in the same sequence so the carousel reads correctly.",
  },
  {
    q: "What size are the downloaded slides?",
    a: "Each slide keeps the full height of your original image and gets an equal share of its width. For a 1080×1350 photo split into 3 slides, each PNG is about 360×1350 px.",
  },
  {
    q: "Should all carousel slides be the same size?",
    a: "Yes. Instagram carousels look best when every slide shares one aspect ratio. This tool makes equal-width crops from one image, and the carousel size checker confirms the final files match.",
  },
];
const toolJsonLd = toolSoftwareJsonLd({
  name: "Instagram Carousel Splitter",
  description,
  url: `${BRAND.url}${PATH}`,
  category: "MultimediaApplication",
});
const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", url: BRAND.url },
  { name: "Free tools", url: `${BRAND.url}/tools` },
  { name: "Carousel splitter", url: `${BRAND.url}${PATH}` },
]);
export default function InstagramCarouselSplitterPage() {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(crumbsJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <nav aria-label="Breadcrumb" className={s.crumbs}>
        <Link href="/tools">Free Instagram tools</Link> / Carousel splitter
      </nav>
      <header className="hero">
        <span className="pill">Free · runs in your browser · nothing is uploaded</span>
        <h1>
          Instagram <em className="s mark">carousel splitter</em>
        </h1>
        <p className="lede">
          Split one image into equal-width Instagram carousel slides. Choose 2 to 10 slides, preview every crop in order,
          and download the PNGs locally — your photo never leaves your browser.
        </p>
        <div className="hero-art"><AnimArt name="visual" label="A creator measures a photo frame with a ruler next to phone screens of different shapes" /></div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <CarouselSplitter />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        Next step:{" "}
        <Link className={s.vlink} href="/tools/instagram-carousel-size-checker">
          check every slide&apos;s size and ratio
        </Link>{" "}
        or{" "}
        <Link className={s.vlink} href="/instagram-scheduler">
          schedule the carousel with {BRAND.name}
        </Link>
        .
      </p>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Carousel splitter FAQ</h2>
          </div>
          <div className="faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
