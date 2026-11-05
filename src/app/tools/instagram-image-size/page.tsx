import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
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
                Instagram Image Sizes (2026): Post, Story, Reel &amp; Carousel
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-ink-2">
                Pixel dimensions for every major Instagram format, plus a live crop preview for 1:1, 4:5, 3:4 and 9:16
                before you schedule.
              </p>
            </div>
            <div className="mt-8">
              <CropPreview />
            </div>
            <p className="mt-6 text-center text-sm text-ink-2">
              More free Instagram tools:{" "}
              <Link href="/tools/instagram-caption-counter" className="font-medium text-brand underline underline-offset-2">
                Caption counter
              </Link>
              {" · "}
              <Link
                href="/tools/instagram-line-break-generator"
                className="font-medium text-brand underline underline-offset-2"
              >
                Line break generator
              </Link>
            </p>
          </div>
        </section>

        <section className="border-y border-line bg-surface px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight">Instagram image sizes at a glance (2026)</h2>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-bg">
              <table className="w-full min-w-[28rem] text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th scope="col" className="p-4 font-medium">
                      Format
                    </th>
                    <th scope="col" className="p-4 font-medium">
                      Pixels
                    </th>
                    <th scope="col" className="p-4 font-medium">
                      Ratio
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {IG_FORMATS.map((f) => (
                    <tr key={f.id}>
                      <th scope="row" className="p-4 text-left font-medium">
                        {f.label}
                      </th>
                      <td className="p-4 text-ink-2">
                        {f.infoOnly ? "Same as first slide" : `${f.width}×${f.height}`}
                      </td>
                      <td className="p-4 text-ink-2">{f.infoOnly ? "—" : ratioLabel(f.width, f.height)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-3xl font-semibold tracking-tight">Why 4:5 or 3:4 beats square in the feed</h2>
          <p className="mt-4 text-ink-2">
            Square 1:1 posts still look sharp on the grid, but portrait 4:5 and tall 3:4 formats occupy more height in
            the home feed scroll. That extra space helps product shots, people and text overlays stand out without
            changing how Instagram compresses your file. Many creators default to 4:5; use 3:4 when you want the maximum
            vertical tile Instagram allows in the updated grid.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-8">
          <h2 className="text-3xl font-semibold tracking-tight">Reel and Story cover crop</h2>
          <p className="mt-4 text-ink-2">
            Reels and Stories publish at 1080×1920 (9:16). If you export a landscape or square photo, Instagram will
            center-crop or letterbox it. Use the preview above on your still frame so faces stay in frame, and treat the
            top and bottom safe zones seriously — usernames, music labels and reply buttons cover roughly 250 px on each
            end at full resolution.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-16">
          <h2 className="text-3xl font-semibold tracking-tight">Carousel aspect ratio rule</h2>
          <p className="mt-4 text-ink-2">
            When you add multiple images to one post, Instagram locks every slide to the aspect ratio of the first
            image. Plan your shoot or export batch around one size (for example all 4:5 at 1080×1350). The crop tool
            helps you match that ratio before you upload or schedule.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-16">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Instagram image size FAQ</h2>
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
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Schedule this post on your content calendar</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">{BRAND.tagline}</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/app/calendar"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#0d0d14]"
              >
                Open calendar <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/instagram-auto-dm" className="font-medium underline underline-offset-4">
                Instagram auto DM
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
