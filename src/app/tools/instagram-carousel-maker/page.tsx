import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import CarouselMaker from "./CarouselMaker";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/tools/instagram-carousel-maker";
const title = "Free Instagram Carousel Maker: Design Slides | Poskoo";
const description =
  "Create editable Instagram carousel slides in your browser: add text, pick colours, reorder the slides and download each one as a correctly sized PNG.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
};

const steps = [
  "Edit the headline and body text on each slide, then pick a background colour that matches your brand.",
  "Add or delete slides and use the arrow buttons to put them in the order you want people to swipe through.",
  "Check the preview grid, then download each slide as a 1080×1350 PNG or save them all at once.",
  "Upload the PNGs to Instagram in the same order as a carousel, and add your caption and hashtags in the app.",
];

const faqs = [
  {
    q: "How do I make an Instagram carousel?",
    a: "Create your slides here, download them as PNGs, then open Instagram, tap the plus button, choose Post, select all the slides in order and share. Instagram shows them as one swipeable carousel.",
  },
  {
    q: "What size are the downloaded carousel slides?",
    a: "Every slide is exported at 1080×1350 pixels, the 4:5 portrait size Instagram recommends for feed posts. All slides share the same size, so the carousel stays consistent as people swipe.",
  },
  {
    q: "Can I edit and reorder the slides?",
    a: "Yes. Select any slide to change its headline, body text and background colour. Use the up and down arrows to move it earlier or later, and the preview grid updates in the same order.",
  },
  {
    q: "Is my text or design uploaded to your server?",
    a: "No. The slides are drawn on a canvas inside your browser and the PNGs are saved straight to your device. Nothing is uploaded and no Instagram login is needed.",
  },
  {
    q: "Can I schedule the carousel with Poskoo?",
    a: "Yes. Download the slides, then use the Instagram scheduler to plan the carousel for a date and time in your time zone. Poskoo publishes it through the official Instagram API.",
  },
];

const toolJsonLd = toolSoftwareJsonLd({
  name: "Instagram Carousel Maker",
  description,
  url: `${BRAND.url}${PATH}`,
  category: "MultimediaApplication",
});

export default function InstagramCarouselMakerPage() {
  return (
    <PublicShell
      breadcrumbs={[
        { name: "Free Instagram tools", path: "/tools" },
        { name: "Carousel maker", path: PATH },
      ]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />

      <header className="hero">
        <span className="pill">Free · runs in your browser · nothing is uploaded</span>
        <h1>
          Instagram <em className="s mark">carousel maker</em>
        </h1>
        <p className="lede">
          Build a small set of clean, editable text-and-colour slides, preview them in order, and download each one as
          a correctly sized 1080×1350 PNG. No upload, no account, no watermark.
        </p>
        <div className="hero-art"><AnimArt name="visual" label="A creator measures a photo frame with a ruler next to phone screens of different shapes" /></div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <CarouselMaker />
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
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Step by step</p>
              <h2>How to make an Instagram carousel</h2>
              <p>
                A carousel is a single post with up to 10 swipeable slides. Keep each slide to one idea and use the
                same size for every image so the post looks tidy in the feed.
              </p>
            </div>
            <ol className="pains" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {steps.map((step, i) => (
                <li key={step} className="pain">
                  <b>Step {i + 1}</b>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram carousel maker FAQ</h2>
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

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Plan the whole carousel with {BRAND.name}</h2>
              <p>
                Download your slides, then schedule the carousel for the best time in your time zone. {BRAND.name}{" "}
                publishes it through the official Instagram API and shows the result in your queue.
              </p>
              <p>
                Splitting one photo instead?{" "}
                <Link href="/tools/instagram-carousel-splitter">Use the carousel splitter</Link>.
              </p>
              <Link className="btn" href="/instagram-scheduler">
                Open the scheduler <span aria-hidden="true">→</span>
              </Link>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-leads.webp"
              width={900}
              height={900}
              loading="lazy"
              alt="Two friends high-five next to a board of new leads"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
