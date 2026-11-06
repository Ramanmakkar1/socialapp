import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { IG_FORMATS } from "@/lib/igSizes";
import CropPreview from "./CropPreview";

const PATH = "/tools/instagram-image-size";

export const metadata: Metadata = {
  title: { absolute: "Instagram Image Sizes (2026): Post, Story, Reel & Carousel" },
  description:
    "Free 2026 Instagram size guide with pixel dimensions for feed, Story, Reel and carousel posts. Upload a photo and preview 1:1, 4:5, 3:4 and 9:16 crops.",
  alternates: { canonical: PATH },
};

const ratioLabel = (w: number, h: number) => {
  if (w === h) return "1:1";
  if (w === 1080 && h === 1350) return "4:5";
  if (w === 1080 && h === 1440) return "3:4";
  if (w === 1080 && h === 566) return "1.91:1";
  if (w === 1080 && h === 1920) return "9:16";
  return `${w}:${h}`;
};

const steps = [
  "Upload a photo from your device (processed locally, nothing is uploaded).",
  "Choose an Instagram format: 1:1, 4:5, 3:4, 1.91:1, 9:16 or profile circle.",
  "Reposition the subject with the horizontal and vertical sliders, then use Center crop to reset.",
  "Download the exact-size JPG for that format.",
  `Schedule it on your content calendar with ${BRAND.name}.`,
];

const faqs = [
  {
    q: "What size should Instagram feed photos be in 2026?",
    a: "Use 1080 px on the long edge: 1080×1080 for square (1:1), 1080×1350 for portrait (4:5), 1080×1440 for the newer tall portrait (3:4), or 1080×566 for landscape (about 1.91:1). Instagram scales larger uploads down; smaller files may look soft in the feed.",
  },
  {
    q: "Is 4:5 or 3:4 better than square on Instagram?",
    a: "Portrait and tall portrait posts take more vertical space in the home feed than square, so they often get more attention for the same creative. Square still works everywhere (grid, ads, carousels). Pick one aspect ratio per carousel and keep every slide consistent.",
  },
  {
    q: "What size are Instagram Stories and Reels?",
    a: "Stories and Reels use 1080×1920 pixels (9:16). Leave the top and bottom roughly 250 px clear of important text and logos — profile icons, buttons and captions sit in those zones.",
  },
  {
    q: "What aspect ratio must carousel slides use?",
    a: "Every slide in a carousel must match the aspect ratio of the first slide. If slide one is 4:5, all following slides must be 4:5 as well. Mixing ratios inside one carousel is not supported.",
  },
  {
    q: "What size is an Instagram profile picture?",
    a: "Profile photos display at about 320×320 pixels as a circle on phones. Upload at least 320×320 (square source); keep faces and logos centered so the circular crop does not cut them off.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Instagram Image Size Guide & Crop Preview",
  url: `${BRAND.url}${PATH}`,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: BRAND.company },
};

const ld = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

export default function InstagramImageSizePage() {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(appJsonLd) }} />
      <header className="hero">
        <span className="pill">Free · runs in your browser · nothing is uploaded</span>
        <h1>
          Instagram <em className="s mark">Image Sizes</em> (2026): Post, Story, Reel &amp; Carousel
        </h1>
        <p className="lede">
          Pixel dimensions for every major Instagram format, plus a live crop preview you can reposition before
          you download a JPG and schedule.
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
        <CropPreview />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        More free Instagram tools:{" "}
        <Link className={s.vlink} href="/tools/instagram-caption-counter">
          Caption counter
        </Link>
        {" · "}
        <Link className={s.vlink} href="/tools/instagram-line-break-generator">
          Line break generator
        </Link>
      </p>

      {/* How to crop and download */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Step by step</p>
              <h2>How to crop and download</h2>
            </div>
            <div className="pains">
              {steps.map((step, i) => (
                <div key={step} className="pain">
                  <b>Step {i + 1}</b>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sizes table */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Sizes</p>
            <h2>Instagram image sizes at a glance (2026)</h2>
          </div>
          <div className={s.tableWrap} style={{ maxWidth: 760, marginInline: "auto" }}>
            <table className={s.table}>
              <thead>
                <tr className={s.tr}>
                  <th scope="col" className={s.th}>Format</th>
                  <th scope="col" className={s.th}>Pixels</th>
                  <th scope="col" className={s.th}>Ratio</th>
                </tr>
              </thead>
              <tbody>
                {IG_FORMATS.map((f) => (
                  <tr key={f.id} className={s.tr}>
                    <th scope="row" className={s.th} style={{ textAlign: "left" }}>{f.label}</th>
                    <td className={s.td}>{f.infoOnly ? "Same as first slide" : `${f.width}×${f.height}`}</td>
                    <td className={s.td}>{f.infoOnly ? "—" : ratioLabel(f.width, f.height)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 16 }}>
            Posting a Reel or Story at 1080×1920?{" "}
            <Link className={s.vlink} href="/tools/instagram-safe-zone-checker">
              Check Reels safe zones
            </Link>{" "}
            to see what the caption, buttons and profile bar cover.
          </p>
        </div>
      </section>

      {/* Format notes */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Why 4:5 or 3:4 beats square in the feed</h2>
            <p>
              Square 1:1 posts still look sharp on the grid, but portrait 4:5 and tall 3:4 formats occupy more height in
              the home feed scroll. That extra space helps product shots, people and text overlays stand out without
              changing how Instagram compresses your file. Many creators default to 4:5; use 3:4 when you want the maximum
              vertical tile Instagram allows in the updated grid.
            </p>
            <h2>Reel and Story cover crop</h2>
            <p>
              Reels and Stories publish at 1080×1920 (9:16). If you export a landscape or square photo, Instagram will
              center-crop or letterbox it. Use the preview above on your still frame so faces stay in frame, and treat the
              top and bottom safe zones seriously — usernames, music labels and reply buttons cover roughly 250 px on each
              end at full resolution.
            </p>
            <h2>Carousel aspect ratio rule</h2>
            <p>
              When you add multiple images to one post, Instagram locks every slide to the aspect ratio of the first
              image. Plan your shoot or export batch around one size (for example all 4:5 at 1080×1350). The crop tool
              helps you match that ratio before you upload or schedule.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram image size FAQ</h2>
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

      {/* CTA */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Schedule this post on your content calendar</h2>
              <p>{BRAND.tagline}</p>
              <Link className="btn" href="/app/calendar">
                Open calendar <span aria-hidden="true">→</span>
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
          <p className="small" style={{ textAlign: "center", marginTop: 24 }}>
            <Link className={s.vlink} href="/instagram-auto-dm">
              Instagram auto DM
            </Link>
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
