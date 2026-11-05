import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ImagePlus, Scan, TextQuote } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import PostPreviewTool from "./PostPreviewTool";

const PATH = "/tools/instagram-post-preview";
export const metadata: Metadata = {
  title: { absolute: `Instagram Post Preview: Free Feed Mockup Tool | ${BRAND.name}` },
  description: "Preview your Instagram post with a local photo, display handle and caption. Compare square and portrait crops, check line breaks and copy your caption.",
  alternates: { canonical: `${BRAND.url}${PATH}` },
};

const steps = [
  { icon: ImagePlus, title: "1. Choose a photo", text: "Pick a local image and enter your display handle. No Instagram login needed." },
  { icon: TextQuote, title: "2. Shape your story", text: "Write your caption with emoji and line breaks. Expand it to review the full text." },
  { icon: Scan, title: "3. Check the frame", text: "Compare square and portrait crops, then copy your caption for your next post." },
];
const faqs = [
  { q: "Are my images private?", a: "Yes. Images stay in this browser tab through local object URLs. This tool never uploads them or fetches your profile. Images and captions are not saved; refreshing clears the preview." },
  { q: "How accurate is the Instagram preview?", a: "This is a feed mockup, not an official Instagram renderer. Centered cropping and caption truncation are approximations; fonts, spacing and the fold can vary by device and app version. Check the final post in Instagram." },
  { q: "Can I schedule or publish from this tool?", a: "This free tool only previews a single image and copies captions. It does not publish, schedule or carry your draft into signup. Copy your caption before leaving, then explore the scheduler or create an account separately." },
];
const app = {
  "@context": "https://schema.org", "@type": "WebApplication", name: "Instagram post preview",
  url: `${BRAND.url}${PATH}`, applicationCategory: "UtilitiesApplication", operatingSystem: "Any",
  browserRequirements: "Requires JavaScript", isAccessibleForFree: true,
  description: "Preview a local image, display handle and expandable caption with approximate square or portrait cropping. Copy the caption to your clipboard.",
  featureList: ["Local image preview", "Square and portrait crop previews", "Expandable multiline caption", "Caption character count", "Copy caption"],
};

function StudioScene() {
  return (
    <svg viewBox="0 0 320 180" role="img" aria-label="An illustrator arranging a photo and caption beside a preview card" className="mx-auto w-full max-w-xs text-brand motion-safe:transition-transform motion-safe:hover:-translate-y-1">
      <ellipse cx="160" cy="161" rx="142" ry="14" fill="var(--brand)" opacity=".1" />
      <rect x="155" y="16" width="120" height="140" rx="18" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
      <rect x="167" y="44" width="96" height="66" rx="10" fill="var(--brand)" opacity=".15" />
      <circle cx="239" cy="61" r="9" fill="var(--brand-2)" />
      <path d="m172 103 26-33 21 21 15-13 24 25" fill="var(--brand)" />
      <path d="M170 124h65m-65 12h44" stroke="var(--ink-2)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="87" cy="56" r="20" fill="var(--brand-2)" />
      <path d="M66 50q0-34 31-17l13 18-23-9Z" fill="var(--ink)" />
      <path d="M59 143V101q0-27 27-27t30 27l-10 42Z" fill="var(--brand)" />
      <path d="m105 97 26 20 40-36" fill="none" stroke="var(--brand-2)" strokeWidth="12" strokeLinecap="round" />
      <path d="m71 144-8 18m36-18 9 18" stroke="var(--ink)" strokeWidth="10" strokeLinecap="round" />
      <path d="M33 35v16m-8-8h16m252 74v16m-8-8h16" stroke="var(--brand-2)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function InstagramPostPreviewPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(app).replace(/</g, "\\u003c") }} />
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16">
        <nav aria-label="Breadcrumb" className="mt-6 text-sm text-ink-2"><Link href="/tools" className="underline">Free Instagram tools</Link> / Post preview</nav>
        <section className="py-10 sm:py-14">
          <div className="grid items-center gap-6 pb-8 md:grid-cols-[1fr_20rem]">
            <div><p className="mb-4 text-sm font-medium text-brand">Free tool · no signup needed</p><h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Instagram <span className="gradient-text">post preview</span></h1><p className="mt-5 max-w-xl text-ink-2">Find your frame. Refine your first line. See how your photo and caption work together before you post.</p></div>
            <StudioScene />
          </div>
          <PostPreviewTool />
        </section>
        <section aria-labelledby="steps-heading" className="pb-14">
          <h2 id="steps-heading" className="mb-6 text-2xl font-semibold">From idea to feed in three steps</h2>
          <div className="grid gap-4 sm:grid-cols-3">{steps.map(({ icon: Icon, title, text }) => <div key={title} className="rounded-2xl border border-line bg-surface p-6"><Icon aria-hidden="true" className="mb-4 h-9 w-9 text-brand" /><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm text-ink-2">{text}</p></div>)}</div>
        </section>
        <section aria-labelledby="faq-heading" className="mx-auto max-w-3xl pb-12">
          <h2 id="faq-heading" className="text-3xl font-semibold">Before you post</h2>
          {faqs.map(({ q, a }) => <div key={q} className="mt-6 border-b border-line pb-6"><h3 className="font-semibold">{q}</h3><p className="mt-2 text-sm leading-relaxed text-ink-2">{a}</p></div>)}
          <p className="mt-6 flex flex-wrap gap-4 text-sm text-brand"><Link href="/tools/instagram-caption-counter" className="underline">Instagram caption counter</Link><Link href="/tools/instagram-image-size" className="underline">Instagram image size tool</Link><Link href="/instagram-scheduler" className="underline">Explore the Instagram scheduler</Link></p>
        </section>
        <section className="rounded-3xl border border-line bg-brand/10 p-8 text-center sm:p-12">
          <StudioScene /><h2 className="text-3xl font-semibold">Give your next post a head start</h2><p className="mx-auto mt-3 max-w-lg text-ink-2">Copy your caption, keep your original image handy and explore {BRAND.name} for your next step.</p><Link href="/signup" className="btn-primary mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium">Create your account <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
