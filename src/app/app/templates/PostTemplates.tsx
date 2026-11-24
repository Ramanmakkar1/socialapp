"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { PostTemplate } from "@/lib/templates";
import styles from "./templates.module.css";

const TINTS = ["#fdf3e1", "#eef4ff", "#f3eeff", "#e9f7ef", "#fdecef"];

// Saved caption templates (post_templates). Inserting one happens in the composer ("Saved post templates").
export default function PostTemplates({ templates, loadFailed }: { templates: PostTemplate[]; loadFailed: boolean }) {
  const [q, setQ] = useState("");
  const needle = q.trim().toLocaleLowerCase();
  const visible = templates.filter((t) => !needle || `${t.name} ${t.caption} ${t.tags.join(" ")}`.toLocaleLowerCase().includes(needle));

  return (
    <section aria-label="Post templates">
      <div className={styles.hero}>
        <h2 className={styles.heroTitle}>Let’s find something to post</h2>
        <label className={styles.searchWrap}>
          <Search width={18} height={18} aria-hidden="true" />
          <span className="sr-only">Search your post templates</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your templates" className={styles.search} />
        </label>
        <div className={styles.heroPills}>
          <span className={`${styles.chip} ${styles.chipActive}`}>My Templates <span className={styles.chipCount}>{templates.length}</span></span>
        </div>
      </div>

      {loadFailed ? (
        <p role="alert" className={styles.empty}>We couldn’t load your post templates. They are still saved; reload the page to try again.</p>
      ) : templates.length === 0 ? (
        <div className={styles.empty}>
          <p><b>No post templates yet</b></p>
          <p>In the post composer, write a caption and use “Save current as template”. Your templates show up here and in the composer.</p>
          <Link href="/app/publish?compose=1" className={styles.primaryBtn}>Write a post</Link>
        </div>
      ) : visible.length === 0 ? (
        <p className={styles.empty}>No templates match “{q}”.</p>
      ) : (
        <ul className={styles.grid}>
          {visible.map((t, i) => (
            <li key={t.id}>
              <article className={styles.postCard} style={{ background: TINTS[i % TINTS.length] }}>
                <h3 className={styles.title}>{t.name}</h3>
                {t.tags.length > 0 && <p className={styles.desc}>{t.tags.map((x) => `#${x}`).join(" ")}</p>}
                <div className={styles.miniPost}>
                  <p>{t.caption}</p>
                  {t.first_comment && <span className={styles.miniTag}>+ first comment</span>}
                </div>
                <Link href="/app/publish?compose=1" className={styles.useLink}>Use in a new post</Link>
              </article>
            </li>
          ))}
        </ul>
      )}
      <p className={styles.note}>Open the composer and pick the template under “Saved post templates” to insert it.</p>
    </section>
  );
}
