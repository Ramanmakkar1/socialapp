import Link from "next/link";
import type { Metadata } from "next";
import {
  CalendarDays, MessageCircleHeart, Sparkles, BarChart3, Users, Link2, Check, ArrowRight,
  Instagram, Facebook, AtSign, Zap, ShieldCheck,
} from "lucide-react";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const features = [
  { icon: CalendarDays, title: "Schedule everywhere", text: "Plan a week of posts in minutes. One post, tuned for Instagram, Facebook and Threads, published at the right time." },
  { icon: MessageCircleHeart, title: "Comment → DM, instantly", text: "Someone comments “GUIDE”? They get your link in their DMs within seconds — 24/7, on every post." },
  { icon: Sparkles, title: "AI that replies like you", text: "Captions, hashtags and DM replies written in your voice. Follow-up questions answered, calls booked." },
  { icon: Users, title: "Leads, not just likes", text: "Collect emails and phone numbers before sending the link. Every contact lands in your lead list." },
  { icon: Link2, title: "Link in bio + click tracking", text: "A beautiful bio page and tracked links, so you know which post made money." },
  { icon: BarChart3, title: "One dashboard", text: "Reach, comments, DMs sent, clicks and leads — per post, per platform, in one place." },
];

const steps = [
  { n: "1", title: "Connect your accounts", text: "Official Meta login. Secure, one tap, no passwords shared." },
  { n: "2", title: "Schedule a post + add a DM rule", text: "“Comment LINK and I'll DM you” — set it once on the post." },
  { n: "3", title: "Watch leads roll in", text: "The post goes live, the DMs go out, the leads fill your list." },
];

const plans = [
  { name: "Free", price: "$0", per: "forever", items: ["2 social accounts", "10 scheduled posts / month", "500 auto-DMs / month", "Link in bio page"], cta: "Start free" },
  { name: "Pro", price: "$19", per: "/ month", popular: true, items: ["5 social accounts", "Unlimited scheduling", "10,000 auto-DMs / month", "AI captions + AI DM replies", "Email & phone capture", "Click + lead analytics"], cta: "Start 14-day trial" },
  { name: "Agency", price: "$49", per: "/ month", items: ["25 social accounts", "50,000 auto-DMs / month", "Client workspaces", "Approve-before-post", "Team seats", "Priority support"], cta: "Start 14-day trial" },
];

