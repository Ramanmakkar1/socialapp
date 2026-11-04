import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  ShieldCheck,
  CalendarDays,
  Layers,
  BarChart3,
  MessageSquare,
  Sparkles,
  MessageCircleHeart,
} from "lucide-react";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: { absolute: "Instagram Scheduler: Plan & Auto-Publish Posts and Reels" },
  description:
    "Schedule Instagram posts, reels, carousels and stories, see the best time to post, and auto-DM everyone who comments. Free plan available.",
  alternates: { canonical: "/instagram-scheduler" },
};

const benefits = [
  {
    icon: CalendarDays,
    title: "Week and month calendar",
    text: "Drag and drop posts across a week or month view so you can plan your feed at a glance.",
  },
  {
    icon: Layers,
    title: "Posts, reels, carousels and stories",
    text: "Schedule feed posts, reels, multi-image carousels and stories from one composer.",
  },
  {
    icon: BarChart3,
    title: "Best times to post",
    text: "See suggested publish times based on your own followers' activity, not generic guesses.",
  },
  {
    icon: MessageSquare,
    title: "First comment with hashtags",
    text: "Queue a first comment with your hashtags so your caption stays clean while tags still go live.",
  },
  {
    icon: Sparkles,
    title: "Write with AI",
    text: "Draft captions in your brand voice with AI, then tweak and schedule in the same flow.",
  },
  {
    icon: MessageCircleHeart,
    title: "Auto-DM when the post goes live",
    text: "Attach a comment-to-DM rule to a scheduled post so automation switches on the moment it publishes.",
  },
];

const steps = [
  {
    n: "1",
    title: "Connect Instagram",
    text: "Sign in with Meta's official login for Business or Creator accounts. We never ask for your password.",
  },
  {
    n: "2",
    title: "Write the post and pick a time",
    text: "Compose your caption yourself or with AI, add media, set a first comment if you want, and choose when to publish.",
  },
  {
    n: "3",
    title: "Publish and DM commenters",
    text: `${BRAND.name} publishes at the scheduled time. If you added an auto-DM rule, commenters get your message in their DMs.`,
  },
];

const faqs = [
  {
    q: "Can I schedule Instagram reels and stories?",
    a: `Yes. ${BRAND.name} lets you schedule feed posts, reels, carousels and stories to go live at the time you pick.`,
  },
  {
    q: "Is it safe? Do you need my password?",
    a: `No password needed. You connect through Meta's official login and API, the same way Meta expects third-party apps to work. We never scrape or store your Instagram password.`,
  },
  {
    q: "What is the best time to post on Instagram?",
    a: `There is no one-size-fits-all answer. ${BRAND.name} shows suggested times from your own followers' activity so you can schedule when your audience is most likely online.`,
  },
  {
    q: "Can I add a first comment?",
    a: "Yes. You can schedule a first comment with your hashtags or a call to action so it posts right after the main post goes live.",
  },
  {
    q: "Is there a free plan?",
    a: `Yes. The Free plan is $0 forever and includes 2 social accounts, 10 scheduled posts per month, 500 auto-DMs per month and a link-in-bio page.`,
  },
  {
    q: "Can I combine scheduling with Instagram auto DM?",
    a: `Yes. Add a comment-to-DM rule when you schedule a post so everyone who comments a keyword gets your link in their DMs after publish. See our ${BRAND.name} auto-DM page for details.`,
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function InstagramScheduler() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="btn-primary grid h-8 w-8 place-items-center rounded-lg">
              <Zap className="h-4 w-4" />
            </span>
            {BRAND.name}
          </Link>
          <Link href="/signup" className="btn-primary rounded-full px-4 py-2 text-sm font-medium">
            Start free
          </Link>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-16 pb-16 sm:pt-24">
          <div className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-96 max-w-3xl rounded-full bg-[radial-gradient(closest-side,var(--brand),transparent)] opacity-20 blur-3xl" />
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-2">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Schedule posts · auto-DM on publish
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
              Instagram scheduler that <span className="gradient-text">turns comments into leads</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-ink-2">
              Plan and auto-publish posts, reels, carousels and stories, pick the best time from your own audience data,
              and attach comment-to-DM automation when each post goes live.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium"
              >
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how" className="rounded-full border border-line bg-surface px-6 py-3 font-medium">
                How it works
              </a>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to <span className="gradient-text">schedule Instagram</span>
          </h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-line bg-surface p-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-2">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-y border-line bg-surface px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
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

        {/* Related */}
        <section className="mx-auto max-w-3xl px-4 py-12">
          <p className="text-center text-sm leading-7 text-ink-2">
            Pair scheduling with{" "}
            <Link href="/instagram-auto-dm" className="font-medium text-brand hover:underline">
              Instagram auto DM
            </Link>
            , compare us to{" "}
            <Link href="/buffer-alternative" className="font-medium text-brand hover:underline">
              Buffer
            </Link>{" "}
            and{" "}
            <Link href="/later-alternative" className="font-medium text-brand hover:underline">
              Later
            </Link>
            , or try free{" "}
            <Link href="/tools" className="font-medium text-brand hover:underline">
              Instagram tools
            </Link>
            .
          </p>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Instagram scheduler questions</h2>
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
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Schedule your next post in minutes.</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">Start free. No credit card. Connect Instagram in one tap.</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#0d0d14]"
              >
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/instagram-auto-dm" className="font-medium underline underline-offset-4">
                Learn about auto DM
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-line px-4 py-8 text-sm text-muted">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <span>© 2026 {BRAND.company}</span>
          <div className="flex flex-wrap justify-center gap-5">
            <Link href="/instagram-auto-dm" className="hover:text-ink">
              Instagram auto DM
            </Link>
            <Link href="/buffer-alternative" className="hover:text-ink">
              Buffer alternative
            </Link>
            <Link href="/later-alternative" className="hover:text-ink">
              Later alternative
            </Link>
            <Link href="/tools" className="hover:text-ink">
              Free tools
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
