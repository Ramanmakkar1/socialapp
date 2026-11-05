import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import HashtagGenerator from "./HashtagGenerator";

const PATH = "/tools/instagram-hashtag-generator";
const title = "Instagram Hashtag Generator: Free Niche Hashtag Sets";
const description = "Build a free Instagram hashtag set from 15 hand-curated niches. Mix broad and specific tags, add your keyword and copy up to 30 hashtags.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
};

const faqs = [
  {
    q: "How does this Instagram hashtag generator work?",
    a: "Choose one of 15 niches, a count and a mix. The tool selects from hand-curated broad, mid-level and specific tag sets in a repeatable order. It runs in your browser without AI, scraping or uploading your keyword.",
  },
  {
    q: "How many Instagram hashtags should I use?",
    a: "Instagram allows up to 30 hashtags. That is a ceiling, not a target: use only tags that describe your post. It is better to mix broad and specific tags than to stuff a caption with loosely related ones.",
  },
  {
    q: "What changes when I choose a different mix?",
    a: "Balanced spreads tags evenly across the three tiers. More broad favors general topics; more specific favors focused subjects. Each tier has 10 tags, so at 30 tags without an extra keyword, every mix contains the full set. Use a smaller count to see the mix change.",
  },
  {
    q: "Are these trending hashtags or a guarantee of reach?",
    a: "No. These are static editorial suggestions, not live popularity rankings, account checks or a promise of reach. Review every tag for relevance and check it in Instagram before posting. Your content and audience matter more than filling every hashtag slot.",
  },
  {
    q: "Can I add my city or brand as a keyword?",
    a: "Yes. The optional keyword becomes one combined tag, plus its first word for a multi-word phrase. Spaces, hash symbols and punctuation are removed, accented Latin letters are simplified, and duplicates are removed. Keyword tags count toward your selected total.",
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
  name: "Instagram Hashtag Generator",
  url: `${BRAND.url}${PATH}`,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: BRAND.company },
};
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Free Instagram tools", item: `${BRAND.url}/tools` },
    { "@type": "ListItem", position: 2, name: "Instagram hashtag generator", item: `${BRAND.url}${PATH}` },
  ],
};
const ld = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

function HashtagScene() {
  return (
    <svg viewBox="0 0 320 180" fill="none" aria-hidden="true" className="mx-auto mt-6 h-36 w-full max-w-xs text-brand">
      <ellipse cx="160" cy="156" rx="138" ry="18" fill="currentColor" opacity=".08" />
      <rect x="115" y="15" width="150" height="134" rx="20" className="fill-surface stroke-line" strokeWidth="2" />
      <rect x="132" y="33" width="65" height="8" rx="4" fill="currentColor" opacity=".2" />
      <rect x="132" y="55" width="113" height="35" rx="12" fill="currentColor" opacity=".12" />
      <path d="m153 62-5 21m16-21-5 21m-16-14h24m-26 8h24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <rect x="177" y="66" width="54" height="5" rx="2.5" fill="currentColor" opacity=".5" />
      <rect x="177" y="77" width="38" height="4" rx="2" fill="currentColor" opacity=".2" />
      <rect x="132" y="102" width="52" height="22" rx="11" fill="currentColor" />
      <rect x="191" y="102" width="54" height="22" rx="11" className="fill-brand-2" opacity=".5" />
      <circle cx="77" cy="66" r="18" className="fill-brand-2" opacity=".6" />
      <path d="M58 61c0-27 36-29 39-3-14 3-22-5-26-9-1 8-6 11-13 12Z" className="fill-ink" />
      <path d="M53 117c-1-38 44-39 48 0" fill="currentColor" />
      <path d="m95 97 18 8 23-12" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      <path d="m65 115-6 35m28-35 7 35" className="stroke-ink" strokeWidth="11" strokeLinecap="round" />
      <path d="M282 43v14m-7-7h14M35 93v12m-6-6h12" className="stroke-brand-2" strokeWidth="3" strokeLinecap="round" />
      <circle cx="274" cy="126" r="5" fill="currentColor" opacity=".4" />
    </svg>
  );
}

export default function InstagramHashtagGeneratorPage() {
  return (
    <>
      {[faqJsonLd, appJsonLd, breadcrumbJsonLd].map((data) => <script key={data["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(data) }} />)}
      <SiteHeader />
      <main className="flex-1 overflow-x-hidden">
        <section className="relative px-4 pt-10 pb-16 sm:pt-16">
          <div className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-96 max-w-3xl rounded-full bg-[radial-gradient(closest-side,var(--brand),transparent)] opacity-20 blur-3xl" />
          <div className="relative mx-auto max-w-5xl">
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-2"><Link href="/tools" className="underline underline-offset-2">Free Instagram tools</Link> / Hashtag generator</nav>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-2"><ShieldCheck className="h-3.5 w-3.5 text-brand" />Free · no signup · no AI or scraping</span>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-6xl">Instagram Hashtag Generator: <span className="gradient-text">Free Hashtag Sets by Niche</span></h1>
              <p className="mx-auto mt-4 max-w-2xl text-ink-2">Pick your niche, find a useful mix and copy a set for your next post. Hand-curated suggestions, generated entirely in your browser.</p>
              <HashtagScene />
            </div>
            <div className="mt-6"><HashtagGenerator /></div>
          </div>
        </section>
        <section className="border-y border-line bg-surface px-4 py-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight">Choose relevance over a full caption</h2>
            <p className="mt-4 text-ink-2">Instagram allows up to 30 hashtags. It is better to mix broad and specific tags than to stuff them into every post. Start with a smaller set, remove anything unrelated, and add a city, product or brand keyword when it fits.</p>
            <p className="mt-3 text-ink-2">Broad, mid-level and specific describe how focused a topic is. They are editorial categories, not measured search volumes. These sets do not check trends or whether a hashtag is restricted.</p>
          </div>
        </section>
        <section className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Instagram hashtag questions</h2>
          <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-surface">
            {faqs.map((f) => <details key={f.q} className="group p-5"><summary className="cursor-pointer list-none font-medium">{f.q}</summary><p className="mt-2 text-sm text-ink-2">{f.a}</p></details>)}
          </div>
        </section>
        <section className="px-4 pb-24">
          <div className="btn-primary mx-auto max-w-5xl rounded-3xl px-6 py-14 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your hashtags, ready for your next post</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">Copy your favorites, then save them to a scheduled post with {BRAND.name}.</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#0d0d14]">Start free <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/instagram-scheduler" className="inline-flex min-h-11 items-center font-medium underline underline-offset-4">Save them to a scheduled post</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
