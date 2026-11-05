import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import DmLinkGenerator from "./DmLinkGenerator";

const PATH = "/tools/instagram-dm-link-generator";

export const metadata: Metadata = {
  title: { absolute: "Instagram DM Link Generator: Free ig.me Link Maker" },
  description:
    "Free Instagram DM link generator: turn @username into an ig.me link that opens a DM with your account. Copy for bio, Stories and email.",
  alternates: { canonical: PATH },
};

const faqs = [
  {
    q: "What is an ig.me/m link?",
    a: "It is Instagram’s short link format that opens the Instagram app (or website) straight to a new direct message with the username in the URL. Example: https://ig.me/m/yourname sends people to a DM thread with @yourname.",
  },
  {
    q: "How is this different from linking to my Instagram profile?",
    a: "A profile link (instagram.com/yourname) shows your grid and bio. An ig.me/m link skips straight to messaging, which is better when you want leads, support questions or giveaway entries in DMs.",
  },
  {
    q: "Can I use the same link in my bio, Stories and on my website?",
    a: "Yes. The ig.me URL works anywhere you can paste a link: Instagram bio, Story Link sticker, email signature, QR codes and HTML buttons on your site.",
  },
  {
    q: "Does this tool need my Instagram password or Meta login?",
    a: "No. This page only formats a public username into the correct ig.me URL in your browser. It does not connect to Instagram or store your handle.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: BRAND.url },
    { "@type": "ListItem", position: 2, name: "Free tools", item: `${BRAND.url}/tools` },
    { "@type": "ListItem", position: 3, name: "DM link generator", item: `${BRAND.url}${PATH}` },
  ],
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Instagram DM Link Generator",
  url: `${BRAND.url}${PATH}`,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: BRAND.company },
};

const ld = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

export default function InstagramDmLinkGeneratorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(breadcrumbJsonLd) }} />
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
                Instagram DM link <span className="gradient-text">generator</span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-ink-2">
                Turn your @username into an ig.me link that opens a direct message with your account. Copy it for your bio,
                Story sticker, email or website button.
              </p>
            </div>
            <div className="mt-8">
              <DmLinkGenerator />
            </div>
            <p className="mt-6 text-center text-sm text-ink-2">
              More free Instagram tools:{" "}
              <Link href="/tools/instagram-bio-generator" className="font-medium text-brand underline underline-offset-2">
                Bio generator
              </Link>
              {" · "}
              <Link href="/tools/instagram-caption-counter" className="font-medium text-brand underline underline-offset-2">
                Caption counter
              </Link>
            </p>
          </div>
        </section>

        <section className="border-y border-line bg-surface px-4 py-16">
          <div className="mx-auto max-w-3xl space-y-10">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">What is an ig.me link?</h2>
              <p className="mt-4 text-ink-2">
                An ig.me/m URL is Instagram’s official short link for direct messages. When someone taps it on a phone with
                Instagram installed, they land in a new DM conversation with the username you chose—no need to search your
                profile or tap Message manually.
              </p>
              <p className="mt-4 text-ink-2">
                The format is always <code className="rounded bg-bg px-1.5 py-0.5 text-sm">https://ig.me/m/username</code>.
                Use the generator above with your public @handle; we do not log in to Meta or verify the account exists.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Where to use it (bio, Stories, emails, QR codes, website buttons)
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-2">
                <li>
                  <strong className="font-medium text-ink">Bio:</strong> paste the ig.me link or the ready-made bio line so
                  followers can DM you in one tap.
                </li>
                <li>
                  <strong className="font-medium text-ink">Stories:</strong> add a Link sticker (if you have access) and paste
                  the same URL.
                </li>
                <li>
                  <strong className="font-medium text-ink">Email &amp; newsletters:</strong> use the HTML snippet for a
                  “Message on Instagram” button.
                </li>
                <li>
                  <strong className="font-medium text-ink">Website links you share in DMs:</strong> tag them with the{" "}
                  <Link href="/tools/instagram-utm-builder" className="font-medium text-brand underline underline-offset-2">
                    Instagram UTM builder
                  </Link>{" "}
                  so your site analytics shows which bio, Story or auto-DM link sent the visit.
                </li>
                <li>
                  <strong className="font-medium text-ink">QR codes:</strong> encode the ig.me URL so print materials or events
                  open DMs on scan.
                </li>
                <li>
                  <strong className="font-medium text-ink">Website:</strong> drop the link on a contact page, link-in-bio
                  tool or checkout thank-you page.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16">
          <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Want DMs to answer themselves?</h2>
            <p className="mt-3 text-ink-2">
              A click-to-DM link starts the conversation. {BRAND.name} can reply when someone comments a keyword, send welcome
              messages and capture leads—with scheduling and Instagram auto-DM in one place.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/instagram-auto-dm"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-bg px-5 py-2.5 text-sm font-medium hover:text-ink"
              >
                How Instagram auto DM works <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white"
              >
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-16">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Instagram DM link FAQ</h2>
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
