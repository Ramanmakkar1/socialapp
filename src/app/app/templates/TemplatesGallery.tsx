"use client";

import { useState } from "react";
import type { DmTemplate } from "@/lib/dmTemplates";
import { CATEGORIES, visibleIn, type TemplateCategoryId } from "./categories";
import TemplateCard from "./TemplateCard";
import styles from "./templates.module.css";
import card from "./templateCard.module.css";

export default function TemplatesGallery({ templates }: { templates: DmTemplate[] }) {
  const [category, setCategory] = useState<TemplateCategoryId>("all");
  const sections = category === "all" ? CATEGORIES.filter((c) => c.id !== "all") : CATEGORIES.filter((c) => c.id === category);

  return (
    <section aria-label="Automation templates">
      <div className={styles.chips} role="group" aria-label="Filter templates">
        {CATEGORIES.map((c) => {
          const count = templates.filter((t) => visibleIn(t, c.id)).length;
          const active = c.id === category;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={active}
              className={`${styles.chip} ${active ? styles.chipActive : ""}`}
              onClick={() => setCategory(c.id)}
            >
              {c.label}
              <span className={styles.chipCount}>{count}</span>
            </button>
          );
        })}
      </div>

      {sections.map((s) => {
        const list = templates.filter((t) => visibleIn(t, s.id));
        if (list.length === 0) return null;
        return (
          <section key={s.id} className={styles.section} aria-labelledby={`tpl-${s.id}`}>
            <h2 id={`tpl-${s.id}`} className={styles.sectionTitle}>
              {s.label}
              <span className={styles.sectionCount}>· {list.length}</span>
            </h2>
            <ul className={card.grid}>
              {list.map((t) => (
                <li key={`${s.id}-${t.slug}`}>
                  <TemplateCard template={t} href={`/app/auto-dm?template=${t.slug}`} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <p className={styles.note}>
        A template only fills in a draft in the automation builder. Nothing is sent until you add your link and save the automation.
      </p>
    </section>
  );
}
