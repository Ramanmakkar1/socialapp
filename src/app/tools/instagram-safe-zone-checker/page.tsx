import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SAFE_ZONES, toPixels } from "@/lib/safeZones";
import SafeZoneChecker from "./SafeZoneChecker";

const PATH = "/tools/instagram-safe-zone-checker";

export const metadata: Metadata = {
  title: { absolute: "Instagram Reels & Story Safe Zone Checker (Free Template)" },
  description:
    "Free Instagram Reels and Story safe zone checker: see what captions, buttons and the profile bar cover, then download a 1080×1920 PNG template.",
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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Instagram Reels & Story Safe Zone Checker",
  url: `${BRAND.url}${PATH}`,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: BRAND.company },
};

const ld = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

export default function InstagramSafeZoneCheckerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(appJsonLd) }} />
      <SiteHeader />
      <main className="flex-1 overflow-x-hidden">
        <section className="relative px-4 pt-10 pb-16 sm:pt-16">
          <div className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-96 max-w-3xl rounded-full bg-[radial-gradient(closest-side,var(--brand),transparent)] opacity-20 blur-3xl" />
          <div className="relative mx-auto max-w-5xl">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-2">
                <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Free · runs in your browser · nothing is uploaded
              </span>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
                Instagram Reels &amp; Story Safe Zone Checker
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-ink-2">
                Load a cover, Story or video frame and see exactly what the caption, buttons and profile bar will hide.
                Switch between Reels and Story, then download a free 1080×1920 template.
              </p>
            </div>
            <div className="mt-8">
              <SafeZoneChecker />
            </div>
            <p className="mt-6 text-center text-sm text-ink-2">
              More free Instagram tools:{" "}
              <Link href="/tools/instagram-image-size" className="font-medium text-brand underline underline-offset-2">
                Image size guide
              </Link>
              {" · "}
              <Link href="/tools/instagram-post-preview" className="font-medium text-brand underline underline-offset-2">
                Post preview
              </Link>
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-3xl font-semibold tracking-tight">How to check your safe zones</h2>
          <ol className="mt-6 list-decimal space-y-3 pl-5 text-ink-2">
            <li>Load a 9:16 image or video from your device (it stays in your browser).</li>
            <li>Pick Reels or Story to see the shaded areas Instagram covers in that format.</li>
            <li>Raise the overlay opacity or turn on the grid to line up text and faces.</li>
            <li>Move anything important out of the shaded areas in your editor and check again.</li>
            <li>Download the blank template to design inside the safe area next time.</li>
          </ol>
        </section>

        <section className="border-y border-line bg-surface px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight">What each zone hides (1080×1920)</h2>
            <p className="mt-4 text-ink-2">
              These sizes are approximate guides, since Instagram&apos;s interface varies by device and caption length.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {zoneGuide.map((z) => (
                <div key={z.title} className="rounded-2xl border border-line bg-bg p-5">
                  <h3 className="font-medium">{z.title}</h3>
                  <p className="mt-1 text-xs font-medium text-brand">{z.size}</p>
                  <p className="mt-2 text-sm text-ink-2">{z.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-ink-2">
              Need the frame size itself? See the{" "}
              <Link href="/tools/instagram-image-size" className="font-medium text-brand underline underline-offset-2">
                Instagram image size guide
              </Link>{" "}
              for Reel, Story, feed and carousel dimensions, or check a feed post in the{" "}
              <Link href="/tools/instagram-post-preview" className="font-medium text-brand underline underline-offset-2">
                Instagram post preview
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Safe zone FAQ</h2>
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
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Plan and schedule your Reels and Stories</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">{BRAND.tagline}</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#0d0d14]"
              >
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/instagram-scheduler" className="font-medium underline underline-offset-4">
                Instagram scheduler
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
