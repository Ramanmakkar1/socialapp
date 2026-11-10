import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import CarouselSizeChecker from "./CarouselSizeChecker";
import { breadcrumbJsonLd, faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";

const PATH = "/tools/instagram-carousel-size-checker";
const title = "Instagram Carousel Size Checker: Check Slide Ratios | Poskoo";
const description =
  "Check every Instagram carousel slide in your browser: see pixel size, aspect ratio and file size, and whether all slides match before you schedule.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
};

const steps = [
  {
    title: "Select your carousel images",
    text: "Pick two or more image files from your device. They are read locally and never uploaded.",
  },
  {
    title: "Check every slide",
    text: "Each slide shows its pixel dimensions, aspect ratio and file size, plus whether it matches the first slide.",
  },
  {
    title: "Fix mixed ratios before you schedule",
    text: "If the summary says mixed, re-export the odd slides at the same width-to-height ratio as the first one.",
  },
];

const faqs = [
  {
    q: "What size should Instagram carousel images be?",
    a: "Instagram scales carousel images to fit the feed. A common choice is 1080×1350 px (4:5) or 1080×1080 px (1:1). Use the same aspect ratio on every slide, so export the whole set from one template.",
  },
  {
    q: "Do all carousel slides need the same aspect ratio?",
    a: "Plan for one ratio across the whole carousel. Instagram uses the first slide to set the frame, and mismatched slides can be cropped or padded as people swipe. This checker compares every file with the first slide.",
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
    a: "The tool compares each slide's width-to-height value with the first slide. A tiny rounding difference, such as 1080×1349 and 1080×1350, counts as the same ratio; a visibly different shape such as 1:1 and 4:5 is flagged as mixed.",
  },
];

const toolJsonLd = toolSoftwareJsonLd({
  name: "Instagram Carousel Size Checker",
  description,
  url: `${BRAND.url}${PATH}`,
  category: "MultimediaApplication",
});

const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", url: BRAND.url },
  { name: "Free tools", url: `${BRAND.url}/tools` },
  { name: "Carousel size checker", url: `${BRAND.url}${PATH}` },
]);

export default function InstagramCarouselSizeCheckerPage() {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(crumbsJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <nav aria-label="Breadcrumb" className={s.crumbs}>
        <Link href="/tools">Free Instagram tools</Link> / Carousel size checker
      </nav>
      <header className="hero">
        <span className="pill">Free · runs in your browser · nothing is uploaded</span>
        <h1>
          Instagram <em className="s mark">carousel size checker</em>
        </h1>
        <p className="lede">
          Instagram carousel slides should all share one aspect ratio. Select your images to see each file&apos;s pixel
          dimensions, aspect ratio and size, and check in seconds whether every slide matches before you schedule.
        </p>
        <div className="hero-art" style={{ maxWidth: 520 }}>
          <Image
            sizes="(max-width: 520px) 100vw, 520px"
            src="/landing/card-schedule.webp"
            width={900}
            height={900}
            loading="lazy"
            alt="A creator pins post cards onto a weekly calendar next to a smiling alarm clock"
          />
        </div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <CarouselSizeChecker />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        Next step:{" "}
        <Link className={s.vlink} href="/instagram-scheduler">
          schedule your carousel with {BRAND.name}
        </Link>{" "}
        or read{" "}
        <Link className={s.vlink} href="/help/schedule-instagram-carousel">
          how to schedule an Instagram carousel post
        </Link>
        .
      </p>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Three steps</p>
            <h2>How the carousel size checker works</h2>
          </div>
          <div className="cards">
            {steps.map((st, i) => (
              <article key={st.title} className="pcard">
                <span className="no">Step {i + 1}</span>
                <h3>{st.title}</h3>
                <p>{st.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Common Instagram carousel ratios</h2>
            <p>
              Match the shape of every slide, not just the pixel count. A 1080×1350 image and a 1350×1688 image share the
              same 4:5 ratio even though their pixel sizes differ. The checker flags the shape, so you can re-export only
              the slides that break the set.
            </p>
            <ul>
              <li>
                <strong>1:1</strong> — 1080×1080 px, the classic square carousel.
              </li>
              <li>
                <strong>4:5</strong> — 1080×1350 px, a portrait carousel with more feed height.
              </li>
              <li>
                <strong>3:4</strong> — 1080×1440 px, a taller portrait frame.
              </li>
              <li>
                <strong>9:16</strong> — 1080×1920 px, better suited to Stories and Reels than feed carousels.
              </li>
            </ul>
            <p>
              Need help with a single photo first? The{" "}
              <Link className={s.vlink} href="/tools/instagram-image-size">
                Instagram image size guide
              </Link>{" "}
              previews crops, and the{" "}
              <Link className={s.vlink} href="/tools/instagram-post-preview">
                post preview tool
              </Link>{" "}
              shows how a slide looks in the feed.
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Carousel size FAQ</h2>
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
              <h2>Schedule the whole carousel in one go</h2>
              <p>{BRAND.tagline}</p>
              <Link className="btn" href="/instagram-scheduler">
                Explore the Instagram scheduler <span aria-hidden="true">→</span>
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
