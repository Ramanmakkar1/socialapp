import Link from "next/link";
import { DM_TEMPLATES, type DmTemplate } from "@/lib/dmTemplates";
import ui from "@/components/ui/ui.module.css";
import styles from "./auto-dm.module.css";

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
      <rect x="0" y="0" width="120" height="64" rx="12" fill="var(--poskoo-band)" />
      <circle cx="104" cy="12" r="18" fill="var(--poskoo-coral)" opacity="0.15" />
      <rect x="10" y="12" width="52" height="14" rx="7" fill="var(--poskoo-card)" stroke="var(--poskoo-line)" />
      <rect x="16" y="17" width="34" height="4" rx="2" fill="var(--poskoo-muted)" opacity="0.6" />
      <rect x="46" y="34" width="58" height="18" rx="9" fill="var(--poskoo-violet)" />
      <rect x="54" y="41" width="30" height="4" rx="2" fill="#fff" opacity="0.85" />
      <g transform="translate(86 6)" stroke="var(--poskoo-violet)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {icon === "guide" && <path d="M2 4h7a3 3 0 0 1 3 3v11a2 2 0 0 0-2-2H2zM22 4h-7a3 3 0 0 0-3 3v11a2 2 0 0 1 2-2h8z" />}
        {icon === "bag" && <path d="M5 7h14l-1 13H6zM9 9V5a3 3 0 0 1 6 0v4" />}
        {icon === "check" && <path d="M5 4h14v16H5zM8 10l2 2 4-4M8 16h8" />}
        {icon === "call" && <path d="M4 7h16v13H4zM4 11h16M9 4v5M15 4v5" />}
      </g>
      <path d="M22 44l2-4 2 4 4 2-4 2-2 4-2-4-4-2z" fill="var(--poskoo-coral)" opacity="0.5" />
    </svg>
  );
}

export default function TemplatePicker({ activeTitle, onReopen }: { activeTitle?: string; onReopen?: () => void }) {
  const items = PICKS.flatMap((p) => {
    const t = DM_TEMPLATES.find((tpl) => tpl.slug === p.slug);
    return t ? [{ ...p, t }] : [];
  });

  return (
    <section aria-labelledby="dm-template-picker" className={`${ui.card} ${ui.band} mt-6 p-5`}>
      <h2 id="dm-template-picker" className="m-0 font-semibold text-[var(--poskoo-ink)]">Start from a template</h2>
      <p className="mt-1 text-sm text-[var(--poskoo-muted)]">
        A template only fills in a draft. Nothing is sent until you finish the setup, add your link and save the automation.
      </p>
      <ul className={`${styles.pickerList} mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4`}>
        {items.map(({ slug, label, icon, t }) => (
          <li key={slug}>
            <Link
              href={`/app/auto-dm?template=${slug}`}
              // The same template is already loaded: the URL won't change, so reopen its draft directly.
              onClick={t.title === activeTitle ? onReopen : undefined}
              className={styles.pickerCard}
            >
              <span className={styles.pickerArt}>
                <PreviewArt icon={icon} />
              </span>
              <span className="mt-3 font-semibold text-[var(--poskoo-ink)]">{label}</span>
              <span className="mt-1 flex flex-wrap gap-1.5 text-xs">
                {t.keywords.map((k) => (
                  <span key={k} className={ui.pill} style={{ color: "var(--poskoo-violet)" }}>Keyword: {k}</span>
                ))}
                <span className={ui.pill}>{gateLabel(t)}</span>
              </span>
              <span className="mt-2 text-xs leading-relaxed text-[var(--poskoo-ink)]">{excerpt(t.dmMessage)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
