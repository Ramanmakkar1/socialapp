import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import UtmBuilder from "./UtmBuilder";

const PATH = "/tools/instagram-utm-builder";

export const metadata: Metadata = {
  title: { absolute: "Instagram UTM Builder: Free Campaign URL Link Generator" },
  description:
    "Free Instagram UTM builder: tag links for your bio, Stories and auto-DMs with source, medium and campaign. Runs in your browser; nothing is saved.",
  alternates: { canonical: PATH },
};

const faqs = [
  {
    q: "Do UTM tags track clicks by themselves?",
    a: "No. UTM parameters only label the visit. Your website needs an analytics tool (such as Google Analytics) to read the labels and report the traffic under your campaign.",
  },
  {
    q: "Which source and medium should I use for Instagram?",
    a: "Use instagram as the source and social as the medium, and keep the spelling identical every time. Use utm_content to tell the bio link, Story sticker and auto-DM apart.",
  },
  {
    q: "What happens if my link already has UTM tags or other parameters?",
    a: "The builder replaces utm_source, utm_medium, utm_campaign and utm_content with your new values, so you never get duplicates. Other parameters and #section anchors stay as they were.",
  },
];

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: BRAND.url },
    { "@type": "ListItem", position: 2, name: "Free tools", item: `${BRAND.url}/tools` },
    { "@type": "ListItem", position: 3, name: "Instagram UTM builder", item: `${BRAND.url}${PATH}` },
  ],
};

function LinkHeroArt() {
  return (
    <svg viewBox="0 0 320 200" role="img" aria-label="Illustration: an Instagram link getting campaign tags" className="h-auto w-full">
      <defs>
        <linearGradient id="utm-g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="var(--brand)" />
          <stop offset="1" stopColor="var(--brand-2)" />
        </linearGradient>
      </defs>
      <rect x="20" y="30" width="120" height="150" rx="22" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
      <circle cx="80" cy="72" r="20" fill="url(#utm-g)" opacity="0.9" />
      <rect x="45" y="104" width="70" height="8" rx="4" fill="var(--line)" />
      <rect x="45" y="122" width="70" height="22" rx="11" fill="url(#utm-g)" />
      <path d="M140 133 C 175 133, 170 70, 205 70" fill="none" stroke="url(#utm-g)" strokeWidth="3" strokeDasharray="6 6" />
      <rect x="190" y="40" width="112" height="120" rx="18" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
      {[["source", 62], ["medium", 92], ["campaign", 122]].map(([label, y]) => (
        <g key={label}>
          <rect x="204" y={Number(y)} width="84" height="20" rx="10" fill="var(--bg)" stroke="var(--brand)" strokeWidth="1.5" />
          <text x="246" y={Number(y) + 14} textAnchor="middle" fontSize="10" fill="var(--ink-2)">utm_{label}</text>
        </g>
      ))}
      <path d="M288 26 l4 8 8 4 -8 4 -4 8 -4 -8 -8 -4 8 -4z" fill="var(--brand-2)" />
      <circle cx="170" cy="170" r="5" fill="var(--brand)" opacity="0.6" />
    </svg>
  );
}

export default function InstagramUtmBuilderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
      <SiteHeader />
      <main className="flex-1 overflow-x-hidden">
        <section className="relative px-4 pt-10 pb-16 sm:pt-16">
          <div className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-96 max-w-3xl rounded-full bg-[radial-gradient(closest-side,var(--brand),transparent)] opacity-20 blur-3xl" />
          <div className="relative mx-auto max-w-5xl">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="text-center lg:text-left">
                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Free · runs in your browser · nothing is saved
                </span>
                <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
                  Instagram <span className="gradient-text">UTM builder</span>
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-ink-2 lg:mx-0">
                  Add campaign tags to the links in your bio, Story stickers and auto-DMs so your website analytics can show
                  which Instagram placement sent each visit.
                </p>
              </div>
              <div className="mx-auto w-full max-w-xs lg:max-w-sm">
                <LinkHeroArt />
              </div>
            </div>
            <div className="mt-10">
              <UtmBuilder />
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-surface px-4 py-16">
          <div className="mx-auto max-w-3xl space-y-10">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Example: one campaign, tagged for the bio</h2>
              <p className="mt-4 text-ink-2">
                Destination <code className="break-all rounded bg-bg px-1.5 py-0.5 text-sm">https://example.com/spring-sale?ref=ig#offer</code>,
                campaign <code className="rounded bg-bg px-1.5 py-0.5 text-sm">spring_sale</code>, Bio preset:
              </p>
              <p className="mt-3 break-all rounded-xl border border-line bg-bg p-4 font-mono text-xs text-brand">
                https://example.com/spring-sale?ref=ig&amp;utm_source=instagram&amp;utm_medium=social&amp;utm_campaign=spring_sale&amp;utm_content=bio_link#offer
              </p>
              <p className="mt-3 text-sm text-ink-2">
                The existing <code>ref</code> parameter and the <code>#offer</code> anchor are kept. Use the same campaign name
                for the Story and auto-DM versions and change only the content value.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Website analytics vs {BRAND.name} click counts</h2>
              <p className="mt-4 text-ink-2">
                UTM tags label traffic; they don’t count anything on their own. Your destination site needs analytics installed
                (for example Google Analytics, following{" "}
                <a
                  href="https://support.google.com/analytics/answer/10917952?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand underline underline-offset-2"
                >
                  Google’s campaign URL guidance
                </a>
                ) to report sessions, sign-ups and sales by source, medium and campaign.
              </p>
              <p className="mt-4 text-ink-2">
                {BRAND.name} counts something different: how many people clicked the link inside an auto-DM it sent. Use both
                together—{BRAND.name} shows which comment rule drives clicks, and your analytics shows what those visitors did
                on your site.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Instagram UTM FAQ</h2>
          <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-surface">
            {faqs.map((f) => (
              <div key={f.q} className="p-5">
                <h3 className="font-medium">{f.q}</h3>
                <p className="mt-2 text-sm text-ink-2">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 pb-24">
          <div className="btn-primary mx-auto max-w-5xl rounded-3xl px-6 py-14 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Send tagged links automatically in Instagram DMs</h2>
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
