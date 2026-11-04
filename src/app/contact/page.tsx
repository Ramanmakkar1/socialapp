import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy, Mail, MessageCircleQuestion, Zap } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: `${BRAND.name} support: help with scheduling and auto-DM`,
  description: `Questions about scheduling posts, Instagram auto-DM rules or your ${BRAND.name} account? Email the support team or browse step-by-step help guides.`,
  alternates: { canonical: "/contact" },
};

const cards = [
  {
    icon: Mail,
    title: "Email us",
    content: (
      <>
        <a className="font-medium text-brand underline-offset-4 hover:underline" href={`mailto:${BRAND.supportEmail}`}>
          {BRAND.supportEmail}
        </a>
        <p className="mt-2 text-sm text-ink-2">We reply within one business day</p>
      </>
    ),
  },
  {
    icon: LifeBuoy,
    title: "Help center",
    content: (
      <p className="text-sm leading-6 text-ink-2">
        Browse <Link className="text-brand underline-offset-4 hover:underline" href="/help">step-by-step help guides</Link> or follow the <Link className="text-brand underline-offset-4 hover:underline" href="/help/getting-started">getting started guide</Link>.
      </p>
    ),
  },
  {
    icon: MessageCircleQuestion,
    title: "Auto-DM not working?",
    content: (
      <p className="text-sm leading-6 text-ink-2">
        <Link className="text-brand underline-offset-4 hover:underline" href="/help/instagram-auto-dm-not-working">Troubleshoot Instagram auto-DMs</Link> with our step-by-step checklist.
      </p>
    ),
  },
];

export default function ContactPage() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="btn-primary grid h-8 w-8 place-items-center rounded-lg"><Zap className="h-4 w-4" /></span>
            {BRAND.name}
          </Link>
          <Link href="/help" className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-ink-2 hover:text-ink">Help center</Link>
        </div>
      </header>
      <main className="flex-1 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Contact support</h1>
          <p className="mt-3 text-ink-2">Need a hand with scheduling, Instagram auto-DM or your account? Choose the support option that fits.</p>
        </div>
        <section aria-label="Support options" className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-3">
          {cards.map(({ icon: Icon, title, content }) => (
            <article key={title} className="rounded-2xl border border-line bg-surface p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-brand"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <h2 className="mt-4 font-semibold">{title}</h2>
              <div className="mt-2">{content}</div>
            </article>
          ))}
        </section>
        <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-6 text-ink-2">
          For details about how {BRAND.company} handles your information, see our <Link className="text-brand underline-offset-4 hover:underline" href="/privacy">Privacy Policy</Link>, <Link className="text-brand underline-offset-4 hover:underline" href="/terms">Terms of Service</Link> and <Link className="text-brand underline-offset-4 hover:underline" href="/data-deletion">data deletion instructions</Link>.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
