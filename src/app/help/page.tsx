import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, LifeBuoy, Rocket, Wrench, Zap } from "lucide-react";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Help center",
  description:
    "Step-by-step guides for Postflow: connect Instagram, set up comment-to-DM rules, fix auto-DMs that are not sending, and use free templates.",
  alternates: { canonical: "/help" },
};

const guides = [
  {
    href: "/help/getting-started",
    icon: Rocket,
    title: "Getting started in 3 minutes",
    text: "Connect Instagram, create your first auto-DM rule from a template, and schedule a post in the calendar.",
  },
  {
    href: "/help/instagram-auto-dm-not-working",
    icon: Wrench,
    title: "Instagram auto DM not working?",
    text: "A step-by-step checklist: connection, message access, active rules, keywords, gates, and the send queue.",
  },
];

const resources = [
  {
    href: "/instagram-auto-dm",
    icon: BookOpen,
    title: "Instagram auto DM overview",
    text: "How comment-to-DM works and what you can automate.",
  },
  {
    href: "/instagram-auto-dm/templates",
    icon: LifeBuoy,
    title: "DM message templates",
    text: "Copy-ready keywords and messages for guides, shops, webinars, and more.",
  },
  {
    href: "/tools",
    icon: Wrench,
    title: "Free Instagram tools",
    text: "Caption counter, image sizes, engagement rate, and other helpers.",
  },
];

export default function HelpHubPage() {
  return (
    <>
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
      <main className="flex-1 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Help center</h1>
          <p className="mt-3 text-ink-2">
            Guides for scheduling posts and Instagram comment-to-DM automation in {BRAND.name}.
          </p>
        </div>

        <section className="mx-auto mt-12 max-w-5xl">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted">Guides</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {guides.map((g) => (
              <Link
                key={g.href}
                href={g.href}
                className="group rounded-2xl border border-line bg-surface p-6 transition hover:border-brand/40"
              >
                <g.icon className="h-6 w-6 text-brand" aria-hidden="true" />
                <h3 className="mt-3 font-semibold group-hover:text-brand">{g.title}</h3>
                <p className="mt-2 text-sm text-ink-2">{g.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand">
                  Read guide <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-5xl">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted">Product resources</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="rounded-2xl border border-line bg-surface p-5 transition hover:border-brand/40"
              >
                <r.icon className="h-5 w-5 text-brand" aria-hidden="true" />
                <h3 className="mt-2 font-medium">{r.title}</h3>
                <p className="mt-1 text-sm text-ink-2">{r.text}</p>
              </Link>
            ))}
          </div>
        </section>

        <p className="mx-auto mt-12 max-w-xl text-center text-sm text-muted">
          Still stuck?{" "}
          <Link href="/app" className="font-medium text-brand hover:underline">
            Open your dashboard
          </Link>{" "}
          or email{" "}
          <a href={`mailto:${BRAND.supportEmail}`} className="font-medium text-brand hover:underline">
            {BRAND.supportEmail}
          </a>
          .
        </p>
      </main>
      <footer className="border-t border-line px-4 py-8 text-sm text-muted">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <span>© 2026 {BRAND.company}</span>
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
        </div>
      </footer>
    </>
  );
}
