import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import StoryMaker from "./StoryMaker";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/tools/instagram-story-maker";
const description =
  "Free Instagram Story maker: design 1080x1920 Stories with a photo, text and gradient background. Safe zone guides keep text clear. Runs in your browser.";

export const metadata: Metadata = {
  title: { absolute: "Instagram Story Maker: Free 1080x1920 Story Designs" },
  description,
  alternates: { canonical: PATH },
};

const sizes = [
  {
    title: "Full Story: 1080×1920",
    text: "An Instagram Story is a full 9:16 frame, 1080 pixels wide and 1920 pixels tall. That is the size this tool exports.",
  },
  {
    title: "Top safe zone: profile name and progress bar",
    text: "Instagram keeps the top ~250 px for your profile name, picture and Story progress bar. Keep text below it.",
  },
  {
    title: "Bottom safe zone: reply bar",
    text: "Instagram keeps the bottom ~250 px for the reply bar and message field. Keep links, CTAs and important text above it.",
  },
];

const steps = [
  "Tap Choose photo and pick one image from your device. It opens in your browser and is never uploaded.",
  "Add your text, pick a size and a colour preset, or switch on the gradient background.",
  "Keep the text inside the clear band between the two tinted safe zones, then tap Download PNG.",
  "Upload the 1080×1920 PNG to your Instagram Story and add any link sticker, music or poll in the Instagram app.",
];

const faqs = [
  {
    q: "What size is an Instagram Story?",
    a: "An Instagram Story is 1080×1920 pixels (9:16). This tool draws on a 1080×1920 canvas and exports that exact PNG.",
  },
  {
    q: "Where are the Story safe zones?",
    a: "Instagram keeps roughly the top 250 px (profile name and progress bar) and the bottom 250 px (reply bar) clear. This tool shows those areas as tinted guides and fits your text inside the clear middle band. Guides are not saved in the PNG.",
  },
  {
    q: "Is my photo uploaded to your server?",
    a: "No. Your photo is opened and drawn on a canvas inside your browser, and the PNG is saved straight to your device. Nothing is uploaded and no account is needed.",
  },
  {
    q: "Can I add a clickable link sticker here?",
    a: "No. This tool designs the Story image with your photo and text. Clickable link stickers are an Instagram feature — add them in the Instagram app after you upload the PNG, and keep any link out of the bottom 250 px where the reply bar sits.",
  },
];

const toolJsonLd = toolSoftwareJsonLd({
  name: "Instagram Story Maker",
  description,
  url: `${BRAND.url}${PATH}`,
  category: "MultimediaApplication",
});

export default function InstagramStoryMakerPage() {
  return (
    <PublicShell
      breadcrumbs={[
        { name: "Free Instagram tools", path: "/tools" },
        { name: "Story Maker", path: PATH },
      ]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />

      <header className="hero">
        <span className="pill">Free · runs in your browser · nothing is uploaded</span>
        <h1>
          Instagram Story <em className="s mark">maker</em>
        </h1>
        <p className="lede">
          Design a 1080×1920 Instagram Story with your photo, text and an optional gradient background. Safe zone
          guides keep text clear of the profile name and reply bar. Download a PNG — no upload, no account, no
          watermark.
        </p>
        <div className="hero-art"><AnimArt name="visual" label="A creator measures a photo frame with a ruler next to phone screens of different shapes" /></div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <StoryMaker />
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

      {/* Sizes */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">The sizes</p>
            <h2>Instagram Story size and safe zones</h2>
            <p>Design for the full 9:16 frame, but keep the important part between the top and bottom bars.</p>
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

      {/* How to use */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Step by step</p>
              <h2>How to make an Instagram Story</h2>
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
            <h2>Instagram Story maker FAQ</h2>
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
              <h2>Schedule this Story with {BRAND.name}</h2>
              <p>
                Paste one public image or video link, pick the Story format, choose a date and time in your time
                zone, and {BRAND.name} publishes it for you. A Story takes exactly one image or video; interactive
                stickers such as links, polls and music are added in the Instagram app instead.
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
          <p className="small" style={{ textAlign: "center", marginTop: 24 }}>
            <Link className={s.vlink} href="/help/schedule-instagram-stories">
              How to schedule Instagram Stories
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
