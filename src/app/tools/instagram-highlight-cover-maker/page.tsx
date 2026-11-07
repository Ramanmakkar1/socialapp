import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import HighlightCoverMaker from "./HighlightCoverMaker";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";

const PATH = "/tools/instagram-highlight-cover-maker";
const description =
  "Free Instagram highlight cover maker: pick a colour and icon, preview the circle crop, and download a 1080x1080 PNG. Runs in your browser, no upload.";

export const metadata: Metadata = {
  title: { absolute: "Instagram Highlight Cover Maker: Free Icon Covers (PNG)" },
  description,
  alternates: { canonical: PATH },
};

const steps = [
  "Open your Instagram profile and find the highlight you want to customise.",
  "Press and hold the highlight circle until the menu appears.",
  "Tap “Edit highlight”.",
  "Tap “Edit cover” and choose the PNG you downloaded from your camera roll.",
  "Crop it so the icon sits in the middle, then tap Done.",
];

const sizes = [
  {
    title: "Story frame: 1080×1920",
    text: "Highlight covers are cropped from a 1080×1920 Story. This tool exports a 1080×1080 square (the circle fills it) or a full 1080×1920 frame with the icon centred.",
  },
  {
    title: "Circle crop from the centre",
    text: "Instagram shows the cover as a circle cut from the centre of the image. Anything outside that circle is hidden, so the design lives in the middle.",
  },
  {
    title: "Keep the icon in the middle ~60%",
    text: "Stay inside the central 60% of the circle. Icons and labels placed near the edge get clipped on some devices and screen sizes.",
  },
];

const faqs = [
  {
    q: "What size are Instagram highlight covers?",
    a: "They are cropped to a circle from a 1080×1920 Story frame. This tool exports a 1080×1080 square PNG (the circle fills it) or a 1080×1920 story PNG with the icon centred, so both work when you choose a cover.",
  },
  {
    q: "Are my images uploaded to your server?",
    a: "No. The cover is drawn on an HTML5 canvas inside your browser and saved straight to your device. Nothing is sent to a server and no account is needed.",
  },
  {
    q: "Why does my cover look cut off at the edges?",
    a: "Instagram only shows a circle from the centre of the image. Keep your icon and label inside the middle ~60% of the circle; anything closer to the edge is cropped out.",
  },
  {
    q: "Can I use the same design for Reels or Story covers?",
    a: "The centred-circle layout works for highlight covers. For full Story or Reel backgrounds, pair this with the safe zone checker to keep text and faces out of the areas Instagram overlays.",
  },
  {
    q: "Is this Instagram highlight cover maker free?",
    a: "Yes. It is 100% free with no watermark, no sign-up and no limit on how many covers you download, including the “download all 16 icons” option.",
  },
];

const toolJsonLd = toolSoftwareJsonLd({
  name: "Instagram Highlight Cover Maker",
  description,
  url: `${BRAND.url}${PATH}`,
  category: "MultimediaApplication",
});

export default function InstagramHighlightCoverMakerPage() {
  return (
    <PublicShell
      breadcrumbs={[
        { name: "Free Instagram tools", path: "/tools" },
        { name: "Highlight Cover Maker", path: PATH },
      ]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />

      <header className="hero">
        <span className="pill">Free · runs in your browser · nothing is uploaded</span>
        <h1>
          Instagram Highlight <em className="s mark">Cover Maker</em>
        </h1>
        <p className="lede">
          Pick a colour and an icon, preview the circle crop, and download a ready-to-use highlight cover PNG.
          No upload, no account, no watermark.
        </p>
        <div className="hero-art">
          <Image
            sizes="(max-width: 1140px) 100vw, 1060px"
            src="/landing/multichannel.webp"
            width={1400}
            height={933}
            loading="lazy"
            alt="A creator designs circular highlight covers for an Instagram profile"
          />
        </div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <HighlightCoverMaker />
      </div>

      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        More free Instagram tools:{" "}
        <Link className={s.vlink} href="/tools/instagram-safe-zone-checker">
          Safe zone checker
        </Link>
        {" · "}
        <Link className={s.vlink} href="/help/schedule-instagram-stories">
          How to schedule Instagram Stories
        </Link>
      </p>

      {/* How to add a highlight cover */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Step by step</p>
              <h2>How to add a highlight cover</h2>
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

      {/* Sizes */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">The sizes</p>
            <h2>Highlight cover sizes</h2>
            <p>Design for the circle, not the square — Instagram crops the rest.</p>
          </div>
          <div className="pains" style={{ maxWidth: 760, marginInline: "auto" }}>
            {sizes.map((z) => (
              <div key={z.title} className="pain">
                <b style={{ whiteSpace: "normal" }}>{z.title}</b>
                <span>{z.text}</span>
              </div>
            ))}
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
            Planning full Story backgrounds too? Check what the profile and reply bars hide with the{" "}
            <Link className={s.vlink} href="/tools/instagram-safe-zone-checker">
              safe zone checker
            </Link>
            , then plan your posts with our{" "}
            <Link className={s.vlink} href="/help/schedule-instagram-stories">
              Instagram Stories guide
            </Link>
            .
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Highlight cover FAQ</h2>
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
              <h2>Schedule your Stories with Poskoo</h2>
              <p>{BRAND.tagline}</p>
              <Link className="btn" href="/signup">
                Start free <span aria-hidden="true">→</span>
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
            <Link className={s.vlink} href="/instagram-scheduler">
              Instagram scheduler
            </Link>
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