const faqs = [
  { q: "Is it safe for my Instagram account?", a: "Yes. We only use Meta's official API (we never ask for your password) and we respect every platform limit." },
  { q: "Which platforms are supported?", a: "Instagram, Facebook Pages and Threads at launch. YouTube, LinkedIn, Pinterest, TikTok and WhatsApp are coming next." },
  { q: "Do I need a business account?", a: "Instagram auto-DM needs a free Instagram Business or Creator account. Switching takes one minute in the Instagram app." },
  { q: "Can I cancel any time?", a: "Yes. Plans are monthly or yearly and you can cancel in one click." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": BRAND.url + "#org",
      name: BRAND.company,
      url: BRAND.url,
      email: BRAND.supportEmail,
    },
    {
      "@type": "SoftwareApplication",
      name: BRAND.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: BRAND.url,
      description: BRAND.description,
      publisher: { "@id": BRAND.url + "#org" },
      offers: plans.map((p) => ({
        "@type": "Offer",
        name: p.name,
        price: p.price.replace("$", ""),
        priceCurrency: "USD",
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="btn-primary grid h-8 w-8 place-items-center rounded-lg"><Zap className="h-4 w-4" /></span>
          {BRAND.name}
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-ink-2 md:flex">
          <a href="#features" className="hover:text-ink">Features</a>
          <a href="#how" className="hover:text-ink">How it works</a>
          <a href="#pricing" className="hover:text-ink">Pricing</a>
          <a href="#faq" className="hover:text-ink">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm text-ink-2 hover:text-ink sm:block">Log in</Link>
          <Link href="/signup" className="btn-primary rounded-full px-4 py-2 text-sm font-medium">Start free</Link>
        </div>
      </div>
    </header>
  );
}

function HeroMock() {
  return (
    <div className="glow relative mx-auto mt-14 max-w-5xl overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs text-muted">{BRAND.name} · This week</span>
      </div>
      <div className="grid gap-px bg-line md:grid-cols-[1.4fr_1fr]">
        <div className="bg-surface p-5">
          <div className="mb-3 text-sm font-medium">Content calendar</div>
          <div className="grid grid-cols-7 gap-2 text-[11px]">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
              <div key={d} className="min-h-28 rounded-lg bg-surface-2 p-2">
                <div className="mb-2 text-muted">{d}</div>
                {i % 2 === 0 && (
                  <div className="mb-1.5 rounded-md border border-line bg-surface p-1.5">
                    <div className="flex items-center gap-1 text-brand"><Instagram className="h-3 w-3" /> 6:00 pm</div>
                    <div className="mt-1 truncate text-ink-2">Reel · 5 tips</div>
                  </div>
                )}
                {i % 3 === 1 && (
                  <div className="rounded-md border border-line bg-surface p-1.5">
                    <div className="flex items-center gap-1 text-brand-2"><Facebook className="h-3 w-3" /> 9:30 am</div>
                    <div className="mt-1 truncate text-ink-2">Carousel</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-surface p-5">
          <div className="mb-3 text-sm font-medium">Auto-DM · Reel “5 tips”</div>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl bg-surface-2 p-3"><span className="font-medium">@maya.fit</span> <span className="text-ink-2">commented</span> “GUIDE” 🔥</div>
            <div className="ml-6 rounded-xl btn-primary p-3">Hey Maya! Here’s your free guide 👉 link.to/guide — want the 7-day plan too?</div>
            <div className="rounded-xl bg-surface-2 p-3">yes please! 🙌</div>
            <div className="ml-6 rounded-xl border border-line p-3 text-ink-2"><Sparkles className="mr-1 inline h-3.5 w-3.5 text-brand" />AI: Sure! What’s the best email to send it to?</div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[["1,284", "DMs sent"], ["612", "Leads"], ["9.4%", "Click rate"]].map(([v, l]) => (
              <div key={l} className="rounded-lg bg-surface-2 p-2"><div className="font-semibold">{v}</div><div className="text-[11px] text-muted">{l}</div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-16 pb-10 sm:pt-24">
          <div className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-96 max-w-3xl rounded-full bg-[radial-gradient(closest-side,var(--brand),transparent)] opacity-20 blur-3xl" />
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-2">
              <Sparkles className="h-3.5 w-3.5 text-brand" /> Scheduler + auto-DM + AI, in one tool
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
              Schedule every post.<br /><span className="gradient-text">Turn every comment into a lead.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-ink-2">{BRAND.description}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium">Start free <ArrowRight className="h-4 w-4" /></Link>
              <a href="#how" className="rounded-full border border-line bg-surface px-6 py-3 font-medium">See how it works</a>
            </div>
            <div className="mt-6 flex items-center justify-center gap-5 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5"><Instagram className="h-4 w-4" />Instagram</span>
              <span className="inline-flex items-center gap-1.5"><Facebook className="h-4 w-4" />Facebook</span>
              <span className="inline-flex items-center gap-1.5"><AtSign className="h-4 w-4" />Threads</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" />Official Meta API</span>
            </div>
          </div>
          <HeroMock />
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Two tools you pay for today. <span className="gradient-text">Now one.</span></h2>
            <p className="mt-4 text-ink-2">A Buffer-style scheduler and a ManyChat-style auto-DM that finally talk to each other.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-line bg-surface p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-brand"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-2">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-y border-line bg-surface px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">Live in 3 minutes</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map((s) => (
                <div key={s.n} className="rounded-2xl border border-line bg-bg p-6">
                  <span className="btn-primary grid h-9 w-9 place-items-center rounded-full font-semibold">{s.n}</span>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-ink-2">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">Simple pricing</h2>
          <p className="mt-3 text-center text-ink-2">Less than paying for a scheduler and a DM tool separately.</p>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {plans.map((p) => (
              <div key={p.name} className={`relative rounded-2xl border bg-surface p-7 ${p.popular ? "glow border-brand" : "border-line"}`}>
                {p.popular && <span className="btn-primary absolute -top-3 left-7 rounded-full px-3 py-0.5 text-xs font-medium">Most popular</span>}
                <div className="font-semibold">{p.name}</div>
                <div className="mt-3 flex items-baseline gap-1"><span className="text-4xl font-semibold">{p.price}</span><span className="text-sm text-muted">{p.per}</span></div>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {p.items.map((i) => <li key={i} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" />{i}</li>)}
                </ul>
                <Link href="/signup" className={`mt-7 block rounded-full py-2.5 text-center text-sm font-medium ${p.popular ? "btn-primary" : "border border-line"}`}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-4 pb-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Questions</h2>
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
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your next post could bring 100 leads.</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">Start free. No credit card. Connect your account in one tap.</p>
            <Link href="/signup" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#0d0d14]">Start free <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-line px-4 py-8 text-sm text-muted">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <span>© 2026 {BRAND.company}</span>
          <div className="flex flex-wrap justify-center gap-5">
            <Link href="/instagram-auto-dm" className="hover:text-ink">Instagram auto DM</Link>
            <Link href="/instagram-auto-dm/templates" className="hover:text-ink">DM templates</Link>
            <Link href="/buffer-alternative" className="hover:text-ink">Buffer alternative</Link>
            <Link href="/manychat-alternative" className="hover:text-ink">ManyChat alternative</Link>
            <Link href="/later-alternative" className="hover:text-ink">Later alternative</Link>
            <Link href="/tools/instagram-caption-counter" className="hover:text-ink">Caption counter</Link>
            <Link href="/tools/instagram-line-break-generator" className="hover:text-ink">Line break generator</Link>
            <Link href="/tools/instagram-image-size" className="hover:text-ink">Image size guide</Link>
            <Link href="/tools" className="hover:text-ink">Free tools</Link>
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
            <Link href="/data-deletion" className="hover:text-ink">Data deletion</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
