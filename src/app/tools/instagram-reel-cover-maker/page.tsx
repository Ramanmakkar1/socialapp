import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import ReelCoverMaker from "./ReelCoverMaker";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";

const PATH = "/tools/instagram-reel-cover-maker";
const description =
  "Free Instagram Reel cover maker: add your photo and a bold title, check the 3:4 profile-grid crop, and download a 1080x1920 PNG. Runs in your browser.";

export const metadata: Metadata = {
  title: { absolute: "Instagram Reel Cover Maker: Free 1080x1920 Thumbnails" },
  description,
  alternates: { canonical: PATH },
};

const sizes = [
  {
    title: "Full cover: 1080×1920",
    text: "A Reel cover is a full 9:16 frame, 1080 pixels wide and 1920 pixels tall. That is the size this tool exports.",
  },
  {
    title: "Profile grid: centre 1080×1440",
    text: "On your profile grid the cover is cropped to 3:4, which keeps only the centre 1080×1440. The top and bottom are hidden.",
  },
  {
    title: "Feed: centre 1080×1350",
    text: "In the feed the cover can be cropped to 4:5, the centre 1080×1350. Keep your title and faces in the middle of the frame so they show everywhere.",
  },
];

const steps = [
  "Before you share a new Reel, tap “Edit cover” on the final screen.",
  "Tap “Add from camera roll” and choose the reel-cover.png you downloaded.",
  "Check the grid preview, then tap Done and share your Reel.",
  "Already posted? Open the Reel, tap ••• → Manage → Edit → Edit cover, and pick the new image.",
];

const faqs = [
  {
    q: "What size is an Instagram Reel cover?",
    a: "A Reel cover is 1080×1920 pixels (9:16). The profile grid shows only the centre 1080×1440 (3:4) and the feed can show the centre 1080×1350 (4:5), so keep your title in the middle.",
  },
  {
    q: "Is my photo uploaded to your server?",
    a: "No. Your photo is opened and drawn on a canvas inside your browser, and the PNG is saved straight to your device. Nothing is uploaded and no account is needed.",
  },
  {
    q: "Can I change the cover of a Reel I already posted?",
    a: "Yes. Open the Reel, tap ••• → Manage → Edit → Edit cover, then choose a new image from your camera roll.",
  },
  {
    q: "Why is the title cut off on my profile grid?",
    a: "The grid crops the cover to 3:4, so the top and bottom of the 1080×1920 frame are hidden. This tool places the title in the centre of the grid crop. Turn on the crop guides to check before you download.",
  },
];

const toolJsonLd = toolSoftwareJsonLd({
  name: "Instagram Reel Cover Maker",
  description,
  url: `${BRAND.url}${PATH}`,
  category: "MultimediaApplication",
});

export default function InstagramReelCoverMakerPage() {
  return (
    <PublicShell
      breadcrumbs={[
        { name: "Free Instagram tools", path: "/tools" },
        { name: "Reel Cover Maker", path: PATH },
      ]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />

      <header className="hero">
        <span className="pill">Free · runs in your browser · nothing is uploaded</span>
        <h1>
          Instagram Reel <em className="s mark">cover maker</em>
        </h1>
        <p className="lede">
          Add your photo and a bold title, check the profile-grid and feed crops, and download a 1080×1920 Reel cover
          PNG. No upload, no account, no watermark.
        </p>
        <div className="hero-art">
          <Image
            sizes="(max-width: 1140px) 100vw, 1060px"
            src="/landing/multichannel.webp"
            width={1400}
            height={933}
            loading="lazy"
            alt="A creator plans Reel covers for an Instagram profile grid"
          />
        </div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <ReelCoverMaker />
      </div>

      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        More free Instagram tools:{" "}
        <Link className={s.vlink} href="/tools/instagram-safe-zone-checker">
          Safe zone checker
        </Link>
        {" · "}
        <Link className={s.vlink} href="/help/schedule-instagram-reels">
          How to schedule Instagram Reels
        </Link>
      </p>

      {/* Sizes */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">The sizes</p>
            <h2>Reel cover size</h2>
            <p>Design for the full 9:16 frame, but keep the important part in the middle.</p>
          </div>
          <div className="pains" style={{ maxWidth: 760, marginInline: "auto" }}>
            {sizes.map((z) => (
              <div key={z.title} className="pain">
                <b style={{ whiteSpace: "normal" }}>{z.title}</b>
                <span>{z.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to add a cover */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Step by step</p>
              <h2>How to add a cover to a Reel</h2>
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

      {/* FAQ */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Reel cover FAQ</h2>
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
              <h2>Schedule your Reels with {BRAND.name}</h2>
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
            <Link className={s.vlink} href="/help/schedule-instagram-reels">
              How to schedule Instagram Reels
            </Link>
            {" · "}
            <Link className={s.vlink} href="/tools/instagram-safe-zone-checker">
              Instagram safe zone checker
            </Link>
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
