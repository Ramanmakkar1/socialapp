import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { PLANS, PLANS_NOTE, SOFTWARE_APPLICATION_OFFERS } from "@/lib/plans";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const PATH = "/pricing";
const title = `${BRAND.name} Pricing: Free Instagram Scheduler & Auto-DM Plans`;
const description = `Compare ${BRAND.name} plans: start free with Instagram scheduling and 500 auto-DMs a month, then upgrade to Pro or Agency when you grow. No credit card needed.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
};

const free = PLANS[0];
const freeLimits = free.items.filter((i) => !i.soon).map((i) => i.text).join(", ");

const faqs = [
  {
    q: "Is there a free plan?",
    a: `Yes. The ${free.name} plan is ${free.price} ${free.per} and includes ${freeLimits}. Every account starts on it.`,
  },
  {
    q: "Do I need a credit card?",
    a: "No. You can sign up and use the Free plan without entering any card details.",
  },
  {
    q: "Can I cancel any time?",
    a: "Yes. Paid plans will be month to month with no contract, and you can cancel from settings. Today every account is on the Free plan, so there is nothing to cancel.",
  },
  {
    q: "Which platforms are included?",
    a: "Instagram scheduling and auto-DMs work today. Facebook Pages and Threads are coming soon.",
  },
];

const includes = [
  "Built on the official Meta API, so you never share your password",
  "Instagram scheduling calendar",
  "Comment keyword auto-DMs",
  "Lead capture from your DMs",
  "Facebook Pages and Threads scheduling (coming soon)",
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};
const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: BRAND.name,
  url: `${BRAND.url}${PATH}`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: SOFTWARE_APPLICATION_OFFERS,
  publisher: { "@type": "Organization", name: BRAND.company },
};
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BRAND.url}/` },
    { "@type": "ListItem", position: 2, name: "Pricing", item: `${BRAND.url}${PATH}` },
  ],
};
const ld = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

function PricingScene() {
  return (
    <svg viewBox="0 0 320 180" fill="none" aria-hidden="true" className="mx-auto mt-6 h-36 w-full max-w-xs text-brand">
      <ellipse cx="160" cy="156" rx="138" ry="18" fill="currentColor" opacity=".08" />
      <rect x="40" y="25" width="130" height="118" rx="18" className="fill-surface stroke-line" strokeWidth="2" />
      <rect x="40" y="25" width="130" height="26" rx="13" fill="currentColor" opacity=".15" />
      <circle cx="70" cy="22" r="5" fill="currentColor" />
      <circle cx="140" cy="22" r="5" fill="currentColor" />
      {[0, 1, 2, 3].map((c) => [0, 1, 2].map((r) => (
        <rect key={`${c}-${r}`} x={54 + c * 27} y={62 + r * 24} width="18" height="14" rx="4" fill="currentColor" opacity={c === 2 && r === 1 ? 1 : 0.15} />
      )))}
      <path d="M182 40h82a14 14 0 0 1 14 14v28a14 14 0 0 1-14 14h-52l-18 14v-14h-12a14 14 0 0 1-14-14V54a14 14 0 0 1 14-14Z" className="fill-brand-2" opacity=".55" />
      <rect x="194" y="56" width="62" height="6" rx="3" className="fill-surface" />
      <rect x="194" y="70" width="42" height="6" rx="3" className="fill-surface" opacity=".8" />
      <path d="M206 112h44l22 18-22 18h-44a8 8 0 0 1-8-8v-20a8 8 0 0 1 8-8Z" fill="currentColor" />
      <circle cx="252" cy="130" r="4" className="fill-surface" />
      <text x="212" y="136" className="fill-surface" fontSize="16" fontWeight="700">$0</text>
      <path d="M292 30v12m-6-6h12M24 100v10m-5-5h10" className="stroke-brand-2" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <>
      {[faqJsonLd, appJsonLd, breadcrumbJsonLd].map((data) => <script key={data["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(data) }} />)}
      <SiteHeader />
      <main className="flex-1 overflow-x-hidden">
        <section className="relative px-4 pt-10 pb-16 sm:pt-16">
          <div className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-96 max-w-3xl rounded-full bg-[radial-gradient(closest-side,var(--brand),transparent)] opacity-20 blur-3xl" />
          <div className="relative mx-auto max-w-5xl">
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-2"><Link href="/" className="underline underline-offset-2">Home</Link> / Pricing</nav>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-2"><ShieldCheck className="h-3.5 w-3.5 text-brand" />Free plan · no credit card · official Meta API</span>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-6xl">Simple pricing for <span className="gradient-text">Instagram scheduling and auto-DMs</span></h1>
              <p className="mx-auto mt-4 max-w-2xl text-ink-2">Start free today and upgrade only when you need more accounts, posts or DMs.</p>
              <PricingScene />
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {PLANS.map((p) => (
                <div key={p.name} className={`relative flex flex-col rounded-2xl border bg-surface p-6 ${p.popular ? "border-brand shadow-lg" : "border-line"}`}>
                  {p.popular && <span className="btn-primary absolute -top-3 left-6 rounded-full px-3 py-1 text-xs font-medium">Most popular</span>}
                  <h2 className="text-xl font-semibold">{p.name}</h2>
                  <p className="mt-3"><span className="text-4xl font-semibold tracking-tight">{p.price}</span> <span className="text-sm text-ink-2">{p.per}</span></p>
                  <ul className="mt-5 flex-1 space-y-3 text-sm">
                    {p.items.map((i) => (
                      <li key={i.text} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" /><span>{i.text}{i.soon && <small className="text-ink-2"> · coming soon</small>}</span></li>
                    ))}
                  </ul>
                  <Link href={p.ctaHref} className={`mt-6 inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-center font-medium ${p.popular ? "btn-primary" : "border border-line"}`}>{p.cta}</Link>
                </div>
              ))}
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-ink-2">{PLANS_NOTE}</p>
          </div>
        </section>
        <section className="border-y border-line bg-surface px-4 py-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight">What every plan includes</h2>
            <ul className="mt-6 space-y-3 text-ink-2">
              {includes.map((t) => <li key={t} className="flex items-start gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-brand" />{t}</li>)}
            </ul>
          </div>
        </section>
        <section className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Pricing questions</h2>
          <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-surface">
            {faqs.map((f) => <details key={f.q} className="group p-5"><summary className="cursor-pointer list-none font-medium">{f.q}</summary><p className="mt-2 text-sm text-ink-2">{f.a}</p></details>)}
          </div>
        </section>
        <section className="px-4 pb-24">
          <div className="btn-primary mx-auto max-w-5xl rounded-3xl px-6 py-14 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Start free, grow when you are ready</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">Schedule your Instagram posts and turn comments into leads with {BRAND.name}.</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#0d0d14]">Start free <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/instagram-scheduler" className="inline-flex min-h-11 items-center font-medium underline underline-offset-4">Instagram scheduler</Link>
              <Link href="/instagram-auto-dm" className="inline-flex min-h-11 items-center font-medium underline underline-offset-4">Instagram auto-DM</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
