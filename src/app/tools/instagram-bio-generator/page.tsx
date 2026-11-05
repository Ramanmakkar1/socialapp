import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import BioTool from "./BioTool";

const PATH = "/tools/instagram-bio-generator";
export const metadata: Metadata = {
  title: { absolute: "Instagram Bio Generator: Free Bio Ideas You Can Copy" },
  description:
    "Free Instagram bio generator with niche templates, optional styled names, and a live 150-character counter. Copy ideas for creators, coaches, and brands.",
  alternates: { canonical: PATH },
};
const steps = [
  "Enter your name, what you do, and a call to action.",
  "Pick a niche to see four bio templates you can customize.",
  "Copy a bio, then paste it into Instagram. Use our line break tool if spacing looks off.",
];
const faqs = [
  {
    q: "What is the Instagram bio character limit?",
    a: "Instagram bios allow up to 150 characters. Emojis and styled Unicode letters each count toward that limit.",
  },
  {
    q: "How do I add line breaks to my Instagram bio?",
    a: "Type your bio with line breaks in Notes or our line break generator, copy the text, then paste into Edit profile > Bio on Instagram.",
  },
  {
    q: "Are fancy fonts safe to use in my bio?",
    a: "Yes. Styled names use standard Unicode characters you copy and paste. Keep important keywords in plain text for search and accessibility.",
  },
  {
    q: "What should I put in a bio call to action?",
    a: "Tell people the one action you want: DM a keyword, tap the link, book a call, or shop. Keep it short and match what you actually offer.",
  },
];
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};
const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Instagram Bio Generator",
  url: `${BRAND.url}${PATH}`,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: BRAND.company },
};
const ld = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

export default function InstagramBioGeneratorPage() {
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
                <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Free / runs in your browser / nothing is uploaded
              </span>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
                Instagram bio <span className="gradient-text">generator</span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-ink-2">
                Get niche bio templates with emojis and line breaks, optional styled names, and a live 150-character counter.
              </p>
            </div>
            <div className="mt-8">
              <BioTool />
            </div>
            <p className="mt-6 text-center text-sm text-ink-2">
              More free Instagram tools:{" "}
              <Link
                href="/tools/instagram-font-generator"
                className="font-medium text-brand underline underline-offset-2"
              >
                Font generator
              </Link>
              {" / "}
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
            <h2 className="text-3xl font-semibold tracking-tight">How to use this tool</h2>
            <ol className="mt-8 list-decimal space-y-4 pl-5 text-ink-2">
              {steps.map((step) => (
                <li key={step} className="pl-1">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Instagram bio FAQ</h2>
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
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Schedule posts and auto-DM everyone who comments
            </h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">{BRAND.tagline}</p>
            <Link
              href="/signup"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#0d0d14]"
            >
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
