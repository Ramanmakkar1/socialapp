import Link from "next/link";
import { DM_TEMPLATES, type DmTemplate } from "@/lib/dmTemplates";

const PICKS: { slug: string; label: string; icon: "guide" | "bag" | "check" | "call" }[] = [
  { slug: "free-guide", label: "Free guide", icon: "guide" },
  { slug: "product-link", label: "Product link", icon: "bag" },
  { slug: "email-checklist", label: "Email checklist", icon: "check" },
  { slug: "book-a-call", label: "Book a call", icon: "call" },
];

function gateLabel(t: DmTemplate) {
  if (t.askEmail && t.requireFollow) return "Email + follow gate";
  if (t.askEmail) return "Email gate";
  if (t.requireFollow) return "Follow gate";
  return "No gate";
}

function excerpt(text: string) {
  const firstLines = text.replace(/\{\{username\}\}/g, "Sam").split("\n").filter(Boolean).slice(0, 2).join(" ");
  return firstLines.length > 90 ? `${firstLines.slice(0, 87).trimEnd()}…` : firstLines;
}

function PreviewArt({ icon }: { icon: (typeof PICKS)[number]["icon"] }) {
  return (
    <svg viewBox="0 0 120 64" aria-hidden="true" className="h-16 w-full">
      <rect x="0" y="0" width="120" height="64" rx="12" className="fill-surface-2" />
      <circle cx="104" cy="12" r="18" className="fill-brand-2" opacity="0.15" />
      <rect x="10" y="12" width="52" height="14" rx="7" className="fill-surface stroke-line" />
      <rect x="16" y="17" width="34" height="4" rx="2" className="fill-muted" opacity="0.6" />
      <rect x="46" y="34" width="58" height="18" rx="9" className="fill-brand" />
      <rect x="54" y="41" width="30" height="4" rx="2" fill="#fff" opacity="0.85" />
      <g transform="translate(86 6)" className="stroke-brand" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {icon === "guide" && <path d="M2 4h7a3 3 0 0 1 3 3v11a2 2 0 0 0-2-2H2zM22 4h-7a3 3 0 0 0-3 3v11a2 2 0 0 1 2-2h8z" />}
        {icon === "bag" && <path d="M5 7h14l-1 13H6zM9 9V5a3 3 0 0 1 6 0v4" />}
        {icon === "check" && <path d="M5 4h14v16H5zM8 10l2 2 4-4M8 16h8" />}
        {icon === "call" && <path d="M4 7h16v13H4zM4 11h16M9 4v5M15 4v5" />}
      </g>
      <path d="M22 44l2-4 2 4 4 2-4 2-2 4-2-4-4-2z" className="fill-brand" opacity="0.5" />
    </svg>
  );
}

export default function TemplatePicker({ activeTitle, onReopen }: { activeTitle?: string; onReopen?: () => void }) {
  const items = PICKS.flatMap((p) => {
    const t = DM_TEMPLATES.find((tpl) => tpl.slug === p.slug);
    return t ? [{ ...p, t }] : [];
  });

  return (
    <section aria-labelledby="dm-template-picker" className="mt-6 rounded-2xl border border-line bg-surface p-5">
      <h2 id="dm-template-picker" className="font-semibold">Start from a template</h2>
      <p className="mt-1 text-sm text-muted">
        A template only fills in a draft. Nothing is sent until you finish the setup, add your link and save the automation.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ slug, label, icon, t }) => (
          <li key={slug}>
            <Link
              href={`/app/auto-dm?template=${slug}`}
              // The same template is already loaded: the URL won't change, so reopen its draft directly.
              onClick={t.title === activeTitle ? onReopen : undefined}
              className="flex h-full flex-col rounded-2xl border border-line bg-bg p-3 transition hover:-translate-y-0.5 hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <PreviewArt icon={icon} />
              <span className="mt-3 font-semibold text-ink">{label}</span>
              <span className="mt-1 flex flex-wrap gap-1.5 text-xs">
                {t.keywords.map((k) => (
                  <span key={k} className="rounded-full bg-brand/10 px-2 py-0.5 font-medium text-brand">Keyword: {k}</span>
                ))}
                <span className="rounded-full border border-line px-2 py-0.5 text-ink-2">{gateLabel(t)}</span>
              </span>
              <span className="mt-2 text-xs leading-relaxed text-muted">{excerpt(t.dmMessage)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
