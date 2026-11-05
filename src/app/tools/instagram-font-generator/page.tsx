import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import FontTool from "./FontTool";

const PATH = "/tools/instagram-font-generator";
export const metadata: Metadata = {
  title: { absolute: "Instagram Font Generator: Copy & Paste Bio Fonts" },
  description: "Create Instagram bio fonts and captions in bold, italic, script and more. Copy and paste Unicode text for free in your browser.",
  alternates: { canonical: PATH },
};
const steps = ["Type or paste your text into the box.", "Choose a font style from the previews and click Copy.", "Paste the text into your Instagram bio or caption."];
const faqs = [
  { q: "Do these fonts work in bios, captions and usernames?", a: "You can use these Unicode styles in Instagram bios and captions, but not in usernames." },
  { q: "Are these fonts searchable and accessible?", a: "Styled characters may not match ordinary search terms, and screen readers may read them badly. Keep important keywords in plain text." },
  { q: "Do fonts count toward the 150-character bio limit?", a: "Yes. Styled characters count toward the limit, and some count as two characters." },
  { q: "Are these fonts safe?", a: "Yes. They are plain Unicode characters that you can copy and paste." },
];
const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
const appJsonLd = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Instagram Font Generator", url: `${BRAND.url}${PATH}`, applicationCategory: "UtilitiesApplication", operatingSystem: "Any", browserRequirements: "Requires JavaScript", isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, publisher: { "@type": "Organization", name: BRAND.company } };
const ld = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

export default function InstagramFontGeneratorPage() {
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
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-2"><ShieldCheck className="h-3.5 w-3.5 text-brand" /> Free / runs in your browser / nothing is uploaded</span>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">Instagram font <span className="gradient-text">generator</span></h1>
              <p className="mx-auto mt-4 max-w-xl text-ink-2">Turn your text into bold, italic, script and more. Copy a style for your Instagram bio or caption.</p>
            </div>
            <div className="mt-8"><FontTool /></div>
            <p className="mt-6 text-center text-sm text-ink-2">More free Instagram tools: <Link href="/tools/instagram-caption-counter" className="font-medium text-brand underline underline-offset-2">Caption counter</Link>{" / "}<Link href="/tools/instagram-line-break-generator" className="font-medium text-brand underline underline-offset-2">Line break generator</Link></p>
          </div>
        </section>
        <section className="border-y border-line bg-surface px-4 py-16"><div className="mx-auto max-w-3xl"><h2 className="text-3xl font-semibold tracking-tight">How to use this tool</h2><ol className="mt-8 list-decimal space-y-4 pl-5 text-ink-2">{steps.map((step) => <li key={step} className="pl-1">{step}</li>)}</ol></div></section>
        <section className="mx-auto max-w-3xl px-4 py-16"><h2 className="text-center text-3xl font-semibold tracking-tight">Instagram font FAQ</h2><div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-surface">{faqs.map((f) => <details key={f.q} className="group p-5"><summary className="cursor-pointer list-none font-medium">{f.q}</summary><p className="mt-2 text-sm text-ink-2">{f.a}</p></details>)}</div></section>
        <section className="px-4 pb-24"><div className="btn-primary mx-auto max-w-5xl rounded-3xl px-6 py-14 text-center"><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Schedule posts and auto-DM everyone who comments</h2><p className="mx-auto mt-3 max-w-xl opacity-90">{BRAND.tagline}</p><Link href="/signup" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#0d0d14]">Start free <ArrowRight className="h-4 w-4" /></Link></div></section>
      </main>
      <SiteFooter />
    </>
  );
}

