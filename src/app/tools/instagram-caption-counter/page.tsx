import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { PLATFORM_LIMITS } from "@/lib/captionLimits";
import CaptionCounter from "./CaptionCounter";

const PATH = "/tools/instagram-caption-counter";
const ig = PLATFORM_LIMITS.instagram;
const threads = PLATFORM_LIMITS.threads;
const n = (v: number | null) => (v === null ? "No published limit" : v.toLocaleString("en-US"));

export const metadata: Metadata = {
  // Absolute so the layout's "| brand" suffix does not push it past 60 characters.
  title: { absolute: `Instagram Caption Counter (${n(ig.max)} Limit) + Hashtag Checker` },
  description:
    `Free Instagram caption counter: count characters, hashtags and @mentions as you type, check the ${n(ig.max)} limit and preview the feed cut-off.`,
  alternates: { canonical: PATH },
};

const limitRows: [string, string][] = [
  ["Caption length", `${n(ig.max)} characters`],
  ["Hashtags per post", n(ig.hashtags)],
  ["@mentions per caption", n(ig.mentions)],
  ["Feed cut-off (\"more\")", `About ${n(ig.foldAt)} characters or two lines`],
];

const faqs = [
  {
    q: "How long can an Instagram caption be?",
    a: `An Instagram caption can be up to ${n(ig.max)} characters. Emoji, spaces and line breaks all count. Paste your caption into the counter above to see how many characters you have left.`,
  },
  {
    q: "How many hashtags can you use on Instagram?",
    a: `You can add up to ${n(ig.hashtags)} hashtags to one Instagram post. The counter lists every hashtag it finds and warns you when you go over ${n(ig.hashtags)}. Tags made only of numbers, like #123, are not counted.`,
  },
  {
    q: "Does the first line of an Instagram caption matter?",
    a: `Yes. In the feed, Instagram shows only about the first ${n(ig.foldAt)} characters or two lines, then hides the rest behind "more". Put your hook or call to action there. The preview above shows roughly where the cut falls; the exact point varies by device.`,
  },
  {
    q: "What is the difference between Threads and Instagram caption limits?",
    a: `A Threads post can be up to ${n(threads.max)} characters, while an Instagram caption can be up to ${n(ig.max)}. Switch to the Threads tab in the counter to check a post against the ${n(threads.max)}-character limit.`,
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
  name: "Instagram Caption Character Counter",
  url: `${BRAND.url}${PATH}`,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: BRAND.company },
};

const ld = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

export default function InstagramCaptionCounterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(appJsonLd) }} />
      <SiteHeader />
      <main className="flex-1 overflow-x-hidden">
        {/* Hero + tool */}
        <section className="relative px-4 pt-10 pb-16 sm:pt-16">
          <div className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-96 max-w-3xl rounded-full bg-[radial-gradient(closest-side,var(--brand),transparent)] opacity-20 blur-3xl" />
          <div className="relative mx-auto max-w-5xl">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-2">
                <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Free · runs in your browser · nothing is uploaded
              </span>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
                Instagram caption <span className="gradient-text">character counter</span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-ink-2">
                Count characters, hashtags and @mentions as you type, check the {n(ig.max)}-character limit and see where Instagram cuts your caption with &quot;more&quot;.
              </p>
            </div>
            <div className="mt-8">
              <CaptionCounter />
            </div>
            <p className="mt-6 text-center text-sm text-ink-2">
              More free Instagram tools:{" "}
              <Link href="/tools/instagram-line-break-generator" className="font-medium text-brand underline underline-offset-2">
                Line break generator
              </Link>
              {" · "}
              <Link href="/tools/instagram-image-size" className="font-medium text-brand underline underline-offset-2">
                Image size guide
              </Link>
            </p>
          </div>
        </section>

        {/* Limits table */}
        <section className="border-y border-line bg-surface px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight">Instagram caption limits</h2>
            <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-bg">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-line">
                  {limitRows.map(([label, value]) => (
                    <tr key={label}>
                      <th scope="row" className="p-4 text-left font-medium">{label}</th>
                      <td className="p-4 text-right text-ink-2">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted">
              Length, hashtag and mention limits:{" "}
              <a href={ig.source} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-ink">
                Meta Instagram API docs <ExternalLink className="h-3 w-3" />
              </a>
              . The feed cut-off is an estimate and varies by device.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Instagram caption questions</h2>
          <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-surface">
            {faqs.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
                <p className="mt-2 text-sm text-ink-2">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-24">
          <div className="btn-primary mx-auto max-w-5xl rounded-3xl px-6 py-14 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Schedule this caption and auto-DM everyone who comments</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">{BRAND.tagline}</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#0d0d14]">Start free <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/instagram-auto-dm" className="font-medium underline underline-offset-4">How Instagram auto DM works</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
