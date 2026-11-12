"use client";

import { useEffect, useState } from "react";
import styles from "./settings.module.css";

/** Sticky section tabs for the Settings page; highlights the section currently in view. */
export default function SettingsNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => el != null);
    if (els.length === 0 || typeof IntersectionObserver === "undefined") return;
    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting);
        const first = sections.find((s) => visible.get(s.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-80px 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  // Keep the active tab visible inside the horizontally scrolling strip on phones.
  useEffect(() => {
    const link = document.querySelector<HTMLElement>(`[data-settings-tab="${active}"]`);
    link?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active]);

  return (
    <nav className={styles.subnav} aria-label="Settings sections">
      <ul className={styles.subnavList}>
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              data-settings-tab={s.id}
              aria-current={active === s.id ? "location" : undefined}
              className={`${styles.subnavLink} ${active === s.id ? styles.subnavActive : ""}`}
              onClick={() => setActive(s.id)}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
