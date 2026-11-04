import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, Check, Minus, Zap, Layers, Mail, ShieldCheck, CalendarClock, MessageCircleHeart, KeyRound,
} from "lucide-react";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "ManyChat Alternative for Instagram Comment-to-DM + Scheduling",
  description:
    "A ManyChat alternative with Instagram comment-to-DM automation, post scheduling and lead capture in one tool, built on the official Meta API.",
  alternates: { canonical: "/manychat-alternative" },
};

const whySwitch = [
  { icon: Layers, title: "Chat automation + scheduler in one", text: "ManyChat automates DMs, but you still need a separate tool to plan and publish posts. Here both live in one place." },
  { icon: CalendarClock, title: "Posts that carry their own DM rule", text: "Attach a comment-to-DM rule to a scheduled post. It switches on when the post goes live, so early commenters get the link right away." },
  { icon: Mail, title: "Email before the link", text: "Turn on the email gate and the DM asks for an email address before it sends your link, so comments become leads." },
];

const compare: [string, string, string][] = [
  ["Comment-to-DM on posts and Reels", "Yes", "Yes"],
  ["Keyword triggers with a link in the DM", "Yes", "Yes"],
  ["Email gate before the link", "Yes", "Yes"],
  ["Post scheduling and calendar", "Yes", "No"],
  ["DM rule attached to a scheduled post", "Yes", "No"],
  ["Contacts list with CSV export", "Coming soon", "Yes"],
  ["AI replies", "Coming soon", "Yes"],
  ["Visual flow builder", "Coming later", "Yes"],
  ["WhatsApp", "Coming later", "Yes"],
  ["Facebook Messenger", "Coming later", "Yes"],
  ["TikTok", "Coming later", "Yes"],
  ["Official Meta API, no password", "Yes", "Yes"],
  ["Pricing", "Free to start", "See their pricing"],
];

const faqs = [
  { q: "Is it against Instagram rules?", a: `No. ${BRAND.name} uses the official Instagram API with Instagram Login. You connect through Meta's own login screen, we never ask for your password, and we only message people who commented first.` },
  { q: "Can I move my ManyChat keywords?", a: `There is no automatic import yet. Recreate each keyword rule in ${BRAND.name}: pick the post, type the keyword and paste your DM message and link. Most rules take about a minute.` },
  { q: "Does it work with Reels comments?", a: "Yes. A comment-to-DM rule can watch a feed post or a Reel, and anyone who comments the keyword gets the DM." },
  { q: "Do I need a Business or Creator account?", a: "Yes. Instagram only allows automated messaging through its API for Business and Creator accounts. Switching is free in the Instagram app settings." },
  { q: "Can it collect emails?", a: "Yes. Turn on the email gate in a rule and the DM asks for an email address before it sends your link." },
  { q: `Does ${BRAND.name} support WhatsApp, Messenger or TikTok?`, a: "Not yet. Instagram comes first. WhatsApp, Messenger and TikTok are planned for later." },
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

export default function ManyChatAlternative() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="btn-primary grid h-8 w-8 place-items-center rounded-lg"><Zap className="h-4 w-4" /></span>
            {BRAND.name}
          </Link>
          <Link href="/signup" className="btn-primary rounded-full px-4 py-2 text-sm font-medium">Start free</Link>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-16 pb-16 sm:pt-24">
          <div className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-96 max-w-3xl rounded-full bg-[radial-gradient(closest-side,var(--brand),transparent)] opacity-20 blur-3xl" />
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-2">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Official Instagram API · no password needed
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
              The ManyChat alternative that also <span className="gradient-text">schedules your posts</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-ink-2">
              DM everyone who comments a keyword on your posts and Reels, ask for their email before the link, and plan the posts themselves in the same tool. No second subscription for a scheduler.
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
            <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">Why people switch</h2>
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
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">{BRAND.name} vs ManyChat</h2>
          <p className="mt-3 text-center text-ink-2">ManyChat is a mature chat automation tool with more channels. {BRAND.name} focuses on Instagram comment-to-DM and adds post scheduling. Here is an honest side-by-side.</p>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full min-w-[30rem] text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="p-4 font-medium text-muted">Feature</th>
                  <th className="p-4 text-center font-semibold">{BRAND.name}</th>
                  <th className="p-4 text-center font-semibold">ManyChat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {compare.map(([label, ours, theirs]) => (
                  <tr key={label}>
                    <td className="p-4">{label}</td>
                    <td className="p-4 text-center"><Cell v={ours} /></td>
                    <td className="p-4 text-center text-ink-2"><Cell v={theirs} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-muted">ManyChat features and pricing change over time. Check their site for current details.</p>
        </section>

        {/* How it works */}
        <section className="border-y border-line bg-surface px-4 py-20">
          <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Schedule the post, the DM rule comes with it</h2>
              <p className="mt-5 leading-7 text-ink-2">
                With ManyChat you set up the automation in one app and plan the post in another. In {BRAND.name} you write the post, pick the time and attach the keyword rule in one step.
              </p>
              <Link href="/instagram-auto-dm/templates" className="mt-6 inline-flex items-center gap-2 font-medium text-brand hover:underline">Browse ready-made DM templates <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid gap-4">
              <div className="flex items-start gap-4 rounded-2xl border border-line bg-bg p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-brand"><CalendarClock className="h-5 w-5" /></span>
                <div>
                  <h3 className="font-semibold">1. Schedule the post</h3>
                  <p className="mt-1 text-sm text-ink-2">Write a caption that asks people to comment a keyword such as GUIDE.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-2xl border border-line bg-bg p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-brand"><KeyRound className="h-5 w-5" /></span>
                <div>
                  <h3 className="font-semibold">2. Set the keyword and link</h3>
                  <p className="mt-1 text-sm text-ink-2">Choose the keyword, write the DM and add your link. Turn on the email gate if you want leads.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-2xl border border-line bg-bg p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-brand"><MessageCircleHeart className="h-5 w-5" /></span>
                <div>
                  <h3 className="font-semibold">3. Commenters get the DM</h3>
                  <p className="mt-1 text-sm text-ink-2">The rule switches on when the post goes live and replies to every matching comment.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight">ManyChat alternative questions</h2>
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
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Auto-DM your commenters and schedule your posts in one place.</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">Start free. No credit card. Connect Instagram in one tap.</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#0d0d14]">Start free <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/" className="font-medium underline underline-offset-4">See the full product</Link>
            </div>
          </div>
          <div className="mx-auto mt-8 flex max-w-5xl flex-wrap justify-center gap-6 text-sm">
            <Link href="/instagram-auto-dm" className="inline-flex items-center gap-1 font-medium text-brand hover:underline">Instagram auto DM <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/instagram-auto-dm/templates" className="inline-flex items-center gap-1 font-medium text-brand hover:underline">DM templates <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/buffer-alternative" className="inline-flex items-center gap-1 font-medium text-brand hover:underline">Buffer alternative <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>
    </>
  );
}
