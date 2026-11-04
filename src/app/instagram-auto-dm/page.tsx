import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, Check, Minus, Zap, MessageCircleHeart, Mail, UserPlus, Film, Sparkles, BarChart3, ShieldCheck,
} from "lucide-react";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Instagram Auto DM: Send a DM to Everyone Who Comments",
  description:
    "Automatically DM everyone who comments a keyword on your Instagram posts and reels. Official Meta API, email capture, AI replies. A simpler, cheaper ManyChat alternative.",
  alternates: { canonical: "/instagram-auto-dm" },
};

const steps = [
  { n: "1", title: "Pick a post or reel", text: "Choose any post or reel on your Instagram Business or Creator account, or one you are about to schedule." },
  { n: "2", title: "Set a keyword like GUIDE", text: "Tell followers to comment a word such as GUIDE, LINK or PRICE. Match it exactly or anywhere in the comment." },
  { n: "3", title: "The DM goes out in seconds", text: "Everyone who comments the keyword gets your message and link in their DMs, day and night." },
];

const automations = [
  { icon: MessageCircleHeart, title: "Keyword replies", text: "Send a different DM for each keyword, on one post or across all of them." },
  { icon: Mail, title: "Email + phone capture", text: "Ask for an email or phone number before the link is sent, so every comment becomes a lead." },
  { icon: UserPlus, title: "Follow gate", text: "Only send the freebie once the person follows you, to grow your audience with every post." },
  { icon: Film, title: "Story replies", text: "Reply automatically when someone answers your story with a keyword." },
  { icon: Sparkles, title: "AI follow-up replies", text: "When people reply with a question, AI answers in your voice and keeps the chat going." },
  { icon: BarChart3, title: "Click + lead tracking", text: "See DMs sent, link clicks and leads collected for every post." },
];

const compare: [string, string, string][] = [
  ["Price from", "$19 / month", "Varies with contacts"],
  ["Post scheduling included", "Yes", "No"],
  ["Comment-to-DM automation", "Yes", "Yes"],
  ["AI replies", "Included in Pro", "Paid add-on"],
  ["Official Meta API", "Yes", "Yes"],
];

const faqs = [
  { q: "How do I auto DM people who comment on Instagram?", a: `Connect your Instagram Business or Creator account to ${BRAND.name}, pick a post, set a keyword and write your message. Everyone who comments that keyword gets the DM automatically.` },
  { q: "Will auto DMs get my Instagram account banned?", a: "Not when you use the official Meta API. We never ask for your password, we respect Meta's rate limits and we only message people who commented first." },
  { q: `Is ${BRAND.name} a ManyChat alternative?`, a: `Yes. ${BRAND.name} does comment-to-DM automation, email capture and AI replies, and also schedules your posts, so you can use one tool instead of two.` },
  { q: "Do I need an Instagram business account?", a: "Yes, Meta only allows DM automation on Business or Creator accounts. Switching is free and takes about a minute in the Instagram app." },
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

export default function InstagramAutoDm() {
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
              <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Official Meta API · no password needed
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
              Instagram auto DM <span className="gradient-text">for every comment</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-ink-2">
              Someone comments a keyword on your post or reel, and {BRAND.name} sends them your link in a DM within seconds. Capture their email, answer with AI and track every lead.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium">Start free <ArrowRight className="h-4 w-4" /></Link>
              <a href="#how" className="rounded-full border border-line bg-surface px-6 py-3 font-medium">How it works</a>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-y border-line bg-surface px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">How comment-to-DM works</h2>
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

        {/* Automations */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">What you can <span className="gradient-text">automate</span></h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {automations.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-line bg-surface p-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-brand"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-2">{text}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center">
            <Link href="/instagram-auto-dm/templates" className="inline-flex items-center gap-2 font-medium text-brand hover:underline">Browse DM templates <ArrowRight className="h-4 w-4" /></Link>
          </p>
        </section>

        {/* Comparison */}
        <section className="mx-auto max-w-3xl px-4 pb-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">{BRAND.name} vs ManyChat</h2>
          <p className="mt-3 text-center text-ink-2">Both send comment-to-DM messages. {BRAND.name} also schedules your posts.</p>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full min-w-[28rem] text-sm">
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
        </section>

        {/* Safety */}
        <section className="border-y border-line bg-surface px-4 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Is Instagram auto DM safe?</h2>
            <p className="mt-5 leading-7 text-ink-2">
              Yes, when it runs on the official Meta API. {BRAND.name} connects through Meta&apos;s own login, so we never see or store your Instagram password. We only message people who commented or replied first, we respect Meta&apos;s rate limits, and we follow the 24-hour messaging window: replies are sent while the conversation is open, never as cold spam.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Instagram auto DM questions</h2>
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
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Turn your next comment section into leads.</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">Start free. No credit card. Connect Instagram in one tap.</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#0d0d14]">Start free <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/" className="font-medium underline underline-offset-4">See the full product</Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-line px-4 py-8 text-sm text-muted">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <span>© 2026 {BRAND.company}</span>
          <div className="flex flex-wrap justify-center gap-5">
            <Link href="/instagram-auto-dm/templates" className="hover:text-ink">DM templates</Link>
            <Link href="/buffer-alternative" className="hover:text-ink">Buffer alternative</Link>
            <Link href="/manychat-alternative" className="hover:text-ink">ManyChat alternative</Link>
            <Link href="/tools/instagram-caption-counter" className="hover:text-ink">Caption counter</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
