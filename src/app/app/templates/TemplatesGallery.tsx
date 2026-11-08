"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ExternalLink } from "lucide-react";
import type { DmTemplate } from "@/lib/dmTemplates";
import ui from "@/components/ui/ui.module.css";
import { CATEGORIES, visibleIn, type TemplateCategoryId } from "./categories";
import styles from "./templates.module.css";

function commentPreview(t: DmTemplate) {
  return t.keywords[0] ? `${t.keywords[0]} 🔥` : "Love this! ❤️";
}

function dmPreview(message: string) {
  const line = message
    .replace(/\{\{username\}\}/g, "Sam")
    .replace(/\{\{link\}\}/g, "")
    .split("\n")
    .map((part) => part.trim())
    .find(Boolean);
  return line ?? "";
}

function gateLabel(t: DmTemplate) {
  if (t.askEmail && t.requireFollow) return "Email + follow gate";
  if (t.askEmail) return "Email gate";
  if (t.requireFollow) return "Follow gate";
  return null;
}

function ChatMock({ template }: { template: DmTemplate }) {
  const hasLink = template.dmMessage.includes("{{link}}");
  return (
    <div className={styles.chat} aria-hidden="true">
      <div className={styles.commentRow}>
        <span className={styles.commentBubble}>{commentPreview(template)}</span>
      </div>
      <ArrowDown className={styles.arrow} width={16} height={16} />
      <div className={styles.dmRow}>
        <div className={styles.dmBubble}>
          <span className={styles.dmText}>{dmPreview(template.dmMessage)}</span>
          <span className={styles.dmButton}>{hasLink ? "Open link" : "Reply"}</span>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesGallery({ templates }: { templates: DmTemplate[] }) {
  const [category, setCategory] = useState<TemplateCategoryId>("all");
  const visible = templates.filter((t) => visibleIn(t, category));

  return (
    <section aria-label="Auto-DM templates">
      <div className={styles.tabs} role="tablist" aria-label="Template categories">
        {CATEGORIES.map((c) => {
          const count = templates.filter((t) => visibleIn(t, c.id)).length;
          const active = c.id === category;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`${styles.tab} ${active ? styles.tabActive : ""}`}
              onClick={() => setCategory(c.id)}
            >
              {c.label}
              <span className={styles.tabCount}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.grid}>
        {visible.map((t) => {
          const gate = gateLabel(t);
          return (
            <article key={t.slug} className={styles.card}>
              <ChatMock template={t} />
              <h2 className={styles.title}>{t.title}</h2>
              <div className={styles.meta}>
                {t.matchMode === "any" ? (
                  <span className={ui.pill}>Every comment</span>
                ) : (
                  t.keywords.map((k) => (
                    <span key={k} className={ui.pill} style={{ color: "var(--poskoo-violet)" }}>
                      {k}
                    </span>
                  ))
                )}
                {gate && <span className={ui.pill}>{gate}</span>}
              </div>
              <div className={styles.use}>
                <Link href={`/app/auto-dm?template=${t.slug}`} className={styles.useLink}>
                  Use template
                  <ExternalLink width={14} height={14} aria-hidden="true" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-4 text-sm" style={{ color: "var(--poskoo-muted)" }}>
        A template only fills in a draft in the Auto-DM builder. Nothing is sent until you add your
        link and save the automation.
      </p>
    </section>
  );
}
