"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { BIO_MAX_BIO, BIO_MAX_LABEL, BIO_MAX_LINKS, BIO_MAX_NAME, BIO_THEMES, type BioPage } from "@/lib/bioPageShared";
import { Btn } from "@/components/ui/kit";
import { saveBioPageAction } from "./actions";
import styles from "./bio.module.css";

type DraftLink = { id: string; label: string; url: string };

export default function BioEditor({ page }: { page: BioPage | null }) {
  const [links, setLinks] = useState<DraftLink[]>(
    page?.links.map((link) => ({ id: link.id, label: link.label, url: link.url })) ?? [
      { id: "", label: "", url: "" },
    ],
  );

  function update(index: number, field: "label" | "url", value: string) {
    setLinks((prev) => prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
  }

  function add() {
    if (links.length >= BIO_MAX_LINKS) return;
    setLinks((prev) => [...prev, { id: "", label: "", url: "" }]);
  }

  function remove(index: number) {
    setLinks((prev) => (prev.length === 1 ? [{ id: "", label: "", url: "" }] : prev.filter((_, i) => i !== index)));
  }

  return (
    <form action={saveBioPageAction} className={styles.form}>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Profile</h2>
        <div className={styles.grid2}>
          <label className={styles.field}>
            <span>Handle</span>
            <div className={styles.handleWrap}>
              <span aria-hidden="true">poskoo.com/@</span>
              <input name="handle" defaultValue={page?.handle ?? ""} placeholder="yourname" maxLength={30} required />
            </div>
          </label>
          <label className={styles.field}>
            <span>Display name</span>
            <input name="display_name" defaultValue={page?.display_name ?? ""} maxLength={BIO_MAX_NAME} required />
          </label>
        </div>
        <label className={styles.field}>
          <span>Bio</span>
          <textarea name="bio" defaultValue={page?.bio ?? ""} maxLength={BIO_MAX_BIO} rows={3} placeholder="One line about you or your business" />
        </label>
        <label className={styles.field}>
          <span>Avatar image URL (optional)</span>
          <input name="avatar_url" type="url" defaultValue={page?.avatar_url ?? ""} placeholder="https://…" />
        </label>
        <fieldset className={styles.field}>
          <legend>Colour theme</legend>
          <div className={styles.themes}>
            {BIO_THEMES.map((theme) => (
              <label key={theme.id} className={styles.themeOption} style={{ background: theme.bg, color: theme.ink }}>
                <input type="radio" name="theme" value={theme.id} defaultChecked={(page?.theme ?? "sunrise") === theme.id} />
                <span className={styles.themeDot} style={{ background: theme.accent }} aria-hidden="true" />
                {theme.label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className={styles.check}>
          <input type="checkbox" name="published" defaultChecked={page?.published ?? true} />
          Publish my page
        </label>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>Links</h2>
          <span className={styles.muted}>{links.length}/{BIO_MAX_LINKS}</span>
        </div>
        <p className={styles.muted}>Each link gets a tracked short link, so you can see clicks on this page.</p>
        <div className={styles.links}>
          {links.map((link, index) => (
            <div key={link.id || `new-${index}`} className={styles.linkRow}>
              <input type="hidden" name="link_id" value={link.id} />
              <label className={styles.field}>
                <span>Label</span>
                <input
                  name="link_label"
                  value={link.label}
                  onChange={(e) => update(index, "label", e.target.value)}
                  maxLength={BIO_MAX_LABEL}
                  placeholder="Shop the collection"
                />
              </label>
              <label className={styles.field}>
                <span>Link</span>
                <input
                  name="link_url"
                  value={link.url}
                  onChange={(e) => update(index, "url", e.target.value)}
                  type="url"
                  placeholder="https://…"
                />
              </label>
              <button type="button" className={styles.remove} onClick={() => remove(index)} aria-label={`Remove ${link.label || "link"}`}>
                <Trash2 width={16} height={16} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <Btn type="button" variant="line" size="sm" onClick={add} disabled={links.length >= BIO_MAX_LINKS}>
          <Plus width={16} height={16} aria-hidden="true" /> Add link
        </Btn>
      </section>

      <div className={styles.actions}>
        <Btn type="submit" variant="dark">Save page</Btn>
      </div>
    </form>
  );
}
