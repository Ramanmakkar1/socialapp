import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { PLATFORM_LIMITS } from "@/lib/captionLimits";
import LineBreakTool from "./LineBreakTool";

const PATH = "/tools/instagram-line-break-generator";
const ig = PLATFORM_LIMITS.instagram;
const n = (v: number | null) => (v === null ? "No published limit" : v.toLocaleString("en-US"));

export const metadata: Metadata = {
  title: { absolute: "Instagram Line Break Generator: Add Spaces to Captions" },
  description:
    "Free Instagram line break generator: keep blank lines and paragraph spacing in captions. Runs in your browser; nothing is uploaded.",
  alternates: { canonical: PATH },
};

const steps = [
  "Paste or type your Instagram caption in the box, including the blank lines you want between paragraphs.",
  "Choose invisible Braille blank or a dot for empty lines, then check the live preview.",
  "Click Copy and paste the formatted caption into Instagram before you post or schedule.",
];

const faqs = [
  {
    q: "Why does Instagram remove line breaks in captions?",
    a: "The Instagram mobile app trims trailing spaces on each line when you save a caption. Empty lines and lines that were only spaces can collapse, so paragraphs look like one block of text. Adding a visible or invisible character on blank lines keeps the spacing you intended.",
  },
  {
    q: "What is the invisible character for Instagram line breaks?",
    a: "Many creators use Unicode U+2800 (Braille Pattern Blank). It looks empty in the caption but stops Instagram from merging blank lines. This tool inserts it on every empty line, or you can choose a single dot instead.",
  },
  {
    q: "Does this count toward the Instagram caption character limit?",
    a: `Yes. Every character in the formatted caption counts toward Instagram's ${n(ig.max)}-character limit, including the Braille blank or dot on each empty line. The counter on this page uses the same rules as our caption counter.`,
  },
  {
    q: "Can I schedule a caption after formatting it?",
    a: `Copy the formatted text into Instagram, or schedule the post in ${BRAND.name} after you paste the caption there. Pair this tool with our caption counter if you need to check hashtags and the ${n(ig.max)}-character limit.`,
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
  name: "Instagram Line Break Generator",
  url: `${BRAND.url}${PATH}`,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: BRAND.company },
};

const ld = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

export default function InstagramLineBreakGeneratorPage() {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(appJsonLd) }} />
      <header className="hero">
        <span className="pill">Free · runs in your browser · nothing is uploaded</span>
        <h1>
          Instagram line break <em className="s mark">generator</em>
        </h1>
        <p className="lede">
          Format captions so blank lines and spacing survive in the Instagram app. Copy the result and paste it into
          your post or scheduler.
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
        <LineBreakTool />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        More free Instagram tools:{" "}
        <Link className={s.vlink} href="/tools/instagram-caption-counter">
          Caption counter
        </Link>
        {" · "}
        <Link className={s.vlink} href="/tools/instagram-image-size">
          Image size guide
        </Link>
      </p>

      {/* How to use this tool */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Step by step</p>
              <h2>How to use this tool</h2>
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

      {/* Why Instagram removes spacing */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Why Instagram removes spacing</h2>
            <p>
              When you edit a caption in the Instagram app, trailing spaces at the end of a line are stripped. If you relied
              on spaces or completely empty lines to separate paragraphs, those gaps often disappear after you tap Done. The
              caption still has line breaks, but without a character on the blank line the feed can look like one dense
              paragraph.
            </p>
            <p>
              This generator normalises line endings, removes trailing spaces that Instagram would drop anyway, and places a
              Braille blank (U+2800) or a dot on each empty line so your layout matches what you designed in the textarea.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram line break FAQ</h2>
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
              <h2>Schedule this caption and auto-DM everyone who comments</h2>
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
            <Link className={s.vlink} href="/tools/instagram-caption-counter">
              Caption counter
            </Link>
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
