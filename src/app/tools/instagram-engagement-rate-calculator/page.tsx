import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { SiteFooter } from "@/components/SiteFooter";
import EngagementCalculator from "./EngagementCalculator";

const PATH = "/tools/instagram-engagement-rate-calculator";

export const metadata: Metadata = {
  title: { absolute: `Free Instagram Engagement Rate Calculator | ${BRAND.name}` },
  description:
    "Free Instagram engagement rate calculator: enter likes, comments, saves and shares, then divide by followers or reach to get your rate in seconds.",
  alternates: { canonical: PATH },
};

const faqs = [
  {
    q: "What is engagement rate on Instagram?",
    a: "Engagement rate is the share of your audience that interacted with a post. You add up likes, comments, saves and shares, divide by a base number (usually followers or reach), and multiply by 100 to get a percentage.",
  },
  {
    q: "How do you calculate engagement rate by reach?",
    a: "Add the post’s likes, comments, saves and shares, divide by how many accounts saw the post (reach), and multiply by 100. Reach-based rates often look higher than follower-based rates because reach is usually smaller than your follower count.",
  },
  {
    q: "Do saves and shares count?",
    a: "Yes. Saves and shares are strong signals that someone valued the post enough to keep or send it. Many calculators count only likes and comments; including saves and shares gives a fuller picture of how a post performed.",
  },
  {
    q: "How can I get more comments on Instagram?",
    a: "Ask a clear question in the caption, use a comment keyword in Stories or Reels, and reply quickly so the thread stays active. Comment-keyword auto-DMs send a link or resource when someone comments a word you choose.",
    linked: { href: "/instagram-auto-dm", label: "Instagram comment auto-DM" },
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: "linked" in f && f.linked ? `${f.a} ${BRAND.url}${f.linked.href}` : f.a,
    },
  })),
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Instagram Engagement Rate Calculator",
  url: `${BRAND.url}${PATH}`,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: BRAND.company },
};

const ld = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

export default function InstagramEngagementRateCalculatorPage() {
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
                Instagram engagement rate <span className="gradient-text">calculator</span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-ink-2">
                Enter likes, comments, saves and shares for one post, choose followers or reach as the base, and get your
                engagement rate as a percentage.
              </p>
            </div>
            <div className="mt-8">
              <EngagementCalculator />
            </div>
            <p className="mt-6 text-center text-sm text-ink-2">
              More free Instagram tools:{" "}
              <Link href="/tools/instagram-caption-counter" className="font-medium text-brand underline underline-offset-2">
                Caption counter
              </Link>
              {" · "}
              <Link href="/tools/instagram-line-break-generator" className="font-medium text-brand underline underline-offset-2">
                Line break generator
              </Link>
            </p>
          </div>
        </section>

        <section className="border-y border-line bg-surface px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight">How engagement rate is calculated</h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-2">
              <p>
                <strong className="font-medium text-ink">By followers</strong> divides total interactions by your follower
                count. It answers: of everyone who follows you, what fraction engaged with this post? It is easy to compare
                across posts when your audience size is stable.
              </p>
              <p>
                <strong className="font-medium text-ink">By reach</strong> divides by how many unique accounts saw the post
                (from Instagram Insights). Reach is often lower than followers, so the same interactions produce a higher
                percentage. Use reach when you care about performance among people who actually saw the content.
              </p>
              <p>
                <strong className="font-medium text-ink">Saves and shares</strong> count toward the numerator because they
                show intent beyond a quick like. If you do not have save or share counts handy, leave those fields blank and
                the calculator treats them as zero.
              </p>
            </div>
            <p className="mt-6 text-xs text-muted">
              Interaction types follow what Instagram reports in Insights. For official metrics definitions, see{" "}
              <a
                href="https://business.facebook.com/business/help"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-ink"
              >
                Meta Business Help Center <ExternalLink className="h-3 w-3" />
              </a>
              .
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Instagram engagement rate questions</h2>
          <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-surface">
            {faqs.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
                {"linked" in f && f.linked ? (
                  <p className="mt-2 text-sm text-ink-2">
                    {f.a}{" "}
                    <Link href={f.linked.href} className="font-medium text-brand underline underline-offset-2">
                      {f.linked.label}
                    </Link>
                    .
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-ink-2">{f.a}</p>
                )}
              </details>
            ))}
          </div>
        </section>

        <section className="px-4 pb-24">
          <div className="btn-primary mx-auto max-w-5xl rounded-3xl px-6 py-14 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Schedule posts and auto-DM everyone who comments</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">{BRAND.tagline}</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#0d0d14]">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/instagram-auto-dm" className="font-medium underline underline-offset-4">
                How Instagram auto DM works
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
