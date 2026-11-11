import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { SAFE_ZONES, toPixels } from "@/lib/safeZones";
import SafeZoneChecker from "./SafeZoneChecker";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/tools/instagram-safe-zone-checker";
const description =
  "Free Instagram Reels and Story safe zone checker: see what captions, buttons and the profile bar cover, then download a 1080×1920 PNG template.";

export const metadata: Metadata = {
  title: { absolute: "Instagram Reels & Story Safe Zone Checker (Free Template)" },
  description,
  alternates: { canonical: PATH },
};

const px = (mode: "reels" | "story", id: string) => {
  const zone = SAFE_ZONES[mode].find((z) => z.id === id);
  return zone ? toPixels(zone) : { x: 0, y: 0, w: 0, h: 0 };
};

const reelsTop = px("reels", "top");
const reelsBottom = px("reels", "bottom");
const reelsRight = px("reels", "right");
const storyTop = px("story", "top");
const storyBottom = px("story", "bottom");

const steps = [
  "Load a 9:16 image or video from your device (it stays in your browser).",
  "Pick Reels or Story to see the shaded areas Instagram covers in that format.",
  "Toggle the Reel interface to preview the caption and action buttons, and adjust the overlay opacity or grid to line up text and faces.",
  "Move anything important out of the shaded areas in your editor and check again.",
  "Download the blank template to design inside the safe area next time.",
];

const zoneGuide = [
  {
    title: "Reels: top bar",
    size: `top ~${reelsTop.h} px`,
    text: "The Reels header and camera icon sit here. Short titles placed at the very top are easy to miss and can clash with the status bar.",
  },
  {
    title: "Reels: caption & audio",
    size: `bottom ~${reelsBottom.h} px`,
    text: "Your username, follow button, caption preview, tagged people and the audio label cover the lower third. Longer captions push this area even higher.",
  },
  {
    title: "Reels: like/comment/share buttons",
    size: `right ~${reelsRight.w} px`,
    text: "The vertical column of like, comment, share, save and audio buttons runs down the right edge. Keep faces, prices and text away from it.",
  },
  {
    title: "Story: profile & progress bar",
    size: `top ~${storyTop.h} px`,
    text: "The progress segments, your profile photo, name and the close button sit across the top of every Story frame.",
  },
  {
    title: "Story: reply bar",
    size: `bottom ~${storyBottom.h} px`,
    text: "The 'Send message' reply field, like and share icons (or the link sticker area on ads) fill the bottom of the screen.",
  },
];

const faqs = [
  {
    q: "What is the Instagram Reels safe zone?",
    a: `On a 1080×1920 Reel, keep important text and faces out of roughly the top ${reelsTop.h} px, the bottom ${reelsBottom.h} px and the right ${reelsRight.w} px. That leaves a central area that the caption, audio label and action buttons will not cover.`,
  },
  {
    q: "What is the Instagram Story safe zone?",
    a: `Stories are also 1080×1920. Leave about ${storyTop.h} px clear at the top for the progress and profile bar and about ${storyBottom.h} px at the bottom for the reply bar. The left and right edges are mostly free, but keep a small margin.`,
  },
  {
    q: "Are these safe zones exact?",
    a: "No. They are approximate guides. Instagram's interface changes with the device, screen ratio, app version and caption length, so leave a little extra space around anything important.",
  },
  {
    q: "Is my image or video uploaded anywhere?",
    a: "No. The file is opened with a local object URL in your browser. Nothing is sent to a server, and closing the tab clears it.",
  },
  {
    q: "How do I use the safe-zone template?",
    a: "Download the 1080×1920 PNG, place it as the top layer in Canva, Figma, CapCut or Premiere at low opacity, design inside the clear area, then hide or delete the layer before you export.",
  },
];

const toolJsonLd = toolSoftwareJsonLd({ name: "Instagram Reels & Story Safe Zone Checker", description, url: `${BRAND.url}${PATH}` });

export default function InstagramSafeZoneCheckerPage() {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <header className="hero">
        <span className="pill">Free · runs in your browser · nothing is uploaded</span>
        <h1>
          Instagram Reels &amp; Story <em className="s mark">Safe Zone Checker</em>
        </h1>
        <p className="lede">
          On a 1080×1920 Reel, keep important text and faces out of roughly the top {reelsTop.h} px, bottom {reelsBottom.h} px and right {reelsRight.w} px so Instagram&apos;s caption and buttons do not cover them.
          Load a cover, Story or video frame to check your layout, then download a free template.
        </p>
        <div className="hero-art"><AnimArt name="visual" label="A creator measures a photo frame with a ruler next to phone screens of different shapes" /></div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <SafeZoneChecker />
      </div>
      <p className="small" style={{ maxWidth: 760, margin: "20px auto 0", textAlign: "center" }}>
        The Reel interface overlay adds a sample username, caption and audio label at the bottom, plus like, comment,
        share and save buttons down the right. Toggle it on or off to compare your design with the interface it sits
        behind. When your Reel is ready, plan its publish time with our{" "}
        <Link className={s.vlink} href="/instagram-scheduler">
          Instagram scheduler
        </Link>
        .
      </p>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        More free Instagram tools:{" "}
        <Link className={s.vlink} href="/tools/instagram-image-size">
          Image size guide
        </Link>
        {" · "}
        <Link className={s.vlink} href="/tools/instagram-post-preview">
          Post preview
        </Link>
      </p>

      {/* How to check your safe zones */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Step by step</p>
              <h2>How to check your safe zones</h2>
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

      {/* What each zone hides */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">The zones</p>
            <h2>What each zone hides (1080×1920)</h2>
            <p>These sizes are approximate guides, since Instagram&apos;s interface varies by device and caption length.</p>
          </div>
          <div className="pains" style={{ maxWidth: 760, marginInline: "auto" }}>
            {zoneGuide.map((z) => (
              <div key={z.title} className="pain">
                <b style={{ whiteSpace: "normal" }}>{z.title}</b>
                <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <b style={{ color: "var(--violet)", fontWeight: 600, fontSize: ".88rem" }}>{z.size}</b>
                  {z.text}
                </span>
              </div>
            ))}
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
            Need the frame size itself? See the{" "}
            <Link className={s.vlink} href="/tools/instagram-image-size">
              Instagram image size guide
            </Link>{" "}
            for Reel, Story, feed and carousel dimensions, or check a feed post in the{" "}
            <Link className={s.vlink} href="/tools/instagram-post-preview">
              Instagram post preview
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
            <h2>Safe zone FAQ</h2>
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
              <h2>Plan and schedule your Reels and Stories</h2>
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
