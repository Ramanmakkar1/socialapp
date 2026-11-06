import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, Check, Minus, Wallet, Layers, Mail, ShieldCheck, CalendarClock, MessageCircleHeart,
} from "lucide-react";
import { BRAND } from "@/lib/brand";
import { CompareAlternativesNav } from "@/components/CompareAlternativesNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: { absolute: "Hootsuite Alternative for Instagram Scheduling & Auto-DM" },
  description:
    "An Instagram scheduler plus comment-to-DM automation, email capture and AI replies, from $19/month. A simpler Hootsuite alternative for Instagram.",
  alternates: { canonical: "/hootsuite-alternative" },
};

const whySwitch = [
  { icon: Layers, title: "Built for Instagram growth", text: "Schedule your posts and reply to every keyword comment with a DM from the same place, instead of a big suite plus a separate chatbot tool." },
  { icon: Wallet, title: "Simple, clear pricing", text: `Scheduling, comment-to-DM, AI replies and lead capture are all part of ${BRAND.name} Pro at $19 / month.` },
  { icon: Mail, title: "Leads from every post", text: "Ask for an email or phone number in the DM before the link is sent, so every comment on a scheduled post can become a lead." },
];

const compare: [string, string, string, string][] = [
  ["Post scheduling", "Yes", "Yes", "No"],
  ["Calendar view", "Yes", "Yes", "No"],
  ["Instagram publishing", "Yes", "Yes", "No"],
  ["Facebook publishing", "Coming soon", "Yes", "No"],
  ["Threads publishing", "Coming soon", "Yes", "No"],
  ["Comment-to-DM automation", "Yes", "Check their plans", "Yes"],
  ["Email capture in DMs", "Yes", "Check their plans", "Yes"],
  ["AI DM replies", "Yes", "Check their plans", "Yes"],
  ["Starting price", "$19 / month", "See their pricing", "See their pricing"],
];

const faqs = [
  { q: `Is ${BRAND.name} a Hootsuite alternative?`, a: `Yes, for Instagram. ${BRAND.name} schedules and publishes your Instagram posts on a calendar, and also sends an automatic DM to everyone who comments a keyword, with email capture and AI replies built in. Hootsuite covers more networks and team features today.` },
  { q: "Can I import my Hootsuite schedule?", a: `Not yet. Add your upcoming posts in the ${BRAND.name} calendar and recreate your schedule there.` },
  { q: "Which platforms are supported?", a: "Instagram scheduling and auto-DMs work today. Facebook Pages and Threads publishing are coming soon, then YouTube, LinkedIn, Pinterest, TikTok and WhatsApp." },
  { q: "Does it use the official APIs only?", a: "Yes. We connect through the official Meta login and APIs. We never ask for your password and never scrape." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

function Cell({ v }: { v: string }) {
  if (v === "Yes") return <Check className="mx-auto h-4 w-4 text-ok" aria-label="Yes" />;
  if (v === "No") return <Minus className="mx-auto h-4 w-4 text-muted" aria-label="No" />;
  return <>{v}</>;
}

export default function HootsuiteAlternative() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-16 pb-16 sm:pt-24">
          <div className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-96 max-w-3xl rounded-full bg-[radial-gradient(closest-side,var(--brand),transparent)] opacity-20 blur-3xl" />
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-2">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Official Meta API · no password needed
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
              The Hootsuite alternative for Instagram that <span className="gradient-text">turns comments into leads</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-ink-2">
              Schedule your Instagram posts (Facebook and Threads coming soon), and let {BRAND.name} DM everyone who comments a keyword. Capture their email, answer with AI and track every lead, from $19 / month.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium">Start free <ArrowRight className="h-4 w-4" /></Link>
              <a href="#compare" className="rounded-full border border-line bg-surface px-6 py-3 font-medium">Compare features</a>
            </div>
          </div>
        </section>

        {/* Why people switch */}
        <section className="border-y border-line bg-surface px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">Why Instagram creators switch</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {whySwitch.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-line bg-bg p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-brand"><Icon className="h-5 w-5" /></span>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-2">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section id="compare" className="mx-auto max-w-4xl scroll-mt-20 px-4 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">{BRAND.name} vs Hootsuite vs ManyChat</h2>
          <p className="mt-3 text-center text-ink-2">Hootsuite is a full social media management suite. ManyChat automates DMs but does not schedule posts. {BRAND.name} does Instagram scheduling and comment-to-DM in one tool.</p>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="p-4 font-medium text-muted">Feature</th>
                  <th className="p-4 text-center font-semibold">{BRAND.name}</th>
                  <th className="p-4 text-center font-semibold">Hootsuite</th>
                  <th className="p-4 text-center font-semibold">ManyChat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {compare.map(([label, ours, hootsuite, manychat]) => (
                  <tr key={label}>
                    <td className="p-4">{label}</td>
                    <td className="p-4 text-center"><Cell v={ours} /></td>
                    <td className="p-4 text-center text-ink-2"><Cell v={hootsuite} /></td>
                    <td className="p-4 text-center text-ink-2"><Cell v={manychat} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-muted">Competitor features and prices change. Check their websites for current plans.</p>
        </section>

        {/* Plan a post, attach an auto-DM rule */}
        <section className="border-y border-line bg-surface px-4 py-20">
          <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Plan a post, attach an auto-DM rule</h2>
              <p className="mt-5 leading-7 text-ink-2">
                When you schedule a post in the {BRAND.name} calendar, you can attach a comment-to-DM rule to it. The rule stays off until the post goes live, then switches on by itself, so the first people who comment get your link straight away.
              </p>
            </div>
            <div className="grid gap-4">
              <div className="flex items-start gap-4 rounded-2xl border border-line bg-bg p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-brand"><CalendarClock className="h-5 w-5" /></span>
                <div>
                  <h3 className="font-semibold">1. Schedule the post</h3>
                  <p className="mt-1 text-sm text-ink-2">Pick the time and write a caption that asks people to comment a keyword such as GUIDE.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-2xl border border-line bg-bg p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-brand"><MessageCircleHeart className="h-5 w-5" /></span>
                <div>
                  <h3 className="font-semibold">2. Attach the DM rule</h3>
                  <p className="mt-1 text-sm text-ink-2">Set the keyword and the message with your link. It switches on when the post is published.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Hootsuite alternative questions</h2>
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
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Schedule your posts and turn comments into leads.</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">Start free. No credit card. Connect Instagram in one tap.</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#0d0d14]">Start free <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/" className="font-medium underline underline-offset-4">See the full product</Link>
            </div>
          </div>
          <div className="mx-auto mt-8 flex max-w-5xl flex-wrap justify-center gap-6 text-sm">
            <Link href="/instagram-scheduler" className="inline-flex items-center gap-1 font-medium text-brand hover:underline">Instagram scheduler <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/instagram-auto-dm" className="inline-flex items-center gap-1 font-medium text-brand hover:underline">Instagram auto DM <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <CompareAlternativesNav current="hootsuite" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
