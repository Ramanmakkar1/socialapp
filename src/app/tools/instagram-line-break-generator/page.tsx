import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { SiteFooter } from "@/components/SiteFooter";
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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(appJsonLd) }} />
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="btn-primary grid h-8 w-8 place-items-center rounded-lg">
              <Zap className="h-4 w-4" />
            </span>
            {BRAND.name}
          </Link>
          <Link href="/signup" className="btn-primary rounded-full px-4 py-2 text-sm font-medium">
            Start free
          </Link>
        </div>
      </header>
      <main className="flex-1 overflow-x-hidden">
        <section className="relative px-4 pt-10 pb-16 sm:pt-16">
          <div className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-96 max-w-3xl rounded-full bg-[radial-gradient(closest-side,var(--brand),transparent)] opacity-20 blur-3xl" />
          <div className="relative mx-auto max-w-5xl">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-2">
                <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Free · runs in your browser · nothing is uploaded
              </span>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
                Instagram line break <span className="gradient-text">generator</span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-ink-2">
                Format captions so blank lines and spacing survive in the Instagram app. Copy the result and paste it into
                your post or scheduler.
              </p>
            </div>
            <div className="mt-8">
              <LineBreakTool />
            </div>
            <p className="mt-6 text-center text-sm text-ink-2">
              More free Instagram tools:{" "}
              <Link href="/tools/instagram-caption-counter" className="font-medium text-brand underline underline-offset-2">
                Caption counter
              </Link>
              {" · "}
              <Link href="/tools/instagram-image-size" className="font-medium text-brand underline underline-offset-2">
                Image size guide
              </Link>
            </p>
          </div>
        </section>

        <section className="border-y border-line bg-surface px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight">How to use this tool</h2>
            <ol className="mt-8 list-decimal space-y-4 pl-5 text-ink-2">
              {steps.map((s) => (
                <li key={s} className="pl-1">
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-3xl font-semibold tracking-tight">Why Instagram removes spacing</h2>
          <p className="mt-4 text-ink-2">
            When you edit a caption in the Instagram app, trailing spaces at the end of a line are stripped. If you relied
            on spaces or completely empty lines to separate paragraphs, those gaps often disappear after you tap Done. The
            caption still has line breaks, but without a character on the blank line the feed can look like one dense
            paragraph.
          </p>
          <p className="mt-4 text-ink-2">
            This generator normalises line endings, removes trailing spaces that Instagram would drop anyway, and places a
            Braille blank (U+2800) or a dot on each empty line so your layout matches what you designed in the textarea.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-16">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Instagram line break FAQ</h2>
          <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-surface">
            {faqs.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
                <p className="mt-2 text-sm text-ink-2">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="px-4 pb-24">
          <div className="btn-primary mx-auto max-w-5xl rounded-3xl px-6 py-14 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Schedule this caption and auto-DM everyone who comments</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">{BRAND.tagline}</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#0d0d14]">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/tools/instagram-caption-counter" className="font-medium underline underline-offset-4">
                Caption counter
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
