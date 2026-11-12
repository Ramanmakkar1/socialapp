import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import { AnimArt } from "@/components/AnimArt";
import ui from "@/components/ui/ui.module.css";
import { DM_TEMPLATES, type DmTemplate } from "@/lib/dmTemplates";
import TemplateChooser from "./TemplateChooser";
import CopyButton from "./CopyButton";

export const metadata: Metadata = withSocial({
  title: "Instagram Comment-to-DM Templates (Copy & Paste)",
  description:
    "Copy-and-paste Instagram auto DM templates for comment keywords like GUIDE, LINK, PRICE and CODE, with public replies, email and follow gates.",
  alternates: { canonical: "/instagram-auto-dm/templates" },
});

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
    <PublicShell breadcrumbs={[{ name: "Instagram auto-DM", path: "/instagram-auto-dm" }, { name: "DM templates", path: "/instagram-auto-dm/templates" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
      <header className="hero">
        <span className="pill">Copy &amp; paste · {DM_TEMPLATES.length} templates</span>
        <p className="eyebrow">Auto-DM templates</p>
        <h1>
          Instagram comment-to-DM <em className="s mark">templates</em>
        </h1>
        <p className="lede">
          {DM_TEMPLATES.length} ready-made auto DM messages for the keywords people actually comment. Copy one, add your link and turn it on in {BRAND.name}.
        </p>
        <nav aria-label="Use cases" className="chips">
          {groups.map((g) => (
            <a key={g.useCase} href={`#${anchor(g.useCase)}`} className="chip">
              {g.useCase}
            </a>
          ))}
        </nav>
        <div className="hero-art"><AnimArt name="feat-dm" label="A phone post gets a GUIDE comment and a DM with a link flies back with a green check" /></div>
      </header>

      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <TemplateChooser />
        </div>
      </section>

      {groups.map((g, gi) => (
        <section key={g.useCase} id={anchor(g.useCase)} style={{ paddingTop: 20, scrollMarginTop: 24 }}>
          <div className="wrap">
            <div className="head" style={{ marginBottom: 28 }}>
              <p className="eyebrow">{String(gi + 1).padStart(2, "0")} / Use case</p>
              <h2>{g.useCase}</h2>
            </div>
            <div className="cards">
              {g.items.map((t) => (
                <article key={t.slug} id={t.slug} className="pcard" style={{ scrollMarginTop: 80 }}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3>{t.title}</h3>
                    <CopyButton text={t.dmMessage} />
                  </div>
                  <p className="flex flex-wrap items-center gap-1.5 text-sm" style={{ color: "var(--poskoo-muted)" }}>
                    {t.slug === "story-freebie" ? "Story reply" : "Comment"}:
                    {t.keywords.map((k) => (
                      <span key={k} className={`${ui.pill} font-mono text-xs`} style={{ color: "var(--poskoo-violet)" }}>{k}</span>
                    ))}
                  </p>
                  <pre className="whitespace-pre-wrap break-words p-4 font-sans text-sm leading-6" style={{ background: "var(--poskoo-band)", borderRadius: "var(--poskoo-radius-md)", margin: 0 }}>
                    {preview(t.dmMessage)}
                  </pre>
                  {t.publicReply && (
                    <p className="text-sm" style={{ color: "var(--poskoo-muted)" }}>
                      <strong style={{ color: "var(--poskoo-ink)" }}>Public reply:</strong> {t.publicReply}
                    </p>
                  )}
                  {(t.askEmail || t.requireFollow) && (
                    <div className="flex flex-wrap gap-2">
                      {t.askEmail && <span className={ui.pill}>Email gate</span>}
                      {t.requireFollow && <span className={ui.pill}>Follow gate</span>}
                    </div>
                  )}
                  <p className="text-sm leading-6" style={{ color: "var(--poskoo-muted)" }}>
                    <strong style={{ color: "var(--poskoo-ink)" }}>Tip:</strong> {t.tip}
                  </p>
                  <Link href={`/app/auto-dm?template=${t.slug}`} className="go">
                    Use this template <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Auto DM template questions</h2>
          </div>
          <div className="faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Put a template to work <em className="s">on your next post</em></h2>
              <p>Start free. No credit card. Connect Instagram in one tap.</p>
              <Link className="btn" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            </div>
            <Image sizes="(max-width: 960px) 100vw, 50vw" src="/landing/card-leads.webp" width={900} height={900} loading="lazy" alt="Two friends high-five next to a board of new leads" />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
