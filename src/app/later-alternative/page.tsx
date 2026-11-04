import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, Check, Minus, Zap, CalendarDays, Layers, Mail, ShieldCheck, CalendarClock, MessageCircleHeart, KeyRound,
} from "lucide-react";
import { BRAND } from "@/lib/brand";
import { CompareAlternativesNav } from "@/components/CompareAlternativesNav";

export const metadata: Metadata = {
  title: { absolute: `Later Alternative With Instagram Auto-DM | ${BRAND.name}` },
  description:
    "A Later alternative that schedules Instagram, Facebook and Threads posts and auto-DMs commenters with a keyword, plus email capture and lead export.",
  alternates: { canonical: "/later-alternative" },
};

const whyLook = [
  { icon: Layers, title: "Scheduler plus comment-to-DM", text: "Later plans your grid and calendar well, but turning comments into DMs still means paying for a separate chat automation tool." },
  { icon: CalendarDays, title: "One calendar for posts and rules", text: `In ${BRAND.name} you attach a comment-to-DM rule to a scheduled post. The rule switches on when the post goes live.` },
  { icon: Mail, title: "Leads from scheduled content", text: "Ask for an email in the DM before the link is sent, so posts you planned weeks ahead can still fill a lead list." },
];

const compare: [string, string, string][] = [
  ["Scheduling for Instagram, Facebook and Threads", "Yes", "Yes"],
  ["Visual calendar", "Yes", "Yes"],
  ["Comment→DM keyword automation", "Yes", "No"],
  ["Email capture in the DM", "Yes", "No"],
  ["Link click tracking", "Yes", "See their site"],
  ["Lead CSV export", "Coming soon", "No"],
  ["AI captions", "Coming soon", "See their site"],
];

const switchSteps = [
  { icon: CalendarClock, title: "Connect Instagram", text: "Sign up, connect your Instagram Business or Creator account through Meta login. No password sharing." },
  { icon: KeyRound, title: "Recreate your queue", text: "Add upcoming posts to the calendar for Instagram, Facebook or Threads. Paste captions from Later if you like." },
  { icon: MessageCircleHeart, title: "Attach DM rules", text: "For lead posts, set a comment keyword and DM message on each scheduled post. Publish on time; commenters get the link in DMs." },
];

const faqs = [
  { q: `Is ${BRAND.name} a Later alternative?`, a: `Yes. ${BRAND.name} gives you a visual calendar and publishing for Instagram, Facebook and Threads, and adds Instagram comment-to-DM automation, email capture and link tracking in the same subscription.` },
  { q: "Does Later send automatic DMs when someone comments?", a: "Later is built for planning and publishing social content. Comment-to-DM automation is not part of Later itself; teams usually add a tool like ManyChat for that." },
  { q: "Can I import my Later media library or schedule?", a: `There is no Later import yet. Download assets from Later if needed, then upload them when you create posts in ${BRAND.name}. Most teams rebuild the next one to two weeks of posts in under ten minutes.` },
  { q: "Which platforms does each tool support?", a: `${BRAND.name} focuses on Instagram, Facebook Pages and Threads at launch, with more networks planned later. Later supports additional networks such as Pinterest and TikTok; see their site for the current list.` },
  { q: "Is comment-to-DM allowed on Instagram?", a: `Yes, through the official Instagram API. ${BRAND.name} only messages people who commented first, uses Meta login, and never asks for your password.` },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

function Cell({ v }: { v: string }) {
  if (v === "Yes") return <Check className="mx-auto h-4 w-4 text-ok" aria-label="Yes" />;
  if (v === "No") return <Minus className="mx-auto h-4 w-4 text-muted" aria-label="No" />;
  return <span className="text-ink-2">{v}</span>;
}

export default function LaterAlternative() {
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
        <section className="relative overflow-hidden px-4 pt-16 pb-16 sm:pt-24">
          <div className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-96 max-w-3xl rounded-full bg-[radial-gradient(closest-side,var(--brand),transparent)] opacity-20 blur-3xl" />
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-2">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Official Meta API · no password needed
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
              Later alternative with Instagram auto-DM built in
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-ink-2">
              Keep a visual calendar for Instagram, Facebook and Threads, and auto-DM everyone who comments a keyword on your posts. Capture emails, track link clicks and export leads without a second subscription.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium">Start free <ArrowRight className="h-4 w-4" /></Link>
              <a href="#compare" className="rounded-full border border-line bg-surface px-6 py-3 font-medium">Compare features</a>
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-surface px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">Why people look for a Later alternative</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {whyLook.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-line bg-bg p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-brand"><Icon className="h-5 w-5" /></span>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-2">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="compare" className="mx-auto max-w-4xl scroll-mt-20 px-4 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">{BRAND.name} vs Later</h2>
          <p className="mt-3 text-center text-ink-2">Later is a strong visual scheduler. {BRAND.name} keeps scheduling and adds comment-to-DM automation in one place. Here is an honest side-by-side.</p>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full min-w-[30rem] text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="p-4 font-medium text-muted">Feature</th>
                  <th className="p-4 text-center font-semibold">{BRAND.name}</th>
                  <th className="p-4 text-center font-semibold">Later</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {compare.map(([label, ours, theirs]) => (
                  <tr key={label}>
                    <td className="p-4">{label}</td>
                    <td className="p-4 text-center"><Cell v={ours} /></td>
                    <td className="p-4 text-center"><Cell v={theirs} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-muted">Later features and plans change over time. Check their site for current details. We do not list their prices here.</p>
        </section>

        <section className="border-y border-line bg-surface px-4 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">Who should stay on Later</h2>
            <p className="mt-5 text-center leading-7 text-ink-2">
              Stay on Later if Pinterest, TikTok or other networks they support are core to your workflow, you rely on their Link in Bio product end to end, or you only need scheduling with no comment-to-DM at all. Later is a mature planner; there is no reason to switch if automation is not on your roadmap.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">How to switch in 10 minutes</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {switchSteps.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-brand"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-2">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Later alternative questions</h2>
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
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Schedule like Later. Auto-DM every commenter.</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">Start free. No credit card. Connect Instagram in one tap.</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#0d0d14]">Start free <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/" className="font-medium underline underline-offset-4">See the full product</Link>
            </div>
          </div>
          <CompareAlternativesNav current="later" />
        </section>
      </main>
    </>
  );
}
