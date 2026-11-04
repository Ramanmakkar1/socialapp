import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, UserPlus, Zap } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { DM_TEMPLATES, type DmTemplate } from "@/lib/dmTemplates";
import CopyButton from "./CopyButton";

export const metadata: Metadata = {
  title: "Instagram Comment-to-DM Templates (Copy & Paste)",
  description:
    "Copy-and-paste Instagram auto DM templates for comment keywords like GUIDE, LINK, PRICE and CODE, with public replies, email and follow gates.",
  alternates: { canonical: "/instagram-auto-dm/templates" },
};

const anchor = (useCase: string) => useCase.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const groups = DM_TEMPLATES.reduce<{ useCase: string; items: DmTemplate[] }[]>((acc, t) => {
  const group = acc.find((g) => g.useCase === t.useCase);
  if (group) group.items.push(t);
  else acc.push({ useCase: t.useCase, items: [t] });
  return acc;
}, []);

const preview = (text: string) => text.replace(/\{\{username\}\}/g, "@username").replace(/\{\{link\}\}/g, "[your link]");

const faqs = [
  { q: "What should I write in an Instagram auto DM?", a: "Greet the person by name, thank them for commenting, give them exactly what the post promised (the link, code or guide) and end with one clear next step, such as replying with a question. Keep it short and friendly so it reads like a real message." },
  { q: "What are the best keywords for comment-to-DM?", a: "Short, single words that match the offer, such as GUIDE, LINK, PRICE, CODE or BOOK. Put the keyword in the caption and on screen, and use a different word for each offer so you can see which one works." },
  { q: "How long can an Instagram auto DM be?", a: `${BRAND.name} lets you write up to 1,000 characters per DM. Most good auto DMs are only two or three short lines with the link on its own line.` },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function DmTemplatesPage() {
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
        <section className="relative overflow-hidden px-4 pt-16 pb-12 sm:pt-24">
          <div className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-96 max-w-3xl rounded-full bg-[radial-gradient(closest-side,var(--brand),transparent)] opacity-20 blur-3xl" />
          <div className="relative mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Instagram Comment-to-DM Templates <span className="gradient-text">(Copy &amp; Paste)</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-ink-2">
              {DM_TEMPLATES.length} ready-made auto DM messages for the keywords people actually comment. Copy one, add your link and turn it on in {BRAND.name}.
            </p>
            <nav aria-label="Use cases" className="mt-8 flex flex-wrap justify-center gap-2">
              {groups.map((g) => (
                <a key={g.useCase} href={`#${anchor(g.useCase)}`} className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm text-ink-2 hover:text-ink">
                  {g.useCase}
                </a>
              ))}
            </nav>
          </div>
        </section>

        {/* Templates */}
        {groups.map((g) => (
          <section key={g.useCase} id={anchor(g.useCase)} className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-16">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{g.useCase}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {g.items.map((t) => (
                <article key={t.slug} id={t.slug} className="flex flex-col rounded-2xl border border-line bg-surface p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="font-semibold">{t.title}</h3>
                    <CopyButton text={t.dmMessage} />
                  </div>
                  <p className="mt-3 text-sm text-ink-2">
                    {t.slug === "story-freebie" ? "Story reply" : "Comment"}:{" "}
                    {t.keywords.map((k) => (
                      <span key={k} className="mr-1.5 inline-block rounded-md bg-surface-2 px-2 py-0.5 font-mono text-xs font-semibold text-brand">{k}</span>
                    ))}
                  </p>
                  <pre className="mt-4 whitespace-pre-wrap break-words rounded-xl border border-line bg-bg p-4 font-sans text-sm leading-6">{preview(t.dmMessage)}</pre>
                  {t.publicReply && (
                    <p className="mt-3 text-sm text-ink-2"><span className="font-medium text-ink">Public reply:</span> {t.publicReply}</p>
                  )}
                  {(t.askEmail || t.requireFollow) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {t.askEmail && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-0.5 text-xs text-ink-2"><Mail className="h-3.5 w-3.5 text-brand" /> Email gate</span>
                      )}
                      {t.requireFollow && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-0.5 text-xs text-ink-2"><UserPlus className="h-3.5 w-3.5 text-brand" /> Follow gate</span>
                      )}
                    </div>
                  )}
                  <p className="mt-4 text-sm leading-6 text-muted"><span className="font-medium text-ink-2">Tip:</span> {t.tip}</p>
                </article>
              ))}
            </div>
          </section>
        ))}

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Auto DM template questions</h2>
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
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Put a template to work on your next post.</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">Start free. No credit card. Connect Instagram in one tap.</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#0d0d14]">Start free <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/instagram-auto-dm" className="font-medium underline underline-offset-4">How Instagram auto DM works</Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-line px-4 py-8 text-sm text-muted">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <span>© 2026 {BRAND.company}</span>
          <div className="flex flex-wrap justify-center gap-5">
            <Link href="/instagram-auto-dm" className="hover:text-ink">Instagram auto DM</Link>
            <Link href="/tools/instagram-caption-counter" className="hover:text-ink">Caption counter</Link>
            <Link href="/tools/instagram-line-break-generator" className="hover:text-ink">Line break generator</Link>
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
            <Link href="/data-deletion" className="hover:text-ink">Data deletion</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
