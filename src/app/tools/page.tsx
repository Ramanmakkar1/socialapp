import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Hash, Image as ImageIcon, Percent, ShieldCheck, TextQuote, UserRound } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const PATH = "/tools";

export const metadata: Metadata = {
  title: { absolute: "Free Instagram Tools: Captions, Bios, Fonts & Image Sizes" },
  description:
    "Free Instagram tools: count caption characters, keep line breaks, write a bio, make fonts, check image sizes and work out your engagement rate.",
  alternates: { canonical: PATH },
};

const tools = [
  {
    href: "/tools/instagram-post-preview",
    title: "Instagram post preview",
    description: "Preview a local photo and caption in a feed mockup, compare square and portrait crops, and copy your caption.",
    icon: ImageIcon,
  },
  {
    href: "/tools/instagram-caption-counter",
    title: "Instagram caption counter",
    description: "Count characters and hashtags as you type and see how close your caption is to the Instagram limit.",
    icon: Hash,
  },
  {
    href: "/tools/instagram-line-break-generator",
    title: "Instagram line break generator",
    description: "Keep blank lines and paragraph spacing in your captions so they don’t collapse into one block of text.",
    icon: TextQuote,
  },
  {
    href: "/tools/instagram-image-size",
    title: "Instagram image size guide",
    description: "Check the right sizes for posts, portraits and Stories, and preview the 1:1, 4:5, 3:4 and 9:16 crops of your photo.",
    icon: ImageIcon,
  },
  {
    href: "/tools/instagram-font-generator",
    title: "Instagram font generator",
    description: "Create and copy Unicode font styles for your Instagram bio and captions.",
    icon: TextQuote,
  },
  {
    href: "/tools/instagram-bio-generator",
    title: "Instagram bio generator",
    description: "Get ready-to-copy Instagram bio ideas for your niche, with emojis, line breaks and a clear call to action.",
    icon: UserRound,
  },
  {
    href: "/tools/instagram-engagement-rate-calculator",
    title: "Instagram engagement rate calculator",
    description: "Calculate engagement rate by followers or reach from likes, comments, saves and shares.",
    icon: Percent,
  },
];

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Free Instagram tools",
  itemListElement: tools.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.title,
    url: `${BRAND.url}${t.href}`,
  })),
};

export default function ToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c") }}
      />
      <SiteHeader />
      <main className="flex-1 overflow-x-hidden">
        <section className="relative px-4 pt-10 pb-16 sm:pt-16">
          <div className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-96 max-w-3xl rounded-full bg-[radial-gradient(closest-side,var(--brand),transparent)] opacity-20 blur-3xl" />
          <div className="relative mx-auto max-w-5xl">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-2">
                <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Free · no signup needed
              </span>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
                Free <span className="gradient-text">Instagram tools</span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-ink-2">
                Small, fast tools for getting a post ready: check your caption length and hashtags, keep the spacing you
                typed, and pick the right image size before you post or schedule with {BRAND.name}.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {tools.map((t) => (
                <div key={t.href} className="flex flex-col rounded-2xl border border-line bg-surface p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-bg text-brand">
                    <t.icon className="h-5 w-5" />
                  </span>
                  <h2 className="mt-4 text-lg font-semibold">{t.title}</h2>
                  <p className="mt-2 flex-1 text-sm text-ink-2">{t.description}</p>
                  <Link
                    href={t.href}
                    className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand underline underline-offset-2"
                  >
                    Open tool <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-24">
          <div className="btn-primary mx-auto max-w-5xl rounded-3xl px-6 py-14 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Schedule posts and auto-DM everyone who comments</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">{BRAND.tagline}</p>
            <Link href="/signup" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#0d0d14]">
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
